import * as p from '@clack/prompts';

import { tool } from 'ai';
import { ConfirmInputSchema } from './schema.js';
import { cancellable } from '../../utils/prompt.js';

/**
 * The `confirm-question` tool.
 */
export const confirmQuestion = tool({
  description: 'Prompts the user to confirm a yes/no question.',
  parameters: ConfirmInputSchema,
  execute: async ({ message }) => {
    return await cancellable(p.confirm)({
      message
    });
  }
});

export { ConfirmInputSchema };
