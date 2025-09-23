'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

// Window 객체에 googleAuthPopup 속성 추가
declare global {
  interface Window {
    googleAuthPopup?: Window | null
  }
}
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { PRIVACY_CONFIG } from '@/lib/privacy-config'

interface AuthContextType {
  user: User | null
  loading: boolean
  cartItemCount: number
  isLoginComplete: boolean
  // 개인정보 시스템 연동 정보
  privacyUID: string | null
  privacyJWT: string | null
  consentStatus: 'none' | 'pending' | 'allowed' | 'denied'
  
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<any>
  loginWithGoogleWithTerms: (agreements: {
    termsAccepted: boolean
    privacyAccepted: boolean
    marketingAccepted: boolean
  }) => Promise<any>
  completeGoogleLogin: (agreements: {
    termsAccepted: boolean
    privacyAccepted: boolean
    marketingAccepted: boolean
  }) => Promise<void>
  deleteUserAccount: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  checkSignInMethods: (email: string) => Promise<{ signInMethods: string[], isGoogleOnly: boolean, registered: boolean }>
  updateCartCount: () => Promise<void>
  
  // 개인정보 시스템 연동 함수들
  requestPrivacyUIDAndJWT: () => Promise<{ uid: string, jwt: string }>
  requestUserInfo: (requiredFields: string[]) => Promise<any>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [cartItemCount, setCartItemCount] = useState(0)
  
  // 개인정보 시스템 연동 상태
  const [privacyUID, setPrivacyUID] = useState<string | null>(null)
  const [privacyJWT, setPrivacyJWT] = useState<string | null>(null)
  const [consentStatus, setConsentStatus] = useState<'none' | 'pending' | 'allowed' | 'denied'>('none')
  
