import Header from "@/components/header"
import Footer from "@/components/footer"

export default function CustomerServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">고객센터</h1>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-[#A2B38B]">자주 묻는 질문</h2>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-700 hover:text-[#A2B38B]">
                    주문 및 배송 관련
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 hover:text-[#A2B38B]">
                    반품 및 교환
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 hover:text-[#A2B38B]">
                    결제 문의
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 hover:text-[#A2B38B]">
                    회원 서비스
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-[#A2B38B]">고객 지원</h2>
              <div className="space-y-3">
                <p className="text-gray-700">전화: 1588-1234</p>
                <p className="text-gray-700">이메일: support@morebooks.com</p>
                <p className="text-gray-700">운영시간: 평일 09:00-18:00</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
