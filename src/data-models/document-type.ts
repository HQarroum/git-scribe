import { z } from 'zod';

/**
 * The schema for the document type.
 */
export const DocumentTypeSchema = z.enum([
  'blog-post',
  'tutorial',
  'research-paper',
  'technical-documentation'
])
.describe('The type of document to create.');

export type DocumentType = z.infer<typeof DocumentTypeSchema>;
