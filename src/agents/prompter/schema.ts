import { z } from 'zod';
import { Output } from 'ai';
import { DocumentTypeSchema } from '../../data-models/document-type.js';

/**
 * The schema for the query object.
 */
export const PromptSchema = Output.object({
  schema: z.object({
    success: z
      .boolean()
      .describe('Whether the extraction of all the information from the user was successful.'),
    document: z.object({
      documentType: DocumentTypeSchema,
      detailedInstructions: z
        .string()
        .describe('The detailed instructions aimed at an LLM on how to write the document.')
    })
    .describe('The information gathered from the user in order to write the document.'),
  })
});
