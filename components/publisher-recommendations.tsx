import { Button } from "@/components/ui/button"
import Link from "next/link"

const publisherBooks = [
  {
    id: 7,
    title: "미국 자산관리 성공전략",
    image: "/publisher-book-1.jpg",
  },
  {
    id: 8,
    title: "치즈 이야기",
    image: "/publisher-book-2.jpg",
  },
  {
    id: 9,
    title: "머리 좋은 아이는 이렇게 키웁니다",
    image: "/publisher-book-3.jpg",
  },
  {
    id: 10,
    title: "렛뎀 이론",
    image: "/publisher-book-4.jpg",
  },
  {
    id: 11,
    title: "워런 버핏 바이어블",
    image: "/publisher-book-5.jpg",
  },
  {
    id: 12,
    title: "외계인 자서전",
    image: "/publisher-book-6.jpg",
  },
]

export default function PublisherRecommendations() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">출판사에서 자신있게 추천해요</h2>
        <Button variant="outline" size="sm">
          AD
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {publisherBooks.map((book) => (
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
    </section>
  )
}
