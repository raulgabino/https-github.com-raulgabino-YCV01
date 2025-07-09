import Card from "./Card"

interface Recommendation {
  name: string
  desc: string
  url: string
}

interface CardListProps {
  recs: Recommendation[]
  vibe?: string
}

export default function CardList({ recs, vibe = "chill" }: CardListProps) {
  if (recs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No encontré lugares. Prueba otra vibra.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 masonry-grid">
      {recs.map((rec, index) => (
        <Card key={index} name={rec.name} desc={rec.desc} url={rec.url} vibe={vibe} />
      ))}
    </div>
  )
}
