"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import MainBanner from "@/components/main-banner"
import BookRecommendations from "@/components/book-recommendations"
import ServiceIcons from "@/components/service-icons"
import TodaysSelection from "@/components/todays-selection"
import PublisherRecommendations from "@/components/publisher-recommendations"
import { useAuth } from "@/contexts/AuthContext"
import { PrivacySystemClient } from "@/lib/privacy-config"

export default function HomePage() {
  const { user } = useAuth()

  // ✅ 새로운 방식: 쇼핑몰 메인에서 처리
  const handleOrderComplete = async () => {
    if (!user) {
      console.error('사용자가 로그인되지 않음')
      return
    }

    try {
      const client = new PrivacySystemClient()
      
      // 1. UID 생성
      const uidResult = await client.generateUID(user.uid)
      console.log('UID 생성 완료:', uidResult.uid)
      
      // 2. JWT 발급
      const jwtResult = await client.issueJWT(uidResult.uid, 'paper')
      console.log('JWT 발급 완료:', jwtResult.sessionType, jwtResult.expiresIn)
      
      // 3. 개인정보 요청
      const infoResult = await client.requestUserInfo(jwtResult.jwt, ['name', 'phone', 'address'])
      console.log('개인정보 요청 완료:', infoResult.viewerUrl)
      
      // 4. 택배사에 뷰어 URL 전달
      await notifyDeliveryCompany(infoResult.viewerUrl)
      
    } catch (error) {
      console.error('배송 정보 처리 실패:', error)
      // 사용자에게 오류 알림
      alert('배송 정보 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  // 택배사 알림 함수
  const notifyDeliveryCompany = async (viewerUrl: string) => {
    try {
      const response = await fetch('/api/notify-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewerUrl,
          orderId: 'current_order_id', // 실제 주문 ID로 교체 필요
        })
      })
      
      if (!response.ok) {
        throw new Error('택배사 알림 실패')
      }
      
      console.log('택배사에 배송 정보 전달 완료')
    } catch (error) {
      console.error('택배사 알림 오류:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <MainBanner />
        <div className="container mx-auto px-4 py-8 space-y-12 max-w-6xl">
          <ServiceIcons />
          <TodaysSelection />
          <BookRecommendations />
          <PublisherRecommendations />
        </div>
      </main>
      <Footer />
    </div>
  )
}
