# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables
1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your API keys in `.env.local`:
   - Get Firebase config from [Firebase Console](https://console.firebase.google.com/)
   - Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - (Optional) Get CodeHelm API key

### Step 3: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4: (Optional) Populate Initial Data
```bash
npm run scrape
```

## 📝 Important Notes

- **Firebase Setup**: Make sure Firestore is enabled in your Firebase project
- **API Keys**: Never commit `.env.local` to version control
- **Scraping**: The scraper may take time and some sites may block requests
- **Free Tier**: All services used are available on free tiers

## 🐛 Troubleshooting

**Firebase errors?**
- Verify all Firebase env variables are correct
- Check Firestore is enabled
- Ensure service account key is properly formatted

**Scraping not working?**
- Some websites block automated requests
- Check your internet connection
- Verify website URLs in `lib/universities.json`

**Build errors?**
- Run `npm install` again
- Check TypeScript version compatibility
- Verify all dependencies are installed

## 📚 Next Steps

1. Read the full [README.md](README.md) for detailed setup
2. Configure automated scraping with Vercel Cron
3. Set up email subscriptions (optional)
4. Deploy to Vercel

---

**Need help?** Check the main README.md or open an issue on GitHub.

