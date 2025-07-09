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
}

export default function CardList({ recs, vibe }: CardListProps) {
  return (
    <div className="space-y-4">
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
        />
      ))}
    </div>
  )
}
