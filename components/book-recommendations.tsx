import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const books = [
  {
    id: 1,
    title: "그리스인 조르바",
    image: "/publisher-book-1.jpg",
  },
  {
    id: 2,
    title: "이토록 광장한 세계",
    image: "/publisher-book-2.jpg",
  },
  {
    id: 3,
    title: "돈의 심리학(30만 부 기념 스페셜 에디션)",
    image: "/publisher-book-3.jpg",
  },
  {
    id: 4,
    title: "마침내 특이점이 시작된다",
    image: "/publisher-book-4.jpg",
  },
  {
    id: 5,
    title: "물질의 세계",
    image: "/publisher-book-5.jpg",
  },
  {
    id: 6,
    title: "다정한 것이 살아남는다",
    image: "/publisher-book-6.jpg",
  },
]

export default function BookRecommendations() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">61인의 작가가 권하는 한 권의 책</h2>
        <Button variant="outline" size="sm">
          더보기 +
        </Button>
      </div>

      <div className="relative">
        <Button variant="ghost" size="sm" className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 px-8">
          {books.map((book) => (
            <Link key={book.id} href={`/product/${book.id}`} className="group cursor-pointer">
              <div className="aspect-[3/4] mb-3 overflow-hidden rounded-lg">
                <img
                  src={book.image || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-[#A2B38B]">
                {book.title}
              </h3>
            </Link>
          ))}
        </div>

        <Button variant="ghost" size="sm" className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </section>
  )
}
