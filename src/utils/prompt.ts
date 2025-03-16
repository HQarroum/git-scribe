import Table from 'cli-table3';

import { Plan } from '../data-models/plan.js';
import { Review } from '../data-models/review.js';
import {
  log,
  isCancel,
  TextOptions,
  SelectOptions,
  MultiSelectOptions,
  ConfirmOptions,
  PasswordOptions,
  GroupMultiSelectOptions,
  LogMessageOptions,
  SpinnerOptions
} from '@clack/prompts';

/**
 * The types for the cancellable options.
 */
export type CancellableOptions = TextOptions
  | SelectOptions<any>
  | MultiSelectOptions<any>
  | ConfirmOptions
  | PasswordOptions
  | GroupMultiSelectOptions<any>
  | LogMessageOptions
  | SpinnerOptions;

/**
 * The type for the async iterable stream.
 */
export type AsyncIterableStream<T> = AsyncIterable<T> & ReadableStream<T>;

/**
 * A functional wrapper for a cancellable function for clack prompts.
 * @param fn The function to wrap.
 * @returns The wrapped function.
 */
export const cancellable = <T extends CancellableOptions>(fn: (opts: T) => Promise<any>) => {
  return async (opts: T) => {
    const result = await fn(opts);
    if (isCancel(result)) {
      process.exit(0);
    }
    return (result);
  };
};

/**
 * Dumps a text stream to the standard output.
 * @param title The title for the stream.
 * @param stream The stream to dump.
 */
export const displayStream = async ({
  title,
  stream
}: {
  title: string;
  stream: AsyncIterableStream<string>;
}) => {
  let value = '';

  log.step(title);
  for await (const chunk of stream) {
    value += chunk;
    process.stdout.write(chunk);
  }
  return (value);
};

/**
 * Displays the plan for the document to the standard output.
 * @param plan The plan for the document.
 */
export const displayCodeDetails = ({
  code,
  totalTokens
}: {
  code: string;
  totalTokens: number
}) => {
  const table = new Table({
    head: ['Token Size', 'Character Size'],
  });

  table.push([
    `${totalTokens > 0 ? totalTokens : 'Unknown'} tokens`,
    `${code.length} characters`
  ]);

  console.log(table.toString());
};

/**
 * Displays the plan for the document to the standard output.
 * @param plan The plan for the document.
 */
export const displayPlan = (plan: Plan) => {
  const table = new Table({
    head: ['Sections', 'Length'],
  });

  log.step('Plan');
  for (let i = 0; i < plan.plan.length; i++) {
    table.push([
      plan.plan[i].title,
      `${plan.plan[i].words} words`
    ]);
  }

  console.log(table.toString());
};

/**
 * Displays a table with the completion, prompt and total tokens
 * used to write the document.
 * @param usage The usage statistics for the document.
 */
export const displayUsage = (usage: {
  promptTokens: number,
  researchTokens: number,
  planTokens: number,
  documentTokens: number
}) => {
  const table = new Table({
    head: ['Step', 'Tokens']
  });

  // Calculate the total tokens used.
  const totalTokensUsed = usage.promptTokens
    + usage.researchTokens
    + usage.planTokens
    + usage.documentTokens;

  log.step('Token Consumption');
  table.push(
    ['Prompt User', usage.promptTokens],
    ['Research', usage.researchTokens],
    ['Plan', usage.planTokens],
    ['Document', usage.documentTokens],
    ['Total', totalTokensUsed]
  );

  console.log(table.toString());
};

/**
 * Displays a review to the standard output.
 * @param review The review to display.
 */
export const displayReview = (review: Review) => {
  const table = new Table({
    head: ['Metric', 'Score (0-10)']
  });

  log.step('Review');
  table.push(
    ['Overall Quality', `${review.overallQuality}/10`],
    ['Accuracy', `${review.accuracy}/10`],
    ['Consistency', `${review.consistency}/10`],
    ['Quality of Writing', `${review.qualityOfWriting}/10`],
    ['Engagement Score', `${review.engagementScore}/10`],
    ['Ease of Reading', `${review.easeOfReading}/10`]
  );

  // Display the table.
  console.log(table.toString());

  // Display comments and suggestions.
  log.step('Overall Comments');
  log.info(review.overallComments);
  log.step('Suggestions');
  log.info(review.suggestions);
};
