import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== 택배사 알림 API 시작 ===')
    
    const deliveryPayload = await request.json()  // ← 이미 조합된 데이터
    console.log('받은 deliveryPayload:', JSON.stringify(deliveryPayload, null, 2))
    
    console.log('환경변수 확인:')
    console.log('DELIVERY_API_URL:', process.env.DELIVERY_API_URL)
    
    const targetUrl = `${process.env.DELIVERY_API_URL}/api/delivery-requests.json`
    console.log('요청할 URL:', targetUrl)

    // 택배사 API로 전송
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deliveryPayload)  // ← 조합된 데이터 그대로 전송
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