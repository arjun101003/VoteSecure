import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const db = await getDb()
    const pollsCollection = db.collection("polls")

    let query = {}
    if (userId) {
      query = { createdBy: userId }
    }

    const polls = await pollsCollection.find(query).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(polls)
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch polls" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "You must be logged in to create a poll" }, { status: 401 })
    }

    const { question, options } = await request.json()

    if (!question || !options || options.length < 2) {
      return NextResponse.json({ message: "Question and at least two options are required" }, { status: 400 })
    }

    const db = await getDb()
    const pollsCollection = db.collection("polls")

    const formattedOptions = options.map((option: string) => ({
      text: option,
      votes: 0,
    }))

    const result = await pollsCollection.insertOne({
      question,
      options: formattedOptions,
      createdBy: session.id,
      createdByName: session.name,
      createdAt: new Date(),
      totalVotes: 0,
    })

    return NextResponse.json(
      {
        id: result.insertedId,
        message: "Poll created successfully",
      },
      { status: 201 },
    )
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create poll" }, { status: 500 })
  }
}
