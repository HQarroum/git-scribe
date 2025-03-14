import { z } from 'zod';

/**
 * The input schema for the `ask-question` tool.
 */
export const AskQuestionInputSchema = z.object({
  message: z
    .string()
    .describe('The message to show to the user.'),
  placeholder: z
    .string()
    .describe('An optional placeholder text for the user\'s response.'),
  initialValue: z
    .string()
    .describe('An optional initial value for the user\'s response.')
});

export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;
