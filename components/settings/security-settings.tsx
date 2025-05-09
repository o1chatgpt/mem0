"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const securityFormSchema = z.object({
  twoFactorAuth: z.boolean().default(false),
  loginNotifications: z.boolean().default(true),
  sessionTimeout: z.string().min(1, {
    message: "Please select a session timeout.",
  }),
  dataEncryption: z.boolean().default(true),
  recoveryEmail: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional(),
})

type SecurityFormValues = z.infer<typeof securityFormSchema>

// This would come from your database or user preferences
const defaultValues: Partial<SecurityFormValues> = {
  twoFactorAuth: false,
  loginNotifications: true,
  sessionTimeout: "30",
  dataEncryption: true,
  recoveryEmail: "recovery@example.com",
}

export function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [showRecoveryEmail, setShowRecoveryEmail] = useState(true)

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: SecurityFormValues) {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data)
      setIsLoading(false)
      toast({
        title: "Security settings updated",
        description: "Your security preferences have been updated successfully.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Configure your account security preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="twoFactorAuth"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                        <FormDescription>Add an extra layer of security to your account.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            setShowRecoveryEmail(checked)
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {showRecoveryEmail && (
                  <FormField
                    control={form.control}
                    name="recoveryEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recovery Email</FormLabel>
                        <FormControl>
                          <Input placeholder="recovery.email@example.com" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          This email will be used for account recovery and security alerts.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="loginNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Login Notifications</FormLabel>
                        <FormDescription>Receive notifications when someone logs into your account.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sessionTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Timeout (minutes)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timeout period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                          <SelectItem value="480">8 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Your session will expire after this period of inactivity.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataEncryption"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Data Encryption</FormLabel>
                        <FormDescription>Enable end-to-end encryption for your data.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Activity</h3>
                <div className="rounded-md border">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Login from New Device</p>
                        <p className="text-sm text-muted-foreground">Windows 11 · Chrome · New York, USA</p>
                      </div>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Password Changed</p>
                        <p className="text-sm text-muted-foreground">Mac OS · Safari · San Francisco, USA</p>
                      </div>
                      <p className="text-sm text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Login from Known Device</p>
                        <p className="text-sm text-muted-foreground">iOS · Safari · San Francisco, USA</p>
                      </div>
                      <p className="text-sm text-muted-foreground">2 weeks ago</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
