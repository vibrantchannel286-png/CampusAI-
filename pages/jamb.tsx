import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import NewsCard from '../components/NewsCard';
import jambData from '../lib/jamb.json';

interface Update {
  id: string;
  title: string;
  summary: string;
  date: string;
  link: string;
  source: string;
  category?: string;
  deadline?: string;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function JAMBPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [nextEvent, setNextEvent] = useState<any>(null);

  useEffect(() => {
    fetchUpdates();
    setupCountdown();
  }, []);

  useEffect(() => {
    if (nextEvent?.deadline) {
      const interval = setInterval(() => {
        updateCountdown();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nextEvent]);

  const fetchUpdates = async () => {
    try {
      if (!db) {
        console.warn('Firebase not initialized. Using sample JAMB data.');
        setUpdates(
          (jambData as any[]).map((item, index) => ({
            id: `sample-${index}`,
            ...item,
            source: 'JAMB',
          }))
        );
        setLoading(false);
        return;
      }

      const updatesRef = collection(db, 'updates');
      const q = query(
        updatesRef,
        where('category', '==', 'JAMB'),
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

      // If no Firestore data, use sample data
      if (updatesData.length === 0) {
        setUpdates(
          (jambData as any[]).map((item, index) => ({
            id: `sample-${index}`,
            ...item,
            source: 'JAMB',
          }))
        );
      } else {
        setUpdates(updatesData);
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
      // Fallback to sample data
      setUpdates(
        (jambData as any[]).map((item, index) => ({
          id: `sample-${index}`,
          ...item,
          source: 'JAMB',
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const setupCountdown = () => {
    // Find the next upcoming event with a deadline
    const upcomingEvents = (jambData as any[])
      .filter((item) => item.deadline)
      .map((item) => ({
        ...item,
        deadlineDate: new Date(item.deadline),
      }))
      .filter((item) => item.deadlineDate > new Date())
      .sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime());

    if (upcomingEvents.length > 0) {
      setNextEvent(upcomingEvents[0]);
      updateCountdown();
    }
  };

  const updateCountdown = () => {
    if (!nextEvent?.deadline) return;

    const now = new Date().getTime();
    const deadline = new Date(nextEvent.deadline).getTime();
    const distance = deadline - now;

    if (distance > 0) {
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    } else {
      setCountdown(null);
    }
  };

  return (
    <>
      <Head>
        <title>JAMB Updates - CampusAI.ng</title>
        <meta
          name="description"
          content="Latest JAMB updates, registration deadlines, examination dates, and admission information. Stay informed with AI-powered summaries."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-primary-green text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <Link href="/" className="text-primary-gold hover:underline mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-2">JAMB Updates</h1>
            <p className="text-green-100">
              Latest news, circulars, and important dates from the Joint Admissions and Matriculation Board
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Countdown Timer */}
          {nextEvent && countdown && (
            <section className="bg-gradient-to-r from-primary-green to-primary-gold rounded-xl shadow-lg p-8 mb-8 text-white">
              <h2 className="text-2xl font-bold mb-2">{nextEvent.title}</h2>
              <p className="mb-6 opacity-90">{nextEvent.summary}</p>
              <div className="flex items-center justify-center gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center min-w-[100px]">
                  <div className="text-4xl font-bold">{countdown.days}</div>
                  <div className="text-sm opacity-90">Days</div>
                </div>
                <div className="text-3xl">:</div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center min-w-[100px]">
                  <div className="text-4xl font-bold">{countdown.hours}</div>
                  <div className="text-sm opacity-90">Hours</div>
                </div>
                <div className="text-3xl">:</div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center min-w-[100px]">
                  <div className="text-4xl font-bold">{countdown.minutes}</div>
                  <div className="text-sm opacity-90">Minutes</div>
                </div>
                <div className="text-3xl">:</div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center min-w-[100px]">
                  <div className="text-4xl font-bold">{countdown.seconds}</div>
                  <div className="text-sm opacity-90">Seconds</div>
                </div>
              </div>
              <p className="text-center mt-6 text-sm opacity-90">
                Deadline: {new Date(nextEvent.deadline).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </section>
          )}

          {/* Quick Links */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <a
              href="https://www.jamb.gov.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-green"
            >
              <h3 className="font-bold text-primary-green mb-2">Official JAMB Website</h3>
              <p className="text-gray-600 text-sm">Visit jamb.gov.ng for official information</p>
            </a>
            <a
              href="https://www.jamb.gov.ng/efacility"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-green"
            >
              <h3 className="font-bold text-primary-green mb-2">JAMB e-Facility</h3>
              <p className="text-gray-600 text-sm">Access your JAMB portal and services</p>
            </a>
            <a
              href="https://www.jamb.gov.ng/caps"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-green"
            >
              <h3 className="font-bold text-primary-green mb-2">CAPS Portal</h3>
              <p className="text-gray-600 text-sm">Check and accept admission offers</p>
            </a>
          </section>

          {/* Updates */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Latest JAMB Updates</h2>
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
                <p className="text-gray-600 text-lg mb-4">No JAMB updates available at the moment.</p>
                <p className="text-gray-500">
                  Updates are automatically fetched from the JAMB website. Check back later!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {updates.map((update) => (
                  <NewsCard
                    key={update.id}
                    title={update.title}
                    summary={update.summary}
                    date={update.date}
                    link={update.link}
                    source={update.source}
                    category={update.category || 'JAMB'}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Important Dates */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Important Dates</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="space-y-4">
                {(jambData as any[])
                  .filter((item) => item.deadline)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.summary}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-green">
                          {new Date(item.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        {new Date(item.deadline) > new Date() ? (
                          <p className="text-xs text-green-600">Upcoming</p>
                        ) : (
                          <p className="text-xs text-gray-500">Past</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
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

