"use client"
import { MapPin, Clock, Star } from "lucide-react"

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
  imageUrl?: string
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
  imageUrl,
}: CardProps) {
  const handleClick = () => {
    window.open(googleMapsUrl, "_blank")
  }

  const getVibeBadge = (vibe: string) => {
    const badges: Record<string, string> = {
      sad: "Tranquilo y acogedor",
      chill: "Relajado",
      perrea: "Ambiente de fiesta",
      romantico: "Romántico",
      productivo: "Ideal para trabajar",
      familiar: "Apto familias",
      trendy: "Moderno y cool",
      autentico: "Auténtico local",
      aesthetic: "Instagrameable",
      aventura: "Aventurero",
      luxury: "Premium",
      vintage: "Estilo vintage",
      social: "Para socializar",
    }
    return badges[vibe] || "Recomendado"
  }

  const formatPrice = (priceRange: string) => {
    const priceMap: Record<string, string> = {
      $: "$150-300",
      $$: "$300-600",
      $$$: "$600-1000",
      $$$$: "$1000+",
      Gratis: "Gratis",
      Varía: "Precio varía",
    }
    return priceMap[priceRange] || priceRange
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - fullStars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-400" />)
    }

    return stars
  }

  const getPlaceholderImage = (type: string, vibe: string) => {
    // Generate a placeholder based on type and vibe
    const images: Record<string, string> = {
      restaurant: "🍽️",
      cafe: "☕",
      bar: "🍺",
      hotel: "🏨",
      shop: "🛍️",
      recreation: "🎮",
    }
    return images[type] || "📍"
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex-shrink-0 w-80"
    >
      {/* Image Section - Larger like Perplexity */}
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100">
        {imageUrl ? (
          <img src={imageUrl || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="text-6xl mb-3">{getPlaceholderImage(type, vibe)}</div>
              <div className="text-gray-500 text-sm font-medium">{type}</div>
            </div>
          </div>
        )}

        {/* Vibe Badge - Top left like Perplexity */}
        <div className="absolute top-4 left-4">
          <span className="bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
            {getVibeBadge(vibe)}
          </span>
        </div>

        {/* Rating Badge - Top right */}
        {rating > 0 && (
          <div className="absolute top-4 right-4 bg-white/95 px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
            <div className="flex items-center">{renderStars(rating)}</div>
            <span className="text-xs font-semibold text-gray-800 ml-1">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-3 leading-tight">{name}</h3>

        {/* Price - Large like Perplexity */}
        <div className="text-2xl font-bold text-gray-900 mb-2">{formatPrice(priceRange)}</div>

        {/* Source */}
        <div className="text-gray-500 text-sm mb-4">Google Maps</div>

        {/* Quick Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{address}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{hours}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
