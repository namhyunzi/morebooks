'use client'

import { Button } from "@/components/ui/button"
import { ShoppingCart, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface CartPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartPopup({ isOpen, onClose }: CartPopupProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleCartView = () => {
    router.push('/cart')
    onClose()
  }

  const handleContinueShopping = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative shadow-lg">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#A2B38B] rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* 메시지 */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            선택한 상품이 장바구니에 담겼습니다.
          </h3>
        </div>

        {/* 버튼들 */}
        <div className="flex space-x-3">
          <Button
            onClick={handleContinueShopping}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            계속 쇼핑하기
          </Button>
          <Button
            onClick={handleCartView}
            className="flex-1 bg-[#A2B38B] hover:bg-[#8fa076] text-white"
          >
            장바구니 보기
          </Button>
        </div>
      </div>
    </div>
  )
}
