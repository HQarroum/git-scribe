import * as p from '@clack/prompts';

import { tool } from 'ai';
import { SelectOptionInputSchema } from './schema.js';
import { cancellable } from '../../utils/prompt.js';

/**
 * The `select-option` tool.
 */
export const selectOption = tool({
  description: 'Prompts the user to select a single answer from a list.',
  parameters: SelectOptionInputSchema,
  execute: async ({ message, options }) => {
    return await cancellable(p.select)({
      message,
      options
    });
  }
});

export { SelectOptionInputSchema };
