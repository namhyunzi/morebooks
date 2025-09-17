import { ref, set, get, push, update, remove, onValue, off } from 'firebase/database'
import { realtimeDb } from './firebase'

// 데이터베이스 구조
export interface CartItem {
  id: string
  bookId: string
  quantity: number
  addedAt: string
}

export interface Order {
  id?: string // 주문 ID (Firebase에서 자동 생성)
  userId: string // Firebase Auth 사용자 ID
  items: {
    bookId: string
    title: string
    author: string
    price: number
    discountPrice: number
    quantity: number
    image: string
  }[]
  totalAmount: number // 상품 금액
  shippingFee: number // 배송비
  finalAmount: number // 최종 결제 금액 (상품금액 + 배송비)
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'bank_transfer'
  paymentStatus: 'pending' | 'completed'
  // SSDM에서 개인정보 중개하므로 shippingAddress 제거
  createdAt: string
  updatedAt: string
  bankAccount?: {
    bankName: string
    accountNumber: string
    accountHolder: string
  }
  // SSDM 관련 필드
  ssdmJWT?: string // SSDM에서 받은 JWT 토큰 (JWT 안에 shopId, mallId 포함)
  isDepositReceived: boolean // 입금 여부 (기본값: true로 설정)
  isCancelled: boolean // 취소 여부 (기본값: false)
}

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  phone?: string
  addresses: {
    id: string
    name: string
    phone: string
    address: string
    detailAddress: string
    zipCode: string
    isDefault: boolean
  }[]
  createdAt: string
  updatedAt: string
}

export interface BankAccount {
  bankName: string
  accountNumber: string
  accountHolder: string
  bankCode: string
}

// 장바구니 관련 함수들
export const addToCart = async (userId: string, bookId: string, quantity: number = 1) => {
  try {
    const cartRef = ref(realtimeDb, `carts/${userId}`)
    const snapshot = await get(cartRef)
    
    if (snapshot.exists()) {
      const cartData = snapshot.val()
      const existingItem = Object.values(cartData).find((item: any) => item.bookId === bookId)
      
      if (existingItem) {
        // 기존 아이템 수량 증가
        const itemRef = ref(realtimeDb, `carts/${userId}/${(existingItem as any).id}`)
        await update(itemRef, {
          quantity: (existingItem as any).quantity + quantity,
          addedAt: new Date().toISOString()
        })
      } else {
        // 새 아이템 추가
        const newItemRef = push(ref(realtimeDb, `carts/${userId}`))
        await set(newItemRef, {
          id: newItemRef.key,
          bookId,
          quantity,
          addedAt: new Date().toISOString()
        })
      }
    } else {
      // 장바구니가 없으면 새로 생성
      const newItemRef = push(ref(realtimeDb, `carts/${userId}`))
      await set(newItemRef, {
        id: newItemRef.key,
        bookId,
        quantity,
        addedAt: new Date().toISOString()
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('장바구니 추가 에러:', error)
    return { success: false, error }
  }
}

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartRef = ref(realtimeDb, `carts/${userId}`)
    const snapshot = await get(cartRef)
    
    if (snapshot.exists()) {
      return Object.values(snapshot.val())
    }
    return []
  } catch (error) {
    console.error('장바구니 조회 에러:', error)
    return []
  }
}

export const updateCartItemQuantity = async (userId: string, itemId: string, quantity: number) => {
  try {
    if (quantity <= 0) {
      await removeFromCart(userId, itemId)
      return { success: true }
    }
    
    const itemRef = ref(realtimeDb, `carts/${userId}/${itemId}`)
    await update(itemRef, { quantity })
    return { success: true }
  } catch (error) {
    console.error('장바구니 수량 변경 에러:', error)
    return { success: false, error }
  }
}

export const removeFromCart = async (userId: string, itemId: string) => {
  try {
    const itemRef = ref(realtimeDb, `carts/${userId}/${itemId}`)
    await remove(itemRef)
    return { success: true }
  } catch (error) {
    console.error('장바구니 아이템 삭제 에러:', error)
    return { success: false, error }
  }
}

export const clearCart = async (userId: string) => {
  try {
    const cartRef = ref(realtimeDb, `carts/${userId}`)
    await remove(cartRef)
    return { success: true }
  } catch (error) {
    console.error('장바구니 비우기 에러:', error)
    return { success: false, error }
  }
}

// 주문 관련 함수들
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const ordersRef = ref(realtimeDb, 'orders')
    const newOrderRef = push(ordersRef)
    
    const order: Order = {
      ...orderData,
      id: newOrderRef.key!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await set(newOrderRef, order)
    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('주문 생성 에러:', error)
    return { success: false, error }
  }
}

export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = ref(realtimeDb, `orders/${orderId}`)
    const snapshot = await get(orderRef)
    
    if (snapshot.exists()) {
      const orderData = snapshot.val()
      return {
        ...orderData,
        id: orderId // Firebase 키를 id로 설정
      }
    }
    return null
  } catch (error) {
    console.error('주문 조회 에러:', error)
    return null
  }
}

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = ref(realtimeDb, 'orders')
    const snapshot = await get(ordersRef)
    
    if (snapshot.exists()) {
      const orders = snapshot.val()
      return Object.entries(orders)
        .filter(([key, order]: [string, any]) => order.userId === userId)
        .map(([key, order]: [string, any]) => ({
          ...order,
          id: key // Firebase 키를 id로 설정
        })) as Order[]
    }
    return []
  } catch (error) {
    console.error('사용자 주문 조회 에러:', error)
    return []
  }
}

