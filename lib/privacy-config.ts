// 개인정보 시스템 연동 설정 - 환경변수 기반
export const PRIVACY_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_SSDM_URL,
  apiKey: process.env.PRIVACY_SYSTEM_API_KEY,
  mallId: process.env.MALL_ID,
  publicKey: process.env.SHOP_PUBLIC_KEY, // 쇼핑몰 공개키
  privateKey: process.env.SHOP_PRIVATE_KEY, // 쇼핑몰 개인키
  sessionTypes: {
    paper: { name: '종이송장', ttl: 3600 },
    qr: { name: 'QR송장', ttl: 43200 }
  }
}

class PrivacySystemClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = PRIVACY_CONFIG.baseUrl
    this.apiKey = PRIVACY_CONFIG.apiKey
  }

  // 개인정보 요청 - 쇼핑몰에서 SSDM으로부터 받은 JWT로 개인정보 요청
  async requestUserInfo(jwt: string, requiredFields: string[]) {
    const response = await fetch('/api/ssdm/request-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jwt, requiredFields })
    });
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`개인정보 요청 실패: ${errorData.error || response.status}`);
    }
    
    return await response.json(); // { success: true, viewerUrl: string, sessionId: string, ... }
  }
}

export { PrivacySystemClient }
