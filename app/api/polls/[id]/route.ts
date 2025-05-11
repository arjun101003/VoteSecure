import { NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getDb()
    const pollsCollection = db.collection("polls")

    const poll = await pollsCollection.findOne({
      _id: new ObjectId(params.id),
    })

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 })
    }

    return NextResponse.json(poll)
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch poll" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "You must be logged in to update a poll" }, { status: 401 })
    }

    const { question, options } = await request.json()

    if (!question || !options || options.length < 2) {
      return NextResponse.json({ message: "Question and at least two options are required" }, { status: 400 })
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
      return NextResponse.json({ message: "You can only edit your own polls" }, { status: 403 })
    }

    // Format options to maintain vote counts
    const formattedOptions = options.map((optionText: string, index: number) => {
      // If the option already exists, keep its vote count
      if (existingPoll.options[index]) {
        return {
          text: optionText,
          votes: existingPoll.options[index].votes || 0,
        }
      }
      // If it's a new option, start with 0 votes
      return {
        text: optionText,
        votes: 0,
      }
    })

    // Update the poll
    await pollsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          question,
          options: formattedOptions,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ message: "Poll updated successfully" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Failed to update poll" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "You must be logged in to delete a poll" }, { status: 401 })
    }

    const db = await getDb()
    const pollsCollection = db.collection("polls")

    const poll = await pollsCollection.findOne({
      _id: new ObjectId(params.id),
    })

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 })
    }

    if (poll.createdBy !== session.id) {
      return NextResponse.json({ message: "You can only delete your own polls" }, { status: 403 })
    }

    await pollsCollection.deleteOne({
      _id: new ObjectId(params.id),
    })

    return NextResponse.json({ message: "Poll deleted successfully" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete poll" }, { status: 500 })
  }
}
