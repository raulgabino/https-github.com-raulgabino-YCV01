"use client"

import type React from "react"

import { useState } from "react"
import useSWRMutation from "swr/mutation"
import { toast } from "sonner"
import { Paperclip } from "lucide-react"
import CardList from "@/components/CardList"
import { fetcher } from "@/lib/fetcher"

interface VibeResponse {
  vibe: string
  confidence: number
}

interface RecsResponse {
  recommendations: Array<{
    name: string
    desc: string
    url: string
  }>
  vibe: string
  city: string
}

const EMOJI_VIBES = [
  { emoji: "🔥", vibe: "perrea" },
  { emoji: "📚", vibe: "productivo" },
  { emoji: "😔", vibe: "sad" },
  { emoji: "🌿", vibe: "chill" },
  { emoji: "🎉", vibe: "traka" },
]

export default function HomePage() {
  const [text, setText] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [selectedVibe, setSelectedVibe] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<RecsResponse | null>(null)

  const { trigger: triggerVibe } = useSWRMutation("/api/vibe", fetcher)
  const { trigger: triggerRecs } = useSWRMutation("/api/recs", fetcher)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  const uploadImageToBlob = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
          const uploadedUrl = await uploadImageToBlob(imageFile)
          vibePayload.image_url = uploadedUrl
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

  const handleEmojiSelect = (vibe: string) => {
    setSelectedVibe(selectedVibe === vibe ? "" : vibe)
    setText("")
    setImageFile(null)
  }

  const handleReset = () => {
    setText("")
    setImageFile(null)
    setSelectedVibe("")
    setRecommendations(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111] to-[#1e1e1e] text-white font-inter">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your City Vibe</h1>
          <p className="text-gray-400">Descubre lugares perfectos para tu mood</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          {/* Textarea */}
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cuéntame tu vibra…"
              className="w-full h-24 px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
              disabled={!!selectedVibe}
            />
          </div>

          {/* Image Upload */}
          {!selectedVibe && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => document.getElementById("image-upload")?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-gray-300 hover:bg-white/20 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
                Subir imagen
              </button>
              <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {imageFile && <span className="text-sm text-gray-400">{imageFile.name}</span>}
            </div>
          )}

          {/* Emoji Quick Select */}
          <div>
            <p className="text-sm text-gray-400 mb-3">O elige tu vibe:</p>
            <div className="flex gap-2">
              {EMOJI_VIBES.map(({ emoji, vibe }) => (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => handleEmojiSelect(vibe)}
                  className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                    selectedVibe === vibe ? "bg-white/30 scale-110" : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || (!selectedVibe && !text.trim() && !imageFile)}
              className="flex-1 py-3 bg-white text-black font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              {isLoading ? "Descubriendo..." : "Descubrir"}
            </button>
            {(recommendations || selectedVibe || text || imageFile) && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-colors"
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
              <div key={i} className="h-32 bg-white/10 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Results */}
        {recommendations && !isLoading && <CardList recs={recommendations.recommendations} />}
      </div>
    </div>
  )
}
