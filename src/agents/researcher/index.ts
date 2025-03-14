import { provider } from '../../providers.js';
import { generateText } from 'ai';
import { searchWeb } from '../../tools/search-web/index.js';
import { scrapeWebsite } from '../../tools/scrape-website/index.js';

import {
  RESEARCHER_SYSTEM_PROMPT,
  RESEARCHER_USER_PROMPT,
  CODE_EXTRACTION_SYSTEM_PROMPT,
  CODE_EXTRACTION_USER_PROMPT
} from './prompt.js';

/**
 * Creates a research document about the given repository to guide
 * the next agents towards writing quality sections.
 * @param param The code in the Git repository.
 * @returns the research document in Markdown.
 * @note uses web search and scraping to find complementary information.
 */
const createResearch = async ({ content }: { content: string; }) => {
  const { text: research, usage } = await generateText({
    model: provider.languageModel('researcher-model'),
    system: RESEARCHER_SYSTEM_PROMPT,
    prompt: RESEARCHER_USER_PROMPT(content),
    tools: {
      searchWeb,
      scrapeWebsite
    },
    maxSteps: 5
  });

  return ({ research, usage });
};

/**
 * Extracts the most relevant code chunks from the given repository.
 * @param param The code in the Git repository and user instructions.
 * @returns the extracted code.
 */
const extractCode = async ({
  content,
  userInstructions
}: {
  content: string;
  userInstructions: string;
}) => {
  const { text: code, usage } = await generateText({
    model: provider.languageModel('code-extractor-model'),
    system: CODE_EXTRACTION_SYSTEM_PROMPT,
    prompt: CODE_EXTRACTION_USER_PROMPT(
      content,
      userInstructions
    ),
    maxTokens: 15_000
  });

  return ({ code, usage });
};

/**
 * Creates a research document and code extraction from the given repository.
 * @param param The code in the Git repository and user instructions.
 * @returns the text of the research document and the extracted code.
 */
export const createResearchDocument = async ({
  content,
  userInstructions
}: {
  content: string;
  userInstructions: string;
}) => {
  // We first create a research paper and bibliography on the repository.
  const { research, usage: researchUsage } = await createResearch({ content });

  // Wait a few seconds to avoid throttling.
  await new Promise(resolve => setTimeout(resolve, 5000));

  // We then create a scope down and more precise extract of the source code
  // to reduce the number of tokens that the writers will have to work with.
  const { code, usage: codeUsage } = await extractCode({ content, userInstructions });

  return {
    research,
    code,
    usage: {
      completionTokens: researchUsage.completionTokens + codeUsage.completionTokens,
      promptTokens: researchUsage.promptTokens + codeUsage.promptTokens,
      totalTokens: researchUsage.totalTokens + codeUsage.totalTokens
    }
  };
};
