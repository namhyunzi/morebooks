"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus, Gift, Users, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getCartItems, updateCartItemQuantity, removeFromCart, clearCart, CartItem } from "@/lib/firebase-realtime"
import { getBookById, Book } from "@/lib/demo-books"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CartItemWithBook extends CartItem {
  book: Book
}

export default function CartPage() {
  const { user, updateCartCount } = useAuth()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItemWithBook[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [quantities, setQuantities] = useState<{[key: string]: number}>({})

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadCartItems()
  }, [user, router])

  const loadCartItems = async () => {
    if (!user) return

    try {
      const items = await getCartItems(user.uid)
      const itemsWithBooks: CartItemWithBook[] = []
      
      for (const item of items) {
        const book = getBookById(item.bookId)
        if (book) {
          itemsWithBooks.push({ ...item, book })
        }
      }
      
      setCartItems(itemsWithBooks)
      setSelectedItems(itemsWithBooks.map(item => item.id))
      setQuantities(itemsWithBooks.reduce((acc, item) => {
        acc[item.id] = item.quantity
        return acc
      }, {} as {[key: string]: number}))
    } catch (error) {
      console.error('장바구니 로딩 에러:', error)
      toast.error('장바구니를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    if (selectedItems.includes(item.id)) {
      return sum + item.book.discountPrice * quantities[item.id]
    }
    return sum
  }, 0)

  const totalOriginalAmount = cartItems.reduce((sum, item) => {
    if (selectedItems.includes(item.id)) {
      return sum + item.book.price * quantities[item.id]
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
      return sum + Math.floor(item.book.discountPrice * 0.05) * quantities[item.id]
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

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId))
    }
  }

  const handleQuantityChange = async (itemId: string, change: number) => {
    if (!user) return

    const newQuantity = Math.max(1, quantities[itemId] + change)
    setQuantities({...quantities, [itemId]: newQuantity})
    
    const result = await updateCartItemQuantity(user.uid, itemId, newQuantity)
    if (!result.success) {
      toast.error('수량 변경에 실패했습니다.')
      // 원래 수량으로 되돌리기
      setQuantities({...quantities, [itemId]: quantities[itemId]})
    } else {
      // 헤더의 장바구니 수량 업데이트
      await updateCartCount()
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!user) return

    const result = await removeFromCart(user.uid, itemId)
    if (result.success) {
      setCartItems(cartItems.filter(item => item.id !== itemId))
      setSelectedItems(selectedItems.filter(id => id !== itemId))
      // 헤더의 장바구니 수량 업데이트
      await updateCartCount()
      toast.success('상품이 삭제되었습니다.')
    } else {
      toast.error('상품 삭제에 실패했습니다.')
    }
  }

  const handleRemoveAll = async () => {
    if (!user) return

    const result = await clearCart(user.uid)
    if (result.success) {
      setCartItems([])
      setSelectedItems([])
      // 헤더의 장바구니 수량 업데이트
      await updateCartCount()
      toast.success('장바구니가 비워졌습니다.')
    } else {
      toast.error('장바구니 비우기에 실패했습니다.')
    }
  }

  const isAllSelected = selectedItems.length === cartItems.length

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#A2B38B] mx-auto"></div>
          <p className="mt-4 text-gray-600">장바구니를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">장바구니 (0)</h1>
          </div>
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">장바구니가 비어있습니다</h2>
            <p className="text-gray-600 mb-8">원하는 상품을 장바구니에 담아보세요</p>
            <Button asChild className="bg-[#A2B38B] hover:bg-[#8fa076]">
              <Link href="/">쇼핑 계속하기</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">장바구니 ({selectedItems.length})</h1>
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
                    src={item.book.image || "/placeholder.svg"}
                    alt={item.book.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-2">{item.book.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{item.book.author}</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-[#A2B38B] text-sm font-bold">{item.book.discountRate}%</span>
                      <span className="text-lg font-bold">{item.book.discountPrice.toLocaleString()}원</span>
                      <span className="text-sm text-gray-500 line-through">{item.book.price.toLocaleString()}원</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-3 border-l border-gray-300 pl-3">
                    <div className="text-lg font-bold">{(item.book.discountPrice * quantities[item.id]).toLocaleString()}원</div>
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
                <span>할인 금액</span>
                <span className="text-red-500">-{totalDiscount.toLocaleString()}원</span>
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
