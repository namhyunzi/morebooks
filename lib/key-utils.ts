export function getKeyPair() {
  // 환경변수에서 키 쌍 가져오기
  const publicKey = process.env.SHOP_PUBLIC_KEY
  const privateKey = process.env.SHOP_PRIVATE_KEY
  
  if (!publicKey || !privateKey) {
    throw new Error('Public key or private key not configured')
  }
  
  return { publicKey, privateKey }
}

export function formatPublicKeyForJWT(publicKey: string): string {
  // PEM 형식으로 포맷팅
  if (publicKey.includes('-----BEGIN PUBLIC KEY-----')) {
    return publicKey
  }
  
  // PEM 헤더/푸터가 없으면 추가
  return `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`
}