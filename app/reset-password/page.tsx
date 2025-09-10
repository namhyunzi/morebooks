'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [success, setSuccess] = useState(false)

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
      await resetPassword(email)
      setSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">비밀번호 재설정</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                비밀번호 재설정 링크가 이메일로 발송되었습니다.
              </div>
              <p className="text-gray-600 text-sm">
                이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-900 font-medium">
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
                      setEmailError(validateEmail(e.target.value))
                    }
                  }}
                  onBlur={() => setEmailError(validateEmail(email))}
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

              <Button 
                type="submit" 
                className="w-full bg-[#A2B38B] hover:bg-[#8fa076] text-white"
                disabled={loading}
              >
                {loading ? '발송 중...' : '비밀번호 재설정 링크 발송'}
              </Button>

              <p className="text-center text-gray-900 text-sm">
                발송된 이메일에서 링크를 클릭하여 새 비밀번호를 설정하세요.
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
