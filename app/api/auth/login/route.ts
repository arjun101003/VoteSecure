import { NextResponse } from "next/server"
import { verifyUser, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const user = await verifyUser(email, password)
    await createSession(user)

    return NextResponse.json({ success: true, message: "Login successful" }, { status: 200 })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: error.message || "Login failed" }, { status: 401 })
  }
}
