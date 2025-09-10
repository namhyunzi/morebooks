'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText } from "lucide-react"

interface TermsAgreementModalProps {
  isOpen: boolean
  onClose: () => void
  onAgree: (agreements: {
    termsAccepted: boolean
    privacyAccepted: boolean
    marketingAccepted: boolean
  }) => void
  userName: string
  isNewUser?: boolean
}

export default function TermsAgreementModal({
  isOpen,
  onClose,
  onAgree,
  userName,
  isNewUser = false
}: TermsAgreementModalProps) {
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [privacyAccepted, setPrivacyAccepted] = useState(true)
  const [marketingAccepted, setMarketingAccepted] = useState(false)

  const handleAgree = () => {
    if (termsAccepted && privacyAccepted) {
      onAgree({
        termsAccepted,
        privacyAccepted,
        marketingAccepted
      })
      // 상태 초기화
      setTermsAccepted(false)
      setPrivacyAccepted(false)
      setMarketingAccepted(false)
    }
  }

  const handleCancel = () => {
    // 상태 초기화
    setTermsAccepted(false)
    setPrivacyAccepted(false)
    setMarketingAccepted(false)
    onClose()
  }

  const isAgreeButtonDisabled = !termsAccepted || !privacyAccepted

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex justify-center mb-4">
              <div className="text-[#A2B38B] font-bold text-xl leading-tight text-center">
                <div>More</div>
                <div>Books</div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 환영 메시지 */}
          <div className="text-center">
            <p className="text-base text-gray-700">
              MoreBooks 서비스 이용을 위해 다음 약관에 동의해주세요.
            </p>
          </div>

          {/* 약관 동의 체크박스 */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="terms" className="text-sm font-medium">
                  서비스 이용약관 동의 <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  MoreBooks 서비스의 이용조건 및 제한사항에 동의합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="privacy" className="text-sm font-medium">
                  개인정보처리방침 동의 <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  개인정보 수집, 이용, 제공에 동의합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketing"
                checked={marketingAccepted}
                onCheckedChange={(checked) => setMarketingAccepted(checked === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="marketing" className="text-sm font-medium">
                  마케팅 정보 수신 동의 <span className="text-gray-500">(선택)</span>
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  서비스 개선 및 이벤트 정보를 받아보시겠습니까?
                </p>
              </div>
            </div>
          </div>

          {/* 주요 약관 내용 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-4 h-4 text-[#A2B38B]" />
              <h3 className="font-semibold text-gray-800 text-sm">서비스 이용약관</h3>
            </div>
            
            <div className="space-y-3 text-xs">
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• MoreBooks는 온라인 서점 서비스를 제공합니다</li>
                <li>• 서비스 이용 시 본 약관에 동의한 것으로 간주됩니다</li>
                <li>• 부적절한 사용 시 서비스 이용이 제한될 수 있습니다</li>
              </ul>
            </div>
          </div>


          {/* 버튼 */}
          <div className="flex justify-between space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleAgree}
              disabled={isAgreeButtonDisabled}
              className="flex-1 bg-[#A2B38B] hover:bg-[#8fa076] text-white disabled:opacity-50"
            >
              동의 후 계속하기
            </Button>
          </div>

          {/* 안내 문구 */}
          <div className="text-center text-xs text-gray-500">
            <p>
              동의 후 {isNewUser ? 'Google 계정으로 MoreBooks 서비스를 이용할 수 있습니다.' : 'MoreBooks 서비스에 로그인됩니다.'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
