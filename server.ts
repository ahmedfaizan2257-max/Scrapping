import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import * as cheerio from "cheerio";
import xlsx from "xlsx";
import cron from "node-cron";
import UserAgent from "user-agents";
import { Lead, ScrapeJob, ScraperSource } from "./src/types";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store for the prototype
  let jobs: ScrapeJob[] = [];
  let leads: Lead[] = [];

  // --- Scraper Implementations ---

  async function scrapeYellowPages(query: string, location: string): Promise<Lead[]> {
    const ua = new UserAgent({ deviceCategory: 'desktop' });
    const results: Lead[] = [];
    
    try {
      // Mocking scraping logic for the prototype to avoid hitting real site repeatedly
      // In a real scenario, we would use axios.get with the query/location URL
      const searchUrl = `https://www.yellowpages.ca/search/si/1/${encodeURIComponent(query)}/${encodeURIComponent(location)}`;
      
      // Simulate real delay
      await new Promise(r => setTimeout(r, 1500));

      // Mock results since real scraping might be blocked in the sandbox environment
      for(let i = 0; i < 5; i++) {
        results.push({
          id: Math.random().toString(36).substr(2, 9),
          source: 'yellow-pages',
          name: `${query} Provider ${i + 1}`,
          companyName: `${query} Group Inc`,
          phone: `+1-555-010${i}`,
          address: `${100 + i} Main St, ${location}`,
          website: `https://example-${i}.com`,
          email: `contact@example-${i}.com`,
          capturedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("YellowPages Scrape Error:", error);
    }
    return results;
  }

  async function scrapeKijiji(query: string, location: string): Promise<Lead[]> {
    // Similar to YP, using cheerio to parse search results
    // Real implementation would look for .info-container or .title classes
    await new Promise(r => setTimeout(r, 1000));
    return [{
      id: Math.random().toString(36).substr(2, 9),
      source: 'kijiji',
      name: "Local Specialist",
      companyName: "Kijiji Contact",
      phone: "555-987-6543",
      address: location,
      website: "https://kijiji.ca/some-profile",
      capturedAt: new Date().toISOString()
    }];
  }

  // --- API Routes ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", serverTime: new Date().toISOString() });
  });

  app.get("/api/jobs", (req, res) => {
    res.json(jobs);
  });

  app.get("/api/leads", (req, res) => {
    res.json(leads);
  });

  app.post("/api/scrape", async (req, res) => {
    const { source, query, location, scheduledInterval } = req.body;
    
    const newJob: ScrapeJob = {
      id: Math.random().toString(36).substr(2, 9),
      source,
      query,
      location,
      status: 'pending',
      leadsCount: 0,
      startedAt: new Date().toISOString(),
      scheduledInterval
    };

    jobs.unshift(newJob);
    console.log(`Job created: ${newJob.id} for ${source} with query "${query}"`);

    // Run scraping in background
    (async () => {
      console.log(`Starting background scrape for job ${newJob.id}...`);
      const jobIndexUpdateStatus = jobs.findIndex(j => j.id === newJob.id);
      if (jobIndexUpdateStatus !== -1) jobs[jobIndexUpdateStatus].status = 'running';

      let foundLeads: Lead[] = [];
      try {
        if (source === 'yellow-pages') {
          foundLeads = await scrapeYellowPages(query, location);
        } else if (source === 'kijiji') {
          foundLeads = await scrapeKijiji(query, location);
        } else {
          // Placeholder for others
          await new Promise(r => setTimeout(r, 2000));
          foundLeads = [{
            id: `lead_${Math.random().toString(36).substr(2, 9)}`,
            source,
            name: "Automated Specialist",
            companyName: `${source.toUpperCase()} Partner`,
            phone: "+1-800-SCRAPE-IT",
            email: `info@${source}.com`,
            capturedAt: new Date().toISOString()
          }];
        }

        leads = [...foundLeads, ...leads];
        console.log(`Job ${newJob.id} finished. Found ${foundLeads.length} leads.`);
        const jobIndex = jobs.findIndex(j => j.id === newJob.id);
        if (jobIndex !== -1) {
          jobs[jobIndex].status = 'completed';
          jobs[jobIndex].leadsCount = foundLeads.length;
          jobs[jobIndex].completedAt = new Date().toISOString();
        }
      } catch (err) {
        console.error(`Job ${newJob.id} failed:`, err);
        const jobIndex = jobs.findIndex(j => j.id === newJob.id);
        if (jobIndex !== -1) {
          jobs[jobIndex].status = 'failed';
          jobs[jobIndex].error = err instanceof Error ? err.message : String(err);
        }
      }
    })();

    res.json(newJob);
  });

  app.get("/api/export", (req, res) => {
    if (leads.length === 0) {
      return res.status(400).send("No leads to export");
    }

    const ws = xlsx.utils.json_to_sheet(leads);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Leads");
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.xlsx');
    res.send(buffer);
  });

  // --- Scheduling ---
  cron.schedule("0 0 * * 0", () => {
    console.log("Running weekly scheduled scrapes...");
    // Logic to re-run jobs marked as 'weekly'
    jobs.filter(j => j.scheduledInterval === 'weekly').forEach(job => {
      // Trigger new scrape with same parameters
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
