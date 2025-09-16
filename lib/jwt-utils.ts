import jwt from 'jsonwebtoken'

export function generateJWT(payload: any, apiKey: string): string {
  try {
    console.log('JWT 생성 시작:', {
      payloadKeys: Object.keys(payload),
      apiKeyLength: apiKey.length,
      apiKeyStart: apiKey.substring(0, 20) + '...'
    })
    
    const token = jwt.sign(payload, apiKey, {
      algorithm: 'HS256',
      expiresIn: '5m' // 5분
    })
    
    console.log('JWT 생성 성공:', {
      tokenLength: token.length,
      tokenStart: token.substring(0, 50) + '...'
    })
    
    return token
  } catch (error) {
    console.error('JWT 생성 에러 상세:', error)
    console.error('에러 타입:', typeof error)
    console.error('에러 메시지:', error instanceof Error ? error.message : 'Unknown error')
    throw new Error(`JWT 생성에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function verifyJWT(token: string, apiKey: string): any {
  try {
    const decoded = jwt.verify(token, apiKey, {
      algorithms: ['HS256']
    })
    return decoded
  } catch (error) {
    console.error('JWT 검증 에러:', error)
    throw new Error('JWT 검증에 실패했습니다')
  }
}

export function decodeJWT(token: string): any {
  try {
    return jwt.decode(token)
  } catch (error) {
    console.error('JWT 디코딩 에러:', error)
    throw new Error('JWT 디코딩에 실패했습니다')
  }
}

export function isJWTExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded || !decoded.exp) {
      return true
    }
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    console.error('JWT 만료 확인 에러:', error)
    return true
  }
}