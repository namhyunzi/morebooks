import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, accessToken, purpose, viewerUrl } = await request.json()

    // JWT 토큰 검증
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || accessToken

    if (!token) {
      return NextResponse.json(
        { error: 'JWT 토큰이 필요합니다' },
        { status: 401 }
      )
    }

    if (!orderId) {
      return NextResponse.json(
        { error: '주문 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // JWT 토큰 검증 (기본적인 구조 확인)
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }
      
      const payload = JSON.parse(atob(parts[1]))
      
      // 만료 시간 확인
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return NextResponse.json(
          { error: 'JWT 토큰이 만료되었습니다' },
          { status: 401 }
        )
      }
      
      console.log('JWT 검증 성공:', {
        uid: payload.uid,
        mallId: payload.mallId,
        orderId
      })
    } catch (error) {
      return NextResponse.json(
        { error: '유효하지 않은 JWT 토큰입니다' },
        { status: 401 }
      )
    }

    // 배송 목적의 경우 택배사에 JWT 전달
    if (purpose === 'delivery_authorization') {
      console.log('택배사에 JWT 전달:', {
        orderId,
        accessToken: token,
        timestamp: new Date().toISOString(),
        message: '이 JWT로 고객의 개인정보에 접근할 수 있습니다 (15분간 유효)'
      })

      // 실제 구현에서는 택배사 API를 호출하여 JWT 전달
      // 여기서는 모의 응답 반환
      return NextResponse.json({
        success: true,
        message: '택배사에 개인정보 접근 권한이 전달되었습니다',
        orderId,
        deliveryCompany: 'CJ대한통운',
        trackingNumber: `TRK${Date.now()}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15분 후 만료
      })
    }

    // 기존 뷰어 URL 전달 로직 (호환성 유지)
    if (viewerUrl) {
      console.log('택배사 알림:', {
        orderId,
        viewerUrl,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: '택배사에 배송 정보가 전달되었습니다',
        orderId,
        viewerUrl
      })
    }

    return NextResponse.json(
      { error: '유효하지 않은 요청입니다' },
      { status: 400 }
    )

  } catch (error) {
    console.error('택배사 알림 처리 중 오류:', error)
    return NextResponse.json(
      { error: '택배사 알림 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}





