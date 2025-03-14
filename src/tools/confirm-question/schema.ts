import { z } from 'zod';

/**
 * The input schema for the `confirm` tool.
 */
export const ConfirmInputSchema = z.object({
  message: z
    .string()
    .describe('The message to prompt to the user for confirmation.')
});

export type ConfirmInput = z.infer<typeof ConfirmInputSchema>;
