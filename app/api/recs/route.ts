import { OpenAI } from "openai"
import { type NextRequest, NextResponse } from "next/server"

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

interface RecsRequest {
  vibe: string
  city?: string
}

interface ProcessedRec {
  name: string
  address: string
  rating: number
  description: string
  type: string
  priceRange: string
  hours: string
  phoneNumber: string
  website: string
  googleMapsUrl: string
}

// Vibe to modifier mapping
const VIBE_MODIFIERS: Record<string, string> = {
  perrea: "nightclubs, rooftops, or bars with reggaeton music and party atmosphere",
  productivo: "coffee shops, coworking spaces, or quiet cafés with wifi for working",
  sad: "cozy cafés with acoustic music, dim lighting, and contemplative atmosphere",
  corridos: "cantinas, taquerías, or bars with Mexican music and traditional atmosphere",
  chill: "relaxed bars, lounges, or cafés with good vibes and laid-back atmosphere",
  traka: "street food markets, food trucks, or authentic local food spots",
  eco: "parks, nature spots, organic cafés, or eco-friendly venues",
  "k-cute": "aesthetic cafés, cute shops, or Instagram-worthy spots with kawaii vibes",
}

// Robust JSON parser
function parsePerplexityResponse(content: string): ProcessedRec[] {
  try {
    // Try to find JSON array in the response
    const jsonMatch = content.match(/\[[\s\S]*?\]/g)
    if (jsonMatch) {
      for (const match of jsonMatch) {
        try {
          const parsed = JSON.parse(match)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item) => ({
              name: item.name || "Lugar desconocido",
              address: item.address || "Dirección no disponible",
              rating: Number.parseFloat(item.rating) || 0,
              description: item.description || "Sin descripción",
              type: item.type || "Lugar",
              priceRange: item.priceRange || "No especificado",
              hours: item.hours || "Horarios no disponibles",
              phoneNumber: item.phoneNumber || "",
              website: item.website || "",
              googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + " " + (item.address || ""))}`,
            }))
          }
        } catch (e) {
          continue
        }
      }
    }

    // Try to find individual JSON objects
    const objectMatches = content.match(/\{[^{}]*\}/g)
    if (objectMatches) {
      const places: ProcessedRec[] = []
      for (const match of objectMatches) {
        try {
          const parsed = JSON.parse(match)
          if (parsed.name) {
            places.push({
              name: parsed.name || "Lugar desconocido",
              address: parsed.address || "Dirección no disponible",
              rating: Number.parseFloat(parsed.rating) || 0,
              description: parsed.description || "Sin descripción",
              type: parsed.type || "Lugar",
              priceRange: parsed.priceRange || "No especificado",
              hours: parsed.hours || "Horarios no disponibles",
              phoneNumber: parsed.phoneNumber || "",
              website: parsed.website || "",
              googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parsed.name + " " + (parsed.address || ""))}`,
            })
          }
        } catch (e) {
          continue
        }
      }
      if (places.length > 0) return places
    }

    return []
  } catch (error) {
    console.error("Error parsing Perplexity response:", error)
    return []
  }
}

// GPT fallback for when Perplexity fails
async function getGPTFallback(city: string, modifier: string): Promise<ProcessedRec[]> {
  if (!openai) return []

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a local guide. Generate realistic places in the specified city that match the criteria. Return ONLY a JSON array with this exact format:
[
  {
    "name": "Place Name",
    "address": "Full address with city",
    "rating": 4.2,
    "description": "Why this place fits the vibe (max 20 words)",
    "type": "restaurant/bar/cafe/club/etc",
    "priceRange": "$-$$$$",
    "hours": "Mon-Sun 9am-10pm",
    "phoneNumber": "+1234567890",
    "website": "https://example.com"
  }
]`,
        },
        {
          role: "user",
          content: `Find 4 realistic places in ${city} for: ${modifier}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) return []

    const parsed = parsePerplexityResponse(content)
    return parsed.length > 0 ? parsed : []
  } catch (error) {
    console.error("GPT fallback error:", error)
    return []
  }
}

// Fetch with timeout and retry
async function fetchWithRetry(url: string, options: RequestInit, retries = 2, timeout = 3000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return fetchWithRetry(url, options, retries - 1, timeout)
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return fetchWithRetry(url, options, retries - 1, timeout)
    }

    throw error
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!openai) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const body: RecsRequest = await request.json()

    if (!body.vibe) {
      return NextResponse.json({ error: "Vibe is required" }, { status: 400 })
    }

    const city = body.city || "Ciudad Victoria"
    const vibe = body.vibe.toLowerCase()

    // Get modifier for vibe
    const modifier = VIBE_MODIFIERS[vibe]
    if (!modifier) {
      return NextResponse.json({ error: "Unknown vibe type" }, { status: 400 })
    }

    let processedRecs: ProcessedRec[] = []

    // Try Perplexity first
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
              content: `You are a local guide specializing in ${city}. Find real, specific places that match the criteria. Return ONLY a JSON array with this exact format:
[
  {
    "name": "Exact business name",
    "address": "Full street address, ${city}",
    "rating": 4.2,
    "description": "Why this place fits the vibe (max 20 words)",
    "type": "restaurant/bar/cafe/club/etc",
    "priceRange": "$-$$$$",
    "hours": "Mon-Sun 9am-10pm or actual hours",
    "phoneNumber": "+1234567890",
    "website": "https://actual-website.com"
  }
]
Find exactly 4 places. Use real data when available. Be specific and accurate.`,
            },
            {
              role: "user",
              content: `Find 4 specific places in ${city} for: ${modifier}`,
            },
          ],
          max_tokens: 1200,
          temperature: 0.2,
        }),
      })

      if (perplexityResponse.ok) {
        const perplexityData = await perplexityResponse.json()
        const content = perplexityData.choices?.[0]?.message?.content

        if (content) {
          processedRecs = parsePerplexityResponse(content)
        }
      }
    } catch (error) {
      console.error("Perplexity API error:", error)
    }

    // If Perplexity fails or returns no results, use GPT fallback
    if (processedRecs.length === 0) {
      console.log("Using GPT fallback...")
      processedRecs = await getGPTFallback(city, modifier)
    }

    // Ultimate fallback if everything fails
    if (processedRecs.length === 0) {
      processedRecs = [
        {
          name: `${city} ${vibe} spots`,
          address: `${city}, México`,
          rating: 0,
          description: `Descubre lugares ${vibe} en ${city}`,
          type: "Búsqueda",
          priceRange: "Varía",
          hours: "Ver horarios individuales",
          phoneNumber: "",
          website: "",
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vibe + " " + city)}`,
        },
      ]
    }

    return NextResponse.json({
      recommendations: processedRecs,
      city,
      vibe,
      source: processedRecs.length > 0 ? "perplexity" : "fallback",
    })
  } catch (error) {
    console.error("Error in recs handler:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const runtime = "edge"
