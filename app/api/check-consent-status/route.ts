import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shopId = searchParams.get('shopId')
  const mallId = searchParams.get('mallId')
  
  if (!shopId || !mallId) {
    return NextResponse.json({ error: 'shopId and mallId required' }, { status: 400 })
  }
  
  try {
    // SSDM API 호출
    const ssdmBaseUrl = process.env.NEXT_PUBLIC_PRIVACY_SYSTEM_BASE_URL || 'https://ssmd-smoky.vercel.app'
    const response = await fetch(`${ssdmBaseUrl}/api/consent-status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRIVACY_SYSTEM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shopId: shopId,
        mallId: mallId
      })
    })
    
    if (!response.ok) {
      console.error('SSDM API 호출 실패:', response.status, response.statusText)
      return NextResponse.json({ 
        error: 'SSDM API 호출 실패',
        isConnected: false,
        autoConsent: false 
      }, { status: 500 })
    }
    
    const consentStatus = await response.json()
    return NextResponse.json(consentStatus)
    
  } catch (error) {
    console.error('SSDM 상태 확인 실패:', error)
    return NextResponse.json({ 
      error: 'Failed to check consent status',
      isConnected: false,
      autoConsent: false 
    }, { status: 500 })
  }
}
