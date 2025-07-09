import { Card, CardContent } from "@/components/ui/card"

export default function SkeletonCard() {
  return (
    <Card className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-md">
      <CardContent className="p-6">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>

          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
            <div className="h-8 bg-gray-200 rounded-xl w-20"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
