import { provider } from '../../providers.js';
import { generateText } from 'ai';
import { PlanOutputSchema } from './schema.js';
import { DocumentType } from '../../data-models/document-type.js';

import {
  CREATE_PLAN_SYSTEM_PROMPT,
  CREATE_PLAN_USER_PROMPT
} from './prompt.js';

/**
 * Create a plan for an article based on the code in the Git repository.
 * @param param The instructions, content, and document type to create the plan.
 * @returns The plan object with the information provided by the user.
 */
export const createPlan = async ({
  instructions,
  researchDocument,
  documentType
}: {
  instructions: string;
  researchDocument: string;
  documentType: DocumentType;
}) => {
  const { experimental_output, usage } = await generateText({
    model: provider.languageModel('planner-model'),
    system: CREATE_PLAN_SYSTEM_PROMPT(documentType),
    prompt: CREATE_PLAN_USER_PROMPT(
      instructions,
      researchDocument,
      documentType
    ),
    experimental_output: PlanOutputSchema
  });

  return ({
    documentType,
    usage,
    ...experimental_output
  });
};
