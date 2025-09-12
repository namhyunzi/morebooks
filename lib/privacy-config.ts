// 개인정보 시스템 연동 설정 - API Key만 필요
export const PRIVACY_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_PRIVACY_SYSTEM_BASE_URL || process.env.PRIVACY_SYSTEM_BASE_URL || 'https://ssdm-demo.vercel.app', // 클라이언트/서버 모두 지원
  apiKey: process.env.NEXT_PUBLIC_PRIVACY_SYSTEM_API_KEY || process.env.PRIVACY_SYSTEM_API_KEY || 'demo-api-key-12345', // 클라이언트/서버 모두 지원
  mallId: process.env.NEXT_PUBLIC_MALL_ID || process.env.MALL_ID || 'morebooks', // 쇼핑몰 ID
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

  // 1. generateUID - 내부 API 라우트를 통해 SSDM API 호출
  async generateUID(userId: string) {
    const response = await fetch('/api/ssdm/generate-uid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`UID 생성 실패: ${errorData.error || response.status}`)
    }
    
    const result = await response.json()
    return { uid: result.uid }
  }

  // 2. issueJWT - 내부 API 라우트를 통해 SSDM API 호출
  async issueJWT(uid: string) {
    const response = await fetch('/api/ssdm/issue-jwt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uid })
    });
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`JWT 발급 실패: ${errorData.error || response.status}`);
    }
    
    return await response.json(); // { jwt: string, expiresIn: number }
  }

  // 3. 개인정보 요청 - 내부 API 라우트를 통해 SSDM API 호출
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
