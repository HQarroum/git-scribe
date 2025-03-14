#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import { program } from 'commander';
import { execute } from './execution.js';
import { isUrl } from './utils/url.js';

/**
 * Command-line interface.
 */
program
  .name('git-scribe')
  .version('0.0.5')
  .description('Chain-of-Agents based article generation based on repository analysis.')
  .requiredOption('-r, --repository <source>', 'The source of the repository to analyze (remote git repository, or local directory).')
  .requiredOption('-o, --output <output>', 'The output file to write the document to on the filesystem.', 'output.md')
  .option('-p, --research-output <output>', 'Optional output to store the result of the research agent')
  .option('-e, --enable-reviewer', 'Review the generated document using a reviewer agent', false)
  .showSuggestionAfterError(true)
  .parse(process.argv);

/**
 * The program options.
 */
const opts = program.opts();

/**
 * Verify environment variables.
 */
if (!process.env.OPENAI_API_KEY) {
  console.error('The OPENAI_API_KEY environment variable must be set.');
  process.exit(1);
}
if (!process.env.FIRECRAWL_API_KEY) {
  console.error('The FIRECRAWL_API_KEY environment variable must be set.');
  process.exit(1);
}
if (!process.env.TAVILY_API_KEY) {
  console.error('The TAVILY_API_KEY environment variable must be set.');
  process.exit(1);
}

/**
 * Ensures the output directory exists.
 * @param path the path to the directory.
 */
const createIfNotExists = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

/**
 * Checks if the repository points to a directory or an URL.
 * If it is a directory, we want to ensure that the path is valid
 * and that the directory exists.
 */
if (!isUrl(opts.repository)) {
  opts.repository = path.resolve(opts.repository);
  if (!fs.existsSync(opts.repository)) {
    console.error(`The repository path '${opts.repository}' does not exist.`);
    process.exit(1);
  }
}

/**
 * Normalizes the output path, and ensures the directory exists.
 */
opts.output = path.resolve(opts.output);

// Ensure the path is a markdown file (ends with `.md`).
if (!opts.output.endsWith('.md')) {
  console.error('The output file must be a markdown file (`.md`).');
  process.exit(1);
}

// Ensure the directory exists.
createIfNotExists(path.dirname(opts.output));

/**
 * Normalizes the research output path, and ensures the directory exists.
 */
if (opts.researchOutput) {
  opts.researchOutput = path.resolve(opts.researchOutput);
  createIfNotExists(path.dirname(opts.researchOutput));
}

/**
 * Run the agents.
 */
(async () => {
  await execute({
    source: opts.repository,
    output: opts.output,
    researchOutput: opts.researchOutput,
    enableReviewer: opts.enableReviewer
  });
})();
