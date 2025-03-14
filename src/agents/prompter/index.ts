import { provider } from '../../providers.js';
import { generateText } from 'ai';
import { PromptSchema } from './schema.js';

import {
  PROMPT_USER_SYSTEM_PROMPT,
  PROMPT_USER_USER_PROMPT
} from './prompt.js';
import {
  askQuestion,
  confirmQuestion,
  selectOption,
  multiSelectOption
} from '../../tools/index.js';

/**
 * Prompt the user for information on how to write the document.
 * @returns The document object with the information provided by the user.
 */
export const promptUser = async () => {
  const { experimental_output, usage } = await generateText({
    model: provider.languageModel('prompter-model'),
    system: PROMPT_USER_SYSTEM_PROMPT,
    prompt: PROMPT_USER_USER_PROMPT,
    tools: {
      askQuestion,
      confirmQuestion,
      selectOption,
      multiSelectOption
    },
    experimental_output: PromptSchema,
    maxSteps: 15
  });

  // Throw if the extraction was not successful.
  if (!experimental_output.success) {
    throw new Error('The extraction of the information from the user was not successful.');
  }
  return ({
    instructions: experimental_output.document,
    usage
  });
};
