import { NextRequest, NextResponse } from 'next/server'
import { generateJWT } from '@/lib/jwt-utils'
import { getKeyPair, formatPublicKeyForJWT } from '@/lib/key-utils'

export async function POST(request: NextRequest) {
  try {
    const { shopId, mallId } = await request.json()
    
    if (!shopId || !mallId) {
      return NextResponse.json({ 
        error: 'shopId and mallId are required' 
      }, { status: 400 })
    }

    // 쇼핑몰용 키 쌍 가져오기
    const { publicKey, privateKey } = getKeyPair()

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
    return NextResponse.json({ 
      error: 'JWT 생성 중 오류가 발생했습니다',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
