import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllUpdates } from '../../lib/fetchUpdates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional: Add authentication for cron jobs
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const count = await fetchAllUpdates();
    return res.status(200).json({ success: true, count });
  } catch (error: any) {
    console.error('Scraping failed:', error);
    return res.status(500).json({ error: 'Scraping failed', message: error.message });
  }
}

