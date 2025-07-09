export interface Category {
  id: string
  name: string
  icon: string
  emoji: string
  vibes: Vibe[]
  searchModifiers: Record<string, string>
}

export interface Vibe {
  id: string
  name: string
  description: string
  searchQuery: string
}

export const CATEGORIES: Category[] = [
  {
    id: "restaurants",
    name: "Restaurantes",
    icon: "🍽️",
    emoji: "🍽️",
    vibes: [
      {
        id: "perrea",
        name: "Perrea",
        description: "Ambiente de fiesta",
        searchQuery: "restaurants with party atmosphere, loud music, dancing",
      },
      {
        id: "romantico",
        name: "Romántico",
        description: "Cena íntima",
        searchQuery: "romantic restaurants, intimate dining, date night",
      },
      {
        id: "familiar",
        name: "Familiar",
        description: "Para toda la familia",
        searchQuery: "family restaurants, kid-friendly dining",
      },
      {
        id: "trendy",
        name: "Trendy",
        description: "Moderno y cool",
        searchQuery: "trendy restaurants, modern dining, hip atmosphere",
      },
      {
        id: "autentico",
        name: "Auténtico",
        description: "Comida tradicional",
        searchQuery: "authentic local restaurants, traditional food",
      },
    ],
    searchModifiers: {
      perrea: "restaurants with party atmosphere, loud music, dancing, nightlife dining",
      romantico: "romantic restaurants, intimate dining, candlelit dinner, date night spots",
      familiar: "family-friendly restaurants, kid-friendly dining, casual atmosphere",
      trendy: "trendy restaurants, modern dining, hip atmosphere, Instagram-worthy",
      autentico: "authentic local restaurants, traditional cuisine, local flavors",
    },
  },
  {
    id: "cafeterias",
    name: "Cafeterías",
    icon: "☕",
    emoji: "☕",
    vibes: [
      {
        id: "productivo",
        name: "Productivo",
        description: "Para trabajar",
        searchQuery: "coffee shops with wifi, coworking spaces, quiet for work",
      },
      {
        id: "chill",
        name: "Chill",
        description: "Relajado",
        searchQuery: "chill coffee shops, relaxed atmosphere, cozy cafés",
      },
      {
        id: "aesthetic",
        name: "Aesthetic",
        description: "Bonito para fotos",
        searchQuery: "aesthetic cafés, Instagram-worthy, beautiful interior",
      },
      {
        id: "estudioso",
        name: "Estudioso",
        description: "Para estudiar",
        searchQuery: "study-friendly cafés, quiet atmosphere, good for reading",
      },
      {
        id: "social",
        name: "Social",
        description: "Para socializar",
        searchQuery: "social coffee shops, meet friends, lively atmosphere",
      },
    ],
    searchModifiers: {
      productivo: "coffee shops with wifi, coworking spaces, quiet for work, power outlets",
      chill: "chill coffee shops, relaxed atmosphere, cozy cafés, comfortable seating",
      aesthetic: "aesthetic cafés, Instagram-worthy, beautiful interior, photo-friendly",
      estudioso: "study-friendly cafés, quiet atmosphere, good for reading, library-like",
      social: "social coffee shops, meet friends, lively atmosphere, community space",
    },
  },
  {
    id: "hoteles",
    name: "Hoteles",
    icon: "🏨",
    emoji: "🏨",
    vibes: [
      {
        id: "luxury",
        name: "Luxury",
        description: "Experiencia premium",
        searchQuery: "luxury hotels, 5-star accommodation, premium service",
      },
      {
        id: "business",
        name: "Business",
        description: "Para negocios",
        searchQuery: "business hotels, conference facilities, corporate stays",
      },
      {
        id: "romantico",
        name: "Romántico",
        description: "Escapada romántica",
        searchQuery: "romantic hotels, couples retreat, honeymoon suites",
      },
      {
        id: "familiar",
        name: "Familiar",
        description: "Para familias",
        searchQuery: "family hotels, kid-friendly accommodation, family suites",
      },
      {
        id: "boutique",
        name: "Boutique",
        description: "Único y especial",
        searchQuery: "boutique hotels, unique accommodation, design hotels",
      },
    ],
    searchModifiers: {
      luxury: "luxury hotels, 5-star accommodation, premium service, high-end amenities",
      business: "business hotels, conference facilities, corporate stays, work-friendly",
      romantico: "romantic hotels, couples retreat, honeymoon suites, intimate atmosphere",
      familiar: "family hotels, kid-friendly accommodation, family suites, children amenities",
      boutique: "boutique hotels, unique accommodation, design hotels, artistic atmosphere",
    },
  },
  {
    id: "recreacion",
    name: "Recreación",
    icon: "🎮",
    emoji: "🎮",
    vibes: [
      {
        id: "aventura",
        name: "Aventura",
        description: "Actividades extremas",
        searchQuery: "adventure activities, extreme sports, outdoor adventures",
      },
      {
        id: "chill",
        name: "Chill",
        description: "Relajante",
        searchQuery: "relaxing activities, chill entertainment, peaceful recreation",
      },
      {
        id: "familiar",
        name: "Familiar",
        description: "Diversión familiar",
        searchQuery: "family activities, kid-friendly entertainment, family fun",
      },
      {
        id: "fitness",
        name: "Fitness",
        description: "Actividad física",
        searchQuery: "fitness activities, sports facilities, active recreation",
      },
      {
        id: "cultural",
        name: "Cultural",
        description: "Arte y cultura",
        searchQuery: "cultural activities, museums, art galleries, cultural sites",
      },
    ],
    searchModifiers: {
      aventura: "adventure activities, extreme sports, outdoor adventures, adrenaline activities",
      chill: "relaxing activities, chill entertainment, peaceful recreation, leisure activities",
      familiar: "family activities, kid-friendly entertainment, family fun, all-ages recreation",
      fitness: "fitness activities, sports facilities, active recreation, gym and sports",
      cultural: "cultural activities, museums, art galleries, cultural sites, educational fun",
    },
  },
  {
    id: "moda",
    name: "Moda",
    icon: "👕",
    emoji: "👕",
    vibes: [
      {
        id: "trendy",
        name: "Trendy",
        description: "Última moda",
        searchQuery: "trendy fashion stores, latest fashion, modern clothing",
      },
      {
        id: "vintage",
        name: "Vintage",
        description: "Estilo retro",
        searchQuery: "vintage clothing stores, retro fashion, second-hand clothes",
      },
      {
        id: "luxury",
        name: "Luxury",
        description: "Marcas premium",
        searchQuery: "luxury fashion stores, designer brands, high-end clothing",
      },
      {
        id: "casual",
        name: "Casual",
        description: "Ropa cotidiana",
        searchQuery: "casual clothing stores, everyday fashion, comfortable clothes",
      },
      {
        id: "alternativo",
        name: "Alternativo",
        description: "Estilo único",
        searchQuery: "alternative fashion stores, unique style, indie clothing",
      },
    ],
    searchModifiers: {
      trendy: "trendy fashion stores, latest fashion, modern clothing, contemporary style",
      vintage: "vintage clothing stores, retro fashion, second-hand clothes, thrift shops",
      luxury: "luxury fashion stores, designer brands, high-end clothing, premium fashion",
      casual: "casual clothing stores, everyday fashion, comfortable clothes, basic wear",
      alternativo: "alternative fashion stores, unique style, indie clothing, unconventional fashion",
    },
  },
]

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id)
}

export function getVibesByCategory(categoryId: string): Vibe[] {
  const category = getCategoryById(categoryId)
  return category?.vibes || []
}

export function getSearchModifier(categoryId: string, vibeId: string): string {
  const category = getCategoryById(categoryId)
  return category?.searchModifiers[vibeId] || ""
}
