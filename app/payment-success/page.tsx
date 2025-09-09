import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-8">주문완료</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-400">1 장바구니</span>
            <span className="text-gray-400">2 주문/결제</span>
            <span className="text-[#A2B38B] font-medium">3 주문완료</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-[#A2B38B] mx-auto mb-6" />

          <h2 className="text-2xl font-bold mb-2">주문이 완료되었습니다!</h2>
          <p className="text-gray-600 mb-8">주문번호: 20191113934554</p>
          <p className="text-gray-600 mb-8">
            아래 가상계좌로 입금해 주시면 정상적으로
            <br />
            결제 완료처리가 됩니다
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-lg mb-4">가상계좌 정보</h3>

            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">계좌 정보</span>
                <span className="font-medium">국민은행 60519014678208</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">예금주</span>
                <span className="font-medium">주식회사 아임웹</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제금액</span>
                <span className="font-bold text-[#A2B38B]">4,000원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">입금 기간</span>
                <span className="font-medium">2019-11-13 17:19까지</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/">확인</Link>
            </Button>
            <Button className="bg-[#A2B38B] hover:bg-[#8fa076] text-white" asChild>
              <Link href="/mypage">마이페이지로 돌아가기</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
