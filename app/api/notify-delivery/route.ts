import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    const deliveryPayload = {
      orderNumber: orderData.id,
      mallName: process.env.MALL_NAME, 
      requestDate: new Date().toISOString(),
      totalAmount: orderData.totalAmount,
      items: orderData.items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price
      })),
      deliveryMemo: orderData.deliveryMemo,
      ssdmJWT: orderData.ssdmJWT
    }

    // 택배사 API로 전송
    const response = await fetch(`${process.env.DELIVERY_API_URL}/api/delivery-requests.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deliveryPayload)
    })

    if (!response.ok) {
      throw new Error(`택배사 알림 실패: ${response.status}`)
    }

    const result = await response.json()
    console.log('택배사 알림 성공:', result)
    
    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('택배사 알림 오류:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}