"use client"

import type React from "react"
import { ExternalLink, MapPin, Clock, Star, Phone, Globe } from "lucide-react"

interface CardProps {
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
  vibe: string
}

export default function Card({
  name,
  address,
  rating,
  description,
  type,
  priceRange,
  hours,
  phoneNumber,
  website,
  googleMapsUrl,
  vibe,
}: CardProps) {
  const handleClick = () => {
    window.open(googleMapsUrl, "_blank")
  }

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (website) {
      window.open(website, "_blank")
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-400" />)
    }

    return stars
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30 hover:scale-[1.02] active:scale-95"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white text-lg mb-1 font-inter">{name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/70 text-sm font-inter capitalize">{type}</span>
            <span className="text-white/50">•</span>
            <span className="text-white/70 text-sm font-inter">{priceRange}</span>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">{renderStars(rating)}</div>
              <span className="text-white/70 text-sm font-inter">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <ExternalLink className="w-5 h-5 text-white/60 flex-shrink-0" />
      </div>

      <p className="text-white/80 text-sm mb-3 font-inter leading-relaxed">{description}</p>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
          <span className="text-white/70 text-sm font-inter">{address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/60 flex-shrink-0" />
          <span className="text-white/70 text-sm font-inter">{hours}</span>
        </div>
        {phoneNumber && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
            <span className="text-white/70 text-sm font-inter">{phoneNumber}</span>
          </div>
        )}
        {website && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-white/60 flex-shrink-0" />
            <button
              onClick={handleWebsiteClick}
              className="text-white/70 text-sm font-inter hover:text-white transition-colors underline"
            >
              Sitio web
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
