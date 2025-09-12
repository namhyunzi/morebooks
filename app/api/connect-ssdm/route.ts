import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { shopId, mallId } = await request.json()
    
    if (!shopId || !mallId) {
      return NextResponse.json(
        { error: 'shopId와 mallId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 환경변수에서 SSDM 설정 가져오기
    const baseUrl = process.env.PRIVACY_SYSTEM_BASE_URL
    const apiKey = process.env.PRIVACY_SYSTEM_API_KEY
    
    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: 'SSDM 설정이 올바르지 않습니다.' },
        { status: 500 }
      )
    }

    // SSDM 연결 URL 생성
    const ssdmUrl = new URL(`${baseUrl}/consent`)
    ssdmUrl.searchParams.append('shopId', shopId)
    ssdmUrl.searchParams.append('mallId', mallId)
    
    console.log('SSDM 연결 URL 생성:', ssdmUrl.toString())
    
    // SSDM 시스템에 연결 시도
    const response = await fetch(ssdmUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('SSDM 연결 실패:', response.status, response.statusText)
      return NextResponse.json(
        { 
          error: 'SSDM 연결에 실패했습니다.',
          details: `HTTP ${response.status}: ${response.statusText}`
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      ssdmUrl: ssdmUrl.toString(),
      data
    })

  } catch (error) {
    console.error('SSDM API 라우트 오류:', error)
    return NextResponse.json(
      { 
        error: 'SSDM 연결 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const mallId = searchParams.get('mallId')
    
    if (!shopId || !mallId) {
      return NextResponse.json(
        { error: 'shopId와 mallId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 환경변수에서 SSDM 설정 가져오기
    const baseUrl = process.env.PRIVACY_SYSTEM_BASE_URL
    const apiKey = process.env.PRIVACY_SYSTEM_API_KEY
    
    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: 'SSDM 설정이 올바르지 않습니다.' },
        { status: 500 }
      )
    }

    // SSDM 연결 URL 생성
    const ssdmUrl = new URL(`${baseUrl}/consent`)
    ssdmUrl.searchParams.append('shopId', shopId)
    ssdmUrl.searchParams.append('mallId', mallId)
    
    console.log('SSDM 연결 URL 생성:', ssdmUrl.toString())
    
    return NextResponse.json({
      success: true,
      ssdmUrl: ssdmUrl.toString(),
      message: 'SSDM 연결 URL이 생성되었습니다.'
    })

  } catch (error) {
    console.error('SSDM API 라우트 오류:', error)
    return NextResponse.json(
      { 
        error: 'SSDM 연결 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
