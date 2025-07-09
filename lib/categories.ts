export interface Category {
  id: string
  name: string
  emoji: string
  keywords: string[]
  vibes: string[]
  searchModifier: string
}

export const CATEGORIES: Category[] = [
  {
    id: "restaurants",
    name: "Restaurantes",
    emoji: "🍽️",
    keywords: ["comer", "comida", "restaurante", "cenar", "almorzar", "hambre", "antojo", "plato", "mesa", "reserva"],
    vibes: ["perrea", "romantico", "familiar", "trendy", "autentico", "chill"],
    searchModifier: "restaurants and dining places",
  },
  {
    id: "cafeterias",
    name: "Cafeterías",
    emoji: "☕",
    keywords: [
      "café",
      "cafetería",
      "trabajar",
      "estudiar",
      "wifi",
      "laptop",
      "desayuno",
      "mañana",
      "productivo",
      "latte",
    ],
    vibes: ["productivo", "chill", "aesthetic", "estudioso", "social"],
    searchModifier: "coffee shops and cafés",
  },
  {
    id: "hoteles",
    name: "Hoteles",
    emoji: "🏨",
    keywords: ["hotel", "hostal", "dormir", "quedarse", "noche", "habitación", "cama", "descanso", "viaje", "turismo"],
    vibes: ["luxury", "business", "romantico", "familiar", "boutique"],
    searchModifier: "hotels and accommodation",
  },
  {
    id: "recreacion",
    name: "Diversión",
    emoji: "🎮",
    keywords: [
      "divertir",
      "jugar",
      "entretenimiento",
      "actividad",
      "pasear",
      "aventura",
      "deporte",
      "cultura",
      "museo",
      "parque",
    ],
    vibes: ["aventura", "chill", "familiar", "fitness", "cultural"],
    searchModifier: "entertainment and recreational activities",
  },
  {
    id: "moda",
    name: "Moda",
    emoji: "👕",
    keywords: ["ropa", "comprar", "tienda", "vestir", "moda", "estilo", "shopping", "zapatos", "accesorios", "outfit"],
    vibes: ["trendy", "vintage", "luxury", "casual", "alternativo"],
    searchModifier: "fashion stores and clothing shops",
  },
  {
    id: "bares",
    name: "Bares",
    emoji: "🍺",
    keywords: ["bar", "beber", "trago", "cerveza", "cocktail", "noche", "fiesta", "salir", "copas", "alcohol"],
    vibes: ["perrea", "chill", "trendy", "social", "dive"],
    searchModifier: "bars and nightlife venues",
  },
]

export const VIBE_MAPPINGS: Record<string, string> = {
  // Emotions and moods
  triste: "sad",
  sad: "sad",
  deprimido: "sad",
  melancólico: "sad",
  nostálgico: "sad",
  feliz: "chill",
  happy: "chill",
  alegre: "chill",
  contento: "chill",
  fiesta: "perrea",
  party: "perrea",
  bailar: "perrea",
  reggaeton: "perrea",
  perreo: "perrea",
  relajado: "chill",
  chill: "chill",
  tranquilo: "chill",
  peaceful: "chill",
  romántico: "romantico",
  romance: "romantico",
  amor: "romantico",
  pareja: "romantico",
  cita: "romantico",
  productivo: "productivo",
  trabajar: "productivo",
  trabajo: "productivo",
  estudiar: "productivo",
  focus: "productivo",
  familiar: "familiar",
  familia: "familiar",
  niños: "familiar",
  kids: "familiar",
  trendy: "trendy",
  moderno: "trendy",
  cool: "trendy",
  hipster: "trendy",
  auténtico: "autentico",
  tradicional: "autentico",
  local: "autentico",
  típico: "autentico",
  aesthetic: "aesthetic",
  bonito: "aesthetic",
  instagram: "aesthetic",
  foto: "aesthetic",
  aventura: "aventura",
  adventure: "aventura",
  extremo: "aventura",
  adrenalina: "aventura",
  luxury: "luxury",
  lujo: "luxury",
  premium: "luxury",
  caro: "luxury",
  vintage: "vintage",
  retro: "vintage",
  antiguo: "vintage",
  clásico: "vintage",
}

export function detectCategoriesFromText(text: string): Category[] {
  const lowerText = text.toLowerCase()
  const detectedCategories: Category[] = []

  for (const category of CATEGORIES) {
    const hasKeyword = category.keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))
    if (hasKeyword) {
      detectedCategories.push(category)
    }
  }

  // If no specific categories detected, suggest most common ones
  if (detectedCategories.length === 0) {
    return [
      CATEGORIES.find((c) => c.id === "restaurants")!,
      CATEGORIES.find((c) => c.id === "cafeterias")!,
      CATEGORIES.find((c) => c.id === "bares")!,
    ]
  }

  return detectedCategories.slice(0, 4) // Max 4 suggestions
}

export function detectVibeFromText(text: string): string {
  const lowerText = text.toLowerCase()

  for (const [keyword, vibe] of Object.entries(VIBE_MAPPINGS)) {
    if (lowerText.includes(keyword)) {
      return vibe
    }
  }

  return "chill" // Default vibe
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id)
}

export function buildSearchQuery(category: Category, vibe: string, customText: string): string {
  const vibeModifiers: Record<string, string> = {
    sad: "cozy, intimate, quiet atmosphere with soft music",
    chill: "relaxed, laid-back, good vibes, comfortable",
    perrea: "lively, party atmosphere, music, dancing, energetic",
    romantico: "romantic, intimate, date night, couples",
    productivo: "quiet, wifi, work-friendly, productive environment",
    familiar: "family-friendly, kids welcome, casual atmosphere",
    trendy: "modern, hip, Instagram-worthy, contemporary",
    autentico: "authentic, traditional, local, genuine",
    aesthetic: "beautiful, photogenic, stylish, aesthetic",
    aventura: "adventure, outdoor, exciting, active",
    luxury: "upscale, premium, high-end, sophisticated",
    vintage: "retro, vintage, classic, nostalgic",
    casual: "casual, everyday, comfortable, accessible",
    alternativo: "alternative, unique, unconventional, indie",
    social: "social, meet people, lively, community",
    cultural: "cultural, artistic, educational, museums",
    fitness: "active, sports, fitness, healthy",
  }

  const vibeDescription = vibeModifiers[vibe] || "good atmosphere"
  const baseQuery = `${category.searchModifier} with ${vibeDescription}`

  return customText ? `${baseQuery} that also matches: ${customText}` : baseQuery
}
