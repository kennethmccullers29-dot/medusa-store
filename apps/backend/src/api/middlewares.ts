import { 
  defineMiddlewares,
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { PostStoreReviewSchema } from "./store/reviews/route"
import { GetAdminReviewsSchema } from "./admin/reviews/route"



export default defineMiddlewares({
  routes: [
    { matcher: "/store/rewards/me", middlewares: [authenticate("customer", ["session", "bearer"])] },
     {
      matcher: "/admin/reviews",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminReviewsSchema, {
          isList: true,
          defaults: [
            "id",
            "title",
            "content",
            "rating",
            "first_name",
            "last_name",
            "product_id",
            "customer_id",
            "status",
            "created_at",
            "updated_at",
            "product.*",
          ],
        }),
      ],
    },

    {
      method: ["POST"], 
      matcher: "/store/reviews",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(PostStoreReviewSchema),
      ],
    },
    
  ],
})