export const updateOrderStatus = async (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
  try {
    const orderRef = ref(realtimeDb, `orders/${orderId}`)
    const updates: any = {
      status,
      updatedAt: new Date().toISOString()
    }
    
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus
    }
    
    await update(orderRef, updates)
    return { success: true }
  } catch (error) {
    console.error('주문 상태 업데이트 에러:', error)
    return { success: false, error }
  }
}

// 사용자 프로필 관련 함수들
export const createUserProfile = async (userData: Omit<UserProfile, 'createdAt' | 'updatedAt'>) => {
  try {
    const userRef = ref(realtimeDb, `users/${userData.uid}`)
    const userProfile: UserProfile = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await set(userRef, userProfile)
    return { success: true }
  } catch (error) {
    console.error('사용자 프로필 생성 에러:', error)
    return { success: false, error }
  }
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = ref(realtimeDb, `users/${uid}`)
    const snapshot = await get(userRef)
    
    if (snapshot.exists()) {
      return snapshot.val()
    }
    return null
  } catch (error) {
    console.error('사용자 프로필 조회 에러:', error)
    return null
  }
}

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = ref(realtimeDb, `users/${uid}`)
    await update(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
    return { success: true }
  } catch (error) {
    console.error('사용자 프로필 업데이트 에러:', error)
    return { success: false, error }
  }
}

// 실시간 리스너 함수들
export const listenToCart = (userId: string, callback: (items: CartItem[]) => void) => {
  const cartRef = ref(realtimeDb, `carts/${userId}`)
  
  const unsubscribe = onValue(cartRef, (snapshot) => {
    if (snapshot.exists()) {
      const items = Object.values(snapshot.val())
      callback(items as CartItem[])
    } else {
      callback([])
    }
  })
  
  return unsubscribe
}

export const listenToOrder = (orderId: string, callback: (order: Order | null) => void) => {
  const orderRef = ref(realtimeDb, `orders/${orderId}`)
  
  const unsubscribe = onValue(orderRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    } else {
      callback(null)
    }
  })
  
  return unsubscribe
}

// 은행 계좌 정보 (하드코딩)
export const BANK_ACCOUNTS: BankAccount[] = [
  {
    bankName: '국민은행',
    accountNumber: '123-456-789012',
    accountHolder: '(주)모어북스',
    bankCode: 'kb'
  },
  {
    bankName: '신한은행',
    accountNumber: '110-456-789012',
    accountHolder: '(주)모어북스',
    bankCode: 'shinhan'
  },
  {
    bankName: '우리은행',
    accountNumber: '1002-456-789012',
    accountHolder: '(주)모어북스',
    bankCode: 'woori'
  },
  {
    bankName: '하나은행',
    accountNumber: '100-456-789012',
    accountHolder: '(주)모어북스',
    bankCode: 'hana'
  }
]

// 은행 계좌 조회
export const getBankAccount = (bankCode: string): BankAccount | null => {
  return BANK_ACCOUNTS.find(account => account.bankCode === bankCode) || null
}

// 무통장입금 주문 처리 (주문과 동시에 결제완료 처리)
export const processBankTransferOrder = async (
  orderData: Omit<Order, 'createdAt' | 'updatedAt' | 'isDepositReceived' | 'isCancelled'>, 
  bankCode: string, 
  depositorName: string,
  ssdmJWT?: string
) => {
  try {
    // 은행 계좌 정보 조회
    const bankAccount = getBankAccount(bankCode)
    if (!bankAccount) {
      return { success: false, error: '유효하지 않은 은행입니다.' }
    }

    // 주문번호 생성 (ORD-YYYYMMDD-001 형식)
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    const orderId = `ORD-${dateStr}-001` // 일단 001로 고정, 나중에 순번 로직 추가 가능
    
    // 주문 생성 (결제완료 상태로)
    const orderRef = ref(realtimeDb, `orders/${orderId}`)
    
    const order: Order = {
      ...orderData,
      status: 'paid', // 주문과 동시에 결제완료
      paymentStatus: 'completed', // 결제완료 상태
      isDepositReceived: true, // 무조건 입금 받았다고 가정
      isCancelled: false, // 취소되지 않음
      bankAccount: {
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber,
        accountHolder: bankAccount.accountHolder
      },
      ssdmJWT: ssdmJWT, // SSDM JWT 저장
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await set(orderRef, order)

    // 결제 내역 저장
    const paymentRef = ref(realtimeDb, `payments/${orderId}`)
    await set(paymentRef, {
      orderId: orderId,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'completed',
      amount: order.totalAmount,
      bankAccount: bankAccount,
      depositorName: depositorName,
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })
    
    return { success: true, orderId: orderId, bankAccount }
  } catch (error) {
    console.error('무통장입금 주문 처리 에러:', error)
    return { success: false, error }
  }
}

