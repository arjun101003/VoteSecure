"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Eye, EyeOff, User, Mail, Lock } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Poll = {
  _id: string
  question: string
  createdAt: string
  totalVotes: number
  options: Array<{ text: string; votes: number }>
  showResults?: boolean
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [createdPolls, setCreatedPolls] = useState<Poll[]>([])
  const [votedPolls, setVotedPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to view your profile",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const fetchUserData = async () => {
      if (!user) return

      try {
        // Fetch created polls
        const createdRes = await fetch(`/api/polls?userId=${user.id}`)
        if (!createdRes.ok) throw new Error("Failed to fetch your polls")
        const createdData = await createdRes.json()
        setCreatedPolls(createdData)

        // Fetch voted polls
        const votedRes = await fetch(`/api/user/voted-polls`)
        if (!votedRes.ok) throw new Error("Failed to fetch your voted polls")
        const votedData = await votedRes.json()
        setVotedPolls(votedData)
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

    if (user) fetchUserData()
  }, [user, authLoading, router, toast])

  if (authLoading || (loading && user)) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading profile...</p>
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
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
              <CardDescription>Account Information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p>{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Password</p>
                  <p>{showPassword ? "Actual password hidden for security" : "••••••••"}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)} className="h-8 w-8">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="created" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="created">Created Polls ({createdPolls.length})</TabsTrigger>
              <TabsTrigger value="voted">Voted Polls ({votedPolls.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="created">
              {createdPolls.length === 0 ? (
                <Card className="text-center p-8">
                  <CardHeader>
                    <CardTitle>No polls created yet</CardTitle>
                    <CardDescription>Start creating polls to see them here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/create">
                      <Button>Create Your First Poll</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {createdPolls.map((poll) => (
                    <Card key={poll._id} className="flex flex-col justify-between h-full poll-card">
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{poll.question}</CardTitle>
                        <CardDescription>Created on {new Date(poll.createdAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {poll.options.length} options • {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
                        </p>
                      </CardContent>
                      <CardContent className="flex gap-2 pt-0">
                        <Link href={`/polls/${poll._id}`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full">
                            View Poll
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="voted">
              {votedPolls.length === 0 ? (
                <Card className="text-center p-8">
                  <CardHeader>
                    <CardTitle>No votes cast yet</CardTitle>
                    <CardDescription>Vote on polls to see them here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/explore">
                      <Button>Explore Polls</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {votedPolls.map((poll) => (
                    <Card key={poll._id} className="flex flex-col justify-between h-full poll-card">
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{poll.question}</CardTitle>
                        <CardDescription>Voted on {new Date(poll.createdAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {poll.options.length} options • {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
                        </p>
                      </CardContent>
                      <CardContent className="flex gap-2 pt-0">
                        <Link href={`/polls/${poll._id}`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full">
                            View Results
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
