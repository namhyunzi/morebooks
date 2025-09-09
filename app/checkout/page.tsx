"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import { ChevronUp, HelpCircle, Smartphone, MapPin } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const orderItems = [
  {
    id: 1,
    title: "[국내도서] 가난한 찰리의 연감",
    originalPrice: 33000,
    price: 29700,
    quantity: 1,
    image: "/warren-buffett-and-charlie-munger-book-cover.jpg",
  },
]

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("")
  const [selectedCard, setSelectedCard] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [depositorName, setDepositorName] = useState("")
  const [isOrderItemsExpanded, setIsOrderItemsExpanded] = useState(true)
  
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
  
  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleAddressSearch = () => {
    // 우편번호 API 연동 로직
    console.log("주소찾기 클릭")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
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
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                        </div>
                        <div className="flex items-center justify-between w-32">
                          <span className="text-sm text-gray-600">{item.quantity}개</span>
                          <div className="text-right">
                            <div className="font-bold text-sm">{item.price.toLocaleString()}원</div>
                            <div className="text-xs text-gray-500 line-through">{item.originalPrice.toLocaleString()}원</div>
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
              
              {/* 앱 사용 유도 배너 */}
              <div className="bg-gradient-to-r from-[#A2B38B] to-[#8fa076] rounded-lg p-4 mb-6 text-white">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-6 h-6" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">개인정보 보호 앱을 통해 안전하게 주문하세요!</h4>
                    <p className="text-xs opacity-90 mt-1">직접 입력 없이 개인정보를 보호하며 주문할 수 있습니다.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white text-[#A2B38B] border-white hover:bg-gray-50"
                    onClick={() => window.open('https://play.google.com/store', '_blank')}
                  >
                    앱 다운로드
                  </Button>
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
                <span className="font-bold">{totalAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span>0원</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-[#A2B38B]">상품 할인</span>
                <span className="font-bold text-[#A2B38B]">- {Math.round(totalAmount * 0.1).toLocaleString()}원</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>최종 결제 금액</span>
                <span className="text-[#A2B38B]">{(totalAmount * 0.9).toLocaleString()}원</span>
              </div>
            </div>

            <Button className="w-full bg-[#A2B38B] hover:bg-[#8fa076] text-white" size="lg" asChild>
              <Link href="/payment-success">
                결제하기
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
