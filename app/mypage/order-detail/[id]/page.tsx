"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Smartphone, ChevronRight } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function OrderDetailPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Link href="/mypage" className="hover:text-[#A2B38B] transition-colors">
              마이페이지
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/mypage/order-details" className="hover:text-[#A2B38B] transition-colors">
              주문/배송 조회
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-500">주문 상세</span>
          </nav>
          
          <h1 className="text-2xl font-bold mb-8">주문 상세</h1>

          {/* Basic/Delivery Info */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="font-bold text-lg mb-4">기본/배송 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">주문번호</span>
                <span className="font-medium">20191113934554</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주문접수일</span>
                <span className="font-medium">2019-11-13</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제일(입금 확인일)</span>
                <span className="font-medium">2019-11-13</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">배송 상태</span>
                <span className="font-medium">배송완료</span>
              </div>
            </div>
          </div>

          {/* Orderer Info */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="font-bold text-lg mb-4">주문자 정보</h2>
            <div className="bg-gradient-to-r from-[#A2B38B] to-[#8fa076] rounded-lg p-4 text-white">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">개인정보 비공개</h4>
                  <p className="text-xs opacity-90 mt-1">MoreBooks는 개인정보를 저장하지 않습니다.</p>
                  <p className="text-xs opacity-90">주문자 정보 확인은 SSMD 앱에서 확인하세요.</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white text-[#A2B38B] border-white hover:bg-gray-50"
                  onClick={() => window.open('https://ssmd.app', '_blank')}
                >
                  SSMD 앱으로 이동
                </Button>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="font-bold text-lg mb-4">주문 상품 정보</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <img src="/warren-buffett-and-charlie-munger-book-cover.jpg" alt="상품 이미지" className="w-16 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">[국내도서]</div>
                    <h3 className="font-medium text-gray-900 mb-2">가난한 찰리의 연감</h3>
                  </div>
                  <div className="flex items-center space-x-16">
                    <div className="flex flex-col justify-center">
                      <div className="text-sm text-gray-500">1개</div>
                    </div>
                    <div className="flex flex-col justify-center space-y-2 items-center">
                      <div className="text-lg font-bold">29,700원</div>
                      <div className="text-sm text-gray-400 line-through">33,000원</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <img src="/psychology-of-money-book-cover.jpg" alt="상품 이미지" className="w-16 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">[국내도서]</div>
                    <h3 className="font-medium text-gray-900 mb-2">돈의 심리학</h3>
                  </div>
                  <div className="flex items-center space-x-16">
                    <div className="flex flex-col justify-center">
                      <div className="text-sm text-gray-500">2개</div>
                    </div>
                    <div className="flex flex-col justify-center space-y-2 items-center">
                      <div className="text-lg font-bold">46,800원</div>
                      <div className="text-sm text-gray-400 line-through">52,000원</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="font-bold text-lg mb-4">결제 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">총 주문 금액</span>
                <span className="font-medium">22,500원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">배송비</span>
                <span className="text-[#A2B38B]">무료</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제 방법</span>
                <span className="font-medium">무통장입금</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>최종 결제 금액</span>
                  <span className="text-[#A2B38B]">22,500원</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button className="bg-[#A2B38B] hover:bg-[#8fa076] text-white">재주문</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
