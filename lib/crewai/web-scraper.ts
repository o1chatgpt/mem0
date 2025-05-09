import { JSDOM } from "jsdom"
import { addMemory } from "@/lib/mem0"

export interface ScrapingResult {
  url: string
  title: string | null
  content: string
  metadata: {
    description: string | null
    keywords: string[] | null
    author: string | null
    publishDate: string | null
    images: string[]
    links: string[]
  }
  timestamp: string
}

export async function scrapeWebsite(url: string, userId: number, aiMemberId?: number): Promise<ScrapingResult> {
  try {
    // Validate URL
    const validatedUrl = new URL(url).toString()

    // Fetch the webpage
    const response = await fetch(validatedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FileManagerBot/1.0; +https://filemanager.example.com)",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    // Parse the HTML
    const dom = new JSDOM(html)
    const document = dom.window.document

    // Extract title
    const title = document.querySelector("title")?.textContent || null

    // Extract metadata
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute("content") || null
    const metaKeywords =
      document
        .querySelector('meta[name="keywords"]')
        ?.getAttribute("content")
        ?.split(",")
        .map((k) => k.trim()) || null
    const metaAuthor = document.querySelector('meta[name="author"]')?.getAttribute("content") || null

    // Try to find publish date
    let publishDate = null
    const publishDateMeta =
      document.querySelector('meta[property="article:published_time"]')?.getAttribute("content") ||
      document.querySelector('meta[name="publish-date"]')?.getAttribute("content") ||
      document.querySelector("time")?.getAttribute("datetime")
    if (publishDateMeta) {
      publishDate = publishDateMeta
    }

    // Extract main content
    let content = ""

    // Try to find main content container
    const mainContent =
      document.querySelector("main") ||
      document.querySelector("article") ||
      document.querySelector(".content") ||
      document.querySelector("#content")

    if (mainContent) {
      content = mainContent.textContent?.trim() || ""
    } else {
      // Fallback: get all paragraphs
      const paragraphs = document.querySelectorAll("p")
      content = Array.from(paragraphs)
        .map((p) => p.textContent?.trim())
        .filter(Boolean)
        .join("\n\n")
    }

    // Extract images
    const images = Array.from(document.querySelectorAll("img"))
      .map((img) => {
        const src = img.getAttribute("src")
        if (!src) return null

        // Handle relative URLs
        try {
          return new URL(src, validatedUrl).toString()
        } catch (e) {
          return null
        }
      })
      .filter(Boolean) as string[]

    // Extract links
    const links = Array.from(document.querySelectorAll("a"))
      .map((a) => {
        const href = a.getAttribute("href")
        if (!href) return null

        // Handle relative URLs
        try {
          return new URL(href, validatedUrl).toString()
        } catch (e) {
          return null
        }
      })
      .filter(Boolean) as string[]

    // Create result
    const result: ScrapingResult = {
      url: validatedUrl,
      title,
      content,
      metadata: {
        description: metaDescription,
        keywords: metaKeywords,
        author: metaAuthor,
        publishDate,
        images,
        links,
      },
      timestamp: new Date().toISOString(),
    }

    // Store memory of scraping
    if (userId) {
      await addMemory(
        `Scraped website: ${validatedUrl}. Title: ${title || "Unknown"}. Content length: ${content.length} characters.`,
        userId,
        aiMemberId,
        "Web Scraping",
      )
    }

    return result
  } catch (error) {
    console.error(`Error scraping website ${url}:`, error)
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Extract specific data from a webpage based on selectors
export async function extractDataFromWebpage(
  url: string,
  selectors: Record<string, string>,
): Promise<Record<string, string | null>> {
  try {
    // Validate URL
    const validatedUrl = new URL(url).toString()

    // Fetch the webpage
    const response = await fetch(validatedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FileManagerBot/1.0; +https://filemanager.example.com)",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    // Parse the HTML
    const dom = new JSDOM(html)
    const document = dom.window.document

    // Extract data based on selectors
    const result: Record<string, string | null> = {}

    for (const [key, selector] of Object.entries(selectors)) {
      try {
        const element = document.querySelector(selector)
        result[key] = element?.textContent?.trim() || null
      } catch (e) {
        console.error(`Error extracting ${key} with selector ${selector}:`, e)
        result[key] = null
      }
    }

    return result
  } catch (error) {
    console.error(`Error extracting data from ${url}:`, error)
    throw new Error(`Failed to extract data: ${error instanceof Error ? error.message : String(error)}`)
  }
}
