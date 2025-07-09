import { OpenAI } from "openai"
import { Redis } from "@upstash/redis"
import { type NextRequest, NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const redis = new Redis({
  url: process.env.REDIS_REST_URL!,
  token: process.env.REDIS_REST_TOKEN!,
})

interface RecsRequest {
  vibe: string
  city?: string
}

interface ProcessedRec {
  name: string
  desc: string
  url: string
}

const VIBE_MODIFIERS: Record<string, string> = {
  perrea: "clubs or rooftops open past 1 AM playing reggaeton",
  productivo: "coffee shops or coworks with wifi and quiet areas",
  sad: "cozy cafés with acoustic music and dim lights",
  corridos: "cantinas or taquerías open late with live norteno",
  chill: "relaxed bars or lounges with good vibes and craft drinks",
  traka: "street food spots or markets with authentic local flavors",
  eco: "parks, nature spots, or eco-friendly venues for outdoor activities",
  "k-cute": "aesthetic cafés, cute shops, or Instagram-worthy spots",
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, timeout = 1500): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok && retries > 0) {
      return fetchWithRetry(url, options, retries - 1, timeout)
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (retries > 0) {
      return fetchWithRetry(url, options, retries - 1, timeout)
    }

    throw error
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: RecsRequest = await request.json()

    if (!body.vibe) {
      return NextResponse.json({ error: "Vibe is required" }, { status: 400 })
    }

    const city = body.city || "Ciudad Victoria"
    const vibe = body.vibe.toLowerCase()

    // Check cache first
    const cacheKey = `recs:${vibe}:${city}`
    const cachedResult = await redis.get<ProcessedRec[]>(cacheKey)

    if (cachedResult) {
      return NextResponse.json({ recommendations: cachedResult })
    }

    const modifier = VIBE_MODIFIERS[vibe]
    if (!modifier) {
      return NextResponse.json({ error: "Unknown vibe type" }, { status: 400 })
    }

    // Generate search query using OpenAI
    const queryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Return ONE plain English query for web search, no quotes.",
        },
        {
          role: "user",
          content: `${city} ${modifier}`,
        },
      ],
      max_tokens: 50,
      temperature: 0.3,
    })

    const searchQuery = queryResponse.choices[0]?.message?.content?.trim()

    if (!searchQuery) {
      return NextResponse.json({ error: "Failed to generate search query" }, { status: 500 })
    }

    // Search with Perplexity Sonar
    let processedRecs: ProcessedRec[] = []

    try {
      const perplexityResponse = await fetchWithRetry("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SONAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "Find local places and return as JSON array with name, desc (max 15 words), and url fields.",
            },
            {
              role: "user",
              content: searchQuery,
            },
          ],
          max_tokens: 1000,
          temperature: 0.2,
        }),
      })

      if (perplexityResponse.ok) {
        const perplexityData = await perplexityResponse.json()
        const content = perplexityData.choices?.[0]?.message?.content

        if (content) {
          try {
            const jsonMatch = content.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
              processedRecs = JSON.parse(jsonMatch[0])
            }
          } catch (parseError) {
            // Fallback
            processedRecs = [
              {
                name: `${city} ${vibe} spots`,
                desc: `Discover the best ${vibe} places in ${city}`,
                url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
              },
            ]
          }
        }
      }
    } catch (error) {
      console.error("Perplexity API error:", error)
    }

    // Fallback if no results
    if (!processedRecs.length) {
      processedRecs = [
        {
          name: `${city} ${vibe} recommendations`,
          desc: `Find great ${vibe} spots in ${city}`,
          url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
        },
      ]
    }

    // Cache results for 30 minutes
    await redis.setex(cacheKey, 1800, processedRecs)

    return NextResponse.json({
      recommendations: processedRecs,
      query: searchQuery,
      city,
      vibe,
    })
  } catch (error) {
    console.error("Error in recs handler:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const runtime = "edge"
