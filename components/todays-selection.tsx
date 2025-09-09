import Link from "next/link"

const todayBooks = [
  {
    id: 7,
    title: "호의에 대하여 - 무엇이 우리를 ...",
    author: "문정배",
    image: "/todays-book-1.jpg",
    description: "과학을 바탕으로 한 상상력이 빛나는 이야기들",
  },
  {
    id: 8,
    title: "탐정 명아루 - 페가 괴물 사건 - 제...",
    author: "페명우",
    image: "/todays-book-2.jpg",
  },
  {
    id: 9,
    title: "천천히 다정하게 - 방울헌의 시...",
    author: "박용현",
    image: "/todays-book-3.jpg",
  },
  {
    id: 10,
    title: "렛뎀이든 - 인생이나 로즈마리지는...",
    author: "앨 로빈스",
    image: "/todays-book-4.jpg",
  },
  {
    id: 11,
    title: "신박한 수학 사전 - 외계인 감덕 ...",
    author: "벤 올린",
    image: "/todays-book-5.jpg",
  },
]

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
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
