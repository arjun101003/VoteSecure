"use client"

import { useState } from "react"
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

const createPollSchema = z.object({
  question: z.string().min(5, { message: "Question must be at least 5 characters" }),
  options: z
    .array(z.string().min(1, { message: "Option cannot be empty" }))
    .min(2, { message: "You must provide at least 2 options" }),
})

type CreatePollFormValues = z.infer<typeof createPollSchema>

export default function CreatePollPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      question: "",
      options: ["", ""], // always start with two
    },
  })

  const watchedOptions = watch("options")

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

  const onSubmit = async (data: CreatePollFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a poll",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create poll")
      }

      const result = await response.json()

      toast({
        title: "Poll created",
        description: "Your poll has been created successfully",
      })

      router.push(`/polls/${result.id}`)
    } catch (error: any) {
      setError(error.message || "Failed to create poll. Please try again.")
      toast({
        title: "Failed to create poll",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!authLoading && !user) {
    router.push("/login")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-8 mx-auto px-4">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create a New Poll</CardTitle>
            <CardDescription>Ask a question and provide options for people to vote on</CardDescription>
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

                {typeof errors.options?.message === "string" && (
                  <p className="text-sm text-destructive">{errors.options.message}</p>
                )}
                {errors.options &&
                  Array.isArray(errors.options) &&
                  errors.options.map(
                    (optErr, index) =>
                      optErr?.message && (
                        <p key={index} className="text-sm text-destructive">
                          Option {index + 1}: {optErr.message}
                        </p>
                      ),
                  )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button type="submit" className="w-full max-w-xs" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Poll"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}
