import { Module } from "@medusajs/framework/utils"
import RewardsModuleService from "./service"

export const REWARDS_MODULE = "rewards"
export default Module(REWARDS_MODULE, { service: RewardsModuleService })
