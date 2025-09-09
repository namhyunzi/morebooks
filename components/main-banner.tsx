import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Pause } from "lucide-react"

export default function MainBanner() {
  return (
    <section className="bg-gradient-to-r from-orange-200 to-orange-300 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="bg-black text-white px-3 py-1 rounded text-sm inline-block mb-4">eBook</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              그들은 어떻게
              <br />
              투자계의 전설이 되었나?
            </h1>
            <p className="text-gray-700 mb-6">{"<워런 버핏과 찰리 멍거>"} 전자책 선출간!</p>
          </div>

          <div className="flex-1 flex justify-center">
            <img src="/warren-buffett-and-charlie-munger-book-cover.jpg" alt="워런 버핏과 찰리 멍거" className="rounded-lg shadow-lg" />
          </div>
        </div>

        <div className="flex items-center justify-center mt-8 space-x-4">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Pause className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">21 - 33</span>
          <Button variant="ghost" size="sm">
            전체보기
          </Button>
          <Button variant="ghost" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
