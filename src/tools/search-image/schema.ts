import { z } from 'zod';

/**
 * The input schema for the `search-image` tool.
 */
export const SearchImageInputSchema = z.object({
  query: z
    .string()
    .describe('The search query to use to search for images in a image search engine.'),
  per_page: z
    .number()
    .describe('A number between 5 and 20 that represents the number of images to return per result.')
});

export type SearchImageInput = z.infer<typeof SearchImageInputSchema>;
