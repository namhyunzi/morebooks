"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus, Gift, Users } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useState } from "react"

const cartItems = [
  {
    id: 1,
    title: "[국내도서] 가난한 찰리의 연감",
    originalPrice: 33000,
    price: 29700,
    discount: 10,
    points: 1650,
    quantity: 1,
    image: "/warren-buffett-and-charlie-munger-book-cover.jpg",
  },
  {
    id: 2,
    title: "[예약][국내도서] 머니 트렌드 2026",
    originalPrice: 26000,
    price: 23400,
    discount: 10,
    points: 1300,
    quantity: 1,
    image: "/psychology-of-money-book-cover.jpg",
  },
  {
    id: 3,
    title: "[국내도서] 하루 한 장 나의 어휘력을 위한 필사 노트",
    originalPrice: 23800,
    price: 21420,
    discount: 10,
    points: 1190,
    quantity: 1,
    image: "/placeholder-kb35r.png",
  },
]

export default function CartPage() {
  const [selectedItems, setSelectedItems] = useState<number[]>([1, 2, 3])
  const [quantities, setQuantities] = useState<{[key: number]: number}>({
    1: 1,
    2: 1,
    3: 1,
  })

  const totalAmount = cartItems.reduce((sum, item) => {
    if (selectedItems.includes(item.id)) {
      return sum + item.price * quantities[item.id]
    }
    return sum
  }, 0)

  const totalOriginalAmount = cartItems.reduce((sum, item) => {
    if (selectedItems.includes(item.id)) {
      return sum + item.originalPrice * quantities[item.id]
    }
    return sum
  }, 0)

  const totalDiscount = totalOriginalAmount - totalAmount

  const totalQuantity = cartItems.reduce((sum, item) => {
    if (selectedItems.includes(item.id)) {
      return sum + quantities[item.id]
    }
    return sum
  }, 0)

  const totalPoints = cartItems.reduce((sum, item) => {
    if (selectedItems.includes(item.id)) {
      return sum + item.points * quantities[item.id]
    }
    return sum
  }, 0)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cartItems.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (itemId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId))
    }
  }

  const handleQuantityChange = (itemId: number, change: number) => {
    const newQuantity = Math.max(1, quantities[itemId] + change)
    setQuantities({...quantities, [itemId]: newQuantity})
  }

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems(selectedItems.filter(id => id !== itemId))
  }

  const handleRemoveAll = () => {
    setSelectedItems([])
  }

  const isAllSelected = selectedItems.length === cartItems.length

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">장바구니 ({cartItems.length})</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-[#A2B38B] font-medium">1 장바구니</span>
            <span className="text-gray-400">2 주문/결제</span>
            <span className="text-gray-400">3 주문완료</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="selectAll" 
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="selectAll" className="text-sm font-medium">
                    전체
                  </label>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleRemoveAll}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>


            {/* Promotional Banner */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center space-x-2">
              <Gift className="w-4 h-4 text-[#A2B38B]" />
              <span className="text-sm text-gray-600">5만원 이상 구매 시 추가 적립</span>
            </div>


            {/* Cart Items List */}
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <Checkbox 
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                  />
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-2">{item.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-[#A2B38B] text-sm font-bold">{item.discount}%</span>
                      <span className="text-lg font-bold">{item.price.toLocaleString()}원</span>
                      <span className="text-sm text-gray-500 line-through">{item.originalPrice.toLocaleString()}원</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-3 border-l border-gray-300 pl-3">
                    <div className="text-lg font-bold">{item.price.toLocaleString()}원</div>
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="w-8 h-8 p-0 border-r border-gray-300 rounded-none hover:bg-gray-50"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm py-2 border-r border-gray-300">{quantities[item.id]}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="w-8 h-8 p-0 rounded-none hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span>상품 금액</span>
                <span>{totalOriginalAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>배송비</span>
                <span className="text-[#A2B38B]">+0원</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>결제 예정 금액</span>
                  <span className="text-[#A2B38B]">{totalAmount.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-[#A2B38B] hover:bg-[#8fa076] text-white" size="lg" asChild>
              <Link href="/checkout">
                주문하기 ({totalQuantity})
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
