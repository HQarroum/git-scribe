import { z } from 'zod';
import { SectionSchema } from '../data-models/section.js';

/**
 * The schema for the plan result object.
 */
export const PlanResultSchema = z.object({
  title: z
    .string()
    .describe('The title of the document.'),
  coverImage: z
    .object({
      searchQueryTerms: z
        .string()
        .describe('Query terms for a search engine to find the cover image')
    })
    .describe('Describes the document cover image'),
  plan: z
    .array(SectionSchema)
    .describe('The plan for the document with the different sections to create.')
});

export type PlanResult = z.infer<typeof PlanResultSchema>;
