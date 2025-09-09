"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Package, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useState } from "react"

const orderHistory = [
  {
    id: "001-A891693106",
    date: "2024-01-15",
    title: "워런 버핏과 찰리 멍거",
    status: "배송완료",
    paymentStatus: "결제완료",
    totalAmount: 22500,
    quantity: 1,
    image: "/abstract-book-cover.png",
  },
  {
    id: "001-A031029155",
    date: "2024-01-10",
    title: "돈의 심리학",
    status: "배송중",
    paymentStatus: "결제완료",
    totalAmount: 18000,
    quantity: 1,
    image: "/psychology-book-cover.png",
  },
  {
    id: "001-A911919155",
    date: "2024-01-05",
    title: "마침내 특이점이 시작된다",
    status: "준비중",
    paymentStatus: "결제완료",
    totalAmount: 20000,
    quantity: 1,
    image: "/publisher-book-4.jpg",
  },
]

export default function OrderDetailsPage() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [statusFilter, setStatusFilter] = useState("all")
  const [productName, setProductName] = useState("")

  const filteredOrders = orderHistory.filter(order => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false
    if (startDate && new Date(order.date) < startDate) return false
    if (endDate && new Date(order.date) > endDate) return false
    if (productName && !order.title.toLowerCase().includes(productName.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Link href="/mypage" className="hover:text-[#A2B38B] transition-colors">
              마이페이지
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-500">주문/배송 조회</span>
          </nav>
          
          <h1 className="text-2xl font-bold mb-8">주문/배송 조회</h1>

          {/* Search/Filter Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={statusFilter === "1week" ? "bg-gray-600 text-white border-gray-600" : ""}
                    onClick={() => setStatusFilter("1week")}
                  >
                    1주일
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={statusFilter === "1month" ? "bg-gray-600 text-white border-gray-600" : ""}
                    onClick={() => setStatusFilter("1month")}
                  >
                    1개월
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={statusFilter === "6months" ? "bg-gray-600 text-white border-gray-600" : ""}
                    onClick={() => setStatusFilter("6months")}
                  >
                    6개월
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={statusFilter === "july" ? "bg-gray-600 text-white border-gray-600" : ""}
                    onClick={() => setStatusFilter("july")}
                  >
                    7월
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={statusFilter === "august" ? "bg-gray-600 text-white border-gray-600" : ""}
                    onClick={() => setStatusFilter("august")}
                  >
                    8월
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={statusFilter === "september" ? "bg-gray-600 text-white border-gray-600" : ""}
                    onClick={() => setStatusFilter("september")}
                  >
                    9월
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "yyyy.MM.dd", { locale: ko }) : "2025.08.09"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="text-gray-400">~</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "yyyy.MM.dd", { locale: ko }) : "2025.09.09"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="전체내역" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체내역</SelectItem>
                    <SelectItem value="준비중">준비중</SelectItem>
                    <SelectItem value="배송중">배송중</SelectItem>
                    <SelectItem value="배송완료">배송완료</SelectItem>
                    <SelectItem value="취소">취소</SelectItem>
                    <SelectItem value="교환/반품">교환/반품</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value="product" onValueChange={() => {}}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="상품명" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">상품명</SelectItem>
                    <SelectItem value="order">주문번호</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="구매하신 상품 제목을 입력하세요."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-80"
                />
              </div>
              <Button className="bg-[#A2B38B] hover:bg-[#8fa076] text-white">조회</Button>
            </div>
          </div>

          {/* Order List */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="font-bold text-lg mb-6">주문 내역</h2>
            
            {filteredOrders.length > 0 ? (
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
                    {filteredOrders.map((order) => (
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
                            {order.status !== "배송완료" && order.status !== "배송중" && order.status !== "준비중" && (
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
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-6">최근에 주문한 도서가 없습니다</p>
                <Button 
                  variant="outline" 
                  className="border-green-500 text-green-500 hover:bg-green-50"
                  asChild
                >
                  <Link href="/cart">장바구니 바로가기</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
