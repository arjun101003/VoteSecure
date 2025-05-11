import { NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "You must be logged in" }, { status: 401 })
    }

    const db = await getDb()
    const pollsCollection = db.collection("polls")

    // Get the poll
    const poll = await pollsCollection.findOne({ _id: new ObjectId(params.id) })

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 })
    }

    // Check if the user is the creator of the poll
    if (poll.createdBy !== session.id) {
      return NextResponse.json({ message: "You can only toggle results for your own polls" }, { status: 403 })
    }

    // Toggle the showResults field
    const showResults = !poll.showResults

    // Update the poll
    await pollsCollection.updateOne({ _id: new ObjectId(params.id) }, { $set: { showResults } })

    return NextResponse.json({ showResults }, { status: 200 })
  } catch (error) {
    console.error("Error toggling poll results:", error)
    return NextResponse.json({ message: "Failed to toggle poll results" }, { status: 500 })
  }
}
