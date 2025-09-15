/**
 * 쇼핑몰용 RSA 키 쌍 생성 스크립트
 * 
 * 사용법:
 * node scripts/generate-keys.js
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  })

  return { publicKey, privateKey }
}

function main() {
  console.log('🔑 쇼핑몰용 RSA 키 쌍 생성 중...')
  
  const { publicKey, privateKey } = generateKeyPair()
  
  console.log('✅ 키 쌍 생성 완료!')
  console.log('\n📝 .env.local 파일에 다음을 추가하세요:')
  console.log('')
  console.log(`SHOP_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"`)
  console.log(`SHOP_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"`)
  console.log('')
  console.log('⚠️  주의사항:')
  console.log('- 이 키들은 안전하게 보관하세요')
  console.log('- 개인키는 절대 공개하지 마세요')
  console.log('- 운영 환경에서는 반드시 환경변수로 설정하세요')
  console.log('')
  
  // .env.local 파일에 자동 추가 (기존 내용 보존)
  const envPath = path.join(process.cwd(), '.env.local')
  let existingContent = ''
  
  try {
    // 기존 파일이 있으면 내용 읽기
    if (fs.existsSync(envPath)) {
      existingContent = fs.readFileSync(envPath, 'utf8')
      console.log('📁 기존 .env.local 파일을 발견했습니다.')
    }
  } catch (error) {
    console.log('⚠️  기존 .env.local 파일 읽기 실패.')
  }
  
  // 키 쌍이 이미 있는지 확인
  if (existingContent.includes('SHOP_PUBLIC_KEY') || existingContent.includes('SHOP_PRIVATE_KEY')) {
    console.log('⚠️  이미 키 쌍이 존재합니다. 기존 키를 사용하세요.')
    return
  }
  
  const newContent = existingContent + `\n# 쇼핑몰용 RSA 키 쌍
SHOP_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"
SHOP_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"
`
  
  try {
    fs.writeFileSync(envPath, newContent)
    console.log('✅ .env.local 파일에 키 쌍이 추가되었습니다!')
  } catch (error) {
    console.log('⚠️  .env.local 파일 자동 추가 실패. 수동으로 추가해주세요.')
  }
}

if (require.main === module) {
  main()
}

module.exports = { generateKeyPair }
