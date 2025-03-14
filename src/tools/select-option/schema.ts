import { z } from 'zod';

/**
 * The input schema for the `select-option` tool.
 */
export const SelectOptionInputSchema = z.object({
  message: z
    .string()
    .describe('The message to show to the user.'),
  options: z.array(
    z.object({
      value: z.string(),
      label: z.string()
    })
  )
  .describe('The options to show to the user.')
});

export type SelectOptionInput = z.infer<typeof SelectOptionInputSchema>;
