import { NextResponse } from "next/server"
import { logout } from "@/lib/auth"

export async function POST() {
  try {
    await logout()
    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Logout failed" }, { status: 500 })
  }
}
