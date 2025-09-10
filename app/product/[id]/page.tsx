"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Minus, Plus, ShoppingCart } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getBookById, Book } from "@/lib/demo-books"
import { addToCart } from "@/lib/firebase-realtime"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import CartPopup from "@/components/cart-popup"

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1)
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCartPopup, setShowCartPopup] = useState(false)
  const { user, updateCartCount } = useAuth()
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const bookId = params.id as string
    const foundBook = getBookById(bookId)
    if (foundBook) {
      setBook(foundBook)
    } else {
      router.push('/')
    }
    setLoading(false)
  }, [params.id, router])

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change))
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (!book) return

    const result = await addToCart(user.uid, book.id, quantity)
    if (result.success) {
      // 헤더의 장바구니 수량 업데이트
      await updateCartCount()
      setShowCartPopup(true)
    } else {
      toast.error('장바구니 추가에 실패했습니다.')
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (!book) return

    // 장바구니에 추가 후 바로 구매 페이지로 이동
    const result = await addToCart(user.uid, book.id, quantity)
    if (result.success) {
      router.push('/checkout')
    } else {
      toast.error('구매 진행에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#A2B38B] mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">상품을 찾을 수 없습니다</h1>
          <Button onClick={() => router.push('/')} className="bg-[#A2B38B] hover:bg-[#8fa076]">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 pt-16 pb-8 max-w-6xl">
        {/* Book Info Section - Top */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-[#E4E9BE] text-[#A2B38B]">
                {book.category}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
              <p className="text-gray-600">저자: {book.author} | 출판사: {book.publisher} | 출간일: {book.publishDate}</p>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({book.rating}) 리뷰 {book.reviewCount.toLocaleString()}개</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </Button>
          </div>
          <div className="border-t border-gray-200"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Section - Product Image */}
          <div className="flex flex-col">
            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right Section - Purchase Info */}
          <div className="flex flex-col justify-between">
            <div className="space-y-6">

            {/* 혜택안내 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">혜택안내</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>적립금</span>
                  <span className="text-[#A2B38B] font-medium">{Math.floor(book.discountPrice * 0.05).toLocaleString()}원 (5% 적립)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>무료배송</span>
                  <span className="text-[#A2B38B] font-medium">2만원 이상</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>당일배송</span>
                  <span className="text-[#A2B38B] font-medium">오후 2시 이전 주문</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* 결제안내 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">결제안내</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>무이자할부 가능</div>
                <div>카드/간편결제/휴대폰</div>
                <div>실시간 계좌이체</div>
                <div>무통장입금</div>
              </div>
            </div>

            </div>

            {/* 알림신청 및 매장 정보 */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">알림신청을 하시면 원하는 정보를<br />받아보실 수 있습니다.</p>
                <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5a2.5 2.5 0 01-2.5-2.5V7a2.5 2.5 0 012.5-2.5h15a2.5 2.5 0 012.5 2.5v10a2.5 2.5 0 01-2.5 2.5h-15z" />
                  </svg>
                  알림신청
                </Button>
              </div>
              
              <Button variant="outline" size="lg" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                매장 재고·위치
              </Button>
            </div>

            {/* 가격 및 구매 정보 - 하단 고정 */}
            <div className="mt-auto">
              <div className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg">정가</span>
                      <span className="text-lg line-through text-gray-500">{book.price.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">판매가</span>
                      <span className="text-2xl font-bold text-[#A2B38B]">{book.discountPrice.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">배송비</span>
                      <span className="text-sm font-medium text-[#A2B38B]">무료</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium">수량</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(-1)} className="h-10 w-10 p-0">
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(1)} className="h-10 w-10 p-0">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right mb-6">
                      <span className="text-sm text-gray-500">총 상품금액: </span>
                      <span className="text-xl font-bold text-[#A2B38B]">{(book.discountPrice * quantity).toLocaleString()}원</span>
                    </div>

                    <div className="flex space-x-4">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-[#A2B38B] text-[#A2B38B] hover:bg-[#A2B38B] hover:text-white" 
                        size="lg"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        장바구니
                      </Button>
                      <Button 
                        className="flex-1 bg-[#A2B38B] hover:bg-[#8fa076] text-white" 
                        size="lg"
                        onClick={handleBuyNow}
                      >
                        바로구매
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="mt-12 space-y-8">
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">상품 상세정보</h2>

            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold text-[#A2B38B] mb-4">책 소개</h3>
                <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                  <p>{book.description}</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-[#A2B38B] mb-4">저자 소개</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{book.author}</h4>
                      <p className="text-gray-700">
                        {book.author}은(는) {book.category} 분야의 저명한 작가입니다. 
                        이 책을 통해 독자들에게 깊이 있는 통찰과 지식을 전달하고 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-[#A2B38B] mb-4">목차</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex justify-between">
                      <span>제1장 투자의 기본 원칙</span>
                      <span className="text-gray-500">15</span>
                    </li>
                    <li className="flex justify-between">
                      <span>제2장 가치 투자의 핵심</span>
                      <span className="text-gray-500">45</span>
                    </li>
                    <li className="flex justify-between">
                      <span>제3장 기업 분석의 방법</span>
                      <span className="text-gray-500">78</span>
                    </li>
                    <li className="flex justify-between">
                      <span>제4장 장기 투자의 힘</span>
                      <span className="text-gray-500">112</span>
                    </li>
                    <li className="flex justify-between">
                      <span>제5장 리스크 관리</span>
                      <span className="text-gray-500">145</span>
                    </li>
                    <li className="flex justify-between">
                      <span>제6장 투자자의 심리학</span>
                      <span className="text-gray-500">178</span>
                    </li>
                    <li className="flex justify-between">
                      <span>제7장 성공하는 투자자의 습관</span>
                      <span className="text-gray-500">210</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-[#A2B38B] mb-4">출판사 서평</h3>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    이 책은 단순한 투자 가이드북을 넘어서 인생의 지혜서라고 할 수 있습니다. 워런 버핏과 찰리 멍거가
                    보여준 것은 단순히 돈을 버는 방법이 아니라, 올바른 가치관과 철학을 바탕으로 한 삶의 방식입니다.
                  </p>
                  <p>
                    투자 초보자부터 전문가까지 모든 독자층이 읽을 수 있도록 쉽고 명확하게 설명되어 있으며, 실제 사례와
                    함께 제시되는 투자 원칙들은 즉시 실전에 적용할 수 있습니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-[#A2B38B] mb-4">반품·교환 안내</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-4 text-sm text-gray-700">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">반품·교환 가능 기간</h4>
                      <p>
                        상품 수령 후 7일 이내 (단, 포장을 개봉하였거나 포장이 훼손되어 상품가치가 현저히 감소한 경우
                        제외)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">반품·교환 불가 사유</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>소비자의 책임 있는 사유로 상품 등이 손실 또는 훼손된 경우</li>
                        <li>소비자의 사용, 포장 개봉에 의해 상품 등의 가치가 현저히 감소한 경우</li>
                        <li>복제가 가능한 상품 등의 포장을 훼손한 경우</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">반품·교환 배송비</h4>
                      <p>
                        변심 또는 구매착오의 경우 소비자 부담 (왕복배송비 포함), 상품 불량 또는 오배송의 경우 판매자
                        부담
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-[#A2B38B] mb-4">배송 안내</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">배송료</span>
                      <span>무료배송 (2만원 이상 구매시)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">배송기간</span>
                      <span>주문 후 1-2일 이내 발송</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">배송지역</span>
                      <span>전국 (제주도, 도서산간 지역 추가 배송비 발생)</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* 장바구니 팝업 */}
      <CartPopup 
        isOpen={showCartPopup} 
        onClose={() => setShowCartPopup(false)} 
      />
    </div>
  )
}
