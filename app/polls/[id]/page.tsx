"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Share2, Trash2, Edit, Eye, EyeOff, BarChart } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

type PollOption = {
  text: string
  votes: number
}

type Poll = {
  _id: string
  question: string
  options: PollOption[]
  createdBy: string
  createdByName: string
  createdAt: string
  totalVotes: number
  showResults?: boolean
}

// Define chart colors
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088fe",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a4de6c",
  "#d0ed57",
  "#83a6ed",
  "#8dd1e1",
]

export default function PollPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingResults, setIsTogglingResults] = useState(false)

  // Check if the current user is the poll admin
  const isAdmin = user && poll && user.id === poll.createdBy

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(`/api/polls/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Poll not found")
          }
          throw new Error("Failed to fetch poll")
        }

        const data = await response.json()
        setPoll(data)

        // Check if user has voted
        if (user) {
          const votesResponse = await fetch(`/api/polls/${params.id}/vote?userId=${user.id}`)
          if (votesResponse.ok) {
            const votesData = await votesResponse.json()
            setHasVoted(votesData.hasVoted)
          }
        }
      } catch (err: any) {
        setError(err.message || "An error occurred")
        toast({
          title: "Error",
          description: err.message || "Failed to load poll",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPoll()
  }, [params.id, user, toast])

  const handleVote = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to vote",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (selectedOption === null) {
      toast({
        title: "No option selected",
        description: "Please select an option to vote",
        variant: "destructive",
      })
      return
    }

    // Don't allow voting if results are shown
    if (poll?.showResults) {
      toast({
        title: "Voting closed",
        description: "The creator has ended voting for this poll",
        variant: "destructive",
      })
      return
    }

    setIsVoting(true)
    try {
      const response = await fetch(`/api/polls/${params.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionIndex: selectedOption }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to vote")
      }

      // Update poll data
      const updatedPoll = { ...poll } as Poll
      updatedPoll.options[selectedOption].votes += 1
      updatedPoll.totalVotes += 1
      setPoll(updatedPoll)
      setHasVoted(true)

      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded successfully",
      })
    } catch (error: any) {
      toast({
        title: "Failed to vote",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !poll || poll.createdBy !== user.id) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/polls/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete poll")
      }

      toast({
        title: "Poll deleted",
        description: "Your poll has been deleted successfully",
      })

      router.push("/my-polls")
    } catch (error: any) {
      toast({
        title: "Failed to delete poll",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleResults = async () => {
    if (!user || !poll || poll.createdBy !== user.id) {
      return
    }

    setIsTogglingResults(true)
    try {
      const response = await fetch(`/api/polls/${params.id}/toggle-results`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to toggle results")
      }

      const data = await response.json()

      // Update poll data
      const updatedPoll = { ...poll, showResults: data.showResults }
      setPoll(updatedPoll)

      toast({
        title: data.showResults ? "Results shown" : "Results hidden",
        description: data.showResults
          ? "Poll results are now visible to everyone. Voting is closed."
          : "Poll results are now hidden. Voting is open.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to toggle results",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsTogglingResults(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: poll?.question,
          url: window.location.href,
        })
        .catch((error) => {
          console.error("Error sharing:", error)
        })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Poll link copied to clipboard",
      })
    }
  }

  // Prepare chart data for pie chart
  const chartData =
    poll?.options.map((option) => ({
      name: option.text,
      value: option.votes,
    })) || []

  // Determine if results should be shown to this user
  const shouldShowResults = poll ? poll.showResults || isAdmin : false

  // Determine the winning option
  const getWinner = () => {
    if (!poll || poll.totalVotes === 0) return null

    let maxVotes = 0
    let winnerIndices: number[] = []

    poll.options.forEach((option, index) => {
      if (option.votes > maxVotes) {
        maxVotes = option.votes
        winnerIndices = [index]
      } else if (option.votes === maxVotes) {
        winnerIndices.push(index)
      }
    })

    if (winnerIndices.length === 1) {
      return {
        text: poll.options[winnerIndices[0]].text,
        votes: maxVotes,
        percentage: Math.round((maxVotes / poll.totalVotes) * 100),
      }
    } else if (winnerIndices.length > 1) {
      // Handle tie
      return {
        text: winnerIndices.map((i) => poll.options[i].text).join(" & "),
        votes: maxVotes,
        percentage: Math.round((maxVotes / poll.totalVotes) * 100),
        isTie: true,
      }
    }

    return null
  }

  const winner = poll && shouldShowResults && poll.totalVotes > 0 ? getWinner() : null

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading poll...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>{error || "Failed to load poll"}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => router.push("/")} className="w-full">
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-8 mx-auto px-4">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{poll.question}</CardTitle>
                <CardDescription>
                  Created by {poll.createdByName} • {new Date(poll.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleShare} title="Share poll">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>

                {isAdmin && (
                  <>
                    {!poll.showResults && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleToggleResults}
                        disabled={isTogglingResults}
                        title="Show results"
                      >
                        {isTogglingResults ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">Show results</span>
                      </Button>
                    )}
                    {poll.showResults && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleToggleResults}
                        disabled={isTogglingResults}
                        className="bg-primary/10"
                        title="Hide results"
                      >
                        {isTogglingResults ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        <span className="sr-only">Hide results</span>
                      </Button>
                    )}

                    <Link href={`/polls/${poll._id}/edit-results`}>
                      <Button
                        variant="outline"
                        className="text-primary hover:text-primary/90 hover:bg-primary/10"
                        title="Edit results"
                      >
                        <BarChart className="h-4 w-4 mr-2" />
                        Edit Results
                      </Button>
                    </Link>

                    <Link href={`/polls/${poll._id}/edit`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-primary hover:text-primary/90 hover:bg-primary/10"
                        title="Edit poll"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit poll</span>
                      </Button>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          title="Delete poll"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your poll and all associated
                            votes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {shouldShowResults && poll.totalVotes > 0 ? (
              <div className="space-y-6">
                {winner && (
                  <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <h3 className="text-xl font-bold mb-2">{winner.isTie ? "Tie between:" : "Winner:"}</h3>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary text-primary-foreground rounded-md">{winner.text}</div>
                      <span className="font-medium">
                        with {winner.votes} {winner.votes === 1 ? "vote" : "votes"} ({winner.percentage}%)
                      </span>
                    </div>
                  </div>
                )}
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} votes`, "Votes"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4 mt-6">
                  {poll.options.map((option, index) => {
                    const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-full p-3 rounded-md bg-muted/50">
                            <div className="flex justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                <span>{option.text}</span>
                              </div>
                              <span className="font-medium">{percentage}%</span>
                            </div>
                            <Progress
                              value={percentage}
                              className="h-2"
                              style={
                                {
                                  backgroundColor: "rgba(var(--muted), 0.5)",
                                  "--progress-background": COLORS[index % COLORS.length],
                                } as any
                              }
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              {option.votes} {option.votes === 1 ? "vote" : "votes"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : shouldShowResults && poll.totalVotes === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No votes have been cast yet.</p>
              </div>
            ) : hasVoted ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Thank you for voting! Results will be available when the poll creator publishes them.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {poll.options.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={selectedOption === index ? "default" : "outline"}
                        className="w-full justify-start vote-button"
                        onClick={() => setSelectedOption(index)}
                      >
                        {option.text}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t">
              {isAdmin && <p className="text-sm text-muted-foreground">Total votes: {poll.totalVotes}</p>}
              {poll.showResults && !isAdmin && (
                <p className="text-sm text-yellow-500 mt-1">
                  <strong>Note:</strong> The creator has ended voting for this poll.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {!poll.showResults && !hasVoted ? (
              <Button onClick={handleVote} disabled={selectedOption === null || isVoting || !user} className="ml-auto">
                {isVoting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Voting...
                  </>
                ) : (
                  "Vote"
                )}
              </Button>
            ) : hasVoted && !poll.showResults ? (
              <p className="ml-auto text-sm text-muted-foreground">You have already voted on this poll</p>
            ) : null}
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
