import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import CategoryTabs from '../components/CategoryTabs';
import SearchBar from '../components/SearchBar';
import NewsCard from '../components/NewsCard';
import universities from '../lib/universities.json';

interface Update {
  id: string;
  title: string;
  summary: string;
  date: string;
  link: string;
  source: string;
  category?: string;
  featured?: boolean;
}

export default function Home() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<Update[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [featuredSchools, setFeaturedSchools] = useState<any[]>([]);

  useEffect(() => {
    fetchUpdates();
    setFeaturedSchools(
      (universities as any[])
        .filter((u) => ['unilag', 'ui', 'abu-zaria', 'unn', 'oau'].includes(u.slug))
        .slice(0, 5)
    );
  }, []);

  useEffect(() => {
    filterUpdates();
  }, [activeCategory, searchQuery, updates]);

  const fetchUpdates = async () => {
    try {
      const updatesRef = collection(db, 'updates');
      const q = query(updatesRef, orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);

      const updatesData: Update[] = [];
      querySnapshot.forEach((doc) => {
        updatesData.push({
          id: doc.id,
          ...doc.data(),
        } as Update);
      });

      setUpdates(updatesData);
    } catch (error) {
      console.error('Error fetching updates:', error);
      // Fallback to sample data if Firestore fails
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUpdates = () => {
    let filtered = [...updates];

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter((update) => update.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (update) =>
          update.title.toLowerCase().includes(query) ||
          update.summary.toLowerCase().includes(query) ||
          update.source.toLowerCase().includes(query)
      );
    }

    setFilteredUpdates(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <Head>
        <title>CampusAI.ng - Nigerian Universities & JAMB Updates</title>
        <meta
          name="description"
          content="Get the latest updates from Nigerian universities and JAMB. AI-powered summaries of news, announcements, and circulars."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-primary-green text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">CampusAI.ng</h1>
                <p className="text-green-100">
                  Your AI-powered source for Nigerian university and JAMB updates
                </p>
              </div>
              <nav className="hidden md:flex gap-4">
                <Link href="/" className="hover:text-primary-gold transition-colors">
                  Home
                </Link>
                <Link href="/jamb" className="hover:text-primary-gold transition-colors">
                  JAMB Updates
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Featured Schools */}
          {featuredSchools.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Featured Universities</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {featuredSchools.map((school) => (
                  <Link
                    key={school.slug}
                    href={`/school/${school.slug}`}
                    className="
                      bg-white rounded-lg shadow-md p-4 hover:shadow-xl
                      transition-all duration-200 border-2 border-transparent
                      hover:border-primary-gold
                    "
                  >
                    <h3 className="font-semibold text-primary-green mb-2 line-clamp-2">
                      {school.name}
                    </h3>
                    <p className="text-xs text-gray-600">{school.category}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Search and Filters */}
          <section className="mb-8">
            <SearchBar onSearch={handleSearch} />
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </section>

          {/* Updates Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeCategory === 'all' ? 'All Updates' : `${activeCategory} Updates`}
              </h2>
              <span className="text-gray-600">
                {filteredUpdates.length} {filteredUpdates.length === 1 ? 'update' : 'updates'}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
              </div>
            ) : filteredUpdates.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">
                  {searchQuery
                    ? 'No updates found matching your search.'
                    : 'No updates available at the moment. Check back later!'}
                </p>
                {!searchQuery && (
                  <p className="text-gray-500">
                    Updates are automatically fetched and summarized from university websites and JAMB.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUpdates.map((update) => (
                  <NewsCard
                    key={update.id}
                    title={update.title}
                    summary={update.summary}
                    date={update.date}
                    link={update.link}
                    source={update.source}
                    category={update.category}
                    featured={update.featured}
                  />
                ))}
              </div>
            )}
          </section>

          {/* AdSense Placeholder */}
          <section className="mt-12 mb-8">
            <div className="bg-gray-200 rounded-lg p-8 text-center text-gray-500">
              <p>Advertisement Space</p>
              <p className="text-sm mt-2">
                {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
                  ? 'AdSense will be displayed here'
                  : 'Configure AdSense in environment variables'}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-primary-green text-white mt-16 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="mb-2">&copy; 2024 CampusAI.ng. All rights reserved.</p>
            <p className="text-green-100 text-sm">
              Powered by Gemini AI & CodeHelm | Data from Nigerian Universities & JAMB
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

