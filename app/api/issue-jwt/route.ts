import { NextRequest, NextResponse } from 'next/server'
import { generateJWT } from '@/lib/jwt-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('JWT 발급 API 호출 시작')
    const { shopId, mallId } = await request.json()
    console.log('받은 파라미터:', { shopId, mallId })
    
    if (!shopId || !mallId) {
      return NextResponse.json({ 
        error: 'shopId and mallId are required' 
      }, { status: 400 })
    }

    console.log('환경변수 확인:', {
      PRIVACY_SYSTEM_API_KEY: process.env.PRIVACY_SYSTEM_API_KEY ? '설정됨' : '없음'
    })

    // API 키 (Vercel 환경변수에서 가져오기)
    const apiKey = process.env.PRIVACY_SYSTEM_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'PRIVACY_SYSTEM_API_KEY environment variable is not set' 
      }, { status: 500 })
    }
    
    // JWT 생성 (API Key로 서명)
    const jwt = generateJWT({ 
      shopId, 
      mallId
    }, apiKey)
    
    console.log('JWT 생성 완료:', {
      shopId,
      mallId,
      jwtLength: jwt.length
    })
    
    // JWT 반환
    return NextResponse.json({ 
      success: true,
      jwt,
      shopId,
      mallId,
      expiresIn: 5 * 60 // 5분 (초 단위)
    })

  } catch (error) {
    console.error('JWT 생성 에러:', error)
    console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack trace')
    
    // 클라이언트에서 볼 수 있도록 상세 에러 정보 반환
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json({ 
      error: 'JWT 생성 중 오류가 발생했습니다',
      details: errorMessage,
      stack: errorStack,
      debug: {
        hasApiKey: !!process.env.PRIVACY_SYSTEM_API_KEY
      }
    }, { status: 500 })
  }
}
