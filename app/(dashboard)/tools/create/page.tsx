"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { AI_FAMILY_MEMBERS } from "@/lib/data/ai-family"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Tool name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  apiEndpoint: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  aiMembers: z.array(z.string()).min(1, {
    message: "Please select at least one AI family member.",
  }),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateToolPage() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      apiEndpoint: "",
      aiMembers: [],
      isActive: true,
    },
  })

  function onSubmit(values: FormValues) {
    setIsPending(true)

    // Simulate API call
    setTimeout(() => {
      console.log(values)
      toast({
        title: "Tool created",
        description: `${values.name} has been created successfully.`,
      })
      setIsPending(false)
      router.push("/tools")
    }, 1000)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">Create Tool</h1>
      <p className="mb-8 text-lg text-muted-foreground">Add a new tool for your AI family members</p>

      <Card>
        <CardHeader>
          <CardTitle>Tool Details</CardTitle>
          <CardDescription>Enter the details for your new tool</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Tool name" {...field} />
                    </FormControl>
                    <FormDescription>The name of your tool.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what this tool does" {...field} />
                    </FormControl>
                    <FormDescription>A brief description of the tool's functionality.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Information">Information</SelectItem>
                        <SelectItem value="Productivity">Productivity</SelectItem>
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Creative">Creative</SelectItem>
                        <SelectItem value="Analytics">Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The category this tool belongs to.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiEndpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Endpoint (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://api.example.com/endpoint" {...field} />
                    </FormControl>
                    <FormDescription>The API endpoint for this tool, if applicable.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aiMembers"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">AI Family Members</FormLabel>
                      <FormDescription>Select which AI family members can use this tool.</FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {AI_FAMILY_MEMBERS.map((member) => (
                        <FormField
                          key={member.id}
                          control={form.control}
                          name="aiMembers"
                          render={({ field }) => {
                            return (
                              <FormItem key={member.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(member.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, member.id])
                                        : field.onChange(field.value?.filter((value) => value !== member.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{member.name}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Make this tool available for use immediately.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Tool"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
