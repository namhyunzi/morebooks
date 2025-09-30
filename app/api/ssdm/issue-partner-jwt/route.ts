import { NextRequest, NextResponse } from 'next/server'
import { generateJWT } from '@/lib/jwt-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('=== issue-partner-jwt API 시작 ===')
    const { shopId, mallId } = await request.json()
    console.log('받은 파라미터:', { shopId, mallId })
    
    if (!shopId || !mallId) {
      console.error('필수 파라미터 누락:', { shopId, mallId })
      return NextResponse.json(
        { error: 'shopId와 mallId가 필요합니다.' },
        { status: 400 }
      )
    }
    
    // 서버에서 직접 JWT 생성
    const apiKey = process.env.PRIVACY_SYSTEM_API_KEY
    console.log('API 키 확인:', apiKey ? '설정됨' : '없음')
    
    if (!apiKey) {
      console.error('API 키가 설정되지 않음')
      return NextResponse.json(
        { error: 'PRIVACY_SYSTEM_API_KEY environment variable is not set' },
        { status: 500 }
      )
    }
    
    console.log('JWT 생성 시작:', { shopId, mallId })
    const authJWT = generateJWT({ 
      shopId, 
      mallId,
      timestamp: new Date().toISOString()
    }, apiKey, {
      expiresIn: '15m'
    })
    console.log('JWT 생성 완료:', { jwtLength: authJWT.length, jwtStart: authJWT.substring(0, 50) + '...' })
    
    // 서버에서 외부 SSDM API 호출
    const ssdmUrl = `${process.env.NEXT_PUBLIC_SSDM_URL}/api/issue-partner-jwt`
    console.log('외부 SSDM API 호출:', { ssdmUrl, jwtLength: authJWT.length })
    
    const response = await fetch(ssdmUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authJWT}`
      }
    })
    
    console.log('SSDM 파트너 JWT API 응답 상태:', response.status, response.statusText)
    console.log('SSDM 파트너 JWT API 응답 헤더:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('SSDM 파트너 JWT API 에러 응답:', errorData)
      throw new Error(`SSDM 파트너 JWT API 호출 실패: ${errorData.error || response.status}`)
    }
    
    const result = await response.json()
    console.log('SSDM 파트너 JWT API 응답 데이터:', result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('SSDM 파트너 JWT 발급 실패:', error)
    return NextResponse.json(
      { error: '파트너 JWT 발급에 실패했습니다.' },
      { status: 500 }
    )
  }
}
