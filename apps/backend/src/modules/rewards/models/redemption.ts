import { model } from "@medusajs/framework/utils"

export default model.define("rewards_redemption", {
  id: model.id().primaryKey(),
  customer_id: model.text().index("IDX_REWARDS_REDEMPTION_CUSTOMER"),
  request_id: model.text().unique("IDX_REWARDS_REDEMPTION_REQUEST"),
  code: model.text().unique("IDX_REWARDS_REDEMPTION_CODE"),
  points: model.number(),
  discount_percent: model.number(),
  currency_code: model.text(),
  promotion_id: model.text().nullable(),
  status: model.enum(["pending", "ready"]).default("pending"),
})
