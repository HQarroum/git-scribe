import { SearchImageInputSchema } from './schema.js';
import { tavily } from '@tavily/core';
import { tool } from 'ai';

/**
 * Creates a new Tavily client.
 */
const createClient = () => {
  return (tavily({
    apiKey: process.env.TAVILY_API_KEY!
  }));
};

/**
 * Represents an image returned by Tavily.
 */
type TavilyImage = {
  url: string;
  description?: string;
};

/**
 * Searches for images on the web relevant to a search query.
 * @param query The search query.
 * @param opts The search options.
 * @returns The images found.
 */
export const searchImagesAsync = async (query: string, opts = { per_page: 10 }) => {
  const res = await createClient()
    .search(query, {
      limit: opts.per_page,
      includeImages: true
    });

  return (res.images.length > 0 ? res.images : []);
};

/**
 * Finds the best image for a search query.
 * @param query The search query.
 * @param opts The search options.
 * @returns The best image found, or `null` if none are suitable.
 */
export const findBestImage = async (query: string, opts = { maxCandidates: 10 }) => {
  const images: TavilyImage[] = await searchImagesAsync(query, { per_page: opts.maxCandidates });
  return (images.length > 0 ? images[0] : null);
};

/**
 * The `search-image` tool.
 */
export const searchImage = tool({
  description: 'Searches for images on the web relevant to a search query.',
  parameters: SearchImageInputSchema,
  execute: async ({ query, per_page }) => {
    try {
      const images = await searchImagesAsync(query, { per_page });
      return (images.length > 0 ? images : 'No images found.');
    } catch (error) {
      return ('Failed to search for images.');
    }
  }
});
