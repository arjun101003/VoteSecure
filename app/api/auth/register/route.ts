import { NextResponse } from "next/server"
import { createUser, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const user = await createUser({ name, email, password })
    await createSession(user)

    return NextResponse.json({ success: true, message: "User registered successfully" }, { status: 201 })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: error.message || "Registration failed" }, { status: 400 })
  }
}
