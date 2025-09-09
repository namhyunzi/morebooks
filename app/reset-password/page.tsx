import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">비밀번호 재설정</h1>
          </div>

          <form className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-900 font-medium">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                className="mt-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
              />
            </div>

            <Button type="submit" className="w-full bg-[#A2B38B] hover:bg-[#8fa076] text-white">
              비밀번호 재설정 링크 발송
            </Button>

            <p className="text-center text-gray-900 text-sm">
              발송된 이메일에서 링크를 클릭하여 새 비밀번호를 설정하세요.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
