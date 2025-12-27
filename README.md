# CampusAI.ng

An AI-powered platform that fetches, summarizes, and displays updates from Nigerian universities and JAMB (Joint Admissions and Matriculation Board) using Gemini AI (primary) and CodeHelm (fallback). All data is stored in Firebase Firestore.

## Features

- 🤖 **AI-Powered Summaries**: Automatic summarization of news and updates using Gemini AI with CodeHelm fallback
- 📰 **Real-time Updates**: Automated scraping from 200+ Nigerian universities and JAMB
- 🔍 **Smart Search**: Search across all universities and JAMB news
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices
- 💬 **AI Chatbot**: Floating chatbot powered by Gemini AI and CodeHelm
- ⏰ **Countdown Timers**: Track important JAMB deadlines and registration dates
- 📧 **Email Subscriptions**: Subscribe to alerts for specific universities
- 🎨 **Modern UI**: TailwindCSS with custom color scheme (Green #008751, Gold #FFD700)

## Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Firebase Firestore
- **AI**: Google Gemini AI (primary), CodeHelm (fallback)
- **Scraping**: Axios + Cheerio
- **Deployment**: Vercel (free tier compatible)

## Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account (free tier)
- Gemini AI API key (free tier available)
- CodeHelm API key (optional, for fallback)
- Git

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/campusai-ng.git
cd campusai-ng
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in **test mode** for development
   - Choose a location (preferably close to your users)

4. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Copy the Firebase configuration object

5. Set up Firebase Admin (for server-side operations):
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely (don't commit it!)

### 4. Get API Keys

#### Gemini AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

#### CodeHelm API Key (Optional)
1. Visit [CodeHelm](https://codehelm.ai) (or your CodeHelm provider)
2. Sign up and get your API key
3. This is used as a fallback if Gemini AI fails

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (for server-side operations)
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# AI API Keys
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_CODEHELM_API_KEY=your_codehelm_api_key
CODEHELM_API_KEY=your_codehelm_api_key

# Optional: Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=your_adsense_client_id

# Optional: Email Service (for subscriptions)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@campusai.ng
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- For `FIREBASE_PRIVATE_KEY`, copy the entire private key from the service account JSON, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Keep `.env.local` in `.gitignore` (already configured)
- Never commit your `.env.local` file to version control

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Initial Data Scraping (Optional)

To populate Firestore with initial data:

```bash
npm run scrape
# or
yarn scrape
```

**Note**: This will scrape websites and may take a while. Some websites may block automated requests. The scraper includes error handling and rate limiting.

## Project Structure

```
campusai-ng/
├── components/          # React components
│   ├── CategoryTabs.tsx
│   ├── NewsCard.tsx
│   ├── SearchBar.tsx
│   └── Chatbot.tsx
├── lib/                 # Utility functions and data
│   ├── universities.json
│   ├── jamb.json
│   ├── firebase.ts
│   └── fetchUpdates.ts
├── pages/               # Next.js pages
│   ├── _app.tsx
│   ├── index.tsx
│   ├── jamb.tsx
│   └── school/
│       └── [slug].tsx
├── styles/              # Global styles
│   └── globals.css
├── .env.local          # Environment variables (create this)
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Firebase Integration

### Firestore Collections

The app uses the following Firestore collections:

- **`updates`**: Stores all news articles and updates
  - Fields: `title`, `summary`, `content`, `link`, `source`, `sourceUrl`, `sourceSlug`, `category`, `date`, `createdAt`, `updatedAt`

- **`subscriptions`** (optional): Stores email subscriptions
  - Fields: `email`, `university`, `slug`, `createdAt`

### Firestore Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to updates
    match /updates/{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Subscriptions require authentication
    match /subscriptions/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/campusai-ng.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Add all environment variables from `.env.local`
   - Click "Deploy"

3. **Configure Environment Variables in Vercel**:
   - Go to Project Settings > Environment Variables
   - Add all variables from your `.env.local`
   - Make sure to add both `NEXT_PUBLIC_*` and non-public variables

### Automated Scraping

To set up automated scraping:

1. **Vercel Cron Jobs** (Recommended):
   - Create `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/scrape",
       "schedule": "0 */6 * * *"
     }]
   }
   ```

2. **Create API Route** (`pages/api/scrape.ts`):
   ```typescript
   import { fetchAllUpdates } from '../../lib/fetchUpdates';

   export default async function handler(req: any, res: any) {
     if (req.method === 'POST') {
       const authHeader = req.headers.authorization;
       if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
         return res.status(401).json({ error: 'Unauthorized' });
       }

       try {
         const count = await fetchAllUpdates();
         return res.status(200).json({ success: true, count });
       } catch (error) {
         return res.status(500).json({ error: 'Scraping failed' });
       }
     }
     return res.status(405).json({ error: 'Method not allowed' });
   }
   ```

3. **Alternative: GitHub Actions**:
   - Create `.github/workflows/scrape.yml` for scheduled scraping

## Optional Features

### Email Subscriptions

To enable email subscriptions:

1. Set up SendGrid (or another email service)
2. Add `SENDGRID_API_KEY` to environment variables
3. Implement email sending in subscription handler
4. Use Firebase Cloud Functions or API routes for email sending

### Google AdSense

1. Sign up for [Google AdSense](https://www.google.com/adsense)
2. Get your client ID
3. Add `NEXT_PUBLIC_ADSENSE_CLIENT_ID` to environment variables
4. Integrate AdSense components in your pages

### Premium Alerts

1. Set up Firebase Authentication
2. Create a premium tier in Firestore
3. Implement payment processing (Stripe, PayPal, etc.)
4. Add premium features to the UI

## Troubleshooting

### Firebase Connection Issues

- Verify all Firebase environment variables are correct
- Check Firestore is enabled in Firebase Console
- Ensure service account key is properly formatted in `.env.local`

### Scraping Failures

- Some websites may block automated requests
- Check rate limiting in `fetchUpdates.ts`
- Verify website URLs in `universities.json` are correct
- Some sites may require different selectors

### AI Summarization Not Working

- Verify Gemini API key is correct
- Check API quota limits
- Ensure CodeHelm fallback is configured if needed
- Check browser console for errors

### Build Errors

- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build`
- Verify environment variables are set

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review Firebase and Next.js documentation

## Acknowledgments

- Nigerian universities for providing public information
- JAMB for official updates
- Google Gemini AI for AI capabilities
- Firebase for backend infrastructure
- Next.js team for the amazing framework

---

**Made with ❤️ for Nigerian students and educators**
