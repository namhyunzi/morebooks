/**
 * SSDM (개인정보 보호 시스템) API 통신 관련 유틸리티 함수들
 */

export interface SSDMConfig {
  apiKey: string
  baseUrl: string
}

export interface SSDMConnectionParams {
  shopId: string
  mallId: string
}

export interface SSDMResponse {
  status: 'success' | 'failed'
  jwt?: string
  expiresIn?: number
  uid?: string
  error?: string
}

// SSDM 시스템 설정 - API Key만 필요
export const SSDM_CONFIG: SSDMConfig = {
  apiKey: process.env.NEXT_PUBLIC_PRIVACY_SYSTEM_API_KEY || process.env.PRIVACY_SYSTEM_API_KEY || 'demo-api-key-12345', // 클라이언트/서버 모두 지원
  baseUrl: process.env.NEXT_PUBLIC_PRIVACY_SYSTEM_BASE_URL || process.env.PRIVACY_SYSTEM_BASE_URL || 'https://ssdm-demo.vercel.app', // 클라이언트/서버 모두 지원
}

/**
 * SSDM 연결 URL 생성
 */
export function generateSSDMConnectionUrl(params: SSDMConnectionParams): string {
  const { shopId, mallId } = params
  const baseUrl = SSDM_CONFIG.baseUrl
  
  console.log('SSDM 설정 확인:', {
    baseUrl,
    apiKey: SSDM_CONFIG.apiKey ? '설정됨' : '없음',
    shopId,
    mallId
  })
  
  if (!baseUrl) {
    throw new Error('PRIVACY_SYSTEM_BASE_URL이 설정되지 않았습니다.')
  }
  
  const url = new URL(`${baseUrl}/consent`)
  url.searchParams.append('shopId', shopId)
  url.searchParams.append('mallId', mallId)
  
  console.log('생성된 SSDM URL:', url.toString())
  return url.toString()
}

/**
 * 쇼핑몰에서 SSDM으로 사용자 연결 (팝업 또는 새창)
 */
export function connectToSSDM(shopId: string, mallId: string): Window | null {
  try {
    const params: SSDMConnectionParams = {
      shopId,
      mallId
    }
    
    console.log('SSDM 연결 시도:', { shopId, mallId })
    
    const connectionUrl = generateSSDMConnectionUrl(params)
    
    // 팝업으로 SSDM 페이지 열기
    const popup = window.open(
      connectionUrl,
      'ssdm_consent',
      'width=600,height=800,scrollbars=yes,resizable=yes'
    )
    
    if (!popup) {
      alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.')
      return null
    }
    
    console.log('SSDM 연결 페이지 열림:', connectionUrl)
    return popup
  } catch (error) {
    console.error('▶▶ SSDM 연결 실패:', error)
    alert(`SSDM 연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    return null
  }
}

/**
 * URL 파라미터에서 SSDM 응답 파싱
 */
export function parseSSDMResponse(searchParams: URLSearchParams): SSDMResponse | null {
  const status = searchParams.get('status')
  
  if (!status) {
    return null
  }
  
  if (status === 'success') {
    const jwt = searchParams.get('jwt')
    const expiresIn = searchParams.get('expiresIn')
    const uid = searchParams.get('uid')
    
    return {
      status: 'success',
      jwt: jwt || undefined,
      expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
      uid: uid || undefined
    }
  } else if (status === 'failed') {
    const error = searchParams.get('error')
    
    return {
      status: 'failed',
      error: error || 'unknown_error'
    }
  }
  
  return null
}

/**
 * SSDM으로부터 받은 JWT 검증 (택배사 API 호출용)
 */
export async function validateSSDMJWT(jwt: string): Promise<boolean> {
  try {
    // JWT 기본 구조 확인
    const parts = jwt.split('.')
    if (parts.length !== 3) {
      return false
    }
    
    // payload 디코딩 (검증용)
    const payload = JSON.parse(atob(parts[1]))
    
    // 기본 필드 확인
    if (!payload.uid || !payload.mallId) {
      return false
    }
    
    // 만료 시간 확인
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false
    }
    
    console.log('JWT 검증 성공:', {
      uid: payload.uid,
      mallId: payload.mallId,
      expiresAt: new Date(payload.exp * 1000)
    })
    
    return true
  } catch (error) {
    console.error('JWT 검증 실패:', error)
    return false
  }
}

/**
 * 택배사에 SSDM JWT 전달 (개인정보 접근 권한 부여)
 */
export async function sendJWTToDeliveryService(jwt: string, orderId: string): Promise<boolean> {
  try {
    // 여기서는 모의 택배사 API 호출
    console.log('택배사에 JWT 전달:', {
      jwt,
      orderId,
      message: '이 JWT로 고객의 개인정보에 접근할 수 있습니다 (15분간 유효)'
    })
    
    // 실제 구현 시에는 택배사 API 엔드포인트로 요청
    /*
    const response = await fetch('/api/delivery/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({ 
        orderId,
        accessToken: jwt
      })
    })
    
    return response.ok
    */
    
    return true
  } catch (error) {
    console.error('택배사 JWT 전달 실패:', error)
    return false
  }
}

/**
 * SSDM 연결 결과 처리
 */
export function handleSSDMResult(
  searchParams: URLSearchParams,
  onSuccess: (response: SSDMResponse) => void,
  onError: (error: string) => void
): void {
  const response = parseSSDMResponse(searchParams)
  
  if (!response) {
    return // SSDM 응답이 아님
  }
  
  // URL에서 SSDM 파라미터 제거
  const url = new URL(window.location.href)
  url.searchParams.delete('status')
  url.searchParams.delete('jwt')
  url.searchParams.delete('expiresIn')
  url.searchParams.delete('uid')
  url.searchParams.delete('error')
  window.history.replaceState({}, document.title, url.toString())
  
  if (response.status === 'success') {
    console.log('SSDM 연결 성공:', response)
    onSuccess(response)
  } else {
    console.log('SSDM 연결 실패:', response.error)
    onError(response.error || 'unknown_error')
  }
}

/**
 * 에러 메시지 한국어 변환
 */
export function getSSDMErrorMessage(error: string): string {
  switch (error) {
    case 'user_denied':
      return '사용자가 개인정보 제공을 거부했습니다.'
    case 'expired_session':
      return '세션이 만료되었습니다. 다시 시도해주세요.'
    case 'invalid_mall':
      return '유효하지 않은 쇼핑몰입니다.'
    case 'invalid_user':
      return '유효하지 않은 사용자입니다.'
    case 'consent_required':
      return '개인정보 제공 동의가 필요합니다.'
    default:
      return '개인정보 보호 시스템 연결 중 오류가 발생했습니다.'
  }
}


