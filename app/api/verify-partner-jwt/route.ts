import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt-utils'

export async function POST(request: NextRequest) {
  try {
    const { jwt } = await request.json()
    
    if (!jwt) {
      return NextResponse.json(
        { error: 'JWT 토큰이 필요합니다.' },
        { status: 400 }
      )
    }

    // 서버에서 JWT 검증
    const apiKey = process.env.PRIVACY_SYSTEM_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'PRIVACY_SYSTEM_API_KEY가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const decoded = verifyJWT(jwt, apiKey)
    
    // delegateJwt만 클라이언트에 전달
    return NextResponse.json({ 
      delegateJwt: decoded.delegateJwt 
    })
    
  } catch (error) {
    console.error('JWT 검증 실패:', error)
    return NextResponse.json(
      { error: 'JWT 검증에 실패했습니다.' },
      { status: 400 }
    )
  }
}
