import { NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "You must be logged in to edit poll results" }, { status: 401 })
    }

    const { options } = await request.json()

    if (!options || !Array.isArray(options)) {
      return NextResponse.json({ message: "Invalid options data" }, { status: 400 })
    }

    const db = await getDb()
    const pollsCollection = db.collection("polls")

    // Get the existing poll
    const existingPoll = await pollsCollection.findOne({
      _id: new ObjectId(params.id),
    })

    if (!existingPoll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 })
    }

    // Check if the user is the creator of the poll
    if (existingPoll.createdBy !== session.id) {
      return NextResponse.json({ message: "You can only edit results for your own polls" }, { status: 403 })
    }

    // Calculate the new total votes
    const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)

    // Update the poll
    await pollsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          options,
          totalVotes,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ message: "Poll results updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating poll results:", error)
    return NextResponse.json({ message: "Failed to update poll results" }, { status: 500 })
  }
}
