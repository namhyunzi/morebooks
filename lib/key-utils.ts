/**
 * 쇼핑몰용 RSA 키 쌍 생성 및 관리 유틸리티
 */

import crypto from 'crypto'

export interface KeyPair {
  publicKey: string
  privateKey: string
}

/**
 * RSA 키 쌍 생성 (2048비트)
 */
export function generateKeyPair(): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  })

  return {
    publicKey,
    privateKey
  }
}

/**
 * 환경변수에서 키 쌍 가져오기
 */
export function getKeyPair(): KeyPair {
  // 환경변수에서 키 쌍 확인
  const publicKey = process.env.SHOP_PUBLIC_KEY
  const privateKey = process.env.SHOP_PRIVATE_KEY

  if (publicKey && privateKey) {
    return { publicKey, privateKey }
  }

  // 운영 환경에서는 키 쌍이 반드시 필요
  if (process.env.NODE_ENV === 'production') {
    throw new Error('운영 환경에서는 SHOP_PUBLIC_KEY와 SHOP_PRIVATE_KEY 환경변수가 필요합니다.')
  }

  // 개발 환경에서만 키 쌍 자동 생성
  console.warn('⚠️  개발 환경: 쇼핑몰용 키 쌍이 없어서 새로 생성합니다...')
  const keyPair = generateKeyPair()
  
  console.log('🔑 새로 생성된 키 쌍:')
  console.log('Public Key:', keyPair.publicKey)
  console.log('Private Key:', keyPair.privateKey)
  console.log('\n📝 환경변수에 다음을 추가하세요 (.env.local 파일):')
  console.log(`SHOP_PUBLIC_KEY="${keyPair.publicKey}"`)
  console.log(`SHOP_PRIVATE_KEY="${keyPair.privateKey}"`)
  console.log('\n⚠️  운영 환경에서는 반드시 미리 생성된 키 쌍을 사용해야 합니다!')

  return keyPair
}

/**
 * 개발용 키 쌍 생성 (환경변수 설정용)
 */
export function generateKeyPairForEnv(): void {
  const keyPair = generateKeyPair()
  
  console.log('🔑 쇼핑몰용 키 쌍이 생성되었습니다:')
  console.log('\n📝 .env.local 파일에 다음을 추가하세요:')
  console.log(`SHOP_PUBLIC_KEY="${keyPair.publicKey}"`)
  console.log(`SHOP_PRIVATE_KEY="${keyPair.privateKey}"`)
  console.log('\n⚠️  이 키들은 안전하게 보관하고 공개하지 마세요!')
}

/**
 * 공개키를 PEM 형식에서 한 줄로 변환
 */
export function formatPublicKeyForJWT(publicKey: string): string {
  return publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\n/g, '')
    .trim()
}
