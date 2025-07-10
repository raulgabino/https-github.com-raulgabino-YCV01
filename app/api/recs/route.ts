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
    // Build more specific search queries for real results
    const locationQueries = [
      `${category} ${city} México`,
      `best ${category} in ${city}`,
      `${city} ${category} recommendations`,
      `where to ${category === "restaurants" ? "eat" : category === "bares" ? "drink" : "go"} in ${city}`,
    ]

    // Try multiple search strategies
    const allResults: any[] = []

    for (const query of locationQueries.slice(0, 2)) {
      // Limit to 2 queries to avoid rate limits
      try {
        console.log(`🔍 Searching Exa.ai: "${query}"`)

        const searchResults = await exa.searchAndContents(query, {
          type: "neural", // Use neural search for better semantic understanding
          numResults: 6,
          text: true,
          livecrawl: "always", // Force live crawling for fresh results
          useAutoprompt: false, // Disable autoprompt to use our exact query
          startPublishedDate: "2020-01-01", // Only recent content
          excludeDomains: ["wikipedia.org", "facebook.com", "instagram.com"], // Exclude generic sites
          includeDomains: ["tripadvisor.com", "yelp.com", "google.com", "foursquare.com", "zomato.com"], // Include review sites
        })

        if (searchResults.results && searchResults.results.length > 0) {
          allResults.push(...searchResults.results)
        }
      } catch (queryError) {
        console.error(`Query failed: ${query}`, queryError)
        continue
      }
    }

    if (allResults.length === 0) {
      console.log("No results from Exa.ai searches")
      return []
    }

    // Deduplicate and process results
    const uniqueResults = deduplicateResults(allResults).slice(0, 4)

    console.log(`📊 Found ${uniqueResults.length} unique results from Exa.ai`)

    // Process with more specific prompts
    const processedResults = await Promise.all(
      uniqueResults.map(async (result: any) => {
        try {
          if (!openai) {
            throw new Error("OpenAI not available for processing")
          }

          // More specific processing prompt
          const processingPrompt = `
You are extracting real business information from this web content about places in ${city}:

TITLE: ${result.title}
URL: ${result.url}
CONTENT: ${result.text?.substring(0, 1500) || "No content available"}

Extract REAL business information and return ONLY valid JSON:
{
  "name": "Exact business name from content",
  "address": "Real street address if mentioned, otherwise '${city}, México'",
  "rating": 4.2,
  "description": "Real description from content (max 30 words)",
  "type": "${category}",
  "priceRange": "$" | "$$" | "$$$" | "$$$$",
  "hours": "Real hours if mentioned, otherwise 'Ver horarios'",
  "phoneNumber": "Real phone if found, otherwise ''",
  "website": "${result.url}"
}

IMPORTANT: 
- Use REAL information from the content
- If rating not found, estimate based on reviews mentioned
- Make description specific to what's actually mentioned
- Don't invent information not in the content
`

          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "Extract real business data from web content. Return only valid JSON with actual information found in the content.",
              },
              {
                role: "user",
                content: processingPrompt,
              },
            ],
            max_tokens: 400,
            temperature: 0.1, // Lower temperature for more factual responses
          })

          const content = response.choices[0]?.message?.content?.trim()
          if (!content) {
            throw new Error("No response from OpenAI")
          }

          let businessData
          try {
            businessData = JSON.parse(content)
          } catch (parseError) {
            console.error("JSON parse error:", parseError)
            // Create fallback from actual result data
            businessData = {
              name: result.title?.split(" - ")[0]?.split(" | ")[0] || "Local Business",
              address: `${city}, México`,
              rating: 0,
              description: result.text?.substring(0, 80) || "Local business in " + city,
              type: category,
              priceRange: "$$",
              hours: "Ver horarios",
              phoneNumber: "",
              website: result.url,
            }
          }

          return {
            ...businessData,
            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessData.name + " " + city)}`,
            imageUrl: `https://source.unsplash.com/600x400/?${category},${city},restaurant`,
            source: "exa_ai",
          }
        } catch (error) {
          console.error("Error processing result:", error)
          return null
        }
      }),
    )

    const validResults = processedResults.filter((result) => result !== null && result.name !== "Local Business")
    console.log(`✅ Processed ${validResults.length} valid results`)

    return validResults
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
    console.log(`🔧 API Keys configured: OpenAI=${!!openai}, Exa=${!!exa}`)
    console.log(`🌍 Search parameters: ${city} | ${category} | ${vibe}`)

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
