import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import NewsCard from '../../components/NewsCard';
import universities from '../../lib/universities.json';

interface Update {
  id: string;
  title: string;
  summary: string;
  date: string;
  link: string;
  source: string;
  category?: string;
}

export default function SchoolPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [university, setUniversity] = useState<any>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (slug) {
      const found = (universities as any[]).find((u) => u.slug === slug);
      setUniversity(found);
      if (found) {
        fetchUpdates(found.name);
      }
    }
  }, [slug]);

  const fetchUpdates = async (sourceName: string) => {
    try {
      const updatesRef = collection(db, 'updates');
      const q = query(
        updatesRef,
        where('source', '==', sourceName),
        orderBy('createdAt', 'desc')
      );
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !university) return;

    try {
      // In a real app, you would save this to Firestore
      // For now, we'll just show a success message
      setSubscribed(true);
      setEmail('');
      
      // Save subscription to Firestore
      // await addDoc(collection(db, 'subscriptions'), {
      //   email,
      //   university: university.name,
      //   slug: university.slug,
      //   createdAt: new Date(),
      // });
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  if (!university) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">University not found</h1>
          <Link href="/" className="text-primary-green hover:underline">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{university.name} - CampusAI.ng</title>
        <meta
          name="description"
          content={`Latest updates and news from ${university.name}. Get AI-powered summaries of announcements and circulars.`}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-primary-green text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <Link href="/" className="text-primary-gold hover:underline mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-2">{university.name}</h1>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full">
                {university.category}
              </span>
              <a
                href={university.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-gold hover:underline"
              >
                Visit Official Website →
              </a>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* University Summary */}
          <section className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About {university.name}</h2>
            <p className="text-gray-700 mb-4">
              {university.name} is a {university.category.toLowerCase()} university in Nigeria.
              Stay updated with the latest news, announcements, and circulars from this institution.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary-green bg-opacity-10 text-primary-green rounded-full text-sm">
                {university.category}
              </span>
              <a
                href={university.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-primary-gold bg-opacity-10 text-primary-gold rounded-full text-sm hover:bg-opacity-20"
              >
                Official Website
              </a>
            </div>
          </section>

          {/* Subscribe Section */}
          <section className="bg-gradient-to-r from-primary-green to-primary-gold rounded-xl shadow-md p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Subscribe for Alerts</h2>
            <p className="mb-4 opacity-90">
              Get notified when {university.name} publishes new updates or announcements.
            </p>
            {subscribed ? (
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="font-semibold">✓ Successfully subscribed! You'll receive email alerts.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-primary-green rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                >
                  Subscribe
                </button>
              </form>
            )}
          </section>

          {/* Updates */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Latest Updates</h2>
              <span className="text-gray-600">
                {updates.length} {updates.length === 1 ? 'update' : 'updates'}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
              </div>
            ) : updates.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">
                  No updates available for {university.name} at the moment.
                </p>
                <p className="text-gray-500">
                  Updates are automatically fetched from the university website. Check back later!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {updates.map((update) => (
                  <NewsCard
                    key={update.id}
                    title={update.title}
                    summary={update.summary}
                    date={update.date}
                    link={update.link}
                    source={update.source}
                    category={update.category}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-primary-green text-white mt-16 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="mb-2">&copy; 2024 CampusAI.ng. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

