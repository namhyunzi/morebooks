/**
 * SSDM (개인정보 보호 시스템) API 통신 관련 유틸리티 함수들
 */

export interface SSDMConfig {
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

// SSDM 시스템 설정 - 클라이언트용 (API Key는 서버사이드에서만 사용)
export const SSDM_CONFIG: SSDMConfig = {
  baseUrl: process.env.NEXT_PUBLIC_SSDM_URL || 'https://ssmd-smoky.vercel.app', // 클라이언트용
  // apiKey는 서버사이드에서만 사용
}

/**
 * JWT 토큰 생성 (서버사이드에서 API 키로 생성)
 */
export async function generateSSDMJWT(params: SSDMConnectionParams): Promise<{ jwt: string, expiresIn: number }> {
  const { shopId, mallId } = params
  
  try {
    console.log('API 호출 시작:', { shopId, mallId })
    
    // 서버사이드 API 라우트를 통해 안전하게 JWT 생성
    const response = await fetch('/api/ssdm/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ shopId, mallId })
    })
    
    console.log('API 응답 상태:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('API 에러 응답:', errorData)
      throw new Error(`JWT 생성 실패: ${errorData.error || response.status}`)
    }
    
    const result = await response.json()
    console.log('JWT 생성 성공:', {
      shopId: result.shopId,
      mallId: result.mallId,
      expiresIn: result.expiresIn,
      jwtLength: result.jwt?.length
    })
    
    return {
      jwt: result.jwt,
      expiresIn: result.expiresIn
    }
    
  } catch (error) {
    console.error('JWT 생성 실패:', error)
    console.error('에러 타입:', typeof error)
    console.error('에러 메시지:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * 쇼핑몰에서 SSDM으로 사용자 연결 (JWT 기반)
 */
export async function connectToSSDM(
  shopId: string, 
  mallId: string,
  onConsentResult?: (result: { agreed: boolean, consentType: string, jwt?: string }) => void,
  path: string = '/consent'  // 기본값은 /consent, 호출할 때 다른 경로 전달 가능
): Promise<Window | null> {
  try {
    const params: SSDMConnectionParams = {
      shopId,
      mallId
    }
    
    // 서버사이드에서 안전하게 JWT 생성
    console.log('JWT 생성 시도:', params)
    const jwtResult = await generateSSDMJWT(params)
    console.log('JWT 생성 성공:', jwtResult)
    
    console.log('SSDM JWT 생성 완료:', {
      shopId,
      mallId,
      expiresIn: jwtResult.expiresIn
    })
    
    // SSDM 연결 URL 생성 (경로만 파라미터로 받음)
    const baseUrl = SSDM_CONFIG.baseUrl
    const url = `${baseUrl}${path}`  // path 파라미터로 경로 설정
    
    // 디버깅: URL 확인
    console.log('생성된 URL:', url)
    console.log('baseUrl:', baseUrl)
    console.log('path:', path)
    
    // 팝업으로 SSDM 페이지 열기
    const popup = window.open(
      url,
      'login',
      'width=560,height=770'
    )
    
    if (!popup) {
      alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.')
      return null
    }
    
    // 팝업 열자마자 즉시 postMessage로 JWT 전달
    const ssdmOrigin = new URL(SSDM_CONFIG.baseUrl).origin
    console.log("ssdmOrigin 팝업열떄 ",ssdmOrigin);
    
    // 팝업이 로드 완료된 후 JWT 전송
    const sendJWT = () => {
      console.log('팝업 로드 완료, JWT 전송 시작');
      console.log('전송할 JWT:', jwtResult.jwt.substring(0, 50) + '...');
      console.log('전송할 targetOrigin:', ssdmOrigin);
      
      try {
        popup.postMessage({
          type: path === '/info-preview' ? 'init_preview' : 'init_consent',  // 경로에 따라 타입 변경
          jwt: jwtResult.jwt
        }, ssdmOrigin)
        console.log('JWT 전송 성공');
      } catch (error) {
        console.error('JWT 전송 실패:', error);
      }
    }
    
    // 팝업이 준비될 시간을 주고 JWT 전송 (cross-origin 문제 해결)
    setTimeout(() => {
      if (!popup.closed) {
        sendJWT();
      }
    }, 1000);
    
    // 백업으로 더 긴 시간 후에도 시도
    setTimeout(() => {
      if (!popup.closed) {
        sendJWT();
      }
    }, 3000);
    
    // SSDM 도메인에서 오는 메시지 리스너 추가
    const messageHandler = (event: MessageEvent) => {
      // 보안: SSDM 도메인에서만 메시지 수신 허용
      const ssdmOrigin = new URL(SSDM_CONFIG.baseUrl).origin;
      
      // 개발 환경에서는 더 유연한 검증 (실제 배포 시에는 엄격하게)
      const isAllowedOrigin = (event as any).origin === ssdmOrigin || 
                             (event as any).origin.includes('ssmd-smoky.vercel.app') ||
                             (event as any).origin.includes('localhost');
      
      if (!isAllowedOrigin) {
        return; // 로그 없이 조용히 무시
      }
      
      console.log('SSDM에서 메시지 수신:', event.data);
      
      // SSDM 동의 결과 처리 (isActive 필드로 판단)
      if (event.data && typeof event.data.isActive !== 'undefined') {
        const { isActive, consentType, jwt } = event.data
        
        console.log('SSDM 동의 결과:', { isActive, consentType })
        
        // 팝업 닫기
        if (popup && !popup.closed) {
          popup.close()
        }
        
        // 메시지 리스너 제거
        window.removeEventListener('message', messageHandler)
        
        // 콜백 함수 호출
        if (onConsentResult) {
          onConsentResult({ agreed: isActive, consentType, jwt })
        }
      }
      
      // 팝업 닫기 요청 처리
      if (event.data && event.data.type === 'close_popup') {
        console.log('SSDM에서 팝업 닫기 요청')
        
        if (popup && !popup.closed) {
          popup.close()
        }
        
        // 메시지 리스너 제거
        window.removeEventListener('message', messageHandler)
      }
    }
    
    // 메시지 리스너 등록
    window.addEventListener('message', messageHandler)
    
    // 팝업이 수동으로 닫힌 경우 리스너 정리
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        console.log('SSDM 팝업이 수동으로 닫힘')
        window.removeEventListener('message', messageHandler)
        clearInterval(checkClosed)
      }
    }, 1000)
    
    console.log('SSDM 연결 페이지 열림 (JWT는 postMessage로 전달됨):', url.toString())
    return popup
    
  } catch (error) {
    console.error('SSDM 연결 실패:', error)
    console.error('에러 상세:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      error: error
    })
    alert(`SSDM 연결에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    // JWT는 URL 파라미터에서 가져옴
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
    // JWT 유틸리티를 사용한 검증
    const { decodeJWT, isJWTExpired } = await import('@/lib/jwt-utils')
    
    // JWT 디코딩
    const payload = decodeJWT(jwt)
    if (!payload) {
      return false
    }
    
    // 기본 필드 확인
    if (!payload.shopId || !payload.mallId) {
      return false
    }
    
    // 만료 시간 확인
    if (isJWTExpired(jwt)) {
      return false
    }
    
    console.log('JWT 검증 성공:', {
      shopId: payload.shopId,
      mallId: payload.mallId,
      purpose: payload.purpose,
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : 'N/A'
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
    // JWT 유효성 검증
    const isValidJWT = await validateSSDMJWT(jwt)
    if (!isValidJWT) {
      console.error('유효하지 않은 JWT:', jwt)
      return false
    }

    // 택배사 API 호출
    const response = await fetch('/api/notify-delivery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({ 
        orderId,
        accessToken: jwt,
        purpose: 'delivery_authorization'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('택배사 JWT 전달 실패:', response.status, errorText)
      return false
    }

    const result = await response.json()
    console.log('택배사 JWT 전달 성공:', {
      orderId,
      deliveryCompany: result.deliveryCompany,
      trackingNumber: result.trackingNumber,
      message: '이 JWT로 고객의 개인정보에 접근할 수 있습니다 (15분간 유효)'
    })
    
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
  
  // URL에서 SSDM 파라미터 제거 (JWT는 URL 파라미터에서 가져오므로 URL에서 제거)
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

/**
 * SSDM 동의 팝업을 열고 결과를 처리하는 헬퍼 함수
 */
export async function openSSDMConsentPopup(
  shopId: string, 
  mallId: string
): Promise<{ agreed: boolean, consentType: string, jwt?: string } | null> {
  return new Promise((resolve) => {
    connectToSSDM(shopId, mallId, (result) => {
      resolve(result)
    })
  })
}


