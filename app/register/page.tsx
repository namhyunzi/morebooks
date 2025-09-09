import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import Header from "@/components/header"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">회원가입</h1>
          </div>

          {/* Google Signup Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 border-gray-300 hover:bg-gray-50 bg-transparent"
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

          <form className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일"
                className="mt-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
              />
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
                className="border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                비밀번호 확인
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호 확인"
                className="mt-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">약관동의</Label>
              <div className="bg-gray-50 p-4 rounded-lg mt-2">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allTerms" />
                    <Label htmlFor="allTerms" className="text-sm">
                      전체동의
                      <span className="text-xs text-gray-400 ml-1">선택항목에 대한 동의 포함</span>
                    </Label>
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" defaultChecked />
                    <Label htmlFor="terms" className="text-sm">
                      이용약관<span className="text-red-500">(필수)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="privacy" defaultChecked />
                    <Label htmlFor="privacy" className="text-sm">
                      개인정보처리방침<span className="text-red-500">(필수)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="marketing" />
                    <Label htmlFor="marketing" className="text-sm">
                      마케팅 정보 수신 동의<span className="text-gray-500">(선택)</span>
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#A2B38B] hover:bg-[#8fa076] text-white">
              회원가입하기
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
    </div>
  )
}
