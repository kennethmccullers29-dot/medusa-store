import { model } from "@medusajs/framework/utils"

export default model.define("rewards_activity", {
  id: model.id().primaryKey(),
  customer_id: model.text().index("IDX_REWARDS_ACTIVITY_CUSTOMER"),
  source_key: model.text().unique("IDX_REWARDS_ACTIVITY_SOURCE"),
  points: model.number(),
  kind: model.enum(["signup", "purchase", "birthday", "redemption", "refund"]),
  note: model.text(),
  order_id: model.text().nullable(),
  earning_rate: model.float().nullable(),
})
