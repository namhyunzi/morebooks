'use client'

import Link from "next/link"
import { Search, ShoppingCart, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"

export default function Header() {
  const { user, logout, cartItemCount, isLoginComplete } = useAuth()

  // 디버깅용 로그
  console.log('Header - cartItemCount:', cartItemCount)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }
  return (
    <header className="bg-white">
      <div className="bg-white text-gray-600 border-b border-gray-200">
        <div className="container mx-auto px-4 py-2 max-w-6xl">
          <div className="flex items-center justify-end text-sm space-x-6">
            {user && isLoginComplete ? (
              <>
                <span className="text-[#A2B38B]">
                  {user.displayName || (user.email ? user.email.split('@')[0] : '')}님 환영합니다
                </span>
                <Link href="/mypage" className="hover:text-[#A2B38B]">
                  주문/배송
                </Link>
                <button 
                  onClick={handleLogout}
                  className="hover:text-[#A2B38B] flex items-center space-x-1"
                >
                  <LogOut size={14} />
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-[#A2B38B]">
                  로그인
                </Link>
                <Link href="/register" className="hover:text-[#A2B38B]">
                  회원가입
                </Link>
              </>
            )}
            <Link href="/customer-service" className="hover:text-[#A2B38B]">
              고객센터
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="text-[#A2B38B] font-bold text-2xl leading-tight text-center">
              <div>More</div>
              <div>Books</div>
            </div>
          </Link>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative flex items-center border border-gray-300 rounded-full overflow-hidden bg-transparent shadow-none">
              <Input
                type="text"
                placeholder="대한민국 No.1 경제 트렌드서"
                className="flex-1 px-4 py-3 border-0 focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none"
              />
              <Button
                size="sm"
                className="bg-transparent hover:bg-transparent text-gray-600 px-6 py-3 rounded-none border-0 shadow-none"
              >
                <Search className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-[#A2B38B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            </Link>
            <Link href="/mypage">
              <User className="w-6 h-6 text-gray-700" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
