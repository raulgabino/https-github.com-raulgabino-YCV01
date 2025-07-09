"use client"

import type React from "react"
import { useState, useEffect } from "react"
import useSWRMutation from "swr/mutation"
import { toast } from "sonner"
import { Paperclip, ArrowLeft } from "lucide-react"
import CardList from "@/components/CardList"
import SkeletonCard from "@/components/SkeletonCard"
import { fetcher } from "@/lib/fetcher"
import { toBase64 } from "@/lib/utils"
import { Toaster } from "sonner"
import { CATEGORIES, type Category, type Vibe } from "@/lib/categories"

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
  perrea: "from-pink-600 via-orange-500 to-yellow-400",
  romantico: "from-pink-600 via-red-500 to-rose-400",
  familiar: "from-green-600 via-emerald-500 to-teal-400",
  trendy: "from-purple-600 via-pink-500 to-indigo-400",
  autentico: "from-amber-600 via-orange-500 to-yellow-400",
  productivo: "from-gray-700 via-gray-500 to-gray-300",
  chill: "from-emerald-600 via-teal-400 to-emerald-200",
  aesthetic: "from-pink-600 via-purple-500 to-indigo-400",
  estudioso: "from-blue-700 via-sky-500 to-blue-300",
  social: "from-orange-600 via-pink-500 to-purple-400",
  luxury: "from-yellow-600 via-amber-500 to-orange-400",
  business: "from-slate-700 via-gray-600 to-slate-500",
  boutique: "from-purple-600 via-pink-500 to-rose-400",
  aventura: "from-green-700 via-emerald-600 to-teal-500",
  fitness: "from-red-600 via-orange-500 to-yellow-400",
  cultural: "from-indigo-700 via-purple-600 to-pink-500",
  vintage: "from-amber-700 via-orange-600 to-yellow-500",
  casual: "from-blue-600 via-teal-500 to-green-400",
  alternativo: "from-purple-700 via-pink-600 to-red-500",
}

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<"category" | "vibe" | "input" | "results">("category")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null)
  const [text, setText] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<RecsResponse | null>(null)
  const [currentVibeId, setCurrentVibeId] = useState<string | null>(null)

  const { trigger: triggerVibe } = useSWRMutation("/api/vibe", fetcher)
  const { trigger: triggerRecs } = useSWRMutation("/api/recs", fetcher)

  useEffect(() => {
    if (currentVibeId) {
      const gradient = VIBE_GRADIENTS[currentVibeId as keyof typeof VIBE_GRADIENTS]
      if (gradient) {
        document.body.className = `bg-gradient-to-br ${gradient}`
      }
    } else {
      document.body.className = "bg-gradient-to-b from-[#111] to-[#1e1e1e]"
    }
  }, [currentVibeId])

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    setCurrentStep("vibe")
  }

  const handleVibeSelect = (vibe: Vibe) => {
    setSelectedVibe(vibe)
    setCurrentStep("input")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory || !selectedVibe) return

    setIsLoading(true)
    setRecommendations(null)
    setCurrentStep("results")

    try {
      let vibeResult: VibeResponse = { vibe: selectedVibe.id, confidence: 1.0 }

      // If user added custom text or image, classify it
      if (text.trim() || imageFile) {
        const vibePayload: { text?: string; image_url?: string } = {}

        if (imageFile) {
          const base64 = await toBase64(imageFile)
          vibePayload.image_url = base64
        } else if (text.trim()) {
          vibePayload.text = text.trim()
        }

        try {
          const vibeResponse = await triggerVibe(vibePayload)
          if (vibeResponse.vibe && vibeResponse.confidence > 0.6) {
            vibeResult = vibeResponse
          }
        } catch (error) {
          console.log("Using selected vibe as fallback")
        }
      }

      setCurrentVibeId(vibeResult.vibe)

      const recsResponse = await triggerRecs({
        category: selectedCategory.id,
        vibe: vibeResult.vibe,
        city: "Ciudad Victoria",
        customInput: text.trim(),
      })

      setRecommendations(recsResponse)

      if (recsResponse.recommendations.length === 0) {
        toast.error("No encontré lugares. Prueba otra combinación.")
      }
    } catch (error: any) {
      toast.error(error.message || "Algo salió mal")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep === "vibe") {
      setCurrentStep("category")
      setSelectedCategory(null)
    } else if (currentStep === "input") {
      setCurrentStep("vibe")
      setSelectedVibe(null)
      setText("")
      setImageFile(null)
    } else if (currentStep === "results") {
      setCurrentStep("input")
      setRecommendations(null)
      setCurrentVibeId(null)
    }
  }

  const handleReset = () => {
    setCurrentStep("category")
    setSelectedCategory(null)
    setSelectedVibe(null)
    setText("")
    setImageFile(null)
    setRecommendations(null)
    setCurrentVibeId(null)
  }

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-rubik font-bold mb-2">Your City Vibe</h1>
          <p className="text-white/80 font-inter">Descubre lugares perfectos para tu mood</p>
        </div>

        {/* Back Button */}
        {currentStep !== "category" && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-6 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-inter">Atrás</span>
          </button>
        )}

        {/* Category Selection */}
        {currentStep === "category" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6 font-inter">¿Qué estás buscando?</h2>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className="bg-white/10 border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                >
                  <div className="text-3xl mb-2">{category.emoji}</div>
                  <div className="font-inter font-medium">{category.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vibe Selection */}
        {currentStep === "vibe" && selectedCategory && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6 font-inter">
              ¿Qué tipo de {selectedCategory.name.toLowerCase()}?
            </h2>
            <div className="space-y-3">
              {selectedCategory.vibes.map((vibe) => (
                <button
                  key={vibe.id}
                  onClick={() => handleVibeSelect(vibe)}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 text-left"
                >
                  <div className="font-inter font-medium mb-1">{vibe.name}</div>
                  <div className="text-white/70 text-sm font-inter">{vibe.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        {currentStep === "input" && selectedVibe && (
          <form onSubmit={handleDiscover} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2 font-inter">
                {selectedVibe.name} • {selectedCategory?.name}
              </h2>
              <p className="text-white/70 font-inter">Cuéntanos más sobre tu vibe (opcional)</p>
            </div>

            <div>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe tu mood perfecto..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 font-inter"
              />
            </div>

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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-yellow-500 text-black font-semibold rounded-full px-6 py-3 hover:brightness-110 active:scale-95 transition disabled:opacity-50 font-inter"
              >
                {isLoading ? "Descubriendo..." : "Descubrir"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors font-inter font-medium"
              >
                Reset
              </button>
            </div>
          </form>
        )}

        {/* Loading State */}
        {currentStep === "results" && isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Results */}
        {currentStep === "results" && recommendations && !isLoading && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2 font-inter">
                {selectedVibe?.name} • {selectedCategory?.name}
              </h2>
              <p className="text-white/70 font-inter">{recommendations.recommendations.length} lugares encontrados</p>
            </div>
            <div className="overflow-y-auto h-[calc(100dvh-200px)] space-y-4">
              <CardList recs={recommendations.recommendations} vibe={currentVibeId || "chill"} />
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors font-inter font-medium"
            >
              Nueva búsqueda
            </button>
          </div>
        )}
      </div>

      <Toaster position="top-center" />
    </div>
  )
}
