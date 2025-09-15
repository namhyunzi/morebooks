import jwt from 'jsonwebtoken'

export function generateJWT(payload: any, privateKey: string): string {
  try {
    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '5m' // 5분
    })
    return token
  } catch (error) {
    console.error('JWT 생성 에러:', error)
    throw new Error('JWT 생성에 실패했습니다')
  }
}

export function verifyJWT(token: string, publicKey: string): any {
  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    })
    return decoded
  } catch (error) {
    console.error('JWT 검증 에러:', error)
    throw new Error('JWT 검증에 실패했습니다')
  }
}