import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import ShippoProviderService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [ShippoProviderService],
})
