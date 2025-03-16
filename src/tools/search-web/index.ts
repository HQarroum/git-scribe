import { SearchWebInputSchema } from './schema.js';
import { tool } from 'ai';
import { tavily, TavilyClient } from '@tavily/core';

/**
 * @returns {TavilyClient} a new Tavily client.
 */
const createClient = (): TavilyClient => {
  return (tavily({
    apiKey: process.env.TAVILY_API_KEY!
  }));
};

/**
 * The `search-web` tool allows LLMs to issue web searches
 * using search queries.
 */
export const searchWeb = tool({
  description: 'Searches the web using a search engine given a search query, and returns a list of relevant URLs.',
  parameters: SearchWebInputSchema,
  execute: async ({ search_query }) => {
    try {
      return await createClient().search(search_query, { limit: 10 });
    } catch (error) {
      return ('Failed to search the web.');
    }
  }
});
