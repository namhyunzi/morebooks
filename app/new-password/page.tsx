import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"

export default function NewPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">새 비밀번호 입력</h1>

          <form className="space-y-6">
            <div>
              <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                새 비밀번호
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="새 비밀번호를 입력하세요"
                className="mt-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
              />
            </div>

            <div>
              <Label htmlFor="confirmNewPassword" className="text-gray-700 font-medium">
                새 비밀번호 확인
              </Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="새 비밀번호를 다시 입력하세요"
                className="mt-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
              />
            </div>

            <Button type="submit" className="w-full bg-[#A2B38B] hover:bg-[#8fa076] text-white">
              비밀번호 변경 완료
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
