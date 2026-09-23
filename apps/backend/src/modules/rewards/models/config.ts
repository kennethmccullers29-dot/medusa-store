import { model } from "@medusajs/framework/utils"

export default model.define("rewards_config", {
  id: model.id().primaryKey(),
  name: model.text(),
  enabled: model.boolean().default(true),
  signup_points: model.number(),
  points_per_unit: model.number(),
  birthday_points: model.number(),
  redemption_points: model.number(),
  discount_percent: model.number(),
})
