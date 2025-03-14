import fs from 'fs';

import { spinner, log } from '@clack/prompts';
import { promptUser } from './agents/prompter/index.js';
import { getRepositoryCode } from './agents/repository-packager/index.js';
import { createPlan } from './agents/planner/index.js';
import { createResearchDocument } from './agents/researcher/index.js';
import { retro } from 'gradient-string';
import { createDocument } from './agents/writer/index.js';
import { createReview } from './agents/reviewer/index.js';

import {
  displayCodeDetails,
  displayPlan,
  displayReview,
  displayUsage
} from './utils/prompt.js';

console.log(
  retro(`
 ██████╗ ██╗████████╗    ███████╗ ██████╗██████╗ ██╗██████╗ ███████╗
██╔════╝ ██║╚══██╔══╝    ██╔════╝██╔════╝██╔══██╗██║██╔══██╗██╔════╝
██║  ███╗██║   ██║       ███████╗██║     ██████╔╝██║██████╔╝█████╗
██║   ██║██║   ██║       ╚════██║██║     ██╔══██╗██║██╔══██╗██╔══╝
╚██████╔╝██║   ██║       ███████║╚██████╗██║  ██║██║██████╔╝███████╗
 ╚═════╝ ╚═╝   ╚═╝       ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝
`)
);

/**
 * Input options for the execution of the chain-of-agents.
 */
export type ExecutionOpts = {
  source: string;
  output: string;
  researchOutput?: string;
  enableReviewer?: boolean;
};

/**
 * Runs the chain-of-agents to create a document from a source code repository.
 * @param param information about the source repository and the output file.
 */
export const execute = async ({ source, output, researchOutput, enableReviewer }: ExecutionOpts) => {
  const s = spinner();

  //////////////////////////////////////////////
  ////   Clone and package the repository   ////
  //////////////////////////////////////////////

  s.start('Cloning repository');
  const { totalTokens, content } = await getRepositoryCode({ source });
  s.stop('Repository cloned');
  
  // Display the code details.
  displayCodeDetails({ code: content, totalTokens });

  //////////////////////////////////////////////
  ////   Prompt the user for instructions   ////
  //////////////////////////////////////////////

  const { instructions, usage: promptUsage } = await promptUser();
  log.step('Instructions');
  log.success(instructions.detailedInstructions);

  //////////////////////////////////////////////
  ////     Create the research document     ////
  //////////////////////////////////////////////

  s.start('Creating research document');
  const { research, code, usage: researchUsage } = await createResearchDocument({
    content,
    userInstructions: instructions.detailedInstructions
  });
  s.stop('Research completed');

  // Save the research document if an output path is provided.
  if (researchOutput) {
    fs.writeFileSync(researchOutput, research);
    log.success('The research document has been saved.');
  }

  /////////////////////////////////////////////////
  ////     Create the plan for the document    ////
  /////////////////////////////////////////////////

  log.info('I will now create a plan for the document.');
  s.start('Creating plan');
  const { plan, documentType, coverImage, title, usage: planUsage } = await createPlan({
    instructions: instructions.detailedInstructions,
    researchDocument: research,
    documentType: instructions.documentType
  });
  s.stop();

  // Display the plan.
  displayPlan({ title, documentType, coverImage, plan });


  //////////////////////////////////////////////
  ////   Write the sections of the document  ////
  //////////////////////////////////////////////

  log.info('Let\'s write the sections of the document.');

  // Write each section of the document.
  let { text, usage: documentUsage } = await createDocument({
    plan: { plan, documentType, coverImage, title },
    instructions,
    researchDocument: research,
    code
  });

  // Save the document to the output path.
  fs.writeFileSync(output, text);
  log.success('The document has been written successfully.');

  //////////////////////////////////////////////
  ////     Display the usage statistics     ////
  //////////////////////////////////////////////

  displayUsage({
    promptTokens: promptUsage.totalTokens,
    researchTokens: researchUsage.totalTokens,
    planTokens: planUsage.totalTokens,
    documentTokens: documentUsage.totalTokens
  });

  //////////////////////////////////////////////
  ////         Review the document          ////
  //////////////////////////////////////////////
  
  if (enableReviewer) {
    log.info('I will now review the document.');
    
    s.start('Reviewing document');
    // Review the document.
    const result = await createReview({
      document: text,
      plan: { plan, documentType, coverImage, title },
      instructions: instructions.detailedInstructions
    });
    s.stop('Document reviewed');

    // Display the review results.
    displayReview(result);
  }
};
