import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import { getDb, ObjectId } from "@/lib/db"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function createUser(userData: { name: string; email: string; password: string }) {
  const db = await getDb()
  const usersCollection = db.collection("users")

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email: userData.email })
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  // Create user
  const result = await usersCollection.insertOne({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    createdAt: new Date(),
  })

  return { id: result.insertedId, name: userData.name, email: userData.email }
}

export async function verifyUser(email: string, password: string) {
  const db = await getDb()
  const usersCollection = db.collection("users")

  const user = await usersCollection.findOne({ email })
  if (!user) {
    throw new Error("User not found")
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new Error("Invalid password")
  }

  return { id: user._id, name: user.name, email: user.email }
}

export async function createSession(user: { id: ObjectId | string; name: string; email: string }) {
  // Convert ObjectId to string if it's not already a string
  const userId = typeof user.id === "string" ? user.id : user.id.toString()

  const token = await new SignJWT({
    id: userId,
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(JWT_SECRET))

  // Set cookie with proper options
  cookies().set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
    sameSite: "lax",
  })

  return token
}

export async function getSession() {
  const token = cookies().get("auth-token")?.value

  if (!token) {
    return null
  }

  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))

    return verified.payload as {
      id: string
      name: string
      email: string
    }
  } catch (error) {
    // If token verification fails, clear the invalid token
    cookies().delete("auth-token")
    return null
  }
}

export async function getUserById(id: string) {
  const db = await getDb()
  const usersCollection = db.collection("users")

  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(id) })
    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function logout() {
  cookies().delete("auth-token")
}
