'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/AuthContext"

const orderHistory = [
  {
    id: "001-A891693106",
    date: "2017-09-27",
    title: "남자한 미술 이야기 1 권",
    status: "상세조회",
    paymentStatus: "결제완료",
    deliveryStatus: "배송완료",
  },
  {
    id: "001-A031029155",
    date: "2015-07-23",
    title: "알라딘 캐시(1,000원) 외",
    status: "상세조회",
    paymentStatus: "결제완료",
    deliveryStatus: "배송완료",
  },
  {
    id: "001-A911919155",
    date: "2015-07-23",
    title: "알라딘 캐시(5,000원) 외",
    status: "상세조회",
    paymentStatus: "결제완료",
    deliveryStatus: "배송완료",
  },
]

export default function MyPage() {
  const { user } = useAuth()
  
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
                  <Link href="/mypage/order-details">주문내역 전체보기 ></Link>
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">0</div>
                    <div className="text-sm text-gray-600">주문접수</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">0</div>
                    <div className="text-sm text-gray-600">결제완료</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">0</div>
                    <div className="text-sm text-gray-600">상품준비중</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">0</div>
                    <div className="text-sm text-gray-600">출고작업중</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">0</div>
                    <div className="text-sm text-gray-600">출고완료</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">0</div>
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
                    {orderHistory.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm">{order.date}</td>
                        <td className="py-3 px-4 text-sm text-[#6B7A4F]">{order.id}</td>
                        <td className="py-3 px-4 text-sm">{order.title}</td>
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
                            {order.deliveryStatus !== "배송완료" && order.deliveryStatus !== "배송중" && order.deliveryStatus !== "상품준비중" && (
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
                    ))}
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
