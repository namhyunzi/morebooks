"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getOrder, updateOrderStatus, Order } from "@/lib/firebase-realtime"
import { toast } from "sonner"
import { handleSSDMResult, getSSDMErrorMessage, SSDMResponse } from "@/lib/ssdm-api"

function PaymentSuccessContent() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [ssdmConnected, setSSMDConnected] = useState(false)
  const searchParams = useSearchParams()
  const orderId = searchParams?.get('orderId')

  useEffect(() => {
    if (orderId) {
      loadOrder()
    } else {
      setLoading(false)
    }
    
    // SSDM 연결 결과 확인
    if (searchParams) {
      checkSSMDResult()
    }
  }, [orderId, searchParams])
  
  const checkSSMDResult = () => {
    if (!searchParams) return
    
    handleSSDMResult(
      searchParams,
      (response: SSDMResponse) => {
        // SSDM 연결 성공
        setSSMDConnected(true)
        console.log('결제 완료 페이지에서 SSDM 연결 확인:', response)
      },
      (error: string) => {
        // SSDM 연결 실패 (무시 - 일반 주문으로 처리)
        console.log('SSDM 연결 없이 일반 주문 완료:', error)
      }
    )
  }

  const loadOrder = async () => {
    if (!orderId) return

    try {
      const orderData = await getOrder(orderId)
      if (orderData) {
        setOrder(orderData)
        // 무통장입금은 이미 주문과 동시에 결제완료 처리됨
        if (orderData.paymentMethod === 'bank_transfer' && orderData.paymentStatus === 'completed') {
          toast.success('주문이 완료되었습니다!')
        }
      }
    } catch (error) {
      console.error('주문 정보 로딩 에러:', error)
      toast.error('주문 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
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
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">주문 정보를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-8">잘못된 주문번호이거나 주문이 존재하지 않습니다</p>
            <Button asChild className="bg-[#A2B38B] hover:bg-[#8fa076]">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-8">주문완료</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-400">1 장바구니</span>
            <span className="text-gray-400">2 주문/결제</span>
            <span className="text-[#A2B38B] font-medium">3 주문완료</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-[#A2B38B] mx-auto mb-6" />

          <h2 className="text-2xl font-bold mb-2">주문이 완료되었습니다!</h2>
          <p className="text-gray-600 mb-4">주문번호: {order.id}</p>
          
          {/* SSDM 연결 상태 표시 */}
          {ssdmConnected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">개인정보 보호 시스템을 통한 안전한 배송</span>
              </div>
              <p className="text-green-700 text-sm mt-2">
                택배사에 임시 권한이 부여되어 개인정보를 보호하며 배송됩니다.
              </p>
            </div>
          )}
          
          <p className="text-gray-600 mb-8">
            {order.paymentMethod === 'bank_transfer' ? (
              <>
                무통장입금으로 주문이 완료되었습니다.
                <br />
                아래 계좌 정보를 확인해주세요.
              </>
            ) : (
              '결제가 완료되었습니다.'
            )}
          </p>

          {order.paymentMethod === 'bank_transfer' && order.bankAccount && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-lg mb-4">입금 계좌 정보</h3>

              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">계좌 정보</span>
                  <span className="font-medium">{order.bankAccount.bankName} {order.bankAccount.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예금주</span>
                  <span className="font-medium">{order.bankAccount.accountHolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제금액</span>
                  <span className="font-bold text-[#A2B38B]">{order.totalAmount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주문 상태</span>
                  <span className="font-medium text-[#A2B38B]">결제완료</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/">확인</Link>
            </Button>
            <Button className="bg-[#A2B38B] hover:bg-[#8fa076] text-white" asChild>
              <Link href="/mypage">마이페이지로 돌아가기</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#A2B38B] mx-auto"></div>
          <p className="mt-4 text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
