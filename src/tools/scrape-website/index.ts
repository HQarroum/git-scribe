import FirecrawlApp from '@mendable/firecrawl-js';
import { ScrapeWebsiteInputSchema } from './schema.js';
import { tool } from 'ai';

/**
 * @returns {FirecrawlApp} a new instance of a Firecrawl application.
 */
const createApp = (): FirecrawlApp => {
  return (new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY!
  }));
};

/**
 * Scrapes a website given its URL and returns it in Markdown.
 * @param {object} options - The options for the scrape operation.
 * @returns {Promise<string>} A promise that resolves to the scraped website in Markdown.
 */
export const scrape = async ({ url }: { url: string }) => {
  const app = createApp();
  const res = await app.scrapeUrl(url, {
    formats: ['markdown'],
  });

  if (!res.success) {
    throw new Error(res.error);
  }
  return (res.markdown);
};

/**
 * The `scrape-website` tool allows LLMs to scrape specific
 * URLs and receive a friendly textual representation of the content.
 */
export const scrapeWebsite = tool({
  description: 'Scrapes a website given its URL and returns it content in Markdown.',
  parameters: ScrapeWebsiteInputSchema,
  execute: async ({ url }) => {
    try {
      return await scrape({ url });
    } catch (error) {
      return ('Failed to scrape website.');
    }
  }
});
