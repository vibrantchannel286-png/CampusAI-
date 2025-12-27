import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from './firebase';
import universities from './universities.json';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Summarize text using Gemini AI with CodeHelm fallback
async function summarizeText(text: string, title: string = ''): Promise<string> {
  const prompt = `Summarize the following news article in 2-3 sentences. Focus on key information and important dates:
  
Title: ${title}
Content: ${text.substring(0, 3000)}

Provide a concise summary:`;

  try {
    // Try Gemini AI first
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || 'Summary not available.';
  } catch (error) {
    console.error('Gemini AI summarization failed, trying CodeHelm fallback:', error);
    
    // Fallback to CodeHelm
    try {
      const codehelmResponse = await axios.post(
        'https://api.codehelm.ai/v1/summarize',
        {
          text: text.substring(0, 3000),
          title: title,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.CODEHELM_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return codehelmResponse.data.summary || 'Summary not available.';
    } catch (fallbackError) {
      console.error('CodeHelm summarization also failed:', fallbackError);
      // Return a basic summary if both fail
      return text.substring(0, 200) + '...';
    }
  }
}

// Fetch updates from a university website
async function fetchUniversityUpdates(university: { name: string; slug: string; url: string; category: string }) {
  try {
    console.log(`Fetching updates from ${university.name}...`);
    
    const response = await axios.get(university.url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const articles: Array<{ title: string; link: string; content: string; date?: string }> = [];

    // Try multiple selectors for different website structures
    const selectors = [
      'article',
      '.news-item',
      '.post',
      '.update',
      '.announcement',
      '[class*="news"]',
      '[class*="update"]',
      '[class*="announcement"]',
    ];

    for (const selector of selectors) {
      $(selector).each((_, element) => {
        const title = $(element).find('h1, h2, h3, .title, [class*="title"]').first().text().trim();
        const link = $(element).find('a').first().attr('href') || '';
        const content = $(element).find('p, .content, [class*="content"]').text().trim();
        const dateText = $(element).find('.date, [class*="date"], time').first().text().trim();

        if (title && content && content.length > 50) {
          // Resolve relative URLs
          const fullLink = link.startsWith('http') 
            ? link 
            : new URL(link, university.url).toString();

          articles.push({
            title,
            link: fullLink,
            content: content.substring(0, 5000), // Limit content length
            date: dateText || new Date().toISOString(),
          });
        }
      });

      if (articles.length > 0) break; // Stop if we found articles
    }

    // If no articles found with standard selectors, try to extract from main content
    if (articles.length === 0) {
      const mainContent = $('main, .main-content, #content, .content').first();
      if (mainContent.length > 0) {
        const title = $('h1, h2').first().text().trim() || 'Latest Update';
        const content = mainContent.text().trim();
        
        if (content.length > 50) {
          articles.push({
            title,
            link: university.url,
            content: content.substring(0, 5000),
            date: new Date().toISOString(),
          });
        }
      }
    }

    // Process and save articles to Firestore
    for (const article of articles.slice(0, 10)) { // Limit to 10 articles per university
      try {
        // Check if article already exists
        const existingQuery = await adminDb
          ?.collection('updates')
          .where('link', '==', article.link)
          .limit(1)
          .get();

        if (existingQuery && !existingQuery.empty) {
          console.log(`Article already exists: ${article.title}`);
          continue;
        }

        // Generate summary
        const summary = await summarizeText(article.content, article.title);

        // Save to Firestore
        await adminDb?.collection('updates').add({
          title: article.title,
          link: article.link,
          content: article.content,
          summary: summary,
          source: university.name,
          sourceUrl: university.url,
          sourceSlug: university.slug,
          category: university.category,
          date: article.date || new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`Saved article: ${article.title}`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error processing article from ${university.name}:`, error);
      }
    }

    return articles.length;
  } catch (error: any) {
    console.error(`Error fetching updates from ${university.name}:`, error.message);
    return 0;
  }
}

// Fetch JAMB updates
async function fetchJAMBUpdates() {
  try {
    console.log('Fetching JAMB updates...');
    
    const jambUrl = 'https://www.jamb.gov.ng';
    const response = await axios.get(jambUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const updates: Array<{ title: string; link: string; content: string; date?: string }> = [];

    // Try to find news/updates section
    $('article, .news-item, .update, .announcement, [class*="news"]').each((_, element) => {
      const title = $(element).find('h1, h2, h3, .title').first().text().trim();
      const link = $(element).find('a').first().attr('href') || '';
      const content = $(element).find('p, .content').text().trim();
      const dateText = $(element).find('.date, time').first().text().trim();

      if (title && content) {
        const fullLink = link.startsWith('http') 
          ? link 
          : new URL(link, jambUrl).toString();

        updates.push({
          title,
          link: fullLink,
          content: content.substring(0, 5000),
          date: dateText || new Date().toISOString(),
        });
      }
    });

    // Process and save JAMB updates
    for (const update of updates.slice(0, 10)) {
      try {
        const existingQuery = await adminDb
          ?.collection('updates')
          .where('link', '==', update.link)
          .where('category', '==', 'JAMB')
          .limit(1)
          .get();

        if (existingQuery && !existingQuery.empty) {
          continue;
        }

        const summary = await summarizeText(update.content, update.title);

        await adminDb?.collection('updates').add({
          title: update.title,
          link: update.link,
          content: update.content,
          summary: summary,
          source: 'JAMB',
          sourceUrl: jambUrl,
          sourceSlug: 'jamb',
          category: 'JAMB',
          date: update.date || new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`Saved JAMB update: ${update.title}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error processing JAMB update:', error);
      }
    }

    return updates.length;
  } catch (error: any) {
    console.error('Error fetching JAMB updates:', error.message);
    return 0;
  }
}

// Main function to fetch all updates
export async function fetchAllUpdates() {
  if (!adminDb) {
    console.error('Firebase Admin not initialized. Cannot fetch updates.');
    return;
  }

  console.log('Starting update fetch process...');
  
  let totalArticles = 0;

  // Fetch from universities (limit to first 50 for initial run)
  const universitiesToFetch = (universities as Array<{ name: string; slug: string; url: string; category: string }>).slice(0, 50);
  
  for (const university of universitiesToFetch) {
    const count = await fetchUniversityUpdates(university);
    totalArticles += count;
    
    // Add delay between universities
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Fetch JAMB updates
  const jambCount = await fetchJAMBUpdates();
  totalArticles += jambCount;

  console.log(`Update fetch complete. Total articles: ${totalArticles}`);
  return totalArticles;
}

// Run if called directly
if (require.main === module) {
  fetchAllUpdates()
    .then(() => {
      console.log('Scraping completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Scraping failed:', error);
      process.exit(1);
    });
}

