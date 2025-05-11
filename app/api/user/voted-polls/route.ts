import { NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "You must be logged in" }, { status: 401 })
    }

    const db = await getDb()
    const votesCollection = db.collection("votes")
    const pollsCollection = db.collection("polls")

    // Get all polls the user has voted on
    const userVotes = await votesCollection.find({ userId: session.id }).toArray()

    // If user hasn't voted on any polls
    if (userVotes.length === 0) {
      return NextResponse.json([])
    }

    // Get the poll IDs
    const pollIds = userVotes.map((vote) => vote.pollId)

    // Get the poll details
    const polls = await pollsCollection.find({ _id: { $in: pollIds.map((id) => new ObjectId(id)) } }).toArray()

    return NextResponse.json(polls)
  } catch (error) {
    console.error("Error fetching voted polls:", error)
    return NextResponse.json({ message: "Failed to fetch voted polls" }, { status: 500 })
  }
}
