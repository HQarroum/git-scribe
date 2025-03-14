import { z } from 'zod';

/**
 * The input schema for the `multiselect-option` tool.
 */
export const MultiSelectOptionInputSchema = z.object({
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

export type MultiSelectOptionInput = z.infer<typeof MultiSelectOptionInputSchema>;
