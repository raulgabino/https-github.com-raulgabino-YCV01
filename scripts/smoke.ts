#!/usr/bin/env tsx

interface VibeResponse {
  vibe: string
  confidence: number
}

interface RecsResponse {
  recommendations: Array<{
    name: string
    desc: string
    url: string
  }>
  query: string
  city: string
  vibe: string
}

const TEST_PROMPTS = ["ando lock-in", "ando bélico", "chela tranqui con los panas"]

const BASE_URL = "http://localhost:3000"

async function testPrompt(prompt: string): Promise<boolean> {
  try {
    console.log(`\n🧪 Testing prompt: "${prompt}"`)

    // Step 1: Call /api/vibe
    console.log("  → Calling /api/vibe...")
    const vibeResponse = await fetch(`${BASE_URL}/api/vibe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: prompt }),
    })

    if (!vibeResponse.ok) {
      const errorData = await vibeResponse.json()
      console.log(`  ❌ Vibe API failed: ${vibeResponse.status} - ${JSON.stringify(errorData)}`)
      return false
    }

    const vibeData: VibeResponse = await vibeResponse.json()
    console.log(`  ✅ Vibe detected:`, JSON.stringify(vibeData, null, 2))

    // Step 2: Call /api/recs with the detected vibe
    console.log("  → Calling /api/recs...")
    const recsResponse = await fetch(`${BASE_URL}/api/recs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vibe: vibeData.vibe,
        city: "Ciudad Victoria",
      }),
    })

    if (!recsResponse.ok) {
      const errorData = await recsResponse.json()
      console.log(`  ❌ Recs API failed: ${recsResponse.status} - ${JSON.stringify(errorData)}`)
      return false
    }

    const recsData: RecsResponse = await recsResponse.json()

    if (recsData.recommendations.length === 0) {
      console.log(`  ❌ No recommendations returned`)
      return false
    }

    console.log(`  ✅ Got ${recsData.recommendations.length} recommendations`)
    console.log(`  📍 First result: "${recsData.recommendations[0].name}"`)

    return true
  } catch (error) {
    console.log(`  ❌ Error testing prompt "${prompt}":`, error)
    return false
  }
}

async function runSmokeTest(): Promise<void> {
  console.log("🚀 Starting smoke test for Your City Vibe API")
  console.log(`📡 Testing against: ${BASE_URL}`)

  const results: boolean[] = []

  for (const prompt of TEST_PROMPTS) {
    const success = await testPrompt(prompt)
    results.push(success)

    // Add a small delay between requests to be nice to the API
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const successCount = results.filter(Boolean).length
  const totalCount = results.length

  console.log(`\n📊 Results: ${successCount}/${totalCount} tests passed`)

  if (successCount === totalCount) {
    console.log("🎉 All tests passed! API is working correctly.")
    process.exit(0)
  } else {
    console.log("💥 Some tests failed. Check the API endpoints.")

    // Show which tests failed
    results.forEach((success, index) => {
      const status = success ? "✅" : "❌"
      console.log(`  ${status} "${TEST_PROMPTS[index]}"`)
    })

    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error)
  process.exit(1)
})

// Run the smoke test
runSmokeTest().catch((error) => {
  console.error("Fatal error in smoke test:", error)
  process.exit(1)
})
