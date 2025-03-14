import { z } from 'zod';

/**
 * The input schema for the `search-web` tool.
 */
export const SearchWebInputSchema = z.object({
  search_query: z
    .string()
    .describe('The search query to use to search the web using a search engine.')
});

export type SearchWebInput = z.infer<typeof SearchWebInputSchema>;
