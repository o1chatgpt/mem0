"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Database, Copy, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DatabaseSetupPage() {
  const [copied, setCopied] = useState(false)

  const execSqlFunction = `
-- This function allows executing arbitrary SQL from the server
-- WARNING: This is potentially dangerous and should only be used in controlled environments
CREATE OR REPLACE FUNCTION exec_sql(sql_string text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
  `.trim()

  const createMigrationsTable = `
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum VARCHAR(64) NOT NULL,
  execution_time INTEGER NOT NULL,
  success BOOLEAN NOT NULL
);
  `.trim()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/database">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Database
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Database Setup</h1>
        <p className="text-lg text-muted-foreground">Set up your database for migrations</p>
      </div>

      <Alert className="mb-6">
        <Database className="h-4 w-4" />
        <AlertTitle>Database Setup Required</AlertTitle>
        <AlertDescription>
          Before you can use the migration system, you need to set up your database with the required tables and
          functions.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="supabase" className="mb-6">
        <TabsList>
          <TabsTrigger value="supabase">Supabase</TabsTrigger>
          <TabsTrigger value="manual">Manual Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="supabase">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Setup</CardTitle>
              <CardDescription>Follow these steps to set up your Supabase database for migrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Step 1: Create the exec_sql Function</h3>
                <p className="mb-2">Go to the SQL Editor in your Supabase dashboard and run the following SQL:</p>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">{execSqlFunction}</pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(execSqlFunction)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Step 2: Create the Migrations Table</h3>
                <p className="mb-2">In the same SQL Editor, run the following SQL:</p>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">{createMigrationsTable}</pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(createMigrationsTable)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Step 3: Refresh the Page</h3>
                <p>
                  After running both SQL statements, return to the Database page and refresh to see your migrations.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/database">Return to Database</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Setup</CardTitle>
              <CardDescription>If you're not using Supabase, you can set up your database manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>To use the migration system with a different database provider, you'll need to:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Create a <code>schema_migrations</code> table with the structure shown below
                </li>
                <li>Create a way to execute arbitrary SQL from your application</li>
                <li>Update the migration manager code to work with your database</li>
              </ol>

              <div>
                <h3 className="text-lg font-medium mb-2">Migrations Table Structure</h3>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">{createMigrationsTable}</pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(createMigrationsTable)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/database">Return to Database</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
