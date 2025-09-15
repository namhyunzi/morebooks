import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Firebase Admin 초기화 (중복 초기화 방지)
if (!getApps().length) {
  // 환경변수 디버깅
  console.log('환경변수 확인:')
  console.log('FIREBASE_SERVICE_ACCOUNT_KEY 존재:', !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  console.log('FIREBASE_SERVICE_ACCOUNT_KEY 길이:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length)
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  
  // 환경변수에서 서비스 계정 키를 가져오거나, 기본 설정 사용
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('서비스 계정 키로 초기화 시도...')
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      console.log('JSON 파싱 성공, project_id:', serviceAccount.project_id)
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'morebooks-49f1d'
      })
      console.log('Firebase Admin 초기화 성공!')
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('개별 환경변수로 초기화 시도...')
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'morebooks-49f1d',
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID || '',
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL?.replace('@', '%40')}`,
        universe_domain: "googleapis.com"
      }
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'morebooks-49f1d'
      })
      console.log('Firebase Admin 초기화 성공!')
    } else {
      console.log('서비스 계정 키가 없어서 기본 설정으로 초기화 시도...')
      // 개발 환경에서는 Application Default Credentials 사용
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'morebooks-49f1d'
      })
    }
  } catch (error) {
    console.error('Firebase Admin 초기화 실패:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, action, requiredFields } = await request.json()
    console.log('API 요청 받음:', { email, action, requiredFields })

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // action에 따라 다른 처리
    switch (action) {
      case 'check_user':
        return await checkFirebaseUser(email)
      case 'request_uid_jwt':
        return await requestUidAndJwt(email)
      case 'validate_consent':
        return await validateUserConsent(email, requiredFields || [])
      default:
        return await checkFirebaseUser(email) // 기본값은 기존 동작
    }

  } catch (error) {
    console.error('API 처리 중 에러:', error)
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      signInMethods: [],
      isGoogleOnly: false
    }, { status: 500 })
  }
}

// 기존 Firebase Auth 사용자 확인 함수
async function checkFirebaseUser(email: string) {
  try {
    // Firebase Admin SDK로 사용자 조회
    const auth = getAuth()
    const userRecord = await auth.getUserByEmail(email)
    
    console.log('사용자 정보:', {
      uid: userRecord.uid,
      email: userRecord.email,
      providers: userRecord.providerData.map(p => ({
        providerId: p.providerId,
        uid: p.uid,
        email: p.email
      }))
    })

    // providerData에서 제공업체 확인
    const signInMethods = userRecord.providerData.map(provider => provider.providerId)
    console.log('프로바이더 데이터:', signInMethods)
    
    // 구글만으로 가입된 계정인지 확인 (password 프로바이더가 없고 google.com만 있는 경우)
    const hasGoogleProvider = signInMethods.includes('google.com')
    const hasPasswordProvider = signInMethods.includes('password')
    const isGoogleOnly = hasGoogleProvider && !hasPasswordProvider
    
    console.log('프로바이더 분석:', {
      hasGoogleProvider,
      hasPasswordProvider,
      isGoogleOnly,
      allProviders: signInMethods
    })
    
    return NextResponse.json({
      signInMethods,
      isGoogleOnly,
      registered: true,
      providers: userRecord.providerData
    })

  } catch (adminError: any) {
    console.log('Admin SDK 에러:', adminError.code)
    
    if (adminError.code === 'auth/user-not-found') {
      // 등록되지 않은 사용자
      return NextResponse.json({
        signInMethods: [],
        isGoogleOnly: false,
        registered: false
      })
    } else {
      throw adminError
    }
  }
}

// UID 요청 및 JWT 발급 함수
async function requestUidAndJwt(email: string) {
  try {
    // 1. Firebase Auth 사용자 확인
    const auth = getAuth()
    const userRecord = await auth.getUserByEmail(email)
    
    if (!userRecord) {
      return NextResponse.json({ 
        error: '등록되지 않은 사용자입니다' 
      }, { status: 404 })
    }

    const userId = userRecord.uid

    // 2. 이메일에서 shopId 추출 (예: user@example.com → user)
    const emailParts = userRecord.email?.split('@') || []
    const shopId = emailParts[0] || userRecord.uid
    const { PRIVACY_CONFIG } = await import('@/lib/privacy-config')
    const mallId = PRIVACY_CONFIG.mallId

    // 3. JWT 생성 (서버사이드에서 API 키로 생성)
    const { generateJWT } = await import('@/lib/jwt-utils')
    const apiKey = PRIVACY_CONFIG.apiKey
    
    const jwt = generateJWT({ shopId, mallId }, apiKey)
    
    console.log('JWT 생성 완료:', { shopId, mallId })

    return NextResponse.json({
      success: true,
      shopId,
      mallId,
      jwt,
      expiresIn: 15 * 60, // 15분
      userInfo: {
        email: userRecord.email,
        uid: userRecord.uid
      }
    })

  } catch (error) {
    console.error('UID/JWT 요청 실패:', error)
    return NextResponse.json({ 
      error: 'UID/JWT 요청 중 오류가 발생했습니다',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 사용자 동의 확인 함수
async function validateUserConsent(email: string, requiredFields: string[]) {
  try {
    // 1. Firebase Auth 사용자 확인
    const auth = getAuth()
    const userRecord = await auth.getUserByEmail(email)
    
    if (!userRecord) {
      return NextResponse.json({ 
        error: '등록되지 않은 사용자입니다' 
      }, { status: 404 })
    }

    // 2. 이메일에서 shopId 추출 (예: user@example.com → user)
    const emailParts = userRecord.email?.split('@') || []
    const shopId = emailParts[0] || userRecord.uid
    const { PRIVACY_CONFIG } = await import('@/lib/privacy-config')
    const mallId = PRIVACY_CONFIG.mallId

    // 3. JWT 생성 (동의 확인용)
    const { generateJWT } = await import('@/lib/jwt-utils')
    const apiKey = PRIVACY_CONFIG.apiKey
    const jwt = generateJWT({ shopId, mallId }, apiKey)
    
    console.log('JWT 생성 완료 (동의 확인용):', { shopId, mallId })

    return NextResponse.json({
      success: true,
      shopId,
      mallId,
      jwt,
      expiresIn: 15 * 60, // 15분
      consentStatus: 'pending', // 기본값
      allowedFields: [],
      expiresAt: null,
      userInfo: {
        email: userRecord.email,
        uid: userRecord.uid
      }
    })

  } catch (error) {
    console.error('동의 확인 실패:', error)
    return NextResponse.json({ 
      error: '동의 확인 중 오류가 발생했습니다',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}