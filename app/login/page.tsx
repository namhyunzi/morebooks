'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Header from "@/components/header"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { useRouter } from "next/navigation"
import TermsAgreementModal from "@/components/terms-agreement-modal"

export default function LoginPage() {
  const { login, loginWithGoogle, completeGoogleLogin, deleteUserAccount, checkSignInMethods } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null)
  const router = useRouter()

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return '필수 입력 항목입니다.'
    }
    // 다중 도메인 지원 이메일 유효성 검사: user@domain.com 또는 user@subdomain.domain.com
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/
    if (!emailRegex.test(email)) {
      return '이메일 형식이 올바르지 않습니다.'
    }
    return ''
  }

  const checkEmailProvider = async (email: string) => {
    if (!email || validateEmail(email)) {
      return // 이메일이 없거나 형식이 잘못되면 확인하지 않음
    }

    try {
      const { isGoogleOnly } = await checkSignInMethods(email)
      
      if (isGoogleOnly) {
        setEmailError('구글로 가입된 계정입니다. \'구글\' 버튼을 눌러 로그인해주세요.')
      } else {
        setEmailError('')
      }
    } catch (error) {
      // 에러 발생 시 무시 (네트워크 문제 등)
      console.error('이메일 확인 중 오류:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setEmailError('')

    // 유효성 검사
    const emailErr = validateEmail(email)
    if (emailErr) {
      setEmailError(emailErr)
      setLoading(false)
      return
    }

    try {
      // 이미 이메일 필드에서 구글 계정 에러가 표시되었다면 로그인 시도하지 않음
      if (emailError && emailError.includes('구글로 가입된 계정입니다')) {
        setLoading(false)
        return
      }

      await login(email, password)
      router.push('/')
    } catch (error: any) {
      console.error('로그인 에러:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const userCredential = await loginWithGoogle()
      
      // 기존 사용자인지 확인 (약관동의 정보가 있는지 확인)
      const hasExistingAgreements = await checkUserAgreements(userCredential.user.uid)
      
      if (hasExistingAgreements) {
        // 기존 사용자 - 즉시 완료 처리
        await completeGoogleLogin({
          termsAccepted: true,
          privacyAccepted: true,
          marketingAccepted: true
        })
        router.push('/')
      } else {
        // 신규 사용자 - 약관동의 모달 표시
        setPendingGoogleUser(userCredential)
        setShowTermsModal(true)
      }
      
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const checkUserAgreements = async (userId: string) => {
    try {
      const { ref, get } = await import('firebase/database')
      const { realtimeDb } = await import('@/lib/firebase')
      
      const agreementsRef = ref(realtimeDb, `users/${userId}/agreements`)
      const snapshot = await get(agreementsRef)
      
      return snapshot.exists()
    } catch (error) {
      console.error('약관동의 확인 실패:', error)
      return false
    }
  }

  const handleTermsAgree = async (agreements: {
    termsAccepted: boolean
    privacyAccepted: boolean
    marketingAccepted: boolean
  }) => {
    if (!pendingGoogleUser) return

    try {
      setLoading(true)
      
      // 약관동의 완료 후 최종 로그인 완료 처리
      await completeGoogleLogin(agreements)
      
      // 모달 닫기
      setShowTermsModal(false)
      setPendingGoogleUser(null)
      
      // 메인 페이지로 이동
      router.push('/')
      
    } catch (error: any) {
      setError(error.message)
      // 에러 발생 시 계정 삭제
      try {
        await deleteUserAccount()
      } catch (deleteError) {
        console.error('계정 삭제 실패:', deleteError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTermsCancel = async () => {
    if (pendingGoogleUser) {
      try {
        // 계정 삭제
        await deleteUserAccount()
      } catch (error) {
        console.error('계정 삭제 실패:', error)
      }
    }
    
    setShowTermsModal(false)
    setPendingGoogleUser(null)
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
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) {
                    const basicError = validateEmail(e.target.value)
                    if (basicError) {
                      setEmailError(basicError)
                    } else {
                      setEmailError('') // 기본 에러 클리어
                    }
                  }
                }}
                onBlur={async () => {
                  const basicError = validateEmail(email)
                  if (basicError) {
                    setEmailError(basicError)
                  } else {
                    // 기본 유효성 검사 통과 시 구글 계정 확인
                    await checkEmailProvider(email)
                  }
                }}
                className={`mt-1 focus:border-[#A2B38B] focus:ring-[#A2B38B] ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={loading}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                required
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#A2B38B] hover:bg-[#8fa076] text-white"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-gray-300 hover:bg-gray-50 bg-transparent"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 로그인
            </Button>
          </form>

          <div className="flex justify-center space-x-4 mt-6 text-sm">
            <Link href="/reset-password" className="text-[#A2B38B] hover:underline">
              비밀번호 재설정
            </Link>
            <Link href="/register" className="text-[#A2B38B] hover:underline">
              회원가입
            </Link>
          </div>

          <p className="text-center mt-6 text-sm text-gray-600">로그인에 문제가 있으신가요?</p>
        </div>
      </main>

      {/* 약관동의 모달 */}
      <TermsAgreementModal
        isOpen={showTermsModal}
        onClose={handleTermsCancel}
        onAgree={handleTermsAgree}
        userName={pendingGoogleUser?.user?.displayName || (pendingGoogleUser?.user?.email ? pendingGoogleUser.user.email.split('@')[0] : '')}
        isNewUser={false}
      />
    </div>
  )
}
