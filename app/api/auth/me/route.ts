import { NextResponse } from "next/server"
import { getSession, getUserById } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(null, { status: 401 })
    }

    const user = await getUserById(session.id)

    if (!user) {
      return NextResponse.json(null, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in /api/auth/me:", error)
    return NextResponse.json(null, { status: 500 })
  }
}
