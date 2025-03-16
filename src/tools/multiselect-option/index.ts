import * as p from '@clack/prompts';

import { tool } from 'ai';
import { MultiSelectOptionInputSchema } from './schema.js';
import { cancellable } from '../../utils/prompt.js';

/**
 * The `multiselect-option` tool allows an LLM to prompt the user
 * to select from multiple options.
 */
export const multiSelectOption = tool({
  description: 'Prompts the user to select from multiple answers.',
  parameters: MultiSelectOptionInputSchema,
  execute: async ({ message, options }) => {
    return await cancellable(p.multiselect)({
      message,
      options
    });
  }
});

export { MultiSelectOptionInputSchema };
