# Deployment Guide for LeadHarvest

LeadHarvest is a **Stateful Full-Stack App**. To keep your leads saved in memory and ensure scrapers don't time out, we recommend a **Persistent Server** over serverless platforms like Netlify.

## Recommended: Persistent Server (Render / Railway / VPS)
This is the best way to run LeadHarvest.
1. **GitHub:** Push your code to GitHub.
2. **Setup:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variable:** Set `NODE_ENV=production`.
3. **Benefits:**
   - Leads stay in the dashboard as long as the server is running.
   - Long-running scrapers won't be killed mid-way.

## Alternative: Netlify (Limited)
If you must use Netlify:
- **Note:** Data resets every time the function wakes up (In-memory storage limitation).
- **Setup:** The project includes `netlify.toml` and `netlify/functions/api.ts` for this purpose.
- **Build:** `npm run build`
- **Publish Directory:** `dist`
