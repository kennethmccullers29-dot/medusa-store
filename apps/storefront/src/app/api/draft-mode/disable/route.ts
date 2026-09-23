import { draftMode } from "next/headers"

export async function POST() {
  const mode = await draftMode()
  mode.disable()
  return Response.json({ disabled: true })
}
