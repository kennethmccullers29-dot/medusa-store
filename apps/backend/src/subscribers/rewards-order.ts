import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { manageRewardsWorkflow } from "../workflows/manage-rewards"

export default async function rewardsOrder({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({ entity: "order", fields: ["customer_id"], filters: { id: data.id } })
  if (orders[0]?.customer_id) await manageRewardsWorkflow(container).run({ input: { customer_id: orders[0].customer_id, action: "sync" } })
}
export const config: SubscriberConfig = { event: ["order.placed", "order.canceled", "order.completed"] }
