"use client"
import { useEffect, useState } from "react"
import Card from "./Card"

interface CardListProps {
  recs: Array<{
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
  searchTime?: number
  category?: string
}

export default function CardList({ recs, vibe, searchTime = 0, category = "lugares" }: CardListProps) {
  const [displayTime, setDisplayTime] = useState(0)

  useEffect(() => {
    // Animate search time like Perplexity
    const targetTime = Math.max(searchTime, 5) // Minimum 5 seconds for effect
    const increment = targetTime / 30 // 30 steps animation
    const timer = setInterval(() => {
      setDisplayTime((prev) => {
        const next = prev + increment
        if (next >= targetTime) {
          clearInterval(timer)
          return targetTime
        }
        return next
      })
    }, 50)

    return () => clearInterval(timer)
  }, [searchTime])

  const getCategoryText = (category: string) => {
    const categoryTexts: Record<string, string> = {
      restaurants: "restaurantes",
      cafeterias: "cafeterías",
      hoteles: "hoteles",
      recreacion: "lugares de entretenimiento",
      moda: "tiendas de moda",
      bares: "bares",
    }
    return categoryTexts[category] || "lugares"
  }

  const getVibeDescription = (vibe: string) => {
    const vibeDescriptions: Record<string, string> = {
      sad: "ambientes tranquilos y acogedores",
      chill: "espacios relajados",
      perrea: "lugares con ambiente de fiesta",
      romantico: "sitios románticos",
      productivo: "espacios ideales para trabajar",
      familiar: "lugares familiares",
      trendy: "sitios modernos y cool",
      autentico: "lugares auténticos",
      aesthetic: "espacios instagrameables",
      aventura: "lugares aventureros",
      luxury: "establecimientos premium",
      vintage: "lugares con estilo vintage",
      social: "espacios para socializar",
    }
    return vibeDescriptions[vibe] || "lugares recomendados"
  }

  return (
    <div className="space-y-6">
      {/* Header like Perplexity */}
      <div className="flex items-center gap-2 text-white/90 text-base">
        <span>Pensado durante {Math.round(displayTime)} segundos</span>
        <span className="text-white/60">›</span>
      </div>

      {/* Horizontal scroll container */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-5 w-max pr-4">
          {recs.map((rec, index) => (
            <Card
              key={index}
              name={rec.name}
              address={rec.address}
              rating={rec.rating}
              description={rec.description}
              type={rec.type}
              priceRange={rec.priceRange}
              hours={rec.hours}
              phoneNumber={rec.phoneNumber}
              website={rec.website}
              googleMapsUrl={rec.googleMapsUrl}
              vibe={vibe}
              imageUrl={`https://source.unsplash.com/600x400/?${rec.type},restaurant,cafe,bar`}
            />
          ))}
        </div>
      </div>

      {/* Bottom explanation like Perplexity */}
      <div className="text-white/80 text-sm leading-relaxed">
        <p>
          <span className="font-medium">YourCityVibe</span> te dejé arriba {recs.length}{" "}
          {getCategoryText(category || "lugares")} que combinan con tu {getVibeDescription(vibe)}:
        </p>
      </div>
    </div>
  )
}
