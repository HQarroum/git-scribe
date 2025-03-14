import { z } from 'zod';

/**
 * The schema for the review object.
 */
export const ReviewSchema = z.object({
  overallQuality: z
    .number()
    .describe('The overall quality of the document on a scale from 0-10.'),
  accuracy: z
    .number()
    .describe('The accuracy of the information in the document on a scale from 0-10.'),
  consistency: z
    .number()
    .describe('The consistency and flow of the information between the different sections on a scale from 0-10.'),
  qualityOfWriting: z
    .number()
    .describe('The quality of the writing in the document on a scale from 0-10.'),
  engagementScore: z
    .number()
    .describe('The potential for engagement score of the document on a scale from 0-10.'),
  easeOfReading: z
    .number()
    .describe('The ease of reading and understanding the document on a scale from 0-10.'),
  overallComments: z
    .string()
    .describe('Overall comments on the document.'),
  suggestions: z
    .string()
    .describe('Suggestions for improvement on the document.')
});

export type Review = z.infer<typeof ReviewSchema>;
