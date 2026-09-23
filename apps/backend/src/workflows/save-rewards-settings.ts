import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { z } from "@medusajs/framework/zod"
import { rewardsSettingsSchema } from "../lib/rewards"
import { REWARDS_MODULE } from "../modules/rewards"
import RewardsModuleService from "../modules/rewards/service"

const saveRewardsSettingsStep = createStep("save-rewards-settings", async (input: z.infer<typeof rewardsSettingsSchema>, { container }) => {
  const service = container.resolve<RewardsModuleService>(REWARDS_MODULE)
  const existing = await service.listRewardsConfigs({ id: "rewards_settings" })
  const result = existing.length
    ? await service.updateRewardsConfigs({ id: "rewards_settings", ...input })
    : await service.createRewardsConfigs({ id: "rewards_settings", ...input })
  return new StepResponse(result)
})
export const saveRewardsSettingsWorkflow = createWorkflow("save-rewards-settings", (input: z.infer<typeof rewardsSettingsSchema>) => new WorkflowResponse(saveRewardsSettingsStep(input)))
