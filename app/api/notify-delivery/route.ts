import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { viewerUrl, orderId } = await request.json()

    if (!viewerUrl || !orderId) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다' },
        { status: 400 }
      )
    }

    // 택배사 시스템에 뷰어 URL 전달 로직
    // 실제 구현에서는 택배사 API를 호출하거나 DB에 저장
    console.log('택배사 알림:', {
      orderId,
      viewerUrl,
      timestamp: new Date().toISOString()
    })

    // 임시로 성공 응답 반환
    // 실제로는 택배사 API 호출 결과를 반환
    return NextResponse.json({
      success: true,
      message: '택배사에 배송 정보가 전달되었습니다',
      orderId,
      viewerUrl
    })

  } catch (error) {
    console.error('택배사 알림 처리 중 오류:', error)
    return NextResponse.json(
      { error: '택배사 알림 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}





