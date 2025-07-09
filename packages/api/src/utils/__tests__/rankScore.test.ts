import { calcRank, normalize, explainRank, validateRankInput, getTopRankedVibes, type RankInput } from "../rankScore"

describe("rankScore", () => {
  describe("normalize", () => {
    it("should normalize values correctly", () => {
      expect(normalize(5, 0, 10)).toBe(0.5)
      expect(normalize(0, 0, 10)).toBe(0)
      expect(normalize(10, 0, 10)).toBe(1)
      expect(normalize(5, 5, 5)).toBe(0) // edge case: min === max
    })
  })

  describe("calcRank", () => {
    it("should calculate rank for a trending phrase", () => {
      const input: RankInput = {
        vibe: "productivo",
        chartPos: 1, // #1 on charts
        freqLyrics: 0.8, // high frequency in lyrics
        tiktokHits: 10000,
        maxTikTok: 10000, // max buzz
      }

      const rank = calcRank(input)
      expect(rank).toBeGreaterThan(1) // Should be high due to productivo boost
    })

    it("should handle null chart position", () => {
      const input: RankInput = {
        vibe: "generic",
        chartPos: null,
        freqLyrics: 0.5,
        tiktokHits: 5000,
        maxTikTok: 10000,
      }

      const rank = calcRank(input)
      expect(rank).toBeGreaterThan(0)
      expect(rank).toBeLessThan(1)
    })

    it("should apply vibe boosts correctly", () => {
      const baseInput: RankInput = {
        vibe: "generic",
        chartPos: 10,
        freqLyrics: 0.5,
        tiktokHits: 5000,
        maxTikTok: 10000,
      }

      const boostedInput: RankInput = {
        ...baseInput,
        vibe: "productivo", // 1.5x boost
      }

      const baseRank = calcRank(baseInput)
      const boostedRank = calcRank(boostedInput)

      expect(boostedRank).toBe(baseRank * 1.5)
    })
  })

  describe("validateRankInput", () => {
    it("should validate correct input", () => {
      const validInput: RankInput = {
        vibe: "productivo",
        chartPos: 25,
        freqLyrics: 0.7,
        tiktokHits: 8000,
        maxTikTok: 15000,
      }

      expect(validateRankInput(validInput)).toBe(true)
    })

    it("should reject invalid input", () => {
      const invalidInput: RankInput = {
        vibe: "productivo",
        chartPos: 0, // Invalid: should be 1-50 or null
        freqLyrics: 1.5, // Invalid: should be 0-1
        tiktokHits: -100, // Invalid: should be >= 0
        maxTikTok: 15000,
      }

      expect(validateRankInput(invalidInput)).toBe(false)
    })
  })

  describe("explainRank", () => {
    it("should break down rank calculation", () => {
      const input: RankInput = {
        vibe: "chill",
        chartPos: 5,
        freqLyrics: 0.6,
        tiktokHits: 7500,
        maxTikTok: 10000,
      }

      const explanation = explainRank(input)

      expect(explanation.rank).toBeGreaterThan(0)
      expect(explanation.components.popularity).toBeGreaterThan(0)
      expect(explanation.components.frequency).toBeGreaterThan(0)
      expect(explanation.components.buzz).toBeGreaterThan(0)
      expect(explanation.components.boost).toBe(1.5) // chill boost
    })
  })

  describe("getTopRankedVibes", () => {
    it("should return top ranked vibes in order", () => {
      const inputs: RankInput[] = [
        {
          vibe: "generic",
          chartPos: 50,
          freqLyrics: 0.1,
          tiktokHits: 100,
          maxTikTok: 10000,
        },
        {
          vibe: "productivo",
          chartPos: 1,
          freqLyrics: 0.9,
          tiktokHits: 9000,
          maxTikTok: 10000,
        },
        {
          vibe: "sad",
          chartPos: 10,
          freqLyrics: 0.5,
          tiktokHits: 5000,
          maxTikTok: 10000,
        },
      ]

      const topRanked = getTopRankedVibes(inputs, 2)

      expect(topRanked).toHaveLength(2)
      expect(topRanked[0].vibe).toBe("productivo") // Should be highest due to boost + metrics
      expect(topRanked[0].rank).toBeGreaterThan(topRanked[1].rank)
    })
  })
})
