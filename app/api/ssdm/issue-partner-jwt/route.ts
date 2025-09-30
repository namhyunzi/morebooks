import { NextRequest, NextResponse } from 'next/server'
import { generateJWT } from '@/lib/jwt-utils'

export async function POST(request: NextRequest) {
  try {
    const { shopId, mallId } = await request.json()
    
    if (!shopId || !mallId) {
      return NextResponse.json(
        { error: 'shopId와 mallId가 필요합니다.' },
        { status: 400 }
      )
    }
    
    // 서버에서 직접 JWT 생성
    const apiKey = process.env.PRIVACY_SYSTEM_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'PRIVACY_SYSTEM_API_KEY environment variable is not set' },
        { status: 500 }
      )
    }
    
    const authJWT = generateJWT({ 
      shopId, 
      mallId,
      timestamp: new Date().toISOString()
    }, apiKey, {
      expiresIn: '15m'
    })
    
    // 서버에서 외부 SSDM API 호출
    const response = await fetch(`${process.env.NEXT_PUBLIC_SSDM_URL}/api/issue-partner-jwt`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authJWT}`
      }
    })
    
    console.log('SSDM 파트너 JWT API 응답 상태:', response.status, response.statusText)
    
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
