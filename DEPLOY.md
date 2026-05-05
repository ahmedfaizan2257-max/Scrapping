# Deployment Guide for LeadHarvest

Your application is a **Stateful Full-Stack App**. Unlike a static website, it requires a persistent environment to handle background scraping and scheduling.

## Recommended: Render.com (Easiest)
1. **Connect GitHub:** Push your code to a GitHub repository.
2. **New Web Service:** Select your repository in Render.
3. **Settings:**
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. **Environment Variables:** Add `GEMINI_API_KEY` if you plan to use AI features later.

## Recommended: Railway.app
1. **New Project:** Connect your GitHub repo.
2. **Auto-Detect:** Railway will detect the `package.json` and `server.ts`.
3. **Deployment:** It will automatically run the build and start scripts.

## Note on Netlify/Vercel
These platforms use **Serverless Functions**. To use them, you would need to:
1. Replace in-memory storage (`leads` array) with a database like **Firebase** or **MongoDB**.
2. Replace `node-cron` with a cloud scheduler (like Netlify Scheduled Functions or GitHub Actions).
