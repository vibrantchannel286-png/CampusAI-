import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Try Gemini AI first
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a helpful assistant for CampusAI.ng, a platform providing information about Nigerian universities and JAMB updates. 
      
User question: ${message}

Provide a helpful, accurate, and concise response. If you don't know something, say so. Focus on Nigerian education system, universities, and JAMB-related information.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('Gemini AI failed, trying CodeHelm fallback:', error);

    // Fallback to CodeHelm
    try {
      const codehelmResponse = await axios.post(
        'https://api.codehelm.ai/v1/chat',
        {
          message: message,
          context: 'Nigerian universities and JAMB updates',
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.CODEHELM_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return res.status(200).json({
        response: codehelmResponse.data.response || 'I apologize, but I couldn\'t process your request. Please try again.',
      });
    } catch (fallbackError) {
      console.error('CodeHelm also failed:', fallbackError);

      // Final fallback message
      return res.status(200).json({
        response: 'I apologize, but I\'m having trouble processing your request right now. Please try again later or contact support. For immediate assistance, you can browse our updates or check the JAMB official website.',
      });
    }
  }
}

