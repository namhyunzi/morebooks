import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { jwt, requiredFields } = await request.json()
    
    if (!jwt || !requiredFields || !Array.isArray(requiredFields)) {
      return NextResponse.json({ 
        error: 'jwt and requiredFields array are required' 
      }, { status: 400 })
    }

    // 환경변수에서 SSDM API 설정 가져오기
    const baseUrl = process.env.PRIVACY_SYSTEM_BASE_URL || process.env.NEXT_PUBLIC_PRIVACY_SYSTEM_BASE_URL
    const apiKey = process.env.PRIVACY_SYSTEM_API_KEY || process.env.NEXT_PUBLIC_PRIVACY_SYSTEM_API_KEY

    if (!baseUrl || !apiKey) {
      return NextResponse.json({ 
        error: 'SSDM API 설정이 누락되었습니다. 환경변수를 확인해주세요.' 
      }, { status: 500 })
    }

    // 실제 SSDM API 호출
    const response = await fetch(`${baseUrl}/api/request-info`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jwt, requiredFields })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SSDM 개인정보 요청 API 호출 실패:', response.status, errorText)
      return NextResponse.json({ 
        error: `SSDM 개인정보 요청 API 호출 실패: ${response.status}`,
        details: errorText
      }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('개인정보 요청 API 에러:', error)
    return NextResponse.json({ 
      error: '개인정보 요청 중 오류가 발생했습니다',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