  // 로그인 완료 상태
  const [isLoginComplete, setIsLoginComplete] = useState(false)


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        loadCartCount(user.uid)
        // 기존 로그인 상태 복원 시에만 완료 상태 설정
        if (!loading) {
          setIsLoginComplete(true)
        }
      } else {
        setCartItemCount(0)
        setIsLoginComplete(false)
        // 로그인하지 않은 상태에서 불필요한 스토리지 데이터 정리
        cleanupStorageOnLogout()
      }
    })

    return () => unsubscribe()
  }, [])

  const loadCartCount = async (userId: string) => {
    try {
      const { getCartItems } = await import('@/lib/firebase-realtime')
      const cartItems = await getCartItems(userId)
      const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
      console.log('AuthContext - 장바구니 수량 로딩:', totalCount, cartItems)
      setCartItemCount(totalCount)
    } catch (error) {
      console.error('장바구니 수량 로딩 에러:', error)
    }
  }

  const updateCartCount = async () => {
    if (!user) {
      setCartItemCount(0)
      return
    }

    await loadCartCount(user.uid)
  }

  // 로그아웃 시 스토리지 정리 함수
  const cleanupStorageOnLogout = () => {
    try {
      // localStorage에서 Firebase 관련 데이터만 정리 (Firebase는 자동으로 관리)
      const firebaseKeys = [
        'firebase:host:morebooks-49f1d-default-rtdb.asia-southeast1.firebasedatabase.app',
      ]
      
      firebaseKeys.forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Firebase 관련 동적 키들도 정리
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('firebase:host:') || 
            key.startsWith('firebase:authUser:') ||
            key.startsWith('firebase:config:')) {
          localStorage.removeItem(key)
        }
      })
      
      // sessionStorage에서 SSDM 관련 데이터 정리 (세션 기반이므로 탭 닫으면 자동 삭제)
      const sessionKeysToRemove = [
        'ssdm_connected',
        'ssdm_jwt', 
        'consentStatus',
      ]
      
      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key)
      })
      
      console.log('로그아웃 상태에서 스토리지 정리 완료 (localStorage: Firebase, sessionStorage: SSDM)')
    } catch (error) {
      console.error('스토리지 정리 중 오류:', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setIsLoginComplete(true)
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code))
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code))
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setCartItemCount(0)
      setIsLoginComplete(false)
      // 개인정보 시스템 연동 정보 초기화
      setPrivacyUID(null)
      setPrivacyJWT(null)
      setConsentStatus('none')
      
      // 모든 관련 스토리지 데이터 정리
      cleanupStorageOnLogout()
      
      console.log('로그아웃 완료 - 모든 로컬스토리지 데이터 정리됨')
    } catch (error: any) {
      throw new Error('로그아웃 중 오류가 발생했습니다')
    }
  }

  const loginWithGoogle = async () => {
    try {
      // 기존 팝업이 있다면 정리
      if (typeof window !== 'undefined' && window.googleAuthPopup) {
        window.googleAuthPopup.close()
        window.googleAuthPopup = null
      }

      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const userCredential = await signInWithPopup(auth, provider)
      return userCredential
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code))
    }
  }

  const loginWithGoogleWithTerms = async (agreements: {
    termsAccepted: boolean
    privacyAccepted: boolean
    marketingAccepted: boolean
  }) => {
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      
      // 약관동의 정보를 Realtime Database에 저장
      if (userCredential?.user?.uid) {
        await saveUserAgreements(userCredential.user.uid, userCredential.user.email || '', agreements)
      }
      
      return userCredential
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code))
    }
  }

  // 약관동의 완료 후 호출되는 함수
  const completeGoogleLogin = async (agreements: {
    termsAccepted: boolean
    privacyAccepted: boolean
    marketingAccepted: boolean
  }) => {
    try {
      if (user) {
        await saveUserAgreements(user.uid, user.email || '', agreements)
        setIsLoginComplete(true)
      }
    } catch (error) {
      console.error('약관동의 정보 저장 실패:', error)
      throw error
    }
  }

  const saveUserAgreements = async (userId: string, email: string, agreements: {
    termsAccepted: boolean
    privacyAccepted: boolean
    marketingAccepted: boolean
  }) => {
    try {
      const { ref, set, serverTimestamp } = await import('firebase/database')
      const { realtimeDb } = await import('@/lib/firebase')
      
      // 사용자 기본 정보 저장
      await set(ref(realtimeDb, `users/${userId}/profile`), {
        email: email,
        createdAt: serverTimestamp()
      })
      
      // 약관동의 정보 저장 (단일 동의 날짜)
      const agreementsData = {
        termsAccepted: agreements.termsAccepted,
        privacyAccepted: agreements.privacyAccepted,
        marketingAccepted: agreements.marketingAccepted,
        agreedAt: serverTimestamp() // 단일 동의 날짜
      }
      
      await set(ref(realtimeDb, `users/${userId}/agreements`), agreementsData)
      console.log('약관동의 정보 저장 완료:', agreementsData)
    } catch (error) {
      console.error('약관동의 정보 저장 실패:', error)
      throw error
    }
  }

  const deleteUserAccount = async () => {
    try {
      if (user) {
        await user.delete()
        console.log('사용자 계정 삭제 완료')
      }
    } catch (error) {
      console.error('사용자 계정 삭제 실패:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code))
    }
  }

  const checkSignInMethods = async (email: string): Promise<{ signInMethods: string[], isGoogleOnly: boolean, registered: boolean }> => {
    try {
      console.log('이메일 확인 시작:', email)
      
      const response = await fetch('/api/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      console.log('응답 상태:', response.status)
      
      if (!response.ok) {
        console.error('API 응답 에러:', response.status, response.statusText)
        return { signInMethods: [], isGoogleOnly: false, registered: false }
      }

      const data = await response.json()
      console.log('API 응답 데이터:', data)
      console.log('구글 전용 계정 여부:', data.isGoogleOnly)
      
      return {
        signInMethods: data.signInMethods || [],
        isGoogleOnly: data.isGoogleOnly || false,
        registered: data.registered || false
      }
    } catch (error: any) {
      console.error('사용자 확인 에러:', error)
      return { signInMethods: [], isGoogleOnly: false, registered: false }
    }
  }

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return '등록되지 않은 이메일입니다'
      case 'auth/wrong-password':
        return '비밀번호가 올바르지 않습니다'
      case 'auth/email-already-in-use':
        return '이미 가입된 계정입니다'
      case 'auth/weak-password':
        return '비밀번호는 6자 이상이어야 합니다'
      case 'auth/invalid-email':
        return '이메일 형식이 올바르지 않습니다'
      case 'auth/popup-closed-by-user':
        return 'Google 로그인이 취소되었습니다'
      case 'auth/network-request-failed':
        return '네트워크 오류가 발생했습니다'
      case 'auth/too-many-requests':
        return '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요'
      case 'auth/operation-not-allowed':
        return '이 인증 방법은 허용되지 않습니다'
      default:
        return '오류가 발생했습니다. 다시 시도해주세요'
    }
  }

  const requestPrivacyUIDAndJWT = async (): Promise<{ uid: string, jwt: string }> => {
    try {
      // 이메일에서 shopId 추출 (예: user@example.com → user)
      const emailParts = user!.email?.split('@') || []
      const shopId = emailParts[0] || user!.uid
      const { PRIVACY_CONFIG } = await import('@/lib/privacy-config')
      const mallId = PRIVACY_CONFIG.mallId
      
      if (!mallId) {
        throw new Error('Mall ID가 설정되지 않았습니다.')
      }
      
      // SSDM 연결 (API 라우트를 통해 연결)
      const { connectToSSDM } = await import('@/lib/ssdm-api')
      const popup = await connectToSSDM(shopId, mallId)
      
      if (!popup) {
        throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.')
      }
      
      console.log('SSDM 연결 완료:', shopId, mallId)
      
      // 팝업에서 JWT를 받아오는 로직은 별도로 구현 필요
      // 현재는 임시로 빈 값 반환
      return { uid: shopId, jwt: '' }
    } catch (error) {
      console.error('SSDM 연결 실패:', error)
      throw error
    }
  }

  // 새로운 함수: 개인정보 요청
  const requestUserInfo = async (requiredFields: string[]) => {
    try {
      if (!privacyJWT) {
        throw new Error('JWT 토큰이 없습니다.')
      }
      
      const { PrivacySystemClient } = await import('@/lib/privacy-config')
      const client = new PrivacySystemClient()
      const result = await client.requestUserInfo(privacyJWT, requiredFields)
      
      // SSDM에서 제공하는 추가 정보 활용
      console.log('세션 타입:', result.sessionType)
      console.log('허용된 필드:', result.allowedFields)
      console.log('만료 시간:', result.expiresAt)
      console.log('기능:', result.capabilities)
      
      return result // { viewerUrl, sessionId, allowedFields, ... }
    } catch (error) {
      console.error('개인정보 요청 실패:', error)
      throw error
    }
  }




  const value = {
    user,
    loading,
    cartItemCount,
    isLoginComplete,
    // 개인정보 시스템 연동 상태
    privacyUID,
    privacyJWT,
    consentStatus,
    
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithGoogleWithTerms,
    completeGoogleLogin,
    deleteUserAccount,
    resetPassword,
    checkSignInMethods,
    updateCartCount,
    
    // 개인정보 시스템 연동 함수들
    requestPrivacyUIDAndJWT,
    requestUserInfo
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}