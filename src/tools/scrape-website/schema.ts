import { z } from 'zod';

/**
 * The input schema for the `scrape-website` tool.
 */
export const ScrapeWebsiteInputSchema = z.object({
  url: z
    .string()
    .describe('The URL of the website to scrape the content of.')
});

export type ScrapeWebsiteInput = z.infer<typeof ScrapeWebsiteInputSchema>;
