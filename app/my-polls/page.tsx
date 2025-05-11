"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2, BarChart, Eye, FileEdit, PenLine } from "lucide-react"

type Poll = {
  _id: string
  question: string
  createdAt: string
  totalVotes: number
  showResults?: boolean
  options: Array<{ text: string; votes: number }>
}

export default function MyPollsPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }

    const fetchPolls = async () => {
      if (!user) return
      try {
        const res = await fetch(`/api/polls?userId=${user.id}`)
        if (!res.ok) throw new Error("Failed to fetch your polls")
        const data = await res.json()
        setPolls(data)
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchPolls()
  }, [user, authLoading, router, toast])

  const deletePoll = async (pollId: string) => {
    const confirmed = confirm("Are you sure you want to delete this poll?")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/polls/${pollId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete poll")
      setPolls((prev) => prev.filter((p) => p._id !== pollId))
      toast({ title: "Poll deleted successfully." })
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const toggleResults = async (pollId: string) => {
    try {
      const res = await fetch(`/api/polls/${pollId}/toggle-results`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to toggle results")

      const data = await res.json()

      // Update the poll in the list
      setPolls((prev) => prev.map((poll) => (poll._id === pollId ? { ...poll, showResults: data.showResults } : poll)))

      toast({
        title: data.showResults ? "Results shown" : "Results hidden",
        description: data.showResults
          ? "Poll results are now visible to everyone. Voting is closed."
          : "Poll results are now hidden. Voting is open.",
      })
    } catch (err: any) {
      toast({
        title: "Failed to toggle results",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  if (authLoading || (loading && user)) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your polls...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8 mx-auto px-4">
        <div className="flex flex-col items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4">My Polls</h1>
          <p className="text-muted-foreground text-center mb-6">Manage your created polls and view their results</p>
        </div>

        {polls.length === 0 ? (
          <Card className="w-full max-w-md mx-auto text-center p-10">
            <CardHeader>
              <CardTitle>No polls created yet</CardTitle>
              <CardDescription className="mt-2">Get started by creating your first poll!</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Poll
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {polls.map((poll) => (
              <Card key={poll._id} className="flex flex-col justify-between h-full poll-card">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{poll.question}</CardTitle>
                  <CardDescription>Created on {new Date(poll.createdAt).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {poll.options.length} options • {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
                  </p>
                  {poll.showResults && (
                    <p className="text-sm text-yellow-500 mt-1">
                      <strong>Note:</strong> Results are shown and voting is closed.
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Link href={`/polls/${poll._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleResults(poll._id)}
                    className={poll.showResults ? "bg-primary/10" : ""}
                  >
                    {poll.showResults ? (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Hide Results
                      </>
                    ) : (
                      <>
                        <BarChart className="h-4 w-4 mr-1" />
                        Results
                      </>
                    )}
                  </Button>

                  <div className="w-full flex gap-2 mt-2">
                    <Link href={`/polls/${poll._id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <PenLine className="h-4 w-4 mr-1" />
                        Edit Poll
                      </Button>
                    </Link>

                    <Link href={`/polls/${poll._id}/edit-results`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit Results
                      </Button>
                    </Link>

                    <Button variant="destructive" size="sm" onClick={() => deletePoll(poll._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
