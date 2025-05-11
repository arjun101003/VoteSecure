"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, MinusCircle, PlusCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
}

export default function EditResultsPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<PollOption[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        setOptions([...data.options])
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
  }, [params.id, toast])

  // Check if user is authorized to edit this poll
  useEffect(() => {
    if (!authLoading && !loading && user && poll && user.id !== poll.createdBy) {
      toast({
        title: "Unauthorized",
        description: "You can only edit results for your own polls",
        variant: "destructive",
      })
      router.push("/my-polls")
    }
  }, [authLoading, loading, user, poll, router, toast])

  const handleVoteChange = (index: number, value: number) => {
    const newOptions = [...options]
    // Ensure votes can't go below 0
    newOptions[index].votes = Math.max(0, value)
    setOptions(newOptions)
  }

  const incrementVote = (index: number) => {
    const newOptions = [...options]
    newOptions[index].votes += 1
    setOptions(newOptions)
  }

  const decrementVote = (index: number) => {
    const newOptions = [...options]
    if (newOptions[index].votes > 0) {
      newOptions[index].votes -= 1
    }
    setOptions(newOptions)
  }

  const handleSubmit = async () => {
    if (!user || !poll) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/polls/${params.id}/edit-results`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ options }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update results")
      }

      toast({
        title: "Results updated",
        description: "Poll results have been updated successfully",
      })

      router.push(`/polls/${params.id}`)
    } catch (error: any) {
      setError(error.message || "Failed to update results. Please try again.")
      toast({
        title: "Failed to update results",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || loading) {
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
              <Button onClick={() => router.push("/my-polls")} className="w-full">
                Back to My Polls
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
            <CardTitle className="text-2xl font-bold">Edit Poll Results</CardTitle>
            <CardDescription>Adjust vote counts for "{poll.question}"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => decrementVote(index)}
                      disabled={option.votes <= 0}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={option.votes}
                      onChange={(e) => handleVoteChange(index, Number.parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => incrementVote(index)}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Total votes: {options.reduce((sum, option) => sum + option.votes, 0)}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push(`/polls/${params.id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
