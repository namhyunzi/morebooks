import { verifyJWT } from '@/lib/jwt-utils'

export async function verifyPartnerJWT(jwt: string) {
  try {
    if (!jwt) {
      throw new Error('JWT 토큰이 필요합니다.')
    }

    // 서버에서 JWT 검증
    const apiKey = process.env.PRIVACY_SYSTEM_API_KEY
    if (!apiKey) {
      throw new Error('PRIVACY_SYSTEM_API_KEY가 설정되지 않았습니다.')
    }

    const decoded = verifyJWT(jwt, apiKey)
    
    // delegateJwt만 반환
    return { 
      valid: true,
      delegateJwt: decoded.delegateJwt 
    }
    
  } catch (error) {
    console.error('JWT 검증 실패:', error)
    return { 
      valid: false,
      error: error instanceof Error ? error.message : 'JWT 검증에 실패했습니다.'
    }
  }
}
