import { provider } from '../../providers.js';
import { generateText } from 'ai';
import { Plan } from '../../data-models/plan.js';
import { fixMermaidDiagrams } from '../../tools/verify-diagram/index.js';
import { searchWeb } from '../../tools/search-web/index.js';
import { scrapeWebsite } from '../../tools/scrape-website/index.js';
import { spinner } from '@clack/prompts';
import { DocumentType } from '../../data-models/document-type.js';
import { UsageStats } from '../../data-models/usage-stats.js';

import {
  findBestImage,
  searchImage
} from '../../tools/search-image/index.js';
import {
  WRITE_STEP_SYSTEM_PROMPT,
  WRITE_STEP_USER_PROMPT
} from './prompt.js';

/**
 * Shorthand to initialize the usage statistics.
 */
const createStats = (): UsageStats => ({
  completionTokens: 0,
  promptTokens: 0,
  totalTokens: 0
});

/**
 * Writes a section for a document based on the code in the Git repository, the oberall plan to follow,
 * the instructions provided by the user, a research document produced by the research team, and the
 * previously written sections.
 * @param param The instructions, content, and document type to create the plan.
 * @returns The plan object with the information provided by the user.
 */
export const writeSection = async ({
  instructions,
  researchDocument,
  code,
  plan,
  section,
  previousSections
}: {
  instructions: string;
  researchDocument: string;
  code: string;
  plan: Plan;
  section: string;
  previousSections?: string[];
}) => {
  const { text: stepText, usage: stepUsage } = await generateText({
    model: provider.languageModel('writer-model'),
    system: WRITE_STEP_SYSTEM_PROMPT(plan.documentType as DocumentType),
    prompt: WRITE_STEP_USER_PROMPT(
      instructions,
      researchDocument,
      code,
      plan,
      section,
      previousSections
    ),
    tools: {
      searchImage,
      searchWeb,
      scrapeWebsite
    },
    maxSteps: 5,
    maxTokens: 5000
  });

  // Verify whether Mermaid diagrams are valid and attempt to
  // fix them if they are not.
  const { text: fixText, usage: fixUsage } = await fixMermaidDiagrams(stepText);

  return ({
    text: fixText,
    usage: {
      completionTokens: stepUsage.completionTokens + fixUsage.completionTokens,
      promptTokens: stepUsage.promptTokens + fixUsage.promptTokens,
      totalTokens: stepUsage.totalTokens + fixUsage.totalTokens
    }
  });
};

/**
 * Create a document for an article based on the code in the Git repository.
 * @param param The instructions, content, and document type to create the plan.
 * @returns The plan object with the information provided by the user.
 */
export const createDocument = async ({
  plan,
  instructions,
  researchDocument,
  code
}: {
  plan: Plan;
  instructions: any;
  researchDocument: any;
  code: string;
}) => {
  const s = spinner();
  const stats = createStats();

  // The aggregate text for the document.
  const aggregate = [
    `# ${plan.title}\n`
  ];

  // Find the cover image for the document.
  s.start('Finding cover image');
  const coverImage = await findBestImage(plan.coverImage.searchQueryTerms);
  s.stop('Cover image found.');

  // Add the cover image to the document.
  if (coverImage) {
    aggregate.push(`<br />\n<p align="center">\n<img src="${coverImage.url}" alt="Cover Image" width="800">\n</p>\n<br />\n`);
  }

  // Write each section of the document.
  for (let i = 0; i < plan.plan.length; i++) {
    s.start(`Writing section ${plan.plan[i].title}`);
    await new Promise(resolve => setTimeout(resolve, 30000));
    const { text, usage } = await writeSection({
      instructions: instructions.detailedInstructions,
      researchDocument,
      code,
      plan,
      section: `${plan.plan[i].title}`,
      previousSections: aggregate
    });

    // Update the usage statistics.
    stats.completionTokens += usage.completionTokens;
    stats.promptTokens += usage.promptTokens;
    stats.totalTokens += usage.totalTokens;

    aggregate.push(text);
    s.stop(`Section ${plan.plan[i].title} written.`);
  }

  return ({
    text: aggregate.join('\n\n'),
    usage: stats
  });
};
