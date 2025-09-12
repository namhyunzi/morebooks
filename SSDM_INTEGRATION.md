# SSDM 개인정보 보호 시스템 통합 가이드

## 🎯 개요

이 bookstore 프로젝트는 SSDM (개인정보 보호 시스템)과 통합되어 사용자의 개인정보를 안전하게 보호하며 주문 및 배송이 가능합니다.

## 🚀 주요 기능

### 1️⃣ 쇼핑몰 설정
- **mallId**: `bookstore`
- **API Key**: `api_bookstore_1234567890abcdef`
- **허용 도메인**: `['bookstore.com', 'shop.bookstore.com', 'localhost:3000']`
- **연락처**: `admin@bookstore.com`

### 2️⃣ SSDM 연결 플로우

#### 사용자 체험 과정:
1. **체크아웃 페이지 접근** → "개인정보 연결하기" 버튼 표시
2. **SSDM 연결 클릭** → 팝업으로 SSDM 시스템 열림
3. **로그인 확인** → 미로그인 시 자동 로그인 페이지 이동
4. **동의 과정** → 개인정보 제공 동의 (6개월 또는 이번만)
5. **JWT 발급** → 15분간 유효한 임시 권한 토큰 생성
6. **쇼핑몰 복귀** → JWT와 UID를 받아 결제 진행
7. **택배사 권한 부여** → 주문 완료 시 택배사에 JWT 전달

## 🔧 구현된 파일들

### `/lib/ssdm-api.ts`
```typescript
// SSDM API 통신 핵심 함수들
- connectToSSDM()           // SSDM 연결 팝업 생성
- handleSSDMResult()        // SSDM 응답 처리
- validateSSDMJWT()         // JWT 토큰 검증
- sendJWTToDeliveryService() // 택배사 권한 전달
```

### `/app/checkout/page.tsx`
```typescript
// 체크아웃 페이지 SSDM 통합
- handleSSMDConnect()       // SSDM 연결 시작
- checkSSMDReturnData()     // SSDM 응답 처리
- SSDM 연결 상태 UI 표시
- 주문 완료 시 택배사 JWT 전달
```

### `/app/payment-success/page.tsx`
```typescript
// 결제 완료 페이지 SSDM 상태 표시
- SSDM 연결 성공 시 안전 배송 메시지
- 개인정보 보호 시스템 활용 안내
```

## 📋 SSDM 연결 프로세스

### 1. 연결 시작
```typescript
const returnUrl = window.location.href
const popup = connectToSSDM(user.uid, returnUrl)
```

### 2. SSDM 응답 처리
```typescript
handleSSDMResult(searchParams, 
  (response) => {
    // 성공: JWT, UID 저장
    setSSMDJWT(response.jwt)
    setSSMDUID(response.uid)
    setSSMDConnected(true)
  },
  (error) => {
    // 실패: 일반 주문으로 진행
    toast.error(getSSDMErrorMessage(error))
  }
)
```

### 3. 주문 시 택배사 권한 부여
```typescript
if (ssdmJWT && orderId) {
  await sendJWTToDeliveryService(ssdmJWT, orderId)
}
```

## 🔒 보안 특징

### JWT 토큰 검증
- **구조 검증**: 3-part JWT 형식 확인
- **필수 필드**: `uid`, `mallId` 포함 여부
- **만료 시간**: 15분 후 자동 무효화
- **도메인 검증**: 허용된 도메인에서만 작동

### 개인정보 보호
- **최소 권한**: 택배 배송에 필요한 최소 정보만 접근
- **임시 권한**: 15분 후 자동 만료
- **동의 기반**: 사용자 명시적 동의 후에만 진행
- **선택적 사용**: SSDM 연결 없이도 일반 주문 가능

## 🎨 UI/UX 개선사항

### 체크아웃 페이지
- **연결 전**: 녹색 배너로 SSDM 연결 유도
- **연결 후**: 성공 표시로 안전성 강조
- **실패 시**: 일반 주문으로 자연스럽게 진행

### 결제 완료 페이지
- **SSDM 연결 시**: 개인정보 보호 배송 안내
- **일반 주문 시**: 기존 UI 그대로 유지

## 📱 사용자 플로우

```
📦 장바구니 → 🛒 체크아웃 → 🔒 SSDM 연결 (선택) → 💳 결제 → ✅ 완료
                              ↓
                         🚚 안전한 배송 권한 설정
```

## 🔄 에러 처리

### SSDM 연결 실패 시
- 사용자에게 친화적 메시지 표시
- 일반 배송 방식으로 자동 전환
- 주문 프로세스는 중단되지 않음

### JWT 검증 실패 시
- 콘솔 경고 메시지 출력
- 택배사 권한 부여 건너뛰기
- 일반 배송으로 처리

## 🧪 테스트 시나리오

### 1. 정상 플로우
1. 체크아웃 → SSDM 연결 → 동의 → JWT 수신 → 주문 완료

### 2. 사용자 거부
1. 체크아웃 → SSDM 연결 → 거부 → 일반 주문 진행

### 3. 팝업 차단
1. 체크아웃 → SSDM 연결 → 팝업 차단 경고 → 일반 주문

### 4. 네트워크 오류
1. 체크아웃 → SSDM 연결 → 타임아웃 → 일반 주문

## 📞 문의 및 지원

- **SSDM 시스템**: https://ssmd-smoky.vercel.app
- **쇼핑몰 관리자**: admin@bookstore.com
- **기술 지원**: 개발팀 문의

---
*이 문서는 SSDM 개인정보 보호 시스템 통합 구현을 설명합니다.*



