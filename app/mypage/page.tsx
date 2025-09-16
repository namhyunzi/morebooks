'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"
import { getUserOrders, Order } from "@/lib/firebase-realtime"

export default function MyPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  // 사용자 주문 정보 로드
  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return
      
      try {
        const userOrders = await getUserOrders(user.uid)
        setOrders(userOrders)
      } catch (error) {
        console.error('주문 정보 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadOrders()
  }, [user])
  
  // 주문 상태별 개수 계산
  const getOrderCounts = () => {
    const counts = {
      pending: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    }
    
    orders.forEach(order => {
      if (order.status in counts) {
        counts[order.status as keyof typeof counts]++
      }
    })
    
    return counts
  }
  
  // 사용자 이름 가져오기 (구글: displayName, 이메일: 이메일 아이디 부분)
  const getUserName = () => {
    if (user?.displayName) {
      return user.displayName
    } else if (user?.email) {
      return user.email.split('@')[0]
    }
    return '사용자'
  }
  
  // 사용자 이름의 첫 글자 (아바타용)
  const getUserInitial = () => {
    const name = getUserName()
    return name.charAt(0).toUpperCase()
  }
  
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
  
  // 주문 상품명 생성
  const getOrderTitle = (order: Order) => {
    if (order.items.length === 1) {
      return order.items[0].title
    } else {
      return `${order.items[0].title} 외 ${order.items.length - 1}건`
    }
  }
  
  const orderCounts = getOrderCounts()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-primary rounded-lg p-6 text-primary-foreground mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-primary-foreground rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">{getUserInitial()}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{getUserName()}님</h3>
                  <Badge variant="secondary" className="mt-1 flex items-center gap-1">
                    <div className="w-4 h-4 bg-[#A2B38B] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">C</span>
                    </div>
                    포인트 {">"}
                  </Badge>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              <div className="font-bold text-foreground mb-4">내 주문 관리</div>
              <Link href="/mypage/order-history" className="block text-sm text-muted-foreground hover:text-foreground">
                주문/배송 조회
              </Link>
              <Link href="/mypage/order-history" className="block text-sm text-muted-foreground hover:text-foreground">
                취소/반품 조회
              </Link>

              <div className="font-bold text-foreground mb-4 mt-8">내 서재</div>
              <Link href="/mypage" className="block text-sm text-muted-foreground hover:text-foreground">
                내 서재 관리
              </Link>
              <Link href="/mypage" className="block text-sm text-muted-foreground hover:text-foreground">
                최근 본 상품
              </Link>
              <Link href="/mypage" className="block text-sm text-muted-foreground hover:text-foreground">
                내 관심분야
              </Link>

              <div className="font-bold text-foreground mb-4 mt-8">나의 활동</div>
              <Link href="/mypage" className="block text-sm text-muted-foreground hover:text-foreground">
                내 작성리뷰
              </Link>
              <Link href="/mypage" className="block text-sm text-muted-foreground hover:text-foreground">
                참여중인 이벤트
              </Link>
              <Link href="/mypage" className="block text-sm text-muted-foreground hover:text-foreground">
                참여한 이벤트
              </Link>

              <div className="font-bold text-foreground mb-4 mt-8">고객센터</div>
              <Link href="/customer-service" className="block text-sm text-muted-foreground hover:text-foreground">
                1:1 상담내역
              </Link>
              <Link href="/customer-service" className="block text-sm text-muted-foreground hover:text-foreground">
                공지사항
              </Link>

              <div className="font-bold text-foreground mb-4 mt-8">내 정보 관리</div>
              <Link href="/mypage" className="block text-sm text-muted-foreground hover:text-foreground">
                회원정보 관리
              </Link>
              <Link href="/new-password" className="block text-sm text-muted-foreground hover:text-foreground">
                비밀번호 변경
              </Link>
              <Link href="/mypage" className="block text-sm text-muted-foreground hover:text-foreground">
                회원탈퇴
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Order Status */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">주문 현황</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/mypage/order-details">주문내역 전체보기 &gt;</Link>
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{orderCounts.pending}</div>
                    <div className="text-sm text-gray-600">주문접수</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{orderCounts.paid}</div>
                    <div className="text-sm text-gray-600">결제완료</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{orderCounts.processing}</div>
                    <div className="text-sm text-gray-600">상품준비중</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{orderCounts.shipped}</div>
                    <div className="text-sm text-gray-600">출고작업중</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{orderCounts.shipped}</div>
                    <div className="text-sm text-gray-600">출고완료</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{orderCounts.delivered}</div>
                    <div className="text-sm text-gray-600">배송완료</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Order History */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold text-lg mb-4">최근 주문내역</h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">주문일</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">주문번호</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">주문상품</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">조회/취소</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          주문 정보를 불러오는 중...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          주문 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="py-3 px-4 text-sm text-[#6B7A4F]">{order.id}</td>
                          <td className="py-3 px-4 text-sm">{getOrderTitle(order)}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-[#A2B38B] text-[#A2B38B] hover:bg-[#A2B38B] hover:text-white"
                                asChild
                              >
                                <Link href={`/mypage/order-detail/${order.id}`}>상세조회</Link>
                              </Button>
                              {order.status !== "delivered" && order.status !== "cancelled" && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  취소
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
