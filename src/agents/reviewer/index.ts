import { provider } from '../../providers.js';
import { generateText } from 'ai';
import { searchWeb } from '../../tools/search-web/index.js';
import { scrapeWebsite } from '../../tools/scrape-website/index.js';
import { ReviewOutputSchema } from './schema.js';
import { Plan } from '../../data-models/plan.js';

import {
  REVIEWER_SYSTEM_PROMPT,
  REVIEWER_USER_PROMPT
} from './prompt.js';

/**
 * Creates a review of the given document based on the instructions and plan.
 * The review will provide feedback on the document, and extract key metrics
 * based on the quality of the document.
 * @param param The instructions, and document to review.
 */
export const createReview = async ({
  instructions,
  plan,
  document
}: {
  instructions: string;
  plan: Plan;
  document: string;
}) => {
  const result = await generateText({
    model: provider.languageModel('reviewer-model'),
    system: REVIEWER_SYSTEM_PROMPT,
    prompt: REVIEWER_USER_PROMPT(
      instructions,
      plan,
      document
    ),
    tools: {
      searchWeb,
      scrapeWebsite
    },
    maxTokens: 5000,
    maxSteps: 10,
    experimental_output: ReviewOutputSchema
  });

  return (result.experimental_output);
};
