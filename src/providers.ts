import { openai } from '@ai-sdk/openai';
import { customProvider } from 'ai';

/**
 * Definition of the different types of models exposed to the different
 * agents part of the application.
 */
export const provider = customProvider({
  languageModels: {
    // Model used to prompt the user for information.
    'prompter-model': openai('gpt-4o', {
      structuredOutputs: true
    }),

    // Model used to create the plan of the document.
    'planner-model': openai('o3-mini', {
      structuredOutputs: true,
      reasoningEffort: 'medium'
    }),

    // Model used to create the content of the document.
    'writer-model': openai('o3-mini', {
      reasoningEffort: 'high'
    }),

    // Model used to conduct research on the repository.
    'researcher-model': openai('o3-mini', {
      reasoningEffort: 'high'
    }),

    // Model used to extract the relevant code from the repository.
    'code-extractor-model': openai('o3-mini', {
      reasoningEffort: 'medium'
    }),

    // Model used to review the produced document.
    'reviewer-model': openai('o3-mini', {
      reasoningEffort: 'high',
      structuredOutputs: true
    }),

    // Model used to correct invalid syntax.
    'syntax-model': openai('gpt-4o-mini')
  },
  fallbackProvider: openai
});
