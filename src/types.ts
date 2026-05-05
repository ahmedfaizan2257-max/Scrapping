export type ScraperSource = 'kijiji' | 'google-maps' | 'yellow-pages' | 'facebook' | 'linkedin';

export interface Lead {
  id: string;
  source: ScraperSource;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  companyName: string;
  website?: string;
  capturedAt: string;
}

export interface ScrapeJob {
  id: string;
  source: ScraperSource;
  status: 'pending' | 'running' | 'completed' | 'failed';
  query: string;
  location?: string;
  leadsCount: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  scheduledInterval?: 'once' | 'weekly';
}
