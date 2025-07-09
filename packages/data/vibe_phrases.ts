export interface VibePhrase {
  phrase: string // token
  vibe: "corridos" | "perrea" | "sad" | "chill" | "traka" | "productivo" | "eco" | "k-cute" | "generic"
  rank: number // default 0.25 – will be recalculated nightly
}

export const vibePhrases: VibePhrase[] = [
  { phrase: "bélico", vibe: "corridos", rank: 0.25 },
  { phrase: "troca", vibe: "corridos", rank: 0.25 },
  { phrase: "plebita", vibe: "corridos", rank: 0.25 },
  { phrase: "marlboro", vibe: "corridos", rank: 0.25 },
  { phrase: "ansiedad", vibe: "sad", rank: 0.25 },
  { phrase: "jálate", vibe: "traka", rank: 0.25 },
  { phrase: "Dompe", vibe: "perrea", rank: 0.25 },
  { phrase: "pantera", vibe: "corridos", rank: 0.25 },
  { phrase: "AMG", vibe: "corridos", rank: 0.25 },
  { phrase: "tatuaje", vibe: "sad", rank: 0.25 },
  { phrase: "rockstar", vibe: "traka", rank: 0.25 },
  { phrase: "finde", vibe: "perrea", rank: 0.25 },
  { phrase: "lock-in", vibe: "productivo", rank: 0.25 },
  { phrase: "bones day", vibe: "productivo", rank: 0.25 },
  { phrase: "deep work", vibe: "productivo", rank: 0.25 },
  { phrase: "pomodoro", vibe: "productivo", rank: 0.25 },
  { phrase: "grindset", vibe: "productivo", rank: 0.25 },
  { phrase: "coffee badging", vibe: "productivo", rank: 0.25 },
  { phrase: "study sesh", vibe: "productivo", rank: 0.25 },
  { phrase: "lofi", vibe: "chill", rank: 0.25 },
  { phrase: "headphones on", vibe: "chill", rank: 0.25 },
  { phrase: "zen mode", vibe: "chill", rank: 0.25 },
  { phrase: "quiet flex", vibe: "chill", rank: 0.25 },
  { phrase: "pana", vibe: "generic", rank: 0.25 },
  { phrase: "parce", vibe: "generic", rank: 0.25 },
  { phrase: "chido", vibe: "generic", rank: 0.25 },
  { phrase: "chévere", vibe: "generic", rank: 0.25 },
  { phrase: "bacano", vibe: "generic", rank: 0.25 },
  { phrase: "chamo", vibe: "generic", rank: 0.25 },
  { phrase: "güey", vibe: "generic", rank: 0.25 },
  { phrase: "boludo", vibe: "generic", rank: 0.25 },
  { phrase: "pibe", vibe: "generic", rank: 0.25 },
  { phrase: "dale", vibe: "generic", rank: 0.25 },
  { phrase: "quilombo", vibe: "generic", rank: 0.25 },
  { phrase: "janguear", vibe: "generic", rank: 0.25 },
  { phrase: "piola", vibe: "generic", rank: 0.25 },
  { phrase: "morro", vibe: "generic", rank: 0.25 },
  { phrase: "bacán", vibe: "generic", rank: 0.25 },
  { phrase: "weón", vibe: "generic", rank: 0.25 },
  { phrase: "birra", vibe: "generic", rank: 0.25 },
  { phrase: "chela", vibe: "generic", rank: 0.25 },
  { phrase: "facha", vibe: "generic", rank: 0.25 },
  { phrase: "tranqui", vibe: "chill", rank: 0.25 },
]

// Helper functions for working with vibe phrases
export function getVibesByPhrase(phrase: string): VibePhrase[] {
  return vibePhrases.filter((vp) => vp.phrase.toLowerCase().includes(phrase.toLowerCase()))
}

export function getPhrasesByVibe(vibe: VibePhrase["vibe"]): VibePhrase[] {
  return vibePhrases.filter((vp) => vp.vibe === vibe)
}

export function getTopPhrases(limit = 10): VibePhrase[] {
  return vibePhrases.sort((a, b) => b.rank - a.rank).slice(0, limit)
}

export function analyzeTextForVibes(text: string): { vibe: VibePhrase["vibe"]; score: number }[] {
  const textLower = text.toLowerCase()
  const vibeScores: Record<VibePhrase["vibe"], number> = {
    corridos: 0,
    perrea: 0,
    sad: 0,
    chill: 0,
    traka: 0,
    productivo: 0,
    eco: 0,
    "k-cute": 0,
    generic: 0,
  }

  // Find matching phrases and accumulate scores
  vibePhrases.forEach((vp) => {
    if (textLower.includes(vp.phrase.toLowerCase())) {
      vibeScores[vp.vibe] += vp.rank
    }
  })

  // Convert to array and sort by score
  return Object.entries(vibeScores)
    .map(([vibe, score]) => ({ vibe: vibe as VibePhrase["vibe"], score }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
}
