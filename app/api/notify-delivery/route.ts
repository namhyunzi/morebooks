import { NextRequest, NextResponse } from 'next/server'
import { getOrder } from '@/lib/firebase-realtime'

export async function POST(request: NextRequest) {
  try {
    console.log('=== 택배사 알림 API 시작 ===')
    
    const { orderId } = await request.json()  // ← orderId만 받기
    console.log('받은 orderId:', orderId)
    
    // DB에서 주문 데이터 가져오기
    const orderFromDB = await getOrder(orderId)
    if (!orderFromDB) {
      throw new Error('주문 데이터를 찾을 수 없습니다')
    }
    
    console.log('환경변수 확인:')
    console.log('DELIVERY_API_URL:', process.env.DELIVERY_API_URL)
    console.log('MALL_NAME:', process.env.MALL_NAME)
    
    // 필요한 데이터만 조합해서 택배사 API용 데이터 생성
    const deliveryPayload = {
      orderNumber: orderFromDB.id,                    // DB에서
      mallName: process.env.MALL_NAME,               // ← 서버에서 환경변수 접근
      requestDate: new Date().toISOString(),         // API 호출시점
      totalAmount: orderFromDB.totalAmount,          // DB에서
      items: orderFromDB.items.map((item: any) => ({        // DB에서
        title: item.title,
        quantity: item.quantity,
        price: item.price
      })),
      deliveryMemo: orderFromDB.deliveryMemo,         // DB에서
      ssdmJWT: orderFromDB.ssdmJWT                   // DB에서
    }
    
    console.log('택배사용 페이로드:', JSON.stringify(deliveryPayload, null, 2))
    
    const targetUrl = `${process.env.DELIVERY_API_URL}/api/delivery-requests.json`
    console.log('요청할 URL:', targetUrl)

    // 택배사 API로 전송
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deliveryPayload)  // ← 조합된 데이터 전송
    })

    console.log('택배사 API 응답 상태:', response.status)
    console.log('택배사 API 응답 헤더:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.log('택배사 API 에러 응답:', errorText)
      throw new Error(`택배사 알림 실패: ${response.status}`)
    }

    const result = await response.json()
    console.log('택배사 알림 성공:', result)
    
    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('택배사 알림 오류:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}