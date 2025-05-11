import Link from "next/link"
import { Shield, TrendingUp, Users, BarChart3, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-8">
              <div className="space-y-2 max-w-[800px]">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="relative">
                    <Shield className="h-12 w-12" />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary"></div>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">Vote Secure</h1>
                </div>
                <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl">
                  Create polls, share with friends, and get instant results with secure voting.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/create">
                  <Button size="lg" className="gap-2">
                    <Shield className="h-5 w-5" />
                    Create a Poll
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="gap-2">
                    Explore Polls
                  </Button>
                </Link>
              </div>
              <div className="relative w-full max-w-3xl mx-auto mt-8 md:mt-16">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 shadow-lg">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
                  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-white">
                    <div className="relative">
                      <Shield className="h-16 w-16" />
                      <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-white"></div>
                    </div>
                    <h2 className="text-center text-2xl font-bold">Secure & Private Voting</h2>
                    <p className="text-center text-white/80 max-w-md">
                      Our platform ensures your votes are secure and your privacy is protected
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need for secure and effective polling
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card className="poll-card">
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">Real-time Results</CardTitle>
                  <CardDescription>See votes update instantly as they come in</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Watch as results update in real-time, giving you immediate insights into how people are voting.
                  </p>
                </CardContent>
              </Card>
              <Card className="poll-card">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">User Authentication</CardTitle>
                  <CardDescription>Secure voting with user accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create an account to manage your polls and ensure one vote per user for accurate results.
                  </p>
                </CardContent>
              </Card>
              <Card className="poll-card">
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">Visual Analytics</CardTitle>
                  <CardDescription>Beautiful charts to visualize results</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    View poll results with intuitive charts that make it easy to understand voting patterns.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Creating and sharing polls has never been easier
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold">Create</h3>
                <p className="text-muted-foreground">Create a poll with your question and options</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold">Share</h3>
                <p className="text-muted-foreground">Share your poll with friends and colleagues</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold">Analyze</h3>
                <p className="text-muted-foreground">View results and insights in real-time</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-24">
          <div className="flex items-center gap-4 p-5">
            <a
              href="https://www.linkedin.com/in/arjunxsingh/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-linkedin"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              <span className="sr-only">LinkedIn</span>
            </a>
            <a
              href="https://github.com/arjun101003"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-github"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span className="sr-only">GitHub</span>
            </a>
          </div>

          <div className="flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-primary mr-2" />
            <span className="text-sm font-medium">© {new Date().getFullYear()} Vote Secure</span>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium">Arjun Singh</p>
            <p className="text-xs text-muted-foreground">arjun101003@gmail.com</p>
            <p className="text-xs text-muted-foreground">+91 9717791833</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
