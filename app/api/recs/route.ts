import { OpenAI } from "openai"
import { type NextRequest, NextResponse } from "next/server"
import Exa from "exa-js"

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

const exa = process.env.EXA_API_KEY ? new Exa(process.env.EXA_API_KEY) : null

interface RecsRequest {
  category: string
  vibe: string
  city?: string
  searchQuery?: string
  customInput?: string
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
  imageUrl?: string
  source: string
}

// Enhanced search modifiers with semantic keywords
const SEARCH_MODIFIERS: Record<string, Record<string, string>> = {
  restaurants: {
    sad: "cozy intimate restaurants quiet atmosphere comfort food emotional support dining",
    chill: "relaxed casual restaurants laid-back atmosphere good vibes comfortable seating",
    perrea: "lively restaurants party atmosphere music dancing energetic dining nightlife",
    romantico: "romantic restaurants intimate dining candlelit dinner date night couples",
    productivo: "restaurants with wifi work-friendly quiet dining business meetings",
    familiar: "family-friendly restaurants kids menu casual atmosphere group dining",
    trendy: "modern hip restaurants Instagram-worthy trendy cuisine contemporary design",
    autentico: "authentic traditional restaurants local cuisine cultural dining heritage",
  },
  cafeterias: {
    productivo: "coffee shops coworking spaces wifi laptop-friendly work environment quiet study",
    chill: "relaxed coffee shops comfortable seating laid-back atmosphere good coffee",
    aesthetic: "beautiful coffee shops Instagram-worthy aesthetic design photogenic interior",
    estudioso: "study-friendly cafes quiet atmosphere library-like environment focused work",
    social: "social coffee shops community space meet friends lively atmosphere",
  },
  bares: {
    perrea: "nightlife bars dancing reggaeton party atmosphere energetic music",
    chill: "relaxed bars laid-back atmosphere good drinks comfortable seating",
    trendy: "modern bars hip atmosphere craft cocktails contemporary design",
    social: "social bars meet people lively atmosphere community gathering",
    dive: "dive bars authentic atmosphere local hangout unpretentious",
  },
  hoteles: {
    luxury: "luxury hotels 5-star accommodation premium service high-end amenities",
    business: "business hotels conference facilities corporate stays work-friendly",
    romantico: "romantic hotels couples retreat honeymoon suites intimate atmosphere",
    familiar: "family hotels kids amenities family-friendly accommodation",
    boutique: "boutique hotels unique design artistic atmosphere personalized service",
  },
  recreacion: {
    aventura: "adventure activities extreme sports outdoor adventures adrenaline activities",
    chill: "relaxing activities peaceful recreation leisure entertainment",
    familiar: "family activities kids entertainment all-ages recreation",
    fitness: "fitness activities sports facilities active recreation gym sports",
    cultural: "cultural activities museums art galleries educational entertainment",
  },
  moda: {
    trendy: "fashion stores trendy clothing modern style contemporary fashion",
    vintage: "vintage clothing retro fashion second-hand thrift shops",
    luxury: "luxury fashion designer brands high-end clothing premium",
    casual: "casual clothing everyday fashion comfortable clothes basic wear",
    alternativo: "alternative fashion unique style indie clothing unconventional",
  },
}

