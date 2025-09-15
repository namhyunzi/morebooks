import { NextRequest, NextResponse } from 'next/server'
import { generateJWT } from '@/lib/jwt-utils'
import { getKeyPair, formatPublicKeyForJWT } from '@/lib/key-utils'

export async function POST(request: NextRequest) {
  try {
    const { shopId, mallId } = await request.json()
    
    // 환경변수에서 기본값 가져오기
    const { PRIVACY_CONFIG } = await import('@/lib/privacy-config')
    const defaultMallId = PRIVACY_CONFIG.mallId
    
    // shopId는 요청에서 필수로 받아야 함 (사용자별 동적 값)
    // mallId는 요청에서 받은 값이 없으면 환경변수 기본값 사용
    const finalShopId = shopId
    const finalMallId = mallId || defaultMallId
    
    if (!finalShopId || !finalMallId) {
      return NextResponse.json({ 
        error: 'shopId and mallId are required' 
      }, { status: 400 })
    }

    // 환경변수에서 키 쌍 가져오기
    const publicKey = PRIVACY_CONFIG.publicKey
    const privateKey = PRIVACY_CONFIG.privateKey
    
    if (!publicKey || !privateKey) {
      return NextResponse.json({ 
        error: 'Public key or private key not configured in environment variables' 
      }, { status: 500 })
    }

    // API 키 (환경변수에서 가져오기)
    const apiKey = PRIVACY_CONFIG.apiKey

    // JWT 페이로드에 공개키 포함
    const formattedPublicKey = formatPublicKeyForJWT(publicKey)
    
    // JWT 생성 (RSA 개인키 사용)
    const jwt = generateJWT({ 
      shopId: finalShopId, 
      mallId: finalMallId, 
      apiKey,
      publicKey: formattedPublicKey
    }, privateKey)
    
    console.log('JWT 생성 완료:', {
      shopId: finalShopId,
      mallId: finalMallId,
      apiKey,
      publicKeyLength: formattedPublicKey.length,
      jwtLength: jwt.length
    })
    
    // JWT 반환
    return NextResponse.json({ 
      success: true,
      jwt,
      shopId: finalShopId,
      mallId: finalMallId,
      apiKey,
      publicKey: formattedPublicKey,
      expiresIn: 5 * 60 // 5분 (초 단위)
    })

  } catch (error) {
    console.error('JWT 생성 에러:', error)
    return NextResponse.json({ 
      error: 'JWT 생성 중 오류가 발생했습니다',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
