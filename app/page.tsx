"use client"

import type React from "react"

import { useState, useEffect } from "react"
import useSWRMutation from "swr/mutation"
import { toast } from "sonner"
import { Paperclip } from "lucide-react"
import CardList from "@/components/CardList"
import SkeletonCard from "@/components/SkeletonCard"
import { fetcher } from "@/lib/fetcher"
import { toBase64 } from "@/lib/utils"
import { Toaster } from "sonner"

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
  corridos: "from-purple-700 via-amber-400 to-yellow-300",
  perrea: "from-pink-600 via-orange-500 to-yellow-400",
  sad: "from-blue-700 via-sky-500 to-blue-300",
  chill: "from-emerald-600 via-teal-400 to-emerald-200",
  traka: "from-yellow-400 via-orange-300 to-pink-300",
  productivo: "from-gray-700 via-gray-500 to-gray-300",
  eco: "from-emerald-600 via-teal-400 to-emerald-200",
  "k-cute": "from-pink-600 via-orange-500 to-yellow-400",
}

const LOTTIE_VIBES = [
  { vibe: "perrea", label: "Perreo", url: "https://lottie.host/fire.json" },
  { vibe: "productivo", label: "Productivo", url: "https://lottie.host/book.json" },
  { vibe: "sad", label: "Sad", url: "https://lottie.host/sad.json" },
  { vibe: "chill", label: "Chill", url: "https://lottie.host/leaf.json" },
  { vibe: "traka", label: "Traka", url: "https://lottie.host/party.json" },
]

export default function HomePage() {
  const [text, setText] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [selectedVibe, setSelectedVibe] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<RecsResponse | null>(null)
  const [currentVibe, setCurrentVibe] = useState<string | null>(null)

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setRecommendations(null)

    try {
      let vibeResult: VibeResponse

      if (selectedVibe) {
        vibeResult = { vibe: selectedVibe, confidence: 1.0 }
      } else {
        const vibePayload: { text?: string; image_url?: string } = {}

        if (imageFile) {
          const base64 = await toBase64(imageFile)
          vibePayload.image_url = base64
        } else if (text.trim()) {
          vibePayload.text = text.trim()
        } else {
          toast.error("Cuéntame tu vibra o sube una imagen")
          setIsLoading(false)
          return
        }

        const vibeResponse = await triggerVibe(vibePayload)

        if (vibeResponse.ask) {
          toast.error(vibeResponse.ask)
          setIsLoading(false)
          return
        }

        vibeResult = vibeResponse
      }

      setCurrentVibe(vibeResult.vibe)

      const recsResponse = await triggerRecs({
        vibe: vibeResult.vibe,
        city: "Ciudad Victoria",
      })

      setRecommendations(recsResponse)

      if (recsResponse.recommendations.length === 0) {
        toast.error("No encontré lugares. Prueba otra vibra.")
      }
    } catch (error: any) {
      toast.error(error.message || "Algo salió mal")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChipToggle = (vibe: string) => {
    setSelectedVibe(selectedVibe === vibe ? "" : vibe)
    setText("")
    setImageFile(null)
  }

  const handleReset = () => {
    setText("")
    setImageFile(null)
    setSelectedVibe("")
    setRecommendations(null)
    setCurrentVibe(null)
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
        <form onSubmit={handleDiscover} className="space-y-6 mb-8">
          {/* Input */}
          <div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cuéntame tu vibra…"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 font-inter"
              disabled={!!selectedVibe}
            />
          </div>

          {/* Image Upload */}
          {!selectedVibe && (
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
          )}

          {/* Lottie Chips */}
          <div>
            <p className="text-sm text-white/80 mb-3 font-inter">O elige tu vibe:</p>
            <div className="flex flex-wrap gap-2">
              {LOTTIE_VIBES.map(({ vibe, label, url }) => (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => handleChipToggle(vibe)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all font-inter font-medium ${
                    selectedVibe === vibe
                      ? "bg-white/30 text-white scale-105"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  <lottie-player
                    src={url}
                    background="transparent"
                    speed="1"
                    style={{ width: "20px", height: "20px" }}
                    loop
                    autoplay
                  />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || (!selectedVibe && !text.trim() && !imageFile)}
              className="flex-1 bg-yellow-500 text-black font-semibold rounded-full px-6 py-3 hover:brightness-110 active:scale-95 transition disabled:opacity-50 font-inter"
            >
              {isLoading ? "Descubriendo..." : "Descubrir"}
            </button>
            {(recommendations || selectedVibe || text || imageFile) && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors font-inter font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Results */}
        {recommendations && !isLoading && (
          <div className="overflow-y-auto h-[calc(100dvh-260px)] snap-y">
            <CardList recs={recommendations.recommendations} vibe={currentVibe || "chill"} />
          </div>
        )}
      </div>

      {/* Toaster for notifications */}
      <Toaster position="top-center" />

      {/* Lottie Player Script */}
      <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" />
    </div>
  )
}
