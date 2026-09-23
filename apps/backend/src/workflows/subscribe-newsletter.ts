import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { klaviyoRequest, subscriptionPayload } from "../lib/klaviyo"

const subscribeEmail = createStep("subscribe-email", async ({ email }: { email: string }) => {
  if (!process.env.KLAVIYO_LIST_ID) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Klaviyo subscriber list is not configured.")
  await klaviyoRequest("profile-subscription-bulk-create-jobs/", subscriptionPayload(email, process.env.KLAVIYO_LIST_ID))
  return new StepResponse({ accepted: true })
})
export const subscribeNewsletterWorkflow = createWorkflow("subscribe-newsletter", (input: { email: string }) => new WorkflowResponse(subscribeEmail(input)))
