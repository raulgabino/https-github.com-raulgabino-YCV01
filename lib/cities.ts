export interface City {
  id: string
  name: string
  emoji: string
  country: string
  keywords: string[]
  popular: boolean
}

export const CITIES: City[] = [
  // México - Ciudades principales
  {
    id: "cdmx",
    name: "Ciudad de México",
    emoji: "🏛️",
    country: "México",
    keywords: ["cdmx", "df", "mexico city", "capital", "ciudad de mexico"],
    popular: true,
  },
  {
    id: "guadalajara",
    name: "Guadalajara",
    emoji: "🌮",
    country: "México",
    keywords: ["guadalajara", "gdl", "jalisco", "tapatío"],
    popular: true,
  },
  {
    id: "monterrey",
    name: "Monterrey",
    emoji: "🏔️",
    country: "México",
    keywords: ["monterrey", "mty", "nuevo leon", "regio"],
    popular: true,
  },
  {
    id: "puebla",
    name: "Puebla",
    emoji: "⛪",
    country: "México",
    keywords: ["puebla", "angelópolis", "poblano"],
    popular: true,
  },
  {
    id: "tijuana",
    name: "Tijuana",
    emoji: "🌊",
    country: "México",
    keywords: ["tijuana", "tj", "baja california", "frontera"],
    popular: true,
  },
  {
    id: "cancun",
    name: "Cancún",
    emoji: "🏖️",
    country: "México",
    keywords: ["cancun", "quintana roo", "playa", "caribe"],
    popular: true,
  },
  {
    id: "merida",
    name: "Mérida",
    emoji: "🦩",
    country: "México",
    keywords: ["merida", "yucatan", "maya"],
    popular: true,
  },
  {
    id: "queretaro",
    name: "Querétaro",
    emoji: "🏰",
    country: "México",
    keywords: ["queretaro", "qro", "bajío"],
    popular: false,
  },
  {
    id: "leon",
    name: "León",
    emoji: "👞",
    country: "México",
    keywords: ["leon", "guanajuato", "piel", "zapatos"],
    popular: false,
  },
  {
    id: "playa-del-carmen",
    name: "Playa del Carmen",
    emoji: "🐠",
    country: "México",
    keywords: ["playa del carmen", "riviera maya", "quintana roo"],
    popular: false,
  },
  {
    id: "oaxaca",
    name: "Oaxaca",
    emoji: "🎨",
    country: "México",
    keywords: ["oaxaca", "mezcal", "artesanías"],
    popular: false,
  },
  {
    id: "san-luis-potosi",
    name: "San Luis Potosí",
    emoji: "⛰️",
    country: "México",
    keywords: ["san luis potosi", "slp", "potosino"],
    popular: false,
  },
  {
    id: "ciudad-victoria",
    name: "Ciudad Victoria",
    emoji: "🌵",
    country: "México",
    keywords: ["ciudad victoria", "tamaulipas", "victoria"],
    popular: false,
  },
]

export function detectCityFromText(text: string): City | null {
  const lowerText = text.toLowerCase()

  for (const city of CITIES) {
    const hasKeyword = city.keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))
    if (hasKeyword) {
      return city
    }
  }

  return null
}

export function getCityById(id: string): City | undefined {
  return CITIES.find((city) => city.id === id)
}

export function getPopularCities(): City[] {
  return CITIES.filter((city) => city.popular)
}

export function getAllCities(): City[] {
  return CITIES
}
