"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Smartphone, ChevronRight } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getOrder, Order } from "@/lib/firebase-realtime"
import { useAuth } from "@/contexts/AuthContext"

export default function OrderDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  // 주문 정보 로드
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || !user) return
      
      try {
        const orderData = await getOrder(orderId)
        
        // 주문이 존재하고 현재 사용자의 주문인지 확인
        if (orderData && orderData.userId === user.uid) {
          setOrder(orderData)
        } else {
          setOrder(null) // 권한이 없는 주문
        }
      } catch (error) {
        console.error('주문 정보 로드 실패:', error)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadOrder()
  }, [orderId, user])

  // 주문 상태 한글 변환
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '주문접수',
      paid: '결제완료',
      processing: '상품준비중',
      shipped: '출고작업중',
      delivered: '배송완료',
      cancelled: '주문취소'
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#A2B38B] mx-auto"></div>
          <p className="mt-4 text-gray-600">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">주문을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-8">주문번호를 확인해주세요</p>
          <Button asChild className="bg-[#A2B38B] hover:bg-[#8fa076]">
            <Link href="/mypage/order-details">주문 내역으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    )
  }
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
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주문접수일</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제일(입금 확인일)</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">배송 상태</span>
                <span className="font-medium">{getStatusText(order.status)}</span>
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
              {order.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-16 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">[국내도서]</div>
                      <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.author}</p>
                    </div>
                    <div className="flex items-center space-x-16">
                      <div className="flex flex-col justify-center">
                        <div className="text-sm text-gray-500">{item.quantity}개</div>
                      </div>
                      <div className="flex flex-col justify-center space-y-2 items-center">
                        <div className="text-lg font-bold">{item.discountPrice.toLocaleString()}원</div>
                        <div className="text-sm text-gray-400 line-through">{item.price.toLocaleString()}원</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="font-bold text-lg mb-4">결제 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">총 주문 금액</span>
                <span className="font-medium">{order.totalAmount.toLocaleString()}원</span>
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
                  <span className="text-[#A2B38B]">{order.totalAmount.toLocaleString()}원</span>
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
