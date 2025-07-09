#!/usr/bin/env tsx

import { explainRank, getTopRankedVibes, type RankInput } from "../packages/api/src/utils/rankScore"

// Example data simulating daily phrase analytics
const examplePhrases: RankInput[] = [
  {
    vibe: "productivo",
    chartPos: 1,
    freqLyrics: 0.85,
    tiktokHits: 15000,
    maxTikTok: 20000,
  },
  {
    vibe: "perrea",
    chartPos: 3,
    freqLyrics: 0.92,
    tiktokHits: 18000,
    maxTikTok: 20000,
  },
  {
    vibe: "sad",
    chartPos: null,
    freqLyrics: 0.45,
    tiktokHits: 8000,
    maxTikTok: 20000,
  },
  {
    vibe: "chill",
    chartPos: 15,
    freqLyrics: 0.67,
    tiktokHits: 12000,
    maxTikTok: 20000,
  },
  {
    vibe: "eco",
    chartPos: null,
    freqLyrics: 0.23,
    tiktokHits: 3000,
    maxTikTok: 20000,
  },
]

console.log("🎯 Phrase Ranking Example\n")

// Calculate individual ranks
examplePhrases.forEach((phrase) => {
  const explanation = explainRank(phrase)
  console.log(`📊 ${phrase.vibe.toUpperCase()}`)
  console.log(`   Chart Position: ${phrase.chartPos || "Not charting"}`)
  console.log(`   Lyrics Frequency: ${(phrase.freqLyrics * 100).toFixed(1)}%`)
  console.log(`   TikTok Hits: ${phrase.tiktokHits.toLocaleString()}`)
  console.log(`   Final Rank: ${explanation.rank}`)
  console.log(`   Components:`)
  console.log(`     • Popularity: ${explanation.components.popularity}`)
  console.log(`     • Frequency: ${explanation.components.frequency}`)
  console.log(`     • Buzz: ${explanation.components.buzz}`)
  console.log(`     • Boost: ${explanation.components.boost}x`)
  console.log("")
})

// Get top ranked
const topRanked = getTopRankedVibes(examplePhrases, 3)
console.log("🏆 Top 3 Ranked Vibes:")
topRanked.forEach((phrase, index) => {
  console.log(`   ${index + 1}. ${phrase.vibe} (${phrase.rank})`)
})
