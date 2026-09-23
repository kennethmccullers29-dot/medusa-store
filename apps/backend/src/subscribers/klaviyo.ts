import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { syncKlaviyoEventWorkflow } from "../workflows/sync-klaviyo-event"

export default async function klaviyo({ event, container }: SubscriberArgs<{ id: string }>) {
  await syncKlaviyoEventWorkflow(container).run({ input: { id: event.data.id, event: event.name as "order.placed" | "order.canceled" | "customer.created" } })
}
export const config: SubscriberConfig = { event: ["order.placed", "order.canceled", "customer.created"], context: { subscriberId: "klaviyo-events" } }
