import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">MoreBooks</h3>
            <p className="text-sm text-gray-600 mb-2">대한민국 대표 온라인 서점</p>
            <p className="text-sm text-gray-600">고객센터: 1544-1900</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">바로가기</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary">
                  베스트셀러
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary">
                  신간도서
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary">
                  이벤트
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary">
                  리뷰
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">고객서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/customer-service" className="text-gray-600 hover:text-primary">
                  자주묻는질문
                </Link>
              </li>
              <li>
                <Link href="/customer-service" className="text-gray-600 hover:text-primary">
                  공지사항
                </Link>
              </li>
              <li>
                <Link href="/customer-service" className="text-gray-600 hover:text-primary">
                  1:1문의
                </Link>
              </li>
              <li>
                <Link href="/customer-service" className="text-gray-600 hover:text-primary">
                  대량주문
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h4 className="font-semibold mb-4">회사정보</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>회사명: (주)모어북스</li>
              <li>대표: 홍길동</li>
              <li>주소: 서울시 강남구 테헤란로 123</li>
              <li>사업자등록번호: 123-45-67890</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 MoreBooks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
