"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ChevronUp, HelpCircle, Smartphone, MapPin } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getCartItems, clearCart, processBankTransferOrder, CartItem } from "@/lib/firebase-realtime"
import { getBookById, Book } from "@/lib/demo-books"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  connectToSSDM, 
  handleSSDMResult, 
  validateSSDMJWT, 
  sendJWTToDeliveryService, 
  getSSDMErrorMessage,
  SSDMResponse 
} from "@/lib/ssdm-api"

interface CartItemWithBook extends CartItem {
  book: Book
}

function CheckoutContent() {
  const { 
    user, 
    updateCartCount
  } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cartItems, setCartItems] = useState<CartItemWithBook[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [selectedCard, setSelectedCard] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [depositorName, setDepositorName] = useState("")
  const [isOrderItemsExpanded, setIsOrderItemsExpanded] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // SSDM 관련 상태
  const [ssdmJWT, setSSMDJWT] = useState<string | null>(null)
  const [ssdmUID, setSSMDUID] = useState<string | null>(null)
  const [ssdmConnected, setSSMDConnected] = useState(false)
  
  
  // 주문자 정보 상태
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    emailId: "",
    emailDomain: "naver.com",
    phonePrefix: "010",
    phoneNumber: "",
    postalCode: "",
    address: "",
    detailAddress: ""
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadCartItems()
    
    // 앱에서 돌아온 데이터 확인
    if (searchParams) {
      checkAppReturnData(searchParams)
      // SSDM에서 돌아온 데이터 확인
      checkSSMDReturnData(searchParams)
    }
  }, [user, router, searchParams])

  const checkAppReturnData = (searchParams: URLSearchParams) => {
    // URL 파라미터에서 앱 데이터 확인
    const appData = searchParams.get('appData')
    
    if (appData) {
      try {
        const userData = JSON.parse(decodeURIComponent(appData))
        console.log('앱에서 받은 데이터:', userData)
        
        // 폼에 자동 입력
        setCustomerInfo({
          name: userData.name || '',
          emailId: userData.email ? userData.email.split('@')[0] : '',
          emailDomain: userData.email ? userData.email.split('@')[1] : 'naver.com',
          phonePrefix: userData.phone ? userData.phone.split('-')[0] : '010',
          phoneNumber: userData.phone ? userData.phone.split('-').slice(1).join('-') : '',
          postalCode: userData.zipCode || '',
          address: userData.address || '',
          detailAddress: userData.detailAddress || ''
        })
        
        // URL에서 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname)
        
        alert('앱에서 정보를 가져왔습니다!')
      } catch (error) {
        console.error('앱 데이터 파싱 오류:', error)
      }
    }
  }

  const checkSSMDReturnData = (searchParams: URLSearchParams) => {
    handleSSDMResult(
      searchParams,
        (response: SSDMResponse) => {
        // 성공 시 처리
        if (response.jwt && response.uid) {
          setSSMDJWT(response.jwt)
          setSSMDUID(response.uid)
          setSSMDConnected(true)
          
          toast.success(`개인정보 보호 시스템 연결 완료! (${response.expiresIn}초간 유효)`)
          
          // JWT 검증
          validateSSDMJWT(response.jwt).then(isValid => {
            if (isValid) {
              console.log('JWT 검증 성공')
            } else {
              console.warn('JWT 검증 실패')
            }
          })
        }
      },
      (error: string) => {
        // 실패 시 처리
        toast.error(getSSDMErrorMessage(error))
        console.error('SSDM 연결 실패:', error)
      }
    )
  }

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
      
      // 사용자 정보 자동 입력
      if (user.displayName) {
        setCustomerInfo(prev => ({ ...prev, name: user.displayName! }))
      } else if (user.email) {
        const emailParts = user.email.split('@')
        setCustomerInfo(prev => ({ 
          ...prev, 
          name: emailParts[0],
          emailId: emailParts[0],
          emailDomain: emailParts[1] || "naver.com"
        }))
      }
    } catch (error) {
      console.error('장바구니 로딩 에러:', error)
      toast.error('장바구니를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }
  
  const totalAmount = cartItems.reduce((sum, item) => sum + item.book.discountPrice * item.quantity, 0)
  const totalOriginalAmount = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0)
  const totalDiscount = totalOriginalAmount - totalAmount
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleAddressSearch = () => {
    // 우편번호 API 연동 로직
    console.log("주소찾기 클릭")
  }

  const handleSSMDConnect = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.')
      return
    }

    try {
      console.log('SSDM 개인정보 보호 시스템 연결 시작...')
      
      // 현재 페이지 URL을 returnUrl로 사용
      const returnUrl = window.location.href
      
      // 이메일에서 shopId 추출 (예: user@example.com → user)
      const emailParts = user.email?.split('@') || []
      const shopId = emailParts[0] || user.uid
      const { PRIVACY_CONFIG } = await import('@/lib/privacy-config')
      const mallId = PRIVACY_CONFIG.mallId
      
      // SSDM 연결 (쿼리스트링으로 직접 연결)
      const popup = connectToSSDM(shopId, mallId)
      
      if (!popup) {
        return // 팝업 차단됨 (connectToSSDM에서 알림 처리)
      }
      
      toast.info('개인정보 보호 시스템으로 이동했습니다. 팝업에서 동의를 진행해주세요.')
    } catch (error) {
      console.error('SSDM 연결 실패:', error)
      toast.error('개인정보 보호 시스템 연결에 실패했습니다.')
    }
  }

  const handleAppDownload = async () => {
    // 기존 앱 다운로드 함수 (호환성 유지)
    await handleSSMDConnect()
  }


  const handleOrder = async () => {
    if (!user) {
      return
    }

    // 필수 정보 검증
    if (!customerInfo.name || !customerInfo.phoneNumber || !customerInfo.address) {
      alert('필수 정보를 모두 입력해주세요.\n\n- 이름\n- 전화번호\n- 주소')
      return
    }

    if (!selectedBank || !depositorName) {
      alert('무통장입금 정보를 입력해주세요.\n\n- 은행 선택\n- 입금자 성명')
      return
    }

    try {
      setProcessing(true)

      const orderData = {
        userId: user.uid,
        items: cartItems.map(item => ({
          bookId: item.bookId,
          title: item.book.title,
          author: item.book.author,
          price: item.book.price,
          discountPrice: item.book.discountPrice,
          quantity: item.quantity,
          image: item.book.image
        })),
        totalAmount,
        status: 'paid' as const,
        paymentMethod: 'bank_transfer' as const,
        paymentStatus: 'completed' as const,
        shippingAddress: {
          name: customerInfo.name,
          phone: `${customerInfo.phonePrefix}-${customerInfo.phoneNumber}`,
          address: customerInfo.address,
          detailAddress: customerInfo.detailAddress,
          zipCode: customerInfo.postalCode
        },
        shippingFee: 3000,
        finalAmount: totalAmount + 3000
      }

      // 주문 처리
      const result = await processBankTransferOrder(orderData, selectedBank, depositorName)
      
      if (result.success) {
        // SSDM JWT가 있으면 택배사에 전달
        if (ssdmJWT && result.orderId) {
          try {
            const deliveryAuthSuccess = await sendJWTToDeliveryService(ssdmJWT, result.orderId)
            if (deliveryAuthSuccess) {
              toast.success('개인정보 보호 시스템을 통한 안전한 배송이 설정되었습니다!')
            }
          } catch (error) {
            console.error('택배사 JWT 전달 실패:', error)
            // 실패해도 주문은 계속 진행
          }
        }
        
        // 장바구니 비우기
        await clearCart(user.uid)
        // 헤더의 장바구니 수량 업데이트
        await updateCartCount()
        
        toast.success('주문이 완료되었습니다!')
        router.push(`/payment-success?orderId=${result.orderId}`)
      } else {
        toast.error(typeof result.error === 'string' ? result.error : '주문 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('주문 처리 에러:', error)
      toast.error('주문 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">주문할 상품이 없습니다</h2>
            <p className="text-gray-600 mb-8">장바구니에 상품을 담아주세요</p>
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
        <h1 className="text-2xl font-bold mb-8">주문/결제</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-400">1 장바구니</span>
            <span className="text-[#A2B38B] font-medium">2 주문/결제</span>
            <span className="text-gray-400">3 주문완료</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsOrderItemsExpanded(!isOrderItemsExpanded)}
              >
                <div className="flex items-center">
                  <h3 className="font-bold text-lg">주문상품</h3>
                  <span className="text-sm text-gray-500 ml-16">
                    총 <span className="text-[#A2B38B]">{totalQuantity}</span>개
                  </span>
                </div>
                <ChevronUp 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isOrderItemsExpanded ? 'rotate-0' : 'rotate-180'
                  }`} 
                />
              </div>
              
              {isOrderItemsExpanded && (
                <>
                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>
                  
                  {/* Product Items */}
                  <div className="p-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.book.image || "/placeholder.svg"}
                          alt={item.book.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.book.title}</h4>
                          <p className="text-xs text-gray-500">{item.book.author}</p>
                        </div>
                        <div className="flex items-center justify-between w-32">
                          <span className="text-sm text-gray-600">{item.quantity}개</span>
                          <div className="text-right">
                            <div className="font-bold text-sm">{item.book.discountPrice.toLocaleString()}원</div>
                            <div className="text-xs text-gray-500 line-through">{item.book.price.toLocaleString()}원</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-6">주문자 정보</h3>
              
              {/* SSDM 연결 배너 */}
              <div className={`rounded-lg p-4 mb-6 text-white transition-colors ${
                ssdmConnected 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-[#A2B38B] to-[#8fa076]'
              }`}>
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-6 h-6" />
                  <div className="flex-1">
                    {ssdmConnected ? (
                      <>
                        <h4 className="font-semibold text-sm">개인정보 보호 시스템 연결 완료!</h4>
                        <p className="text-xs opacity-90 mt-1">안전한 배송을 위해 택배사에 임시 권한이 부여됩니다.</p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold text-sm">개인정보 보호 시스템으로 안전하게 주문하세요!</h4>
                        <p className="text-xs opacity-90 mt-1">직접 입력 없이 개인정보를 보호하며 주문할 수 있습니다.</p>
                      </>
                    )}
                  </div>
                  {!ssdmConnected && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white text-[#A2B38B] border-white hover:bg-gray-50"
                      onClick={handleSSMDConnect}
                    >
                      개인정보 연결하기
                    </Button>
                  )}
                  {ssdmConnected && (
                    <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                      연결됨
                    </div>
                  )}
                </div>
              </div>

              {/* 주문자 정보 입력 폼 */}
              <div className="space-y-4">
                {/* 이름 */}
                <div className="flex items-center">
                  <Label htmlFor="name" className="w-20 text-sm font-medium text-gray-700">이름</Label>
                  <div className="w-80">
                    <Input 
                      id="name" 
                      placeholder="이름을 입력해주세요." 
                      className="w-full border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* 이메일 */}
                <div className="flex items-center">
                  <Label htmlFor="email" className="w-20 text-sm font-medium text-gray-700">이메일</Label>
                  <div className="w-80 flex items-center space-x-2">
                    <Input 
                      id="emailId"
                      placeholder="이메일 아이디"
                      className="flex-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                      value={customerInfo.emailId}
                      onChange={(e) => setCustomerInfo({...customerInfo, emailId: e.target.value})}
                    />
                    <span className="text-gray-500">@</span>
                    <Select 
                      value={customerInfo.emailDomain} 
                      onValueChange={(value) => setCustomerInfo({...customerInfo, emailDomain: value})}
                    >
                      <SelectTrigger className="w-32 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="naver.com">naver.com</SelectItem>
                        <SelectItem value="gmail.com">gmail.com</SelectItem>
                        <SelectItem value="daum.net">daum.net</SelectItem>
                        <SelectItem value="yahoo.com">yahoo.com</SelectItem>
                        <SelectItem value="직접입력">직접입력</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 휴대폰 번호 */}
                <div className="flex items-center">
                  <Label htmlFor="phone" className="w-20 text-sm font-medium text-gray-700">전화번호</Label>
                  <div className="w-80 flex items-center space-x-2">
                    <Select 
                      value={customerInfo.phonePrefix} 
                      onValueChange={(value) => setCustomerInfo({...customerInfo, phonePrefix: value})}
                    >
                      <SelectTrigger className="w-20 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="010">010</SelectItem>
                        <SelectItem value="011">011</SelectItem>
                        <SelectItem value="016">016</SelectItem>
                        <SelectItem value="017">017</SelectItem>
                        <SelectItem value="018">018</SelectItem>
                        <SelectItem value="019">019</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      id="phoneNumber"
                      placeholder="휴대폰 번호"
                      className="flex-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                      value={customerInfo.phoneNumber}
                      onChange={(e) => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})}
                    />
                  </div>
                </div>

                {/* 주소 */}
                <div className="flex items-start">
                  <Label htmlFor="address" className="w-20 text-sm font-medium text-gray-700 mt-2">주소</Label>
                  <div className="w-80 space-y-2">
                    <div className="flex space-x-2">
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-[#A2B38B] text-[#A2B38B] hover:bg-[#A2B38B] hover:text-white"
                        onClick={handleAddressSearch}
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        주소찾기
                      </Button>
                      <Input 
                        placeholder="우편번호"
                        className="flex-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                        value={customerInfo.postalCode}
                        onChange={(e) => setCustomerInfo({...customerInfo, postalCode: e.target.value})}
                        readOnly
                      />
                    </div>
                    <Input 
                      placeholder="주소를 입력해주세요"
                      className="w-full border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      readOnly
                    />
                    <Input 
                      placeholder="상세주소를 입력해주세요"
                      className="w-full border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                      value={customerInfo.detailAddress}
                      onChange={(e) => setCustomerInfo({...customerInfo, detailAddress: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-bold text-lg mb-4">결제 방법</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem 
                    value="credit-card" 
                    id="credit-card" 
                    className="border-gray-500"
                  />
                  <Label htmlFor="credit-card">신용카드</Label>
                </div>
                {paymentMethod === "credit-card" && (
                  <div className="ml-6 mb-4">
                    <Select value={selectedCard} onValueChange={setSelectedCard}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="카드를 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="samsung">삼성카드</SelectItem>
                        <SelectItem value="shinhan">신한카드</SelectItem>
                        <SelectItem value="kb">KB국민카드</SelectItem>
                        <SelectItem value="lotte">롯데카드</SelectItem>
                        <SelectItem value="hyundai">현대카드</SelectItem>
                        <SelectItem value="bc">BC카드</SelectItem>
                        <SelectItem value="hana">하나카드</SelectItem>
                        <SelectItem value="woori">우리카드</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem 
                    value="bank-transfer" 
                    id="bank-transfer" 
                    className="border-gray-500"
                  />
                  <Label htmlFor="bank-transfer">무통장입금</Label>
                </div>
                {paymentMethod === "bank-transfer" && (
                  <div className="ml-6 mb-4 space-y-4">
                    <Select value={selectedBank} onValueChange={setSelectedBank}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="입금하실 은행" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kb">국민은행</SelectItem>
                        <SelectItem value="shinhan">신한은행</SelectItem>
                        <SelectItem value="woori">우리은행</SelectItem>
                        <SelectItem value="hana">하나은행</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder="입금자 성명" 
                      value={depositorName}
                      onChange={(e) => setDepositorName(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">예금주: (주)모어북스</p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="mobile-payment" 
                    id="mobile-payment" 
                    className="border-gray-500"
                  />
                  <Label htmlFor="mobile-payment">휴대폰 결제</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 h-fit">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="font-bold">상품 금액</span>
                <span className="font-bold">{totalOriginalAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span>0원</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-[#A2B38B]">상품 할인</span>
                <span className="font-bold text-[#A2B38B]">- {totalDiscount.toLocaleString()}원</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>최종 결제 금액</span>
                <span className="text-[#A2B38B]">{totalAmount.toLocaleString()}원</span>
              </div>
            </div>

            <Button 
              className="w-full bg-[#A2B38B] hover:bg-[#8fa076] text-white" 
              size="lg" 
              onClick={handleOrder}
              disabled={processing}
            >
              {processing ? '주문 처리 중...' : '주문하기'}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#A2B38B] mx-auto"></div>
          <p className="mt-4 text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
