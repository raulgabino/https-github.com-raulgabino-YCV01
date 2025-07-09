export const ALPHA = 0.5
export const BETA = 0.3
export const GAMMA = 0.2

export const BOOSTS: Record<string, number> = {
  productivo: 1.5,
  chill: 1.5,
  corridos: 1.0,
  perrea: 1.0,
  sad: 1.0,
  traka: 1.0,
  eco: 1.2,
  "k-cute": 1.2,
  generic: 1.0,
}

export function normalize(x: number, min: number, max: number): number {
  return max === min ? 0 : (x - min) / (max - min)
}

export interface RankInput {
  vibe: string
  chartPos: number | null // 1-50 or null
  freqLyrics: number // 0-1
  tiktokHits: number // raw int
  maxTikTok: number // global max of the day
}

export function calcRank({ vibe, chartPos, freqLyrics, tiktokHits, maxTikTok }: RankInput): number {
  const pop = chartPos ? 1 / chartPos : 0
  const freq = freqLyrics
  const buzz = normalize(tiktokHits, 0, maxTikTok)
  const base = ALPHA * pop + BETA * freq + GAMMA * buzz
  return +(base * (BOOSTS[vibe] ?? 1)).toFixed(3)
}

// Helper functions for working with rankings
export function calculateBatchRanks(inputs: RankInput[]): Array<RankInput & { rank: number }> {
  return inputs.map((input) => ({
    ...input,
    rank: calcRank(input),
  }))
}

export function getTopRankedVibes(inputs: RankInput[], limit = 10): Array<RankInput & { rank: number }> {
  return calculateBatchRanks(inputs)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit)
}

export function getVibeBoostFactor(vibe: string): number {
  return BOOSTS[vibe] ?? 1.0
}

// Validation functions
export function validateRankInput(input: RankInput): boolean {
  return (
    typeof input.vibe === "string" &&
    (input.chartPos === null || (typeof input.chartPos === "number" && input.chartPos >= 1 && input.chartPos <= 50)) &&
    typeof input.freqLyrics === "number" &&
    input.freqLyrics >= 0 &&
    input.freqLyrics <= 1 &&
    typeof input.tiktokHits === "number" &&
    input.tiktokHits >= 0 &&
    typeof input.maxTikTok === "number" &&
    input.maxTikTok >= 0
  )
}

// Debug helper to understand rank composition
export function explainRank({ vibe, chartPos, freqLyrics, tiktokHits, maxTikTok }: RankInput): {
  rank: number
  components: {
    popularity: number
    frequency: number
    buzz: number
    base: number
    boost: number
  }
} {
  const pop = chartPos ? 1 / chartPos : 0
  const freq = freqLyrics
  const buzz = normalize(tiktokHits, 0, maxTikTok)
  const base = ALPHA * pop + BETA * freq + GAMMA * buzz
  const boost = BOOSTS[vibe] ?? 1
  const rank = +(base * boost).toFixed(3)

  return {
    rank,
    components: {
      popularity: +(ALPHA * pop).toFixed(3),
      frequency: +(BETA * freq).toFixed(3),
      buzz: +(GAMMA * buzz).toFixed(3),
      base: +base.toFixed(3),
      boost,
    },
  }
}
