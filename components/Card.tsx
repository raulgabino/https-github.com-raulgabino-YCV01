"use client"

import { ExternalLink } from "lucide-react"

interface CardProps {
  name: string
  desc: string
  url: string
  vibe: string
}

const VIBE_COLORS = {
  corridos: "#C084FC",
  perrea: "#FB923C",
  sad: "#60A5FA",
  chill: "#6EE7B7",
  traka: "#FDE047",
  productivo: "#A3A3A3",
  eco: "#4ADE80",
  "k-cute": "#F472B6",
}

export default function Card({ name, desc, url, vibe }: CardProps) {
  const borderColor = VIBE_COLORS[vibe as keyof typeof VIBE_COLORS] || "#A3A3A3"

  const handleOpenMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(name)}`
    window.open(mapsUrl, "_blank")
  }

  return (
    <div
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 hover:scale-105 transition-transform duration-200"
      style={{ borderColor }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-white leading-tight flex-1 mr-2">{name}</h3>
        <span
          className="text-xs px-2 py-1 rounded-full text-black font-medium"
          style={{ backgroundColor: borderColor }}
        >
          {vibe}
        </span>
      </div>

      <p className="text-gray-300 text-sm mb-4 leading-relaxed">{desc}</p>

      <div className="flex gap-2">
        <button
          onClick={handleOpenMaps}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir en Maps
        </button>

        {url && url !== "#" && (
          <button
            onClick={() => window.open(url, "_blank")}
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white text-sm hover:bg-white/30 transition-colors"
          >
            Ver más
          </button>
        )}
      </div>
    </div>
  )
}
