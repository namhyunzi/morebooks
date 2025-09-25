"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ChevronUp, HelpCircle, Smartphone, MapPin } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getCartItems, clearCart, processBankTransferOrder, CartItem } from "@/lib/firebase-realtime"
import { notifyDeliveryService } from "@/lib/delivery-api"
import { getBookById, Book } from "@/lib/demo-books"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  connectToSSDM, 
  handleSSDMResult, 
  validateSSDMJWT, 
  sendJWTToDeliveryService, 
  getSSDMErrorMessage,
  generateSSDMJWT,
  SSDMResponse 
} from "@/lib/ssdm-api"

interface CartItemWithBook extends CartItem {
  book: Book
}

function CheckoutContent() {
  const { 
    user, 
    updateCartCount
  } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cartItems, setCartItems] = useState<CartItemWithBook[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("bank-transfer")
  const [selectedCard, setSelectedCard] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [depositorName, setDepositorName] = useState("")
  const [isOrderItemsExpanded, setIsOrderItemsExpanded] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // SSDM 관련 상태
  const [ssdmJWT, setSSMDJWT] = useState<string | null>(null)
  const [ssdmUID, setSSMDUID] = useState<string | null>(null)
  const [ssdmConnected, setSSMDConnected] = useState(false)
  const [ssdmPopup, setSSMDPopup] = useState<Window | null>(null)
  
  // 미리보기 관련 상태 추가
  const [showPreview, setShowPreview] = useState(false)
  const [consentStatus, setConsentStatus] = useState<any>(null)
  const [consentResult, setConsentResult] = useState<any>(null)
  const [consentRejected, setConsentRejected] = useState(false)
  
  // 배송 메모 옵션 매핑
  const deliveryMemoOptions: { [key: string]: string } = {
    'door': '문 앞에 놓아주세요',
    'contact': '부재 시 연락 부탁드려요', 
    'call': '배송 전 미리 연락해 주세요'
  }

  // 배송 메모 상태
  const [deliveryMemo, setDeliveryMemo] = useState("door")
  
  // 개인정보 입력 방식 선택 상태
  const [useSSDM, setUseSSDM] = useState(true)  // 기본적으로 개인정보 보호 시스템 사용
  const [useManualInput, setUseManualInput] = useState(false)  // 기본적으로 직접 입력 비활성화
  
  
  // 주문자 정보 상태
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    emailId: "",
    emailDomain: "naver.com",
    phonePrefix: "010",
    phoneNumber: "",
    postalCode: "",
    address: "",
    detailAddress: ""
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadCartItems()
    
    // 2. useEffect 수정 - 페이지 진입 시 동의 상태 확인
    const checkConsentStatus = async () => {
      if (!user) return
      
      try {
        const shopId = user.email?.split('@')[0] || 'unknown'
        const mallId = process.env.NEXT_PUBLIC_MALL_ID || 'mall001'
        
        // JWT 생성
        const jwtResult = await generateSSDMJWT({ shopId, mallId })
        const jwtToken = jwtResult.jwt

        // SSDM 측 API로 직접 호출
        const response = await fetch(`${process.env.NEXT_PUBLIC_SSDM_URL}/api/check-consent-status`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('API 응답 상태:', response.status, response.statusText)
        console.log('API 응답 헤더:', response.headers)
        
        const result = await response.json()
        console.log('API 응답 데이터:', result)
        
        if (result.status === 'connected') {
          // 항상 허용 + 유효함
          setShowPreview(true)   // 미리보기 버튼
          setConsentStatus(result)
          setSSMDConnected(true)  // SSDM 연결 상태 설정
          sessionStorage.setItem('consentStatus', JSON.stringify(result))
          sessionStorage.setItem('ssdm_connected', 'true')
        } else {
          // need_connect (모든 다른 경우)
          setShowPreview(false)  // 연결하기 버튼
          setSSMDConnected(false)  // SSDM 연결 상태 해제
          sessionStorage.removeItem('consentStatus')
          sessionStorage.removeItem('ssdm_connected')
        }
      } catch (error) {
        setShowPreview(false)
        setSSMDConnected(false)  // SSDM 연결 상태 해제
      }
    }

    checkConsentStatus()
    
    // sessionStorage에서 저장된 동의 상태 복원
    const savedConsentStatus = sessionStorage.getItem('consentStatus')
    if (savedConsentStatus) {
      try {
        const parsedStatus = JSON.parse(savedConsentStatus)
        setConsentStatus(parsedStatus)
        
        
        // 저장된 상태에 따라 showPreview 설정
        if (parsedStatus.status === 'connected') {
          // 항상 허용 만료 확인
          if (parsedStatus.consentType === 'always' && parsedStatus.expiresAt) {
            const expiresAt = new Date(parsedStatus.expiresAt)
            const now = new Date()
            if (now > expiresAt) {
              setShowPreview(false)  // 연결하기 버튼
              return
            }
          }
          
          // 연결 해제 확인
          if (parsedStatus.isActive === false) {
            setShowPreview(false)  // 연결하기 버튼
            return
          }
          
          // 정상 동의 상태
          setShowPreview(true)   // 미리보기 버튼
          setSSMDConnected(true)  // SSDM 연결 상태 설정
        } else {
          setShowPreview(false)  // 연결하기 버튼
          setSSMDConnected(false)  // SSDM 연결 상태 해제
        }
      } catch (error) {
        console.error('저장된 동의 상태 파싱 오류:', error)
        sessionStorage.removeItem('consentStatus')
      }
    }
    
    // 앱에서 돌아온 데이터 확인
    if (searchParams) {
      checkAppReturnData(searchParams)
      // SSDM에서 돌아온 데이터 확인
      checkSSMDReturnData(searchParams)
    }

    // 팝업에서 오는 메시지 리스너 등록
    const handleMessage = async (event: MessageEvent) => {
    console.log("메세지 받음", event.data);
      // SSDM 동의 결과 처리
      if (event.data && event.data.type === 'consent_result') {
        // 동의 처리 - JWT 디코딩 없이 바로 처리
        setConsentRejected(false)  // 거부 상태 초기화
        sessionStorage.setItem('ssdm_agreed', 'true')
        setSSMDConnected(true)
        setUseSSDM(true)
        setUseManualInput(false)
        setShowPreview(true)
        toast.success('개인정보 보호 시스템 연결 완료!')
        
        // 팝업 닫기
        if (ssdmPopup && !ssdmPopup.closed) {
          ssdmPopup.close()
          setSSMDPopup(null)
        }
      } else if (event.data && event.data.type === 'consent_rejected') {
        // 거부 처리 
        setConsentRejected(true)
        toast.error('개인정보 제공을 거부하셨습니다.')
        
        // 팝업 닫기
        if (ssdmPopup && !ssdmPopup.closed) {
          ssdmPopup.close()
          setSSMDPopup(null)
        }
      } else if (event.data && event.data.type === 'close_popup') {
        // 팝업 닫기 요청 처리
        if (ssdmPopup && !ssdmPopup.closed) {
          ssdmPopup.close()
          setSSMDPopup(null)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [user, router, searchParams])

  const checkAppReturnData = (searchParams: URLSearchParams) => {
    // URL 파라미터에서 앱 데이터 확인
    const appData = searchParams.get('appData')
    
    if (appData) {
      try {
        const userData = JSON.parse(decodeURIComponent(appData))
        console.log('앱에서 받은 데이터:', userData)
        
        // 폼에 자동 입력
        setCustomerInfo({
          name: userData.name || '',
          emailId: userData.email ? userData.email.split('@')[0] : '',
          emailDomain: userData.email ? userData.email.split('@')[1] : 'naver.com',
          phonePrefix: userData.phone ? userData.phone.split('-')[0] : '010',
          phoneNumber: userData.phone ? userData.phone.split('-').slice(1).join('-') : '',
          postalCode: userData.zipCode || '',
          address: userData.address || '',
          detailAddress: userData.detailAddress || ''
        })
        
        // URL에서 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname)
        
        alert('앱에서 정보를 가져왔습니다!')
      } catch (error) {
        console.error('앱 데이터 파싱 오류:', error)
      }
    }
  }

  const checkConsentStatus = async () => {
    if (!user) return
    
    try {
      const shopId = user.email?.split('@')[0] || 'unknown'
      const mallId = process.env.NEXT_PUBLIC_MALL_ID || 'mall001'
      
      // JWT 생성
      const jwtResult = await generateSSDMJWT({ shopId, mallId })
      const jwtToken = jwtResult.jwt

      // SSDM 측 API로 직접 호출
      const response = await fetch(`${process.env.NEXT_PUBLIC_SSDM_URL}/api/check-consent-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.status === 'connected') {
        // 항상 허용 + 유효함
        setShowPreview(true)
        setConsentStatus(result)
        setSSMDConnected(true)  // SSDM 연결 상태 설정
      } else {
        // need_connect (모든 다른 경우)
        setShowPreview(false)
        setSSMDConnected(false)  // SSDM 연결 상태 해제
      }
    } catch (error) {
      setShowPreview(false)
      setSSMDConnected(false)  // SSDM 연결 상태 해제
    }
  }

  const checkSSMDReturnData = (searchParams: URLSearchParams) => {
    handleSSDMResult(
      searchParams,
        (response: SSDMResponse) => {
        // 성공 시 처리
        if (response.jwt && response.uid) {
          setSSMDJWT(response.jwt)
          setSSMDUID(response.uid)
          setSSMDConnected(true)
          
          // SSDM 연결 시 자동으로 SSDM 방식 선택
          setUseSSDM(true)
          setUseManualInput(false)
          
          toast.success(`개인정보 보호 시스템 연결 완료! (${response.expiresIn}초간 유효)`)
          
          // JWT 검증
          validateSSDMJWT(response.jwt).then(isValid => {
            if (isValid) {
              console.log('JWT 검증 성공')
            } else {
              console.warn('JWT 검증 실패')
            }
          })
        }
      },
      (error: string) => {
        // 실패 시 처리
        toast.error(getSSDMErrorMessage(error))
        console.error('SSDM 연결 실패:', error)
      }
    )
  }

  const loadCartItems = async () => {
    if (!user) return

    try {
      const items = await getCartItems(user.uid)
      const itemsWithBooks: CartItemWithBook[] = []
      
      for (const item of items) {
        const book = getBookById(item.bookId)
        if (book) {
          itemsWithBooks.push({ ...item, book })
        }
      }
      
      setCartItems(itemsWithBooks)
      
      // 사용자 정보 자동 입력
      if (user.displayName) {
        setCustomerInfo(prev => ({ ...prev, name: user.displayName! }))
      } else if (user.email) {
        const emailParts = user.email.split('@')
        setCustomerInfo(prev => ({ 
          ...prev, 
          name: emailParts[0],
          emailId: emailParts[0],
          emailDomain: emailParts[1] || "naver.com"
        }))
      }
    } catch (error) {
      console.error('장바구니 로딩 에러:', error)
      toast.error('장바구니를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }
  
  const totalAmount = cartItems.reduce((sum, item) => sum + item.book.discountPrice * item.quantity, 0)
  const totalOriginalAmount = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0)
  const totalDiscount = totalOriginalAmount - totalAmount
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleAddressSearch = () => {
    // 우편번호 API 연동 로직
    console.log("주소찾기 클릭")
  }

  const handleSSMDConnect = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.')
      return
    }

    try {
      console.log('SSDM 개인정보 보호 시스템 연결 시작...')
      
      // 이메일에서 shopId 추출 (예: user@example.com → user)
      const emailParts = user.email?.split('@') || []
      const shopId = emailParts[0] || user.uid
      const { PRIVACY_CONFIG } = await import('@/lib/privacy-config')
      const mallId = PRIVACY_CONFIG.mallId
      
      if (!mallId) {
        throw new Error('Mall ID가 설정되지 않았습니다.')
      }
      
      // SSDM 연결 (동의 결과 콜백 포함)
      const popup = await connectToSSDM(shopId, mallId, (result) => {
        console.log('SSDM 동의 결과:', result)
        
        if (result.agreed) {
          console.log('동의 완료:', result.consentType)
          // 동의 시 후속 처리
        } else {
          console.log('동의 거부')
          // 거부 시 후속 처리
        }
      })
      
      if (!popup) {
        return // 팝업 차단됨 (connectToSSDM에서 알림 처리)
      }
      
      // 팝업 참조 저장
      setSSMDPopup(popup)
      
      toast.info('개인정보 보호 시스템으로 이동했습니다. 팝업에서 동의를 진행해주세요.')
    } catch (error) {
      console.error('SSDM 연결 실패:', error)
      toast.error('개인정보 보호 시스템 연결에 실패했습니다.')
    }
  }

  const handleAppDownload = async () => {
    // 기존 앱 다운로드 함수 (호환성 유지)
    await handleSSMDConnect()
  }

  // 3. 기존 "개인정보 연결하기" 버튼 클릭 시 로직 수정
  const handleConnectPersonalInfo = () => {
    if (showPreview) {
      // 동의한 사람 또는 항상 허용인 사람 → 미리보기 팝업 열기
      connectToSSDM(
        user?.email?.split('@')[0] || 'unknown',
        process.env.NEXT_PUBLIC_MALL_ID || 'mall001',
        (result) => {
          if (result.agreed) {
            setConsentResult({
              isActive: result.agreed,
              consentType: result.consentType,
              jwt: result.jwt,
              timestamp: new Date().toISOString()
            })
            setShowPreview(false)
          } else {
            // 거부한 경우 - Alert 표시
            alert('개인정보 제공에 동의하지 않으셨습니다. 주문을 진행할 수 없습니다.')
            setShowPreview(false)
          }
        },
        '/info-preview'  // 4번째 인자로 path 전달
      )
    } else {
      // 동의 안한 사람 → 기존 /consent 팝업 열기 (기존 함수 그대로 사용)
      connectToSSDM(
        user?.email?.split('@')[0] || 'unknown',
        process.env.NEXT_PUBLIC_MALL_ID || 'mall001',
        (result) => {
          setConsentResult({
            isActive: result.agreed,
            consentType: result.consentType,
            jwt: result.jwt,
            timestamp: new Date().toISOString()
          })
          setShowPreview(false)
        }
        // error 콜백 제거 - connectToSSDM 함수에서 자동으로 alert 처리
      )
    }
  }


  const handleOrder = async () => {
    if (!user) {
      return
    }

    // delegateJwt 저장용 변수 (함수 시작 시 초기화)
    let savedDelegateJwt: string | null = null

    // 개인정보 입력 방식에 따른 검증
    if (useManualInput) {
      // 직접 입력 방식일 때 상세한 폼 검증
      const errors = []
      
      if (!customerInfo.name.trim()) {
        errors.push('이름')
      }
      
      if (!customerInfo.phoneNumber.trim()) {
        errors.push('전화번호')
      } else {
        // 전화번호 형식 검증 (010-1234-5678)
        const phoneRegex = /^010-\d{4}-\d{4}$/
        const fullPhone = `${customerInfo.phonePrefix}-${customerInfo.phoneNumber}`
        if (!phoneRegex.test(fullPhone)) {
          errors.push('올바른 전화번호 형식 (010-1234-5678)')
        }
      }
      
      if (!customerInfo.address.trim()) {
        errors.push('주소')
      }
      
      if (!customerInfo.emailId.trim()) {
        errors.push('이메일')
      } else {
        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const fullEmail = `${customerInfo.emailId}@${customerInfo.emailDomain}`
        if (!emailRegex.test(fullEmail)) {
          errors.push('올바른 이메일 형식')
        }
      }
      
      if (errors.length > 0) {
        alert(`다음 정보를 확인해주세요:\n\n• ${errors.join('\n• ')}`)
        return
      }
    } else if (useSSDM) {
      // SSDM 방식일 때는 연결 상태 및 동의 상태 검증
      if (!ssdmConnected) {
        alert('개인정보 보호 시스템 연결이 필요합니다.\n\n"개인정보 보호 시스템 사용"을 체크하고 연결해주세요.')
        return
      }
      
      // 거부 상태 확인
      if (consentRejected) {
        alert('개인정보 제공에 동의하지 않으셨습니다. 주문을 진행할 수 없습니다.')
        return
      }
      
      // 연결 해제 확인
      if (consentStatus?.isActive === false) {
        alert('개인정보 보호 시스템 연결이 해제되었습니다. 다시 연결해주세요.')
        
        // 연결 해제 시 정리
        sessionStorage.removeItem('ssdm_connected')
        sessionStorage.removeItem('consentStatus')
        
        return
      }
      
      // 무통장입금 유효성 검사
      if (!selectedBank || !depositorName) {
        alert('무통장입금 정보를 입력해주세요.\n\n- 은행 선택\n- 입금자 성명')
        return
      }
      
      // 모든 경우에서 /api/issue-partner-jwt 호출하여 택배사용 JWT 발급
      try {
        // JWT 생성
        const authJWT = await generateSSDMJWT({ 
          shopId: user.email?.split('@')[0] || 'unknown',
          mallId: process.env.NEXT_PUBLIC_MALL_ID || 'mall001'
        })
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_SSDM_URL}/api/issue-partner-jwt`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authJWT.jwt}`
          }
        })
        
        // HTTP 상태 코드 확인
        if (!response.ok) {
          const errorData = await response.json()
          alert(errorData.error || '개인정보 보호 시스템 연결에 문제가 발생했습니다.')
          window.location.reload()  // 페이지 새로고침 추가
          return
        }
        
        // 성공 시에만 헤더에서 JWT 받기
        console.log('응답 상태:', response.status, response.ok)
        console.log('Authorization 헤더:', response.headers.get('Authorization'))
        const jwtFromHeader = response.headers.get('Authorization')?.replace('Bearer ', '')
        console.log('추출된 JWT:', jwtFromHeader)
        if (jwtFromHeader) {
          try {
            // 우리 서버 API로 JWT 검증 요청
            const verifyResponse = await fetch('/api/verify-partner-jwt', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ jwt: jwtFromHeader })
            })

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json()
              console.error('JWT 검증 API 에러:', errorData)
              alert(`JWT 검증에 실패했습니다: ${errorData.error}`)
              return
            }

            const { delegateJwt } = await verifyResponse.json()
            
            console.log('--- 디버깅 시작 ---')
            console.log('받은 delegateJwt:', delegateJwt)
            console.log('delegateJwt 존재 여부 (boolean):', !!delegateJwt)
            console.log('--- 디버깅 종료 ---')
            
            if (delegateJwt) {
              // 택배사용 JWT만 저장
              setSSMDJWT(delegateJwt)
              savedDelegateJwt = delegateJwt  // 변수에도 저장
              console.log('택배사용 JWT 발급 완료:', delegateJwt.substring(0, 50) + '...')
            } else {
              alert('개인정보 보호 시스템 연결에 문제가 발생했습니다. 연결정보를 확인해주세요.')
              return
            }
          } catch (error) {
            console.error('JWT 검증 실패:', error)
            alert('개인정보 보호 시스템 연결에 문제가 발생했습니다. 연결정보를 확인해주세요.')
            return
          }
        } else {
          alert('개인정보 보호 시스템 연결에 문제가 발생했습니다. 연결정보를 확인해주세요.')
          return
        }
      } catch (error) {
        console.error('JWT 발급 오류:', error)
        alert('개인정보 보호 시스템 연결에 문제가 발생했습니다. 연결정보를 확인해주세요.')
        return
      }
    } else {
      // 둘 다 선택되지 않은 경우
      alert('개인정보 입력 방식을 선택해주세요.\n\n• 개인정보 보호 시스템 사용\n• 직접 입력하기')
      return
    }

    try {
      setProcessing(true)

      const orderData = {
        userId: user.uid,
        items: cartItems.map(item => ({
          bookId: item.bookId,
          title: item.book.title,
          author: item.book.author,
          price: item.book.price,
          discountPrice: item.book.discountPrice,
          quantity: item.quantity,
          image: item.book.image
        })),
        totalAmount,
        status: 'paid' as const,
        paymentMethod: 'bank_transfer' as const,
        paymentStatus: 'completed' as const,
        // SSDM에서 개인정보 중개하므로 shippingAddress 제거
        shippingFee: 0, // 배송비 무료
        finalAmount: totalAmount, // 배송비 무료이므로 상품금액과 동일
        deliveryMemo: deliveryMemoOptions[deliveryMemo] // 배송 메모 추가 
      }

      // SSDM JWT 정보 준비 - 변수로 delegateJwt 저장
      let jwtToStore: string | undefined = undefined
      
      if (useSSDM && savedDelegateJwt) {
        // 저장된 delegateJwt 사용
        jwtToStore = savedDelegateJwt
        console.log('설정된 JWT 사용:', savedDelegateJwt)
      }

      // 주문 처리 (JWT 정보 포함)
      const result = await processBankTransferOrder(
        orderData, 
        selectedBank, 
        depositorName,
        jwtToStore
      )
      
      if (result.success) {
        // 택배사에 배송 요청 전달
        try {
          await notifyDeliveryService(orderData)
          console.log('택배사 알림 성공')
        } catch (error) {
          console.error('택배사 알림 실패:', error)
          // 택배사 알림 실패해도 주문은 완료된 상태이므로 계속 진행
        }

        // 장바구니 비우기
        await clearCart(user.uid)
        // 헤더의 장바구니 수량 업데이트
        await updateCartCount()
        
        toast.success('주문이 완료되었습니다!')
        
        // 주문 완료 후 sessionStorage 정리
        sessionStorage.removeItem('ssdm_agreed')
        sessionStorage.removeItem('consentStatus')
        sessionStorage.removeItem('ssdm_connected')
        
        router.push(`/payment-success?orderId=${result.orderId}`)
      } else {
        toast.error(typeof result.error === 'string' ? result.error : '주문 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('주문 처리 에러:', error)
      toast.error('주문 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#A2B38B] mx-auto"></div>
          <p className="mt-4 text-gray-600">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">주문할 상품이 없습니다</h2>
            <p className="text-gray-600 mb-8">장바구니에 상품을 담아주세요</p>
            <Button asChild className="bg-[#A2B38B] hover:bg-[#8fa076]">
              <Link href="/">쇼핑 계속하기</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        <h1 className="text-2xl font-bold mb-8">주문/결제</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-400">1 장바구니</span>
            <span className="text-[#A2B38B] font-medium">2 주문/결제</span>
            <span className="text-gray-400">3 주문완료</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsOrderItemsExpanded(!isOrderItemsExpanded)}
              >
                <div className="flex items-center">
                  <h3 className="font-bold text-lg">주문상품</h3>
                  <span className="text-sm text-gray-500 ml-16">
                    총 <span className="text-[#A2B38B]">{totalQuantity}</span>개
                  </span>
                </div>
                <ChevronUp 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isOrderItemsExpanded ? 'rotate-0' : 'rotate-180'
                  }`} 
                />
              </div>
              
              {isOrderItemsExpanded && (
                <>
                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>
                  
                  {/* Product Items */}
                  <div className="p-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.book.image || "/placeholder.svg"}
                          alt={item.book.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.book.title}</h4>
                          <p className="text-xs text-gray-500">{item.book.author}</p>
                        </div>
                        <div className="flex items-center justify-between w-32">
                          <span className="text-sm text-gray-600">{item.quantity}개</span>
                          <div className="text-right">
                            <div className="font-bold text-sm">{item.book.discountPrice.toLocaleString()}원</div>
                            <div className="text-xs text-gray-500 line-through">{item.book.price.toLocaleString()}원</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-6">주문자 정보</h3>
              
              {/* 개인정보 입력 방식 선택 */}
              <div className="space-y-4 mb-6">
                {/* SSDM 방식 선택 */}
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="use-ssdm"
                    checked={useSSDM}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setUseSSDM(true)
                        setUseManualInput(false)
                      }
                    }}
                  />
                  <Label htmlFor="use-ssdm" className="text-sm font-medium">
                    개인정보 보호 시스템 사용
                  </Label>
                </div>

                {/* SSDM 연결 배너 */}
                <div className={`rounded-lg p-4 text-white transition-all ${
                  useSSDM 
                    ? ssdmConnected 
                      ? consentStatus?.consentType === 'always'
                        ? 'bg-gradient-to-r from-green-400 to-green-500' // 항상 허용 - 초록색
                        : 'bg-gradient-to-r from-green-400 to-green-500' // 수동 동의도 초록색
                      : 'bg-gradient-to-r from-[#A2B38B] to-[#8fa076]'
                    : 'bg-gray-200 opacity-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-6 h-6" />
                    <div className="flex-1">
                      {ssdmConnected ? (
                        consentStatus?.consentType === 'always' ? (
                          <>
                            <h4 className="font-semibold text-sm">개인정보 보호 시스템 자동 동의 중</h4>
                            <p className="text-xs opacity-90 mt-1">6개월간 자동으로 개인정보가 제공됩니다.</p>
                          </>
                        ) : (
                          <>
                            <h4 className="font-semibold text-sm">개인정보 보호 시스템 연결 완료!</h4>
                            <p className="text-xs opacity-90 mt-1">안전한 배송을 위해 택배사에 임시 권한이 부여됩니다.</p>
                          </>
                        )
                      ) : (
                        <>
                          <h4 className="font-semibold text-sm">개인정보 보호 시스템으로 안전하게 주문하세요!</h4>
                          <p className="text-xs opacity-90 mt-1">직접 입력 없이 개인정보를 보호하며 주문할 수 있습니다.</p>
                        </>
                      )}
                    </div>
                    {useSSDM && ssdmConnected && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white text-green-500 border-white hover:bg-green-50 hover:text-green-600 text-xs"
                        onClick={handleConnectPersonalInfo}
                      >
                        개인정보 미리보기
                      </Button>
                    )}
                    {useSSDM && !ssdmConnected && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white text-[#A2B38B] border-white hover:bg-gray-50"
                        onClick={handleConnectPersonalInfo}
                      >
                        개인정보 연결하기
                      </Button>
                    )}
                  </div>
                </div>

                {/* 직접 입력 방식 선택 */}
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="use-manual"
                    checked={useManualInput}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setUseManualInput(true)
                        setUseSSDM(false)
                      }
                    }}
                  />
                  <Label htmlFor="use-manual" className="text-sm font-medium">
                    직접 입력하기
                  </Label>
                </div>
              </div>

              {/* 주문자 정보 입력 폼 */}
              <div className={`space-y-4 ${!useManualInput ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* 이름 */}
                <div className="flex items-center">
                  <Label htmlFor="name" className="w-20 text-sm font-medium text-gray-700">이름</Label>
                  <div className="w-80">
                    <Input 
                      id="name" 
                      placeholder="이름을 입력해주세요." 
                      className="w-full border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      maxLength={10}
                      disabled={!useManualInput}
                    />
                  </div>
                </div>

                {/* 이메일 */}
                <div className="flex items-center">
                  <Label htmlFor="email" className="w-20 text-sm font-medium text-gray-700">이메일</Label>
                  <div className="w-80 flex items-center space-x-2">
                    <Input 
                      id="emailId"
                      placeholder="이메일 아이디"
                      className="flex-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                      value={customerInfo.emailId}
                      onChange={(e) => setCustomerInfo({...customerInfo, emailId: e.target.value})}
                      disabled={!useManualInput}
                    />
                    <span className="text-gray-500">@</span>
                    <Select 
                      value={customerInfo.emailDomain} 
                      onValueChange={(value) => setCustomerInfo({...customerInfo, emailDomain: value})}
                      disabled={!useManualInput}
                    >
                      <SelectTrigger className="w-32 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="naver.com">naver.com</SelectItem>
                        <SelectItem value="gmail.com">gmail.com</SelectItem>
                        <SelectItem value="daum.net">daum.net</SelectItem>
                        <SelectItem value="yahoo.com">yahoo.com</SelectItem>
                        <SelectItem value="직접입력">직접입력</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 휴대폰 번호 */}
                <div className="flex items-center">
                  <Label htmlFor="phone" className="w-20 text-sm font-medium text-gray-700">전화번호</Label>
                  <div className="w-80 flex items-center space-x-2">
                    <Select 
                      value={customerInfo.phonePrefix} 
                      onValueChange={(value) => setCustomerInfo({...customerInfo, phonePrefix: value})}
                      disabled={!useManualInput}
                    >
                      <SelectTrigger className="w-20 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="010">010</SelectItem>
                        <SelectItem value="011">011</SelectItem>
                        <SelectItem value="016">016</SelectItem>
                        <SelectItem value="017">017</SelectItem>
                        <SelectItem value="018">018</SelectItem>
                        <SelectItem value="019">019</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      id="phoneNumber"
                      placeholder="휴대폰 번호"
                      className="flex-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                      value={customerInfo.phoneNumber}
                      onChange={(e) => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})}
                      disabled={!useManualInput}
                    />
                  </div>
                </div>

                {/* 주소 */}
                <div className="flex items-start">
                  <Label htmlFor="address" className="w-20 text-sm font-medium text-gray-700 mt-2">주소</Label>
                  <div className="w-80 space-y-2">
                    <div className="flex space-x-2">
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-[#A2B38B] text-[#A2B38B] hover:bg-[#A2B38B] hover:text-white"
                        onClick={handleAddressSearch}
                        disabled={!useManualInput}
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        주소찾기
                      </Button>
                      <Input 
                        placeholder="우편번호"
                        className="flex-1 border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                        value={customerInfo.postalCode}
                        onChange={(e) => setCustomerInfo({...customerInfo, postalCode: e.target.value})}
                        readOnly
                        disabled={!useManualInput}
                      />
                    </div>
                    <Input 
                      placeholder="주소를 입력해주세요"
                      className="w-full border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      readOnly
                      disabled={!useManualInput}
                    />
                    <Input 
                      placeholder="상세주소를 입력해주세요"
                      className="w-full border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]"
                      value={customerInfo.detailAddress}
                      onChange={(e) => setCustomerInfo({...customerInfo, detailAddress: e.target.value})}
                      disabled={!useManualInput}
                    />
                  </div>
                </div>

              </div>

              {/* 구분선 */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* 배송 메모 */}
              <div className="flex items-center">
                <Label className="w-20 text-sm font-medium text-gray-700">배송 메모</Label>
                <div className="w-80">
                  <Select value={deliveryMemo} onValueChange={setDeliveryMemo}>
                    <SelectTrigger className="w-full border-gray-300 focus:border-[#A2B38B] focus:ring-[#A2B38B]">
                      <SelectValue placeholder="배송 메모를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="door">문 앞에 놓아주세요</SelectItem>
                      <SelectItem value="contact">부재 시 연락 부탁드려요</SelectItem>
                      <SelectItem value="call">배송 전 미리 연락해 주세요</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-bold text-lg mb-4">결제 방법</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem 
                    value="credit-card" 
                    id="credit-card" 
                    className="border-gray-500"
                  />
                  <Label htmlFor="credit-card">신용카드</Label>
                </div>
                {paymentMethod === "credit-card" && (
                  <div className="ml-6 mb-4">
                    <Select value={selectedCard} onValueChange={setSelectedCard}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="카드를 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="samsung">삼성카드</SelectItem>
                        <SelectItem value="shinhan">신한카드</SelectItem>
                        <SelectItem value="kb">KB국민카드</SelectItem>
                        <SelectItem value="lotte">롯데카드</SelectItem>
                        <SelectItem value="hyundai">현대카드</SelectItem>
                        <SelectItem value="bc">BC카드</SelectItem>
                        <SelectItem value="hana">하나카드</SelectItem>
                        <SelectItem value="woori">우리카드</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem 
                    value="bank-transfer" 
                    id="bank-transfer" 
                    className="border-gray-500"
                  />
                  <Label htmlFor="bank-transfer">무통장입금</Label>
                </div>
                {paymentMethod === "bank-transfer" && (
                  <div className="ml-6 mb-4 space-y-4">
                    <Select value={selectedBank} onValueChange={setSelectedBank}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="입금하실 은행" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kb">국민은행</SelectItem>
                        <SelectItem value="shinhan">신한은행</SelectItem>
                        <SelectItem value="woori">우리은행</SelectItem>
                        <SelectItem value="hana">하나은행</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder="입금자 성명" 
                      value={depositorName}
                      onChange={(e) => setDepositorName(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">예금주: (주)모어북스</p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="mobile-payment" 
                    id="mobile-payment" 
                    className="border-gray-500"
                  />
                  <Label htmlFor="mobile-payment">휴대폰 결제</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 h-fit">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="font-bold">상품 금액</span>
                <span className="font-bold">{totalOriginalAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span>0원</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-[#A2B38B]">상품 할인</span>
                <span className="font-bold text-[#A2B38B]">- {totalDiscount.toLocaleString()}원</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>최종 결제 금액</span>
                <span className="text-[#A2B38B]">{totalAmount.toLocaleString()}원</span>
              </div>
            </div>

            <Button 
              className="w-full bg-[#A2B38B] hover:bg-[#8fa076] text-white" 
              size="lg" 
              onClick={handleOrder}
              disabled={processing}
            >
              {processing ? '주문 처리 중...' : '주문하기'}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#A2B38B] mx-auto"></div>
          <p className="mt-4 text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
