import { z } from 'zod';

/**
 * The schema for the step object.
 */
export const SectionSchema = z.object({
  index: z
    .number()
    .describe('The incremental index representing the order of the section in the article.'),
  title: z
    .string()
    .describe('The title of the section in the document.'),
  instructions: z
    .string()
    .describe(`
      Detailed instructions to an LLM on how to write the section and what
      to expect in the section.
    `.trim()),
  words: z
    .number()
    .describe('The approximate number of words that the section should contain.')
});

export type Section = z.infer<typeof SectionSchema>;
