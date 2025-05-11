import { NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    const db = await getDb()
    const votesCollection = db.collection("votes")

    // Check if user has already voted
    const existingVote = await votesCollection.findOne({
      pollId: params.id,
      userId,
    })

    return NextResponse.json({ hasVoted: !!existingVote })
  } catch (error) {
    return NextResponse.json({ message: "Failed to check vote status" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "You must be logged in to vote" }, { status: 401 })
    }

    const { optionIndex } = await request.json()

    if (optionIndex === undefined) {
      return NextResponse.json({ message: "Option index is required" }, { status: 400 })
    }

    const db = await getDb()
    const pollsCollection = db.collection("polls")
    const votesCollection = db.collection("votes")

    // Check if poll exists
    const poll = await pollsCollection.findOne({
      _id: new ObjectId(params.id),
    })

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 })
    }

    // Check if option exists
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return NextResponse.json({ message: "Invalid option index" }, { status: 400 })
    }

    // Check if user has already voted
    const existingVote = await votesCollection.findOne({
      pollId: params.id,
      userId: session.id,
    })

    if (existingVote) {
      return NextResponse.json({ message: "You have already voted on this poll" }, { status: 400 })
    }

    // Record the vote
    await votesCollection.insertOne({
      pollId: params.id,
      userId: session.id,
      optionIndex,
      createdAt: new Date(),
    })

    // Update poll vote count
    await pollsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $inc: {
          [`options.${optionIndex}.votes`]: 1,
          totalVotes: 1,
        },
      },
    )

    return NextResponse.json({ message: "Vote recorded successfully" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Failed to record vote" }, { status: 500 })
  }
}
