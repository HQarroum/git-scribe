import { z } from 'zod';

/**
 * The input schema for the `verify-diagram` tool.
 */
export const VerifyDiagramInputSchema = z.object({
  code: z
    .string()
    .describe('The code of the mermaid diagram to verify.')
});

export type VerifyDiagramInput = z.infer<typeof VerifyDiagramInputSchema>;
