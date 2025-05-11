"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Vote, BarChart } from "lucide-react"

type Poll = {
  _id: string
  question: string
  createdAt: string
  totalVotes: number
  createdByName: string
  createdBy: string
  options: Array<{ text: string; votes: number }>
  showResults?: boolean
}

export default function ExplorePollsPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to explore polls",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const fetchPolls = async () => {
      if (!user) return

      try {
        const res = await fetch(`/api/polls`)
        if (!res.ok) throw new Error("Failed to fetch polls")
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

  if (authLoading || (loading && user)) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading polls...</p>
          </div>
        </main>
      </div>
    )
  }

  // Don't render anything if not logged in
  if (!user) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8 mx-auto px-4">
        <div className="flex flex-col items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4">Explore Polls</h1>
          <p className="text-muted-foreground text-center mb-6">Discover and vote on polls created by the community</p>
          {polls.length > 0 && (
            <Link href="/create">
              <Button>Create Your Own Poll</Button>
            </Link>
          )}
        </div>

        {polls.length === 0 ? (
          <Card className="w-full max-w-md mx-auto text-center p-10">
            <CardHeader>
              <CardTitle>No polls available</CardTitle>
              <CardDescription className="mt-2">Be the first to create a poll!</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/create">
                <Button>Create Poll</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {polls.map((poll) => (
              <Card key={poll._id} className="flex flex-col justify-between h-full poll-card">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{poll.question}</CardTitle>
                  <CardDescription>
                    Created by {poll.createdByName} • {new Date(poll.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {poll.options.length} options • {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link href={`/polls/${poll._id}`} className="w-full">
                    <Button variant={poll.showResults ? "outline" : "default"} size="sm" className="w-full gap-1">
                      {poll.showResults ? (
                        <>
                          <BarChart className="w-4 h-4" />
                          View Results
                        </>
                      ) : (
                        <>
                          <Vote className="w-4 h-4" />
                          Vote Now
                        </>
                      )}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
