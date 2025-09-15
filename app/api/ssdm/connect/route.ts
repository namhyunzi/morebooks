import { NextRequest, NextResponse } from 'next/server'
import { generateJWT } from '@/lib/jwt-utils'
import { getKeyPair, formatPublicKeyForJWT } from '@/lib/key-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('SSDM connect API 호출 시작')
    const { shopId, mallId } = await request.json()
    console.log('받은 파라미터:', { shopId, mallId })
    
    if (!shopId || !mallId) {
      return NextResponse.json({ 
        error: 'shopId and mallId are required' 
      }, { status: 400 })
    }

    console.log('환경변수 확인:', {
      SHOP_PUBLIC_KEY: process.env.SHOP_PUBLIC_KEY ? '설정됨' : '없음',
      SHOP_PRIVATE_KEY: process.env.SHOP_PRIVATE_KEY ? '설정됨' : '없음',
      PRIVACY_SYSTEM_API_KEY: process.env.PRIVACY_SYSTEM_API_KEY ? '설정됨' : '없음'
    })

    // 쇼핑몰용 키 쌍 가져오기
    console.log('키 쌍 가져오기 시도...')
    const { publicKey, privateKey } = getKeyPair()
    console.log('키 쌍 가져오기 성공')

    // API 키 (기존 설정된 키 사용)
    const apiKey = process.env.PRIVACY_SYSTEM_API_KEY || process.env.NEXT_PUBLIC_PRIVACY_SYSTEM_API_KEY || 'abc123'

    // JWT 페이로드에 공개키 포함
    const formattedPublicKey = formatPublicKeyForJWT(publicKey)
    
    // JWT 생성 (RSA 개인키 사용)
    const jwt = generateJWT({ 
      shopId, 
      mallId, 
      apiKey,
      publicKey: formattedPublicKey
    }, privateKey)
    
    console.log('JWT 생성 완료:', {
      shopId,
      mallId,
      apiKey,
      publicKeyLength: formattedPublicKey.length,
      jwtLength: jwt.length
    })
    
    // JWT 반환
    return NextResponse.json({ 
      success: true,
      jwt,
      shopId,
      mallId,
      apiKey,
      publicKey: formattedPublicKey,
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
        hasPublicKey: !!process.env.SHOP_PUBLIC_KEY,
        hasPrivateKey: !!process.env.SHOP_PRIVATE_KEY,
        hasApiKey: !!process.env.PRIVACY_SYSTEM_API_KEY
      }
    }, { status: 500 })
  }
}
