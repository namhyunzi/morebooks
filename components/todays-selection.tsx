import Link from "next/link"
import { getFeaturedBooks } from "@/lib/demo-books"

const todayBooks = getFeaturedBooks()

export default function TodaysSelection() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">오늘의 책</h2>
      </div>

      <div className="bg-card rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {todayBooks.map((book) => (
            <Link key={book.id} href={`/product/${book.id}`} className="group cursor-pointer">
              <div className="space-y-4">
                <img
                  src={book.image || "/placeholder.svg"}
                  alt={book.title}
                  className="rounded shadow-md w-full h-64 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-[#A2B38B] line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500">{book.author}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 line-through">{book.price.toLocaleString()}원</span>
                    <span className="text-sm font-bold text-[#A2B38B]">{book.discountPrice.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
