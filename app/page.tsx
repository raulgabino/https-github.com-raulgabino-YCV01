"use client"

import type React from "react"
import { useState, useEffect } from "react"
import useSWRMutation from "swr/mutation"
import { toast } from "sonner"
import { Paperclip, Sparkles } from "lucide-react"
import CardList from "@/components/CardList"
import SkeletonCard from "@/components/SkeletonCard"
import { fetcher } from "@/lib/fetcher"
import { toBase64 } from "@/lib/utils"
import { Toaster } from "sonner"
import { detectCategoriesFromText, detectVibeFromText, buildSearchQuery, type Category } from "@/lib/categories"

interface VibeResponse {
  vibe: string
  confidence: number
}

interface RecsResponse {
  recommendations: Array<{
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
  }>
  vibe: string
  city: string
  source: string
}

const VIBE_GRADIENTS = {
  sad: "from-blue-700 via-sky-500 to-blue-300",
  chill: "from-emerald-600 via-teal-400 to-emerald-200",
  perrea: "from-pink-600 via-orange-500 to-yellow-400",
  romantico: "from-pink-600 via-red-500 to-rose-400",
  productivo: "from-gray-700 via-gray-500 to-gray-300",
  familiar: "from-green-600 via-emerald-500 to-teal-400",
  trendy: "from-purple-600 via-pink-500 to-indigo-400",
  autentico: "from-amber-600 via-orange-500 to-yellow-400",
  aesthetic: "from-pink-600 via-purple-500 to-indigo-400",
  aventura: "from-green-700 via-emerald-600 to-teal-500",
  luxury: "from-yellow-600 via-amber-500 to-orange-400",
  vintage: "from-amber-700 via-orange-600 to-yellow-500",
  casual: "from-blue-600 via-teal-500 to-green-400",
  alternativo: "from-purple-700 via-pink-600 to-red-500",
  social: "from-orange-600 via-pink-500 to-purple-400",
  cultural: "from-indigo-700 via-purple-600 to-pink-500",
}

export default function HomePage() {
  const [text, setText] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [suggestedCategories, setSuggestedCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<RecsResponse | null>(null)
  const [currentVibe, setCurrentVibe] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { trigger: triggerVibe } = useSWRMutation("/api/vibe", fetcher)
  const { trigger: triggerRecs } = useSWRMutation("/api/recs", fetcher)

  useEffect(() => {
    if (currentVibe) {
      const gradient = VIBE_GRADIENTS[currentVibe as keyof typeof VIBE_GRADIENTS]
      if (gradient) {
        document.body.className = `bg-gradient-to-br ${gradient}`
      }
    } else {
      document.body.className = "bg-gradient-to-b from-[#111] to-[#1e1e1e]"
    }
  }, [currentVibe])

  // Update suggestions when text changes
  useEffect(() => {
    if (text.trim().length > 2) {
      const categories = detectCategoriesFromText(text)
      setSuggestedCategories(categories)
      setShowSuggestions(true)
    } else {
      setSuggestedCategories([])
      setShowSuggestions(false)
    }
  }, [text])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  const handleCategorySelect = async (category: Category) => {
    setSelectedCategory(category)
    setShowSuggestions(false)
    setIsLoading(true)
    setRecommendations(null)

    try {
      // Detect vibe from text
      const detectedVibe = detectVibeFromText(text)
      setCurrentVibe(detectedVibe)

      // If we have image or detailed text, enhance with AI
      let finalVibe = detectedVibe
      if (imageFile || text.trim().length > 10) {
        try {
          const vibePayload: { text?: string; image_url?: string } = {}

          if (imageFile) {
            const base64 = await toBase64(imageFile)
            vibePayload.image_url = base64
          } else if (text.trim()) {
            vibePayload.text = text.trim()
          }

          const vibeResponse = await triggerVibe(vibePayload)
          if (vibeResponse.vibe && vibeResponse.confidence > 0.5) {
            finalVibe = vibeResponse.vibe
            setCurrentVibe(finalVibe)
          }
        } catch (error) {
          console.log("Using detected vibe as fallback")
        }
      }

      // Build search query
      const searchQuery = buildSearchQuery(category, finalVibe, text)

      // Get recommendations
      const recsResponse = await triggerRecs({
        category: category.id,
        vibe: finalVibe,
        city: "Ciudad Victoria",
        searchQuery: searchQuery,
        customInput: text.trim(),
      })

      setRecommendations(recsResponse)

      if (recsResponse.recommendations.length === 0) {
        toast.error("No encontré lugares. Prueba describir tu mood diferente.")
      }
    } catch (error: any) {
      toast.error(error.message || "Algo salió mal")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setText("")
    setImageFile(null)
    setSuggestedCategories([])
    setSelectedCategory(null)
    setRecommendations(null)
    setCurrentVibe(null)
    setShowSuggestions(false)
  }

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-rubik font-bold mb-2">Your City Vibe</h1>
          <p className="text-white/80 font-inter">Descubre lugares perfectos para tu mood</p>
        </div>

        {/* Input Form */}
        <div className="space-y-6 mb-8">
          {/* Main Input */}
          <div className="relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cuéntame tu vibe... 'me siento triste y quiero café' o 'quiero bailar reggaeton'"
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 font-inter text-base"
            />
            {text && <Sparkles className="absolute right-4 top-4 w-5 h-5 text-white/40" />}
          </div>

          {/* Image Upload */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => document.getElementById("image-upload")?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white/80 hover:bg-white/20 transition-colors font-inter"
            >
              <Paperclip className="w-4 h-4" />
              Subir imagen
            </button>
            <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {imageFile && <span className="text-sm text-white/60 font-inter">{imageFile.name}</span>}
          </div>

          {/* Smart Category Suggestions */}
          {showSuggestions && suggestedCategories.length > 0 && (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
              <p className="text-sm text-white/80 mb-3 font-inter">¿Qué tipo de lugar buscas?</p>
              <div className="flex flex-wrap gap-2">
                {suggestedCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white/80 hover:bg-white/20 transition-all duration-200 hover:scale-105 active:scale-95 font-inter"
                  >
                    <span className="text-base">{category.emoji}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reset Button */}
          {(recommendations || text || imageFile) && (
            <button
              onClick={handleReset}
              className="w-full py-3 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors font-inter font-medium"
            >
              Nueva búsqueda
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                <span className="text-white/80 font-inter">Encontrando tu vibe...</span>
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Results */}
        {recommendations && !isLoading && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-2">
                <span className="text-base">{selectedCategory?.emoji}</span>
                <span className="text-white/80 font-inter">
                  {selectedCategory?.name} • {recommendations.recommendations.length} lugares
                </span>
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(100dvh-180px)] space-y-4">
              <CardList recs={recommendations.recommendations} vibe={currentVibe || "chill"} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showSuggestions && !isLoading && !recommendations && text.length > 0 && (
          <div className="text-center text-white/60 py-8">
            <p className="font-inter">Sigue escribiendo para que aparezcan sugerencias...</p>
          </div>
        )}
      </div>

      {/* Toaster */}
      <Toaster position="top-center" />
    </div>
  )
}
