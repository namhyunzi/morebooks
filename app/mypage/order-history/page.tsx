"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Package } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"
import Header from "@/components/header"
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

export default function OrderHistoryPage() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders = orderHistory.filter(order => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false
    if (startDate && new Date(order.date) < startDate) return false
    if (endDate && new Date(order.date) > endDate) return false
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">주문 내역</h1>

          {/* Filter Section */}
          <div className="bg-card rounded-lg p-6 border border-border mb-8">
            <h2 className="font-bold text-lg mb-4">조회 조건</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">시작일</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "yyyy-MM-dd", { locale: ko }) : "시작일 선택"}
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
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">종료일</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "yyyy-MM-dd", { locale: ko }) : "종료일 선택"}
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

              <div>
                <label className="text-sm font-medium mb-2 block">주문상태</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="준비중">준비중</SelectItem>
                    <SelectItem value="배송중">배송중</SelectItem>
                    <SelectItem value="배송완료">배송완료</SelectItem>
                    <SelectItem value="취소">취소</SelectItem>
                    <SelectItem value="교환/반품">교환/반품</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button className="w-full">조회</Button>
              </div>
            </div>
          </div>

          {/* Order List */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="font-bold text-lg mb-6">주문 내역</h2>
            
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">주문일: {order.date}</span>
                        <span className="text-sm text-muted-foreground">주문번호: {order.id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                          {order.status}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/mypage/order-detail/${order.id}`}>상세보기</Link>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <img 
                        src={order.image} 
                        alt={order.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{order.title}</h3>
                        <p className="text-sm text-muted-foreground">수량: {order.quantity}개</p>
                        <p className="font-bold text-primary">{order.totalAmount.toLocaleString()}원</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">최근에 주문한 도서가 없습니다.</p>
                <Button asChild>
                  <Link href="/">장바구니 보러가기</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
