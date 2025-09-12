// 개인정보 시스템 연동 설정 - API Key만 필요
export const PRIVACY_CONFIG = {
  baseUrl: process.env.PRIVACY_SYSTEM_BASE_URL!, // SSDM 시스템 URL
  apiKey: process.env.PRIVACY_SYSTEM_API_KEY!, // 이것만 있으면 됨
  mallId: process.env.MALL_ID || 'morebooks', // 쇼핑몰 ID
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

  // 1. generateUID - SSDM에서 받은 UID를 그대로 사용
  async generateUID(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/generate-uid`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    })
    
    if (!response.ok) {
      throw new Error(`UID 생성 실패: ${response.status}`)
    }
    
    const result = await response.json()
    // SSDM에서 받은 UID를 그대로 사용
    return { uid: result.uid }
  }

  // 2. issueJWT (이미 올바름)
  async issueJWT(uid: string, sessionType: 'paper' | 'qr') {
    const response = await fetch(`${this.baseUrl}/api/issue-jwt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ uid, sessionType })
    });
    
    if (!response.ok) {
      throw new Error('JWT 발급 실패');
    }
    
    return await response.json(); // { jwt: string, expiresIn: number, sessionType: string }
  }

  // 3. 새로운 메서드 추가: 개인정보 요청
  async requestUserInfo(jwt: string, requiredFields: string[]) {
    const response = await fetch(`${this.baseUrl}/api/request-info`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jwt, requiredFields })
    });
    
    if (!response.ok) {
      throw new Error('개인정보 요청 실패');
    }
    
    return await response.json(); // { success: true, viewerUrl: string, sessionId: string, ... }
  }
}

export { PrivacySystemClient }
