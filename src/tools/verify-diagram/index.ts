import os from 'os';
import fs from 'fs';
import path from 'path';

import { z } from 'zod';
import { VerifyDiagramInputSchema } from './schema.js';
import { run } from '@mermaid-js/mermaid-cli';
import { marked } from 'marked';
import { Output, tool, generateText } from 'ai';
import { provider } from '../../providers.js';
import { UsageStats } from '../../data-models/usage-stats.js';

/**
 * Shorthand to initialize the usage statistics.
 */
const createStats = (): UsageStats => ({
  completionTokens: 0,
  promptTokens: 0,
  totalTokens: 0
});

/**
 * Extract the Mermaid diagrams from the markdown text.
 * @param markdownText The markdown text to extract the Mermaid diagrams from.
 * @returns The Mermaid diagrams code extracted from the markdown text.
 */
export const extractMermaidDiagrams = (markdownText: string) => {
  const diagrams: string[] = [];
  const renderer = new marked.Renderer();

  // Override the code block rendering
  renderer.code = ({ text, lang, type }) => {
    if (type === 'code' && lang === 'mermaid') {
      diagrams.push(text);
    }
    return ('');
  };

  // Parse the markdown.
  marked(markdownText, { renderer });

  return (diagrams);
};

/**
 * Check if a Mermaid diagram is valid.
 * @param code The Mermaid diagram code to check.
 * @returns The result of the validation.
 */
export const isMermaidDiagramValid = async (code: string) => {
  try {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'diagram-'));

    // The temporary diagram file path.
    const tempFilePath = path.join(tempDir, 'diagram.mmd');

    // Write the diagram code to the temporary file.
    fs.writeFileSync(tempFilePath, code);

    // Render the diagram.
    await run(
      tempFilePath,
      `${tempDir}/output.svg`,
      { quiet: true }
    );

    return ({ valid: true, error: null });
  } catch (e: any) {
    return ({ valid: false, error: e.message });
  }
};

/**
 * Attempt to fix a broken Mermaid diagram using an LLM.
 * @param diagramCode The broken Mermaid diagram code.
 * @param errorMessage The error message from the validation.
 * @returns The fixed Mermaid diagram code or null if fixing failed.
 */
export const fixDiagram = async (
  diagramCode: string,
  errorMessage: string,
  opts = { maxAttempts: 5 }
) => {
  let attempts = 0;
  let currentDiagram = diagramCode;
  let result = { valid: false, error: errorMessage };
  const stats = createStats();

  while (!result.valid && attempts < opts.maxAttempts) {
    attempts++;

    // Use the syntax model to fix the diagram.
    const { experimental_output, usage } = await generateText({
      model: provider.languageModel('syntax-model'),
      system: "You are an expert in Mermaid diagram syntax. Fix the provided Mermaid diagram code that is causing errors.",
      prompt: `The following Mermaid diagram has an error: ${result.error}\n\nHere is the diagram code:\n\`\`\`mermaid\n${currentDiagram}\n\`\`\`\n\nPlease provide only the fixed Mermaid code without any explanations or markdown formatting.`,
      maxTokens: 1000,
      experimental_output: Output.object({
        schema: z.object({
          code: z
            .string()
            .describe('The fixed Mermaid diagram code.')
        })
      }),
      maxRetries: 2
    });

    // Update the usage statistics.
    stats.completionTokens += usage.completionTokens;
    stats.promptTokens += usage.promptTokens;
    stats.totalTokens += usage.totalTokens;

    // Extract just the diagram code from the LLM response
    currentDiagram = experimental_output.code.trim();

    // Remove any markdown formatting the LLM might have added
    if (currentDiagram.startsWith("```mermaid")) {
      currentDiagram = currentDiagram.replace(/```mermaid\n/, "").replace(/```/, "");
    }

    // Validate the fixed diagram
    result = await isMermaidDiagramValid(currentDiagram);

    if (result.valid) {
      return ({ text: currentDiagram, usage: stats });
    }
  }

  return ({ text: null, usage: stats });
};

/**
 * Fix Mermaid diagrams in a markdown text.
 * @param markdownText The markdown text to fix the Mermaid diagrams in.
 * @returns The markdown text with the Mermaid diagrams fixed.
 */
export const fixMermaidDiagrams = async (markdownText: string) => {
  const diagrams = extractMermaidDiagrams(markdownText);
  const stats = createStats();

  for (let i = 0; i < diagrams.length; i++) {
    const result = await isMermaidDiagramValid(diagrams[i]);

    if (!result.valid) {
      const { text, usage } = await fixDiagram(diagrams[i], result.error);
      if (text) {
        markdownText = markdownText.replace(diagrams[i], text);
      }

      // Update the usage statistics.
      stats.completionTokens += usage.completionTokens;
      stats.promptTokens += usage.promptTokens;
      stats.totalTokens += usage.totalTokens;
    }
  }

  return ({
    text: markdownText,
    usage: stats
  });
};

/**
 * The `verify-diagram` tool.
 */
export const verifyDiagram = tool({
  description: 'Verifies whether the code for a mermaid diagram is valid.',
  parameters: VerifyDiagramInputSchema,
  execute: async ({ code }) => {
    const result = await isMermaidDiagramValid(code);

    if (result.valid) {
      return ('The diagram code is valid.');
    } else {
      return (`The diagram code is invalid: ${result.error}`);
    }
  }
});
