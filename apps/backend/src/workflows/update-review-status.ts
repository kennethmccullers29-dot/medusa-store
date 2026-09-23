import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateReviewStatusStep, UpdateReviewStatusStepInput } from "./steps/update-review-status"

export const updateReviewStatusWorkflow = createWorkflow(
  "update-review-status",
  (input: UpdateReviewStatusStepInput) => {
    const review = updateReviewStatusStep(input)
    return new WorkflowResponse(review)
  }
)
