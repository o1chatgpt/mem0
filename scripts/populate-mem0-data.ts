// Script to populate mem0 tables with sample data
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Sample data
const userId = 1 // Assuming user ID 1 exists
const aiMemberIds = [1, 2, 3] // Assuming these AI family members exist

// Sample memories for file operations
const fileOperationsMemories = [
  "User prefers organizing files by project name rather than date.",
  "User typically works with PDF and DOCX files for their research papers.",
  "User asked how to batch rename files with sequential numbering.",
  "User mentioned having trouble finding files after uploading them.",
  "User prefers the list view over grid view for file browsing.",
  "User frequently searches for files containing 'quarterly report' in the filename.",
  "User wants to automatically organize screenshots into a dedicated folder.",
  "User asked about the maximum file size limit for uploads.",
  "User mentioned they need to share large video files with their team.",
  "User prefers to sort files by most recently modified.",
]

// Sample memories for preferences
const preferencesMemories = [
  "User prefers dark mode for the interface.",
  "User wants notifications when file uploads complete.",
  "User prefers to see file sizes in MB rather than KB.",
  "User asked how to change the default sort order for files.",
  "User wants to hide file extensions for common file types.",
  "User prefers to open PDF files in a new tab rather than downloading them.",
  "User asked about keyboard shortcuts for common actions.",
  "User wants to customize the columns shown in the file list.",
  "User prefers to use grid view with medium-sized thumbnails.",
  "User wants to set Google Drive as their default storage location.",
]

// Sample memories for technical information
const technicalMemories = [
  "User asked about the API rate limits for file operations.",
  "User wanted to know if the system supports WebDAV protocol.",
  "User asked about implementing custom metadata fields for their files.",
  "User inquired about the encryption method used for stored files.",
  "User asked how to use the batch processing API for file conversions.",
  "User needed help with the JavaScript SDK for programmatic uploads.",
  "User asked about webhook integration for file change notifications.",
  "User wanted to know if the system supports delta sync for large files.",
  "User inquired about CORS settings for cross-domain file access.",
  "User asked about implementing custom authentication for shared links.",
]

// Sample memories for important information
const importantMemories = [
  "User has a critical presentation due on October 15th that requires access to the design files.",
  "User needs to ensure all financial documents are backed up by the end of each quarter.",
  "User mentioned their team's security audit requires all shared files to be password protected.",
  "User has a 50GB storage limit that they're approaching and needs to be notified at 45GB.",
  "User must maintain version history for all contract documents for at least 3 years.",
  "User's company policy requires all shared links to expire after 30 days maximum.",
  "User needs to ensure all files containing 'CONFIDENTIAL' in the name are only shared internally.",
  "User requires that all deleted files be recoverable for at least 60 days.",
  "User mentioned their regulatory compliance requires all file access to be logged and auditable.",
  "User needs to ensure automatic backup of the 'Projects' folder every Friday at 5pm.",
]

// Sample memories for conversations
const conversationMemories = [
  "User mentioned they're working on a new marketing campaign for Q4.",
  "User said they're collaborating with the design team on the new product launch.",
  "User talked about their frustration with the previous file organization system.",
  "User mentioned they recently switched from Dropbox to our platform.",
  "User said they have a team of 12 people who need access to the shared workspace.",
  "User talked about their upcoming presentation to the executive board.",
  "User mentioned they're working remotely from Europe for the next month.",
  "User said they appreciate the quick responses to their support questions.",
  "User talked about their need to improve workflow efficiency in document processing.",
  "User mentioned they're in the healthcare industry and have specific compliance requirements.",
]

// Function to add memories with a specific category
async function addMemoriesWithCategory(memories: string[], category: string, aiMemberId: number | null = null) {
  console.log(`Adding ${memories.length} memories for category: ${category}`)

  for (const content of memories) {
    const { data, error } = await supabase.from("fm_memories").insert({
      content,
      user_id: userId,
      ai_member_id: aiMemberId,
      category,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(), // Random date within last 30 days
    })

    if (error) {
      console.error(`Error adding memory: ${content}`, error)
    }
  }
}

// Main function to populate data
async function populateData() {
  try {
    console.log("Starting to populate mem0 data...")

    // Add memories for each category
    await addMemoriesWithCategory(fileOperationsMemories, "File Operations", aiMemberIds[0])
    await addMemoriesWithCategory(preferencesMemories, "Preferences", aiMemberIds[1])
    await addMemoriesWithCategory(technicalMemories, "Technical", aiMemberIds[2])
    await addMemoriesWithCategory(importantMemories, "Important")
    await addMemoriesWithCategory(conversationMemories, "Conversations")

    // Add some uncategorized memories
    const uncategorizedMemories = [
      "User asked about the best way to organize their project files.",
      "User mentioned they need to share access with a new team member.",
      "User inquired about recovering a deleted file from last week.",
      "User asked if there's a mobile app available for accessing files on the go.",
      "User wanted to know how to generate a shareable link for a folder.",
    ]

    console.log(`Adding ${uncategorizedMemories.length} uncategorized memories`)
    for (const content of uncategorizedMemories) {
      const { error } = await supabase.from("fm_memories").insert({
        content,
        user_id: userId,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      })

      if (error) {
        console.error(`Error adding uncategorized memory: ${content}`, error)
      }
    }

    // Add custom prompt templates to categories
    const categoryPrompts = [
      {
        name: "File Operations",
        prompt_template: `You are a file management expert assistant with memory capabilities.
Focus on helping the user with file organization, uploads, downloads, and management tasks.
When responding to queries about files and folders, prioritize efficiency, organization, and best practices.
Suggest file naming conventions, folder structures, and organization tips when relevant.
Remember the user's preferences for file organization and apply them consistently.`,
      },
      {
        name: "Technical",
        prompt_template: `You are a technical assistant with memory capabilities.
Focus on providing precise, technically accurate information and solutions.
When responding to technical queries, prioritize accuracy, clarity, and educational value.
Include relevant code examples, technical explanations, and troubleshooting steps when appropriate.
Remember the user's technical environment and adapt your responses accordingly.`,
      },
      {
        name: "Important",
        prompt_template: `You are a priority-focused assistant with memory capabilities.
Focus on high-priority information and tasks that the user has marked as important.
When responding, emphasize urgency, accuracy, and thoroughness for critical matters.
Be particularly attentive to deadlines, critical requirements, and essential details.
Proactively remind the user of important deadlines and requirements they've mentioned before.`,
      },
    ]

    console.log("Updating category prompt templates")
    for (const { name, prompt_template } of categoryPrompts) {
      const { error } = await supabase
        .from("fm_memory_categories")
        .update({ prompt_template })
        .eq("name", name)
        .eq("user_id", userId)

      if (error) {
        console.error(`Error updating prompt template for category: ${name}`, error)
      }
    }

    console.log("Data population completed successfully!")
  } catch (error) {
    console.error("Error populating data:", error)
  }
}

// Run the population script
populateData()
