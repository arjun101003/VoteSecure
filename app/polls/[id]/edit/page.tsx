"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Alert, AlertDescription } from "@/components/ui/alert"

const editPollSchema = z.object({
  question: z.string().min(5, { message: "Question must be at least 5 characters" }),
  options: z
    .array(z.string().min(1, { message: "Option cannot be empty" }))
    .min(2, { message: "You must provide at least 2 options" }),
})

type EditPollFormValues = z.infer<typeof editPollSchema>

export default function EditPollPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollCreator, setPollCreator] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditPollFormValues>({
    resolver: zodResolver(editPollSchema),
    defaultValues: {
      question: "",
      options: ["", ""],
    },
  })

  const watchedOptions = watch("options")

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await fetch(`/api/polls/${params.id}`)
        if (!res.ok) {
          throw new Error("Failed to fetch poll")
        }
        const data = await res.json()

        // Set poll creator ID
        setPollCreator(data.createdBy)

        // Set form values
        reset({
          question: data.question,
          options: data.options.map((opt: any) => opt.text),
        })
      } catch (error: any) {
        setError(error.message || "Failed to load poll")
        toast({
          title: "Error",
          description: error.message || "Failed to load poll",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPoll()
    }
  }, [params.id, reset, toast])

  // Check if user is authorized to edit this poll
  useEffect(() => {
    if (!authLoading && !loading && user && pollCreator && user.id !== pollCreator) {
      toast({
        title: "Unauthorized",
        description: "You can only edit your own polls",
        variant: "destructive",
      })
      router.push("/my-polls")
    }
  }, [authLoading, loading, user, pollCreator, router, toast])

  const addOption = () => {
    const newOptions = [...watchedOptions, ""]
    setValue("options", newOptions)
  }

  const removeOption = (index: number) => {
    if (watchedOptions.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "You must have at least 2 options",
        variant: "destructive",
      })
      return
    }

    const newOptions = watchedOptions.filter((_, i) => i !== index)
    setValue("options", newOptions)
  }

  const onSubmit = async (data: EditPollFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update a poll",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/polls/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update poll")
      }

      toast({
        title: "Poll updated",
        description: "Your poll has been updated successfully",
      })

      router.push(`/polls/${params.id}`)
    } catch (error: any) {
      setError(error.message || "Failed to update poll. Please try again.")
      toast({
        title: "Failed to update poll",
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Edit Poll</CardTitle>
            <CardDescription>Update your poll question and options</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  placeholder="What's your favorite programming language?"
                  {...register("question")}
                  className="text-lg"
                />
                {errors.question && <p className="text-sm text-destructive">{errors.question.message}</p>}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Option
                  </Button>
                </div>

                {watchedOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input placeholder={`Option ${index + 1}`} {...register(`options.${index}`)} />
                    {index >= 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove option</span>
                      </Button>
                    )}
                  </div>
                ))}

                {errors.options && typeof errors.options.message === "string" && (
                  <p className="text-sm text-destructive">{errors.options.message}</p>
                )}

                {watchedOptions.map(
                  (_, index) =>
                    errors.options?.[index] && (
                      <p key={index} className="text-sm text-destructive">
                        Option {index + 1}: {errors.options?.[index]?.message}
                      </p>
                    ),
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Poll"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}
