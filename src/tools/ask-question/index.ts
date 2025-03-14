import * as p from '@clack/prompts';

import { tool } from 'ai';
import { AskQuestionInputSchema } from './schema.js';
import { cancellable } from '../../utils/prompt.js';

/**
 * The `ask-question` tool.
 */
export const askQuestion = tool({
  description: 'Asks an open question to the user.',
  parameters: AskQuestionInputSchema,
  execute: async ({ message, placeholder, initialValue }) => {
    const result = await cancellable(p.text)({
      message,
      placeholder,
      initialValue
    });

    if (result && result.length > 0) {
      return (result);
    } else {
      return ('The user did not provide an answer.');
    }
  }
});

export { AskQuestionInputSchema };
