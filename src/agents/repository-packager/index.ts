import os from 'os';
import fs from 'fs';
import path from 'path';
import git from 'simple-git';

import { pack } from 'repomix';
import { get_encoding } from 'tiktoken';
import {
  ignorePatterns,
  outputOptions
} from './repomix.js';

/**
 * The name of the output file.
 */
const FILE_NAME = '.repomix-output.txt';

/**
 * The approximate number of characters per token in code.
 */
const CHARS_PER_TOKEN = 3;

/**
 * The limit of tokens to consider for the repository.
 */
const TOKEN_LIMIT = 140_000;

/**
 * The encoding for the token count.
 */
const encoding = get_encoding('o200k_base');

/**
 * Checks if the provided source is a URL.
 * @param source the source to check.
 * @returns a boolean indicating whether the source is a URL.
 */
const isUrl = (source: string) => {
  try {
    new URL(source);
    return true;
  } catch {
    return false;
  }
};

/**
 * Clones the Git repository associated with the provided source.
 * @param source the source (e.g directory path or Git url) of the repository to clone.
 * @returns the path to the cloned repository.
 */
export const cloneRepository = async ({ source }: { source: string }) => {
  const dirPath = path.join(os.tmpdir(), 'GIT_ARTICLE');
  const tempDir = fs.mkdtempSync(dirPath);

  // Clone the repository.
  if (!isUrl(source)) {
    throw new Error('The provided source is not a valid URL.');
  }
  
  // Clone the repository locally.
  await (git as any)().clone(source, tempDir);

  return (tempDir);
};

/**
 * Packages the Git repository associated with the provided source.
 * @param source the source (e.g directory path or Git url) of the repository to package.
 * @returns a string of the packaged repository.
 */
export const packageRepository = async ({ source }: { source: string }) => {
  let tempDir = null;

  try {
    // Create temporary directory to store the output.
    const dirPath = path.join(os.tmpdir(), 'GIT_ARTICLE');
    tempDir = fs.mkdtempSync(dirPath);

    if (isUrl(source)) {
      // Clone the repository.
      source = await cloneRepository({ source });
    } else {
      // Check if the source directory exists.
      if (!fs.existsSync(source)) {
        throw new Error('The provided source directory does not exist.');
      }
    }

    const result = await pack([
      source
    ], {
      output: {
        ...outputOptions,
        filePath: path.join(tempDir, FILE_NAME),
        git: {
          sortByChanges: true,
          sortByChangesMaxCommits: 100
        }
      },
      include: [],
      ignore: {
        useGitignore: true,
        useDefaultPatterns: true,
        customPatterns: ignorePatterns
      },
      security: {
        enableSecurityCheck: true
      },
      tokenCount: {
        encoding: 'o200k_base',
      },
      cwd: process.cwd()
    });

    // Load the content in memory.
    const content = fs.readFileSync(path.join(tempDir, FILE_NAME), 'utf8');

    return ({
      totalTokens: result.totalTokens,
      totalFiles: result.totalFiles,
      totalCharacters: result.totalCharacters,
      content
    });
  } finally {
    if (tempDir) {
      // Remove the temporary directory.
      fs.rmSync(tempDir, { recursive: true });
    }
  }
};

/**
 * Gets the code from a source repository.
 * @param source The source repository.
 * @returns The code from the repository.
 */
export const getRepositoryCode = async ({ source }: { source: string }) => {
  let { totalTokens, content } = await packageRepository({ source });
  let cropped = false;

  // If the `totalTokens` is zero, it means the token count is unknown.
  if (totalTokens === 0) {
    totalTokens = Math.round(content.length / CHARS_PER_TOKEN);
  }

  // Ensure the size is not larger than the allowed limit.
  if (totalTokens > TOKEN_LIMIT) {
    // Limit the size of the repository considering a token is
    // approximately 4 characters in the english language.
    content = content.substring(0, TOKEN_LIMIT * CHARS_PER_TOKEN);
    try {
      totalTokens = encoding.encode(content).length;
    } catch {
      totalTokens = Math.round(content.length / CHARS_PER_TOKEN);
    }
    cropped = true;
  }

  return ({ cropped, content, totalTokens });
};
