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

interface VibeRequest {
  text?: string
  image_url?: string
}

interface VibeResponse {
  vibe: "corridos" | "perrea" | "sad" | "chill" | "traka" | "productivo" | "eco" | "k-cute"
  confidence: number
}

// Simple hash function for cache keys
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: VibeRequest = await request.json()

    if (!body.text && !body.image_url) {
      return NextResponse.json({ ask: "¿Cómo te sientes?" }, { status: 400 })
    }

    let input: string

    // Step 1: Get input text (either from text field or image description)
    if (body.image_url) {
      try {
        const imageResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Describe the meme in one sentence max.",
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: body.image_url,
                  },
                },
              ],
            },
          ],
          max_tokens: 100,
        })

        input = imageResponse.choices[0]?.message?.content?.trim() || ""

        if (!input) {
          return NextResponse.json({ ask: "¿Cómo te sientes?" }, { status: 400 })
        }
      } catch (error) {
        console.error("Error processing image:", error)
        return NextResponse.json({ ask: "¿Cómo te sientes?" }, { status: 400 })
      }
    } else {
      input = body.text!
    }

    // Check cache first
    const cacheKey = `vibe:${hashString(input)}`
    const cachedResult = await redis.get<VibeResponse>(cacheKey)

    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    // Step 2: Classify the vibe
    const classificationResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'You are a strict classifier. Return ONLY JSON like {"vibe":"corridos|perrea|sad|chill|traka|productivo|eco|k-cute","confidence":0-1}',
        },
        {
          role: "user",
          content: input,
        },
      ],
      max_tokens: 50,
      temperature: 0,
    })

    const classificationText = classificationResponse.choices[0]?.message?.content?.trim()

    if (!classificationText) {
      return NextResponse.json({ ask: "¿Cómo te sientes?" }, { status: 400 })
    }

    let classification: VibeResponse
    try {
      classification = JSON.parse(classificationText)
    } catch (error) {
      console.error("Error parsing classification:", error)
      return NextResponse.json({ ask: "¿Cómo te sientes?" }, { status: 400 })
    }

    // Step 3: Check confidence threshold
    if (classification.confidence < 0.6) {
      return NextResponse.json({ ask: "¿Cómo te sientes?" }, { status: 400 })
    }

    // Step 4: Cache the result for 30 minutes (1800 seconds)
    await redis.setex(cacheKey, 1800, classification)

    return NextResponse.json(classification)
  } catch (error) {
    console.error("Error in vibe handler:", error)
    return NextResponse.json({ ask: "¿Cómo te sientes?" }, { status: 500 })
  }
}

export const runtime = "edge"
