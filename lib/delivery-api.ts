// 택배사 API 통신 함수
export async function notifyDeliveryService(orderData: any) {
  try {
    const deliveryPayload = {
      orderNumber: orderData.id,
      mallName: process.env.MALL_NAME, 
      requestDate: new Date().toISOString(), // API 호출 시점 일시
      totalAmount: orderData.totalAmount,
      items: orderData.items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price
      })),
      deliveryMemo: orderData.deliveryMemo,
      ssdmJWT: orderData.ssdmJWT
    }

    // 택배사 Firebase에 직접 저장
    const response = await fetch(`${process.env.DELIVERY_API_URL}/delivery-requests.json`, {
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
    return result

  } catch (error) {
    console.error('택배사 알림 오류:', error)
    throw error
  }
}
