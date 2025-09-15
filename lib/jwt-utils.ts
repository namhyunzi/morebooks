/**
 * JWT 생성 및 검증 유틸리티
 */

import jwt from 'jsonwebtoken'

export interface JWTClaims {
  shopId: string
  mallId: string
  apiKey?: string
  publicKey?: string
  uid?: string
  purpose?: string
  iat?: number
  exp?: number
}

/**
 * JWT 토큰 생성 (RSA 개인키 사용)
 */
export function generateJWT(claims: JWTClaims, privateKey: string): string {
  const payload = {
    shopId: claims.shopId,
    mallId: claims.mallId,
    apiKey: claims.apiKey,
    publicKey: claims.publicKey,
    uid: claims.uid,
    purpose: claims.purpose || 'ssdm_consent',
    iat: Math.floor(Date.now() / 1000), // 발급 시간
    exp: Math.floor(Date.now() / 1000) + (5 * 60) // 5분 후 만료
  }

  return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
}

/**
 * JWT 토큰 검증 (RSA 공개키 사용)
 */
export function verifyJWT(token: string, publicKey: string): JWTClaims | null {
  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as JWTClaims
    return decoded
  } catch (error) {
    console.error('JWT 검증 실패:', error)
    return null
  }
}

/**
 * JWT 토큰에서 정보 추출 (검증 없이)
 */
export function decodeJWT(token: string): JWTClaims | null {
  try {
    const decoded = jwt.decode(token) as JWTClaims
    return decoded
  } catch (error) {
    console.error('JWT 디코딩 실패:', error)
    return null
  }
}

/**
 * JWT 만료 시간 확인
 */
export function isJWTExpired(token: string): boolean {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) {
    return true
  }
  
  return decoded.exp < Math.floor(Date.now() / 1000)
}


