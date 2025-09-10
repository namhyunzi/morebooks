'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import Header from "@/components/header"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ref, set, serverTimestamp } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"
import TermsAgreementModal from "@/components/terms-agreement-modal"

// Window 객체에 googleAuthPopup 속성 추가
declare global {
  interface Window {
    googleAuthPopup?: Window | null
  }
}

export default function RegisterPage() {
  const { register, loginWithGoogleWithTerms, deleteUserAccount, checkSignInMethods } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingAccepted, setMarketingAccepted] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null)
  const router = useRouter()

  // 컴포넌트 언마운트 시 팝업 정리
  useEffect(() => {
    return () => {
      if (window.googleAuthPopup) {
        window.googleAuthPopup.close()
        window.googleAuthPopup = null
      }
    }
  }, [])

  // 전체동의 상태 계산
  const allAccepted = termsAccepted && privacyAccepted && marketingAccepted
  const allRequiredAccepted = termsAccepted && privacyAccepted

  // 전체동의 핸들러
  const handleAllTermsChange = (checked: boolean) => {
    setTermsAccepted(checked)
    setPrivacyAccepted(checked)
    setMarketingAccepted(checked)
  }

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return '필수 입력 항목입니다.'
    }
    // 더 엄격한 이메일 유효성 검사: RFC 5322 표준 준수
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!emailRegex.test(email)) {
      return '이메일 형식이 올바르지 않습니다.'
    }
    // 이메일 길이 제한 (일반적인 제한)
    if (email.length > 254) {
      return '이메일이 너무 깁니다.'
    }
    // 로컬 부분(@ 앞부분) 길이 제한
    const localPart = email.split('@')[0]
    if (localPart.length > 64) {
      return '이메일 로컬 부분이 너무 깁니다.'
    }
    return ''
  }

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return '필수 입력 항목입니다.'
    }
    if (password.length < 8) {
      return '영문, 숫자를 포함한 8자 이상의 비밀번호를 입력해주세요.'
    }
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    if (!hasLetter || !hasNumber) {
      return '영문, 숫자를 포함한 8자 이상의 비밀번호를 입력해주세요.'
    }
    return ''
  }

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword.trim()) {
      return '필수 입력 항목입니다.'
    }
    if (confirmPassword !== password) {
      return '비밀번호가 일치하지 않습니다.'
    }
    return ''
  }

  const checkEmailProvider = async (email: string) => {
    if (!email || validateEmail(email)) {
      return // 이메일이 없거나 형식이 잘못되면 확인하지 않음
    }

    try {
      console.log('이메일 프로바이더 확인 시작:', email)
      const { isGoogleOnly, registered } = await checkSignInMethods(email)
      console.log('구글 전용 계정 여부:', isGoogleOnly)
      console.log('등록된 계정 여부:', registered)
      
      if (isGoogleOnly) {
        setEmailError('구글로 가입된 계정입니다. \'구글\' 버튼을 눌러 로그인해주세요.')
      } else if (registered) {
        setEmailError('이미 가입된 계정입니다. 로그인 후 이용해주세요.')
      } else {
        // 등록되지 않은 계정이면 에러 클리어
        if (emailError && (emailError.includes('구글로 가입된') || emailError.includes('이미 가입된'))) {
          setEmailError('')
        }
      }
    } catch (error) {
      console.error('이메일 확인 중 오류:', error)
    }
  }

  const saveUserAgreements = async (userId: string, email: string, agreements: {
    termsAccepted: boolean
    privacyAccepted: boolean
    marketingAccepted: boolean
  }) => {
    try {
      const userRef = ref(realtimeDb, `users/${userId}`)
      const agreementsRef = ref(realtimeDb, `users/${userId}/agreements`)
      
      // 사용자 기본 정보 저장
      await set(ref(realtimeDb, `users/${userId}/profile`), {
        email: email,
        createdAt: serverTimestamp()
      })
      
      // 약관동의 정보 저장
      const agreementsData: any = {
        termsAccepted: agreements.termsAccepted,
        privacyAccepted: agreements.privacyAccepted,
        marketingAccepted: agreements.marketingAccepted
      }
      
      // 동의한 약관에만 타임스탬프 추가
      if (agreements.termsAccepted) {
        agreementsData.termsAcceptedAt = serverTimestamp()
      }
      if (agreements.privacyAccepted) {
        agreementsData.privacyAcceptedAt = serverTimestamp()
      }
      if (agreements.marketingAccepted) {
        agreementsData.marketingAcceptedAt = serverTimestamp()
      }
      
      await set(agreementsRef, agreementsData)
      console.log('약관동의 정보 저장 완료:', agreementsData)
    } catch (error) {
      console.error('약관동의 정보 저장 실패:', error)
      throw error
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (emailError && !emailError.includes('구글로 가입된') && !emailError.includes('이미 가입된')) {
      setEmailError(validateEmail(value))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (passwordError) {
      setPasswordError(validatePassword(value))
    }
    if (confirmPassword && confirmPasswordError) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword))
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (confirmPasswordError) {
      setConfirmPasswordError(validateConfirmPassword(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')

    // 유효성 검사
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    const confirmPasswordErr = validateConfirmPassword(confirmPassword)

    if (emailErr || passwordErr || confirmPasswordErr) {
      setEmailError(emailErr)
      setPasswordError(passwordErr)
      setConfirmPasswordError(confirmPasswordErr)
      setLoading(false)
      return
    }

    if (!termsAccepted || !privacyAccepted) {
      setError('필수 약관에 동의해주세요')
      setLoading(false)
      return
    }

    try {
      const userCredential = await register(email, password)
      // 회원가입 성공 후 약관동의 정보 저장
      if (userCredential?.user?.uid) {
        await saveUserAgreements(userCredential.user.uid, email, {
          termsAccepted,
          privacyAccepted,
          marketingAccepted
        })
      }
      router.push('/')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError('')

    try {
      // 기존 팝업이 있다면 정리
      if (window.googleAuthPopup) {
        window.googleAuthPopup.close()
        window.googleAuthPopup = null
      }

      // 구글 로그인 팝업 열기
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')
      
      const provider = new GoogleAuthProvider()
      
      // 팝업 옵션 설정
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const userCredential = await signInWithPopup(auth, provider)
      
      // 사용자 정보를 임시 저장하고 약관동의 모달 표시
      setPendingGoogleUser(userCredential)
      setShowTermsModal(true)
      
    } catch (error: any) {
      console.error('Google 로그인 오류:', error)
      
      // 팝업 차단 오류 처리
      if (error.code === 'auth/popup-blocked') {
        setError('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('로그인이 취소되었습니다.')
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('로그인 요청이 취소되었습니다. 잠시 후 다시 시도해주세요.')
      } else {
        setError(error.message || 'Google 로그인 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
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
      
      // 약관동의 정보를 Realtime Database에 저장
      await saveUserAgreements(pendingGoogleUser.user.uid, pendingGoogleUser.user.email || '', agreements)
      
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">회원가입</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Google Signup Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 border-gray-300 hover:bg-gray-50 bg-transparent"
            onClick={handleGoogleSignup}
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
            Google로 회원가입
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일"
                value={email}
                onChange={handleEmailChange}
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
              <p className="text-sm text-gray-500 mb-2">영문, 숫자를 포함한 8자 이상의 비밀번호를 입력해주세요.</p>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setPasswordError(validatePassword(password))}
                className={`focus:border-[#A2B38B] focus:ring-[#A2B38B] ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={loading}
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                비밀번호 확인
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={() => setConfirmPasswordError(validateConfirmPassword(confirmPassword))}
                className={`mt-1 focus:border-[#A2B38B] focus:ring-[#A2B38B] ${
                  confirmPasswordError ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={loading}
              />
              {confirmPasswordError && (
                <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-medium">약관동의</Label>
              <div className="bg-gray-50 p-4 rounded-lg mt-2">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="allTerms" 
                      checked={allAccepted}
                      onCheckedChange={handleAllTermsChange}
                      disabled={loading}
                    />
                    <Label htmlFor="allTerms" className="text-sm">
                      전체동의
                      <span className="text-xs text-gray-400 ml-1">선택항목에 대한 동의 포함</span>
                    </Label>
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                      disabled={loading}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      이용약관<span className="text-red-500">(필수)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="privacy" 
                      checked={privacyAccepted}
                      onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                      disabled={loading}
                    />
                    <Label htmlFor="privacy" className="text-sm">
                      개인정보처리방침<span className="text-red-500">(필수)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="marketing" 
                      checked={marketingAccepted}
                      onCheckedChange={(checked) => setMarketingAccepted(checked === true)}
                      disabled={loading}
                    />
                    <Label htmlFor="marketing" className="text-sm">
                      마케팅 정보 수신 동의<span className="text-gray-500">(선택)</span>
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#A2B38B] hover:bg-[#8fa076] text-white"
              disabled={loading}
            >
              {loading ? '회원가입 중...' : '회원가입하기'}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            이미 아이디가 있으신가요?{" "}
            <Link href="/login" className="text-[#A2B38B] hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </main>

      {/* 약관동의 모달 */}
      <TermsAgreementModal
        isOpen={showTermsModal}
        onClose={handleTermsCancel}
        onAgree={handleTermsAgree}
        userName={pendingGoogleUser?.user?.displayName || (pendingGoogleUser?.user?.email ? pendingGoogleUser.user.email.split('@')[0] : '')}
        isNewUser={true}
      />
    </div>
  )
}