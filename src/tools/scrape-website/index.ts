import FirecrawlApp from '@mendable/firecrawl-js';
import { ScrapeWebsiteInputSchema } from './schema.js';
import { tool } from 'ai';

/**
 * Creates a new Firecrawl app.
 */
const createApp = () => {
  return (new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY!
  }));
};

/**
 * The `scrape-website` tool.
 */
export const scrapeWebsite = tool({
  description: 'Scrapes a website given its URL and returns it in Markdown.',
  parameters: ScrapeWebsiteInputSchema,
  execute: async ({ url }) => {
    try {
      const app = createApp();
      const res = await app.scrapeUrl(url, {
        formats: ['markdown'],
      });

      if (!res.success) {
        return (`Failed to scrape website: ${res.error}`);
      }
      return (res.markdown);
    } catch (error) {
      return ('Failed to scrape website.');
    }
  }
});
