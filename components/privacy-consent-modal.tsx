'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, Clock, CheckCircle2, XCircle, Info } from 'lucide-react'

interface PrivacyConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onConsent: (agreed: boolean, duration: '1time' | '6months') => Promise<void>
  requiredFields: string[]
  purpose: string
  sessionType?: 'paper' | 'qr'
}

// 필드명 한글 매핑
const fieldLabels: Record<string, { label: string, description: string, icon: string }> = {
  name: { 
    label: '이름', 
    description: '수취인 확인 및 본인인증용', 
    icon: '👤' 
  },
  phone: { 
    label: '전화번호', 
    description: '배송 관련 연락 및 응급상황 대응용', 
    icon: '📱' 
  },
  address: { 
    label: '주소', 
    description: '정확한 배송지 확인용', 
    icon: '🏠' 
  },
  email: { 
    label: '이메일', 
    description: '배송 알림 및 영수증 발송용', 
    icon: '📧' 
  }
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  onClose,
  onConsent,
  requiredFields,
  purpose,
  sessionType = 'paper'
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<'1time' | '6months'>('1time')

  const handleConsent = async (agreed: boolean) => {
    setIsLoading(true)
    try {
      await onConsent(agreed, selectedDuration)
      onClose()
    } catch (error) {
      console.error('동의 처리 실패:', error)
      alert('동의 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const sessionTypeInfo = {
    paper: { 
      label: '종이송장', 
      duration: '1시간', 
      icon: '📄',
      description: '인쇄 후 자동으로 접근이 차단됩니다'
    },
    qr: { 
      label: 'QR송장', 
      duration: '12시간', 
      icon: '📱',
      description: 'QR코드 스캔으로 배송정보를 확인할 수 있습니다'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-blue-600" />
            개인정보 제공 동의
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {purpose}를 위해 다음 개인정보가 필요합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 배송 방식 정보 */}
          <Card className="border-blue-100 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {sessionTypeInfo[sessionType].icon}
                {sessionTypeInfo[sessionType].label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>개인정보 접근 가능 시간: {sessionTypeInfo[sessionType].duration}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {sessionTypeInfo[sessionType].description}
              </p>
            </CardContent>
          </Card>

          {/* 요청 개인정보 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">제공 요청 개인정보</CardTitle>
              <CardDescription>
                다음 정보들이 안전하게 암호화되어 택배사에 전달됩니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {requiredFields.map((field, index) => {
                const fieldInfo = fieldLabels[field] || { 
                  label: field, 
                  description: '기타 정보', 
                  icon: '📋' 
                }
                
                return (
                  <div key={field} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50/50">
                    <span className="text-lg">{fieldInfo.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{fieldInfo.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          필수
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {fieldInfo.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* 동의 기간 선택 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">동의 기간 선택</CardTitle>
              <CardDescription>
                동의 기간을 선택해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDuration('1time')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedDuration === '1time'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedDuration === '1time'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`} />
                    <div>
                      <div className="font-medium">이번 한 번만 허용</div>
                      <div className="text-sm text-gray-600">
                        현재 주문에서만 사용되며, 주문 완료 후 자동 삭제
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDuration('6months')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedDuration === '6months'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedDuration === '6months'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`} />
                    <div>
                      <div className="font-medium">6개월간 허용</div>
                      <div className="text-sm text-gray-600">
                        6개월 동안 같은 쇼핑몰에서 동의 없이 자동 처리
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* 보안 안내 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 mb-1">개인정보 보호 정책</p>
                <ul className="text-green-700 space-y-1 text-xs">
                  <li>• 개인정보는 암호화되어 안전하게 전송됩니다</li>
                  <li>• 택배사는 지정된 시간 후 정보에 접근할 수 없습니다</li>
                  <li>• 언제든지 마이페이지에서 연결을 해제할 수 있습니다</li>
                  <li>• 개인정보는 쇼핑몰 서버에 저장되지 않습니다</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* 버튼 영역 */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => handleConsent(false)}
              disabled={isLoading}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              거부
            </Button>
            <Button
              onClick={() => handleConsent(true)}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isLoading ? '처리 중...' : '동의하고 계속'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PrivacyConsentModal
