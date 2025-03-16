import { SearchImageInputSchema } from './schema.js';
import { tavily, TavilyClient } from '@tavily/core';
import { tool } from 'ai';

/**
 * @returns {TavilyClient} a new Tavily client.
 */
const createClient = (): TavilyClient => {
  return (tavily({
    apiKey: process.env.TAVILY_API_KEY!
  }));
};

/**
 * The type of an image returned by Tavily.
 */
type TavilyImage = {
  url: string;
  description?: string;
};

/**
 * Searches for images on the web relevant to a search query.
 * @param {string} query The search query.
 * @param {object} opts The search options.
 * @returns {Promise<TavilyImage[]>} an array of found images.
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
 * @param {string} query The search query.
 * @param {object} opts The search options.
 * @returns {Promise<TavilyImage | null>} the best image found for a search query, or `null` if no
 * images were relevant to the search query.
 */
export const findBestImage = async (query: string, opts = { maxCandidates: 10 }) => {
  const images: TavilyImage[] = await searchImagesAsync(query, { per_page: opts.maxCandidates });
  return (images.length > 0 ? images[0] : null);
};

/**
 * The `search-image` tool allows LLMs to issue image searches
 * on the web using search queries.
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
