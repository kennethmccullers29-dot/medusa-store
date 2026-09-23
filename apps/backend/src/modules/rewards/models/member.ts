import { model } from "@medusajs/framework/utils"

export default model.define("rewards_member", {
  id: model.id().primaryKey(),
  customer_id: model.text().unique("IDX_REWARDS_MEMBER_CUSTOMER"),
  signup_points: model.number(),
  birthday_month: model.number().nullable(),
  birthday_day: model.number().nullable(),
  birthday_registered_at: model.dateTime().nullable(),
})