// Extract domain for deduplication
const extractDomain = (url: string): string => {
  const urlPattern = /^https?:\/\/([^/?#]+)(?:[/?#]|$)/i
  return url.match(urlPattern)?.[1] || url
}

// Deduplicate results by domain and URL
const deduplicateResults = <T extends { url: string }>(items: T[]): T[] => {
  const seenDomains = new Set<string>()
  const seenUrls = new Set<string>()
  return items.filter((item) => {
    const domain = extractDomain(item.url)
    const isNewUrl = !seenUrls.has(item.url)
    const isNewDomain = !seenDomains.has(domain)
    if (isNewUrl && isNewDomain) {
      seenUrls.add(item.url)
      seenDomains.add(domain)
      return true
    }
    return false
  })
}

// Enhanced search with Exa.ai
async function searchWithExa(
  city: string,
  category: string,
  vibe: string,
  customInput?: string,
): Promise<ProcessedRec[]> {
  if (!exa) {
    throw new Error("Exa.ai API key not configured")
  }

  try {
    // Get semantic search modifier
    const baseModifier = SEARCH_MODIFIERS[category]?.[vibe] || `${category} ${vibe}`

    // Build enhanced search query
    const searchQuery = customInput ? `${baseModifier} ${customInput} in ${city}` : `${baseModifier} in ${city}`

    console.log(`🔍 Searching with Exa.ai: "${searchQuery}"`)

    // Search with Exa.ai
    const searchResults = await exa.searchAndContents(searchQuery, {
      type: "auto",
      numResults: 8,
      text: true,
      livecrawl: "preferred",
      useAutoprompt: true,
      category:
        category === "restaurants"
          ? "dining"
          : category === "cafeterias"
            ? "dining"
            : category === "bares"
              ? "nightlife"
              : category === "hoteles"
                ? "accommodation"
                : category === "recreacion"
                  ? "entertainment"
                  : category === "moda"
                    ? "shopping"
                    : "",
    })

    if (!searchResults.results || searchResults.results.length === 0) {
      console.log("No results from Exa.ai")
      return []
    }

    // Process results with OpenAI for structured data
    const processedResults = await Promise.all(
      deduplicateResults(searchResults.results)
        .slice(0, 5)
        .map(async (result: any) => {
          try {
            if (!openai) {
              throw new Error("OpenAI not available for processing")
            }

            const processingPrompt = `
Extract business information from this content about a ${category} place in ${city}:

Title: ${result.title}
URL: ${result.url}
Content: ${result.text?.substring(0, 1000) || "No content available"}

Return ONLY a JSON object with this exact structure:
{
  "name": "Business name",
  "address": "Full address in ${city}",
  "rating": 4.2,
  "description": "Why this place fits ${vibe} vibe (max 25 words)",
  "type": "${category}",
  "priceRange": "$" | "$$" | "$$$" | "$$$$",
  "hours": "Operating hours or 'Hours vary'",
  "phoneNumber": "Phone number or empty string",
  "website": "Website URL or empty string"
}

If information is not available, use reasonable defaults. Make the description engaging and relevant to ${vibe} mood.
`

            const response = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are a local business data extractor. Return only valid JSON, no additional text.",
                },
                {
                  role: "user",
                  content: processingPrompt,
                },
              ],
              max_tokens: 300,
              temperature: 0.3,
            })

            const content = response.choices[0]?.message?.content?.trim()
            if (!content) {
              throw new Error("No response from OpenAI")
            }

            let businessData
            try {
              businessData = JSON.parse(content)
            } catch (parseError) {
              // Fallback if JSON parsing fails
              businessData = {
                name: result.title?.split(" - ")[0] || "Local Business",
                address: `${city}, México`,
                rating: 0,
                description: result.text?.substring(0, 100) || "Local business",
                type: category,
                priceRange: "$$",
                hours: "Hours vary",
                phoneNumber: "",
                website: result.url,
              }
            }

            return {
              ...businessData,
              googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessData.name + " " + businessData.address)}`,
              imageUrl: result.image || `https://source.unsplash.com/600x400/?${category},restaurant,${city}`,
              source: "exa_ai",
            }
          } catch (error) {
            console.error("Error processing result:", error)
            // Fallback result
            return {
              name: result.title?.split(" - ")[0] || "Local Business",
              address: `${city}, México`,
              rating: 0,
              description: result.text?.substring(0, 100) || "Discover this local gem",
              type: category,
              priceRange: "$$",
              hours: "Hours vary",
              phoneNumber: "",
              website: result.url,
              googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.title + " " + city)}`,
              imageUrl: `https://source.unsplash.com/600x400/?${category},restaurant,${city}`,
              source: "exa_ai",
            }
          }
        }),
    )

    return processedResults.filter((result) => result.name && result.name !== "Local Business")
  } catch (error) {
    console.error("Exa.ai search error:", error)
    return []
  }
}

// GPT fallback for when Exa.ai fails
async function getGPTFallback(city: string, category: string, vibe: string): Promise<ProcessedRec[]> {
  if (!openai) return []

  try {
    const modifier = SEARCH_MODIFIERS[category]?.[vibe] || `${category} ${vibe}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a local guide for ${city}. Generate realistic ${category} recommendations that match the ${vibe} vibe. Return ONLY a JSON array with this exact format:
[
  {
    "name": "Business Name",
    "address": "Full address in ${city}",
    "rating": 4.2,
    "description": "Why this place fits ${vibe} vibe (max 25 words)",
    "type": "${category}",
    "priceRange": "$-$$$$",
    "hours": "Operating hours",
    "phoneNumber": "+521234567890",
    "website": "https://example.com"
  }
]`,
        },
        {
          role: "user",
          content: `Find 4 realistic ${category} places in ${city} for: ${modifier}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) return []

    try {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed)
        ? parsed.map((item) => ({
            ...item,
            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + " " + city)}`,
            imageUrl: `https://source.unsplash.com/600x400/?${category},restaurant,${city}`,
            source: "gpt_fallback",
          }))
        : []
    } catch (parseError) {
      console.error("Error parsing GPT response:", parseError)
      return []
    }
  } catch (error) {
    console.error("GPT fallback error:", error)
    return []
  }
}

// Main API handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: RecsRequest = await request.json()

    if (!body.category || !body.vibe) {
      return NextResponse.json({ error: "Category and vibe are required" }, { status: 400 })
    }

    const city = body.city || "Ciudad Victoria"
    const category = body.category
    const vibe = body.vibe
    const customInput = body.customInput || ""

    console.log(`🔍 Searching: ${category} | ${vibe} | ${city} | ${customInput}`)

    let processedRecs: ProcessedRec[] = []

    // Try Exa.ai first
    if (exa) {
      try {
        processedRecs = await searchWithExa(city, category, vibe, customInput)
        console.log(`✅ Exa.ai returned ${processedRecs.length} results`)
      } catch (error) {
        console.error("Exa.ai search failed:", error)
      }
    }

    // If Exa.ai fails or returns no results, use GPT fallback
    if (processedRecs.length === 0) {
      console.log("🔄 Using GPT fallback...")
      processedRecs = await getGPTFallback(city, category, vibe)
    }

    // Ultimate fallback if everything fails
    if (processedRecs.length === 0) {
      processedRecs = [
        {
          name: `${city} ${category} search`,
          address: `${city}, México`,
          rating: 0,
          description: `Discover ${vibe} ${category} places in ${city}`,
          type: category,
          priceRange: "$$",
          hours: "Hours vary",
          phoneNumber: "",
          website: "",
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vibe + " " + category + " " + city)}`,
          imageUrl: `https://source.unsplash.com/600x400/?${category},restaurant,${city}`,
          source: "fallback",
        },
      ]
    }

    return NextResponse.json({
      recommendations: processedRecs,
      city,
      vibe,
      category,
      source: processedRecs[0]?.source || "unknown",
      count: processedRecs.length,
    })
  } catch (error) {
    console.error("Error in recs handler:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const runtime = "edge"
