"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface RecommendationCardProps {
  name: string
  desc: string
  url: string
  vibe: string
}

const VIBE_COLORS: Record<string, string> = {
  perrea: "bg-red-500",
  productivo: "bg-blue-500",
  sad: "bg-gray-500",
  corridos: "bg-yellow-500",
  chill: "bg-green-500",
  traka: "bg-orange-500",
  eco: "bg-emerald-500",
  "k-cute": "bg-pink-500",
}

export default function RecommendationCard({ name, desc, url, vibe }: RecommendationCardProps) {
  const handleOpenMaps = () => {
    // Try to open in Google Maps first, fallback to the original URL
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(name)}`
    window.open(mapsUrl, "_blank")
  }

  return (
    <Card className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight flex-1 mr-2">{name}</h3>
          <Badge
            className={`${VIBE_COLORS[vibe] || "bg-gray-500"} text-white text-xs px-2 py-1 rounded-full flex-shrink-0`}
          >
            {vibe}
          </Badge>
        </div>

        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{desc}</p>

        <div className="flex gap-2">
          <Button
            onClick={handleOpenMaps}
            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir en Maps
          </Button>

          {url && url !== "#" && (
            <Button onClick={() => window.open(url, "_blank")} variant="outline" size="sm" className="rounded-xl">
              Ver más
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
