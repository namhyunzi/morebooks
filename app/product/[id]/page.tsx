"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Minus, Plus } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useState } from "react"

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1)

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change))
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
                베스트셀러
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900">워런 버핏과 찰리 멍거</h1>
              <p className="text-gray-600">저자: 워런 버핏, 찰리 멍거 | 출판사: 교보문고 | 출간일: 2024.01.15</p>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">(4.8) 리뷰 1,234개</span>
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
              <img src="/abstract-book-cover.png" alt="상품 이미지" className="w-full h-full object-cover" />
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
                  <span className="text-[#A2B38B] font-medium">1,000원 (5% 적립)</span>
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
                      <span className="text-lg line-through text-gray-500">25,000원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">판매가</span>
                      <span className="text-2xl font-bold text-[#A2B38B]">22,500원</span>
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
                      <span className="text-xl font-bold text-[#A2B38B]">{(22500 * quantity).toLocaleString()}원</span>
                    </div>

                    <div className="flex space-x-4">
                      <Button variant="outline" className="flex-1 border-[#A2B38B] text-[#A2B38B] hover:bg-[#A2B38B] hover:text-white" size="lg">
                        장바구니
                      </Button>
                      <Button className="flex-1 bg-[#A2B38B] hover:bg-[#8fa076] text-white" size="lg">
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
                  <p>
                    투자의 전설 워런 버핏과 찰리 멍거의 투자 철학과 인생 이야기를 담은 책입니다. 50년 넘게 함께해온 두
                    거장의 지혜와 통찰을 통해 성공적인 투자와 인생의 비밀을 배워보세요.
                  </p>
                  <p>
                    이 책은 버크셔 해서웨이의 성공 스토리를 통해 장기 투자의 중요성과 가치 투자의 핵심 원칙들을 상세히
                    다룹니다. 두 투자 거장이 수십 년간 축적한 경험과 노하우를 통해 독자들은 올바른 투자 마인드셋을 기를
                    수 있습니다.
                  </p>
                  <p>
                    특히 이번 개정판에서는 최근 10년간의 투자 사례와 시장 변화에 대한 두 거장의 새로운 통찰이 추가되어
                    더욱 풍부한 내용을 담고 있습니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-[#A2B38B] mb-4">저자 소개</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">워런 버핏 (Warren Buffett)</h4>
                      <p className="text-gray-700">
                        세계 최고의 투자자로 불리는 워런 버핏은 1930년 네브래스카주 오마하에서 태어났습니다. 버크셔
                        해서웨이의 회장 겸 CEO로서 50년 넘게 연평균 20%가 넘는 수익률을 기록하며 '오마하의 현인'이라는
                        별명을 얻었습니다.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">찰리 멍거 (Charlie Munger)</h4>
                      <p className="text-gray-700">
                        워런 버핏의 오랜 동반자이자 버크셔 해서웨이의 부회장인 찰리 멍거는 1924년 네브래스카주에서
                        태어났습니다. 법학과 투자 분야에서 뛰어난 성과를 거둔 그는 버핏과 함께 가치 투자의 새로운 지평을
                        열었습니다.
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
    </div>
  )
}
