export interface Book {
  id: string
  title: string
  author: string
  publisher: string
  price: number
  discountPrice: number
  discountRate: number
  image: string
  category: string
  description: string
  isbn: string
  publishDate: string
  pages: number
  rating: number
  reviewCount: number
  stock: number
}

export const demoBooks: Book[] = [
  {
    id: "1",
    title: "해리포터와 마법사의 돌",
    author: "J.K. 롤링",
    publisher: "문학수첩",
    price: 15000,
    discountPrice: 13500,
    discountRate: 10,
    image: "/todays-book-1.jpg",
    category: "판타지",
    description: "11살 생일날 해리포터는 자신이 마법사라는 사실을 알게 되고, 호그와트 마법학교에 입학하게 됩니다. 마법의 세계에서 펼쳐지는 모험과 우정의 이야기입니다.",
    isbn: "9788983921234",
    publishDate: "2023-01-15",
    pages: 320,
    rating: 4.8,
    reviewCount: 1250,
    stock: 50
  },
  {
    id: "2",
    title: "1984",
    author: "조지 오웰",
    publisher: "민음사",
    price: 12000,
    discountPrice: 10800,
    discountRate: 10,
    image: "/todays-book-2.jpg",
    category: "소설",
    description: "빅 브라더가 지켜보는 디스토피아 세계에서 벌어지는 이야기. 개인의 자유와 사상의 자유를 다룬 걸작 소설입니다.",
    isbn: "9788937412345",
    publishDate: "2023-02-20",
    pages: 280,
    rating: 4.6,
    reviewCount: 890,
    stock: 30
  },
  {
    id: "3",
    title: "자바스크립트 완벽 가이드",
    author: "데이비드 플래너건",
    publisher: "한빛미디어",
    price: 45000,
    discountPrice: 40500,
    discountRate: 10,
    image: "/todays-book-3.jpg",
    category: "프로그래밍",
    description: "자바스크립트의 모든 것을 다루는 완벽한 가이드북. 초보자부터 전문가까지 모든 개발자를 위한 필수 도서입니다.",
    isbn: "9788966263456",
    publishDate: "2023-03-10",
    pages: 1200,
    rating: 4.9,
    reviewCount: 2100,
    stock: 25
  },
  {
    id: "4",
    title: "마음의 평화",
    author: "달라이 라마",
    publisher: "불광출판사",
    price: 18000,
    discountPrice: 16200,
    discountRate: 10,
    image: "/todays-book-4.jpg",
    category: "자기계발",
    description: "현대인을 위한 마음의 평화를 찾는 방법. 달라이 라마의 지혜로운 조언이 담긴 책입니다.",
    isbn: "9788974794567",
    publishDate: "2023-04-05",
    pages: 240,
    rating: 4.7,
    reviewCount: 680,
    stock: 40
  },
  {
    id: "5",
    title: "코스모스",
    author: "칼 세이건",
    publisher: "사이언스북스",
    price: 25000,
    discountPrice: 22500,
    discountRate: 10,
    image: "/todays-book-5.jpg",
    category: "과학",
    description: "우주의 신비와 과학의 아름다움을 탐구하는 명작. 우주에 대한 호기심을 불러일으키는 책입니다.",
    isbn: "9788983715678",
    publishDate: "2023-05-12",
    pages: 480,
    rating: 4.8,
    reviewCount: 950,
    stock: 35
  },
  {
    id: "6",
    title: "부의 추월차선",
    author: "엠제이 드마코",
    publisher: "토트",
    price: 16000,
    discountPrice: 14400,
    discountRate: 10,
    image: "/publisher-book-1.jpg",
    category: "경제/경영",
    description: "부를 창조하는 새로운 사고방식과 실천 방법을 제시하는 책. 경제적 자유를 위한 로드맵을 제공합니다.",
    isbn: "9788994345678",
    publishDate: "2023-06-08",
    pages: 320,
    rating: 4.5,
    reviewCount: 1200,
    stock: 45
  },
  {
    id: "7",
    title: "사피엔스",
    author: "유발 하라리",
    publisher: "김영사",
    price: 22000,
    discountPrice: 19800,
    discountRate: 10,
    image: "/publisher-book-2.jpg",
    category: "역사",
    description: "인류의 역사를 새로운 관점에서 바라본 혁신적인 작품. 인간이 어떻게 지구를 지배하게 되었는지 탐구합니다.",
    isbn: "9788934986789",
    publishDate: "2023-07-15",
    pages: 520,
    rating: 4.9,
    reviewCount: 1800,
    stock: 20
  },
  {
    id: "8",
    title: "아토믹 해빗",
    author: "제임스 클리어",
    publisher: "비즈니스북스",
    price: 17000,
    discountPrice: 15300,
    discountRate: 10,
    image: "/publisher-book-3.jpg",
    category: "자기계발",
    description: "작은 습관의 놀라운 힘. 성공을 위한 원자적 습관을 만드는 방법을 제시합니다.",
    isbn: "9788960867890",
    publishDate: "2023-08-22",
    pages: 360,
    rating: 4.7,
    reviewCount: 1500,
    stock: 55
  },
  {
    id: "9",
    title: "노르웨이의 숲",
    author: "무라카미 하루키",
    publisher: "민음사",
    price: 14000,
    discountPrice: 12600,
    discountRate: 10,
    image: "/publisher-book-4.jpg",
    category: "소설",
    description: "청춘의 사랑과 상실을 그린 무라카미 하루키의 대표작. 1960년대 도쿄를 배경으로 한 감동적인 이야기입니다.",
    isbn: "9788937417890",
    publishDate: "2023-09-10",
    pages: 380,
    rating: 4.6,
    reviewCount: 1100,
    stock: 30
  },
  {
    id: "10",
    title: "리액트를 다루는 기술",
    author: "김민준",
    publisher: "길벗",
    price: 38000,
    discountPrice: 34200,
    discountRate: 10,
    image: "/publisher-book-5.jpg",
    category: "프로그래밍",
    description: "리액트 개발을 위한 완벽한 가이드. 실무에서 바로 사용할 수 있는 실전 예제와 팁이 가득합니다.",
    isbn: "9788966189012",
    publishDate: "2023-10-05",
    pages: 800,
    rating: 4.8,
    reviewCount: 900,
    stock: 25
  },
  {
    id: "11",
    title: "마음의 평화를 찾아서",
    author: "에크하르트 톨레",
    publisher: "불광출판사",
    price: 19000,
    discountPrice: 17100,
    discountRate: 10,
    image: "/publisher-book-6.jpg",
    category: "자기계발",
    description: "현재 순간에 집중하는 힘. 마음의 평화를 찾는 영적 여행을 안내하는 책입니다.",
    isbn: "9788974790123",
    publishDate: "2023-11-12",
    pages: 300,
    rating: 4.5,
    reviewCount: 750,
    stock: 40
  },
  {
    id: "12",
    title: "퀀텀 리빙",
    author: "딥초프 초프라",
    publisher: "갤리온",
    price: 21000,
    discountPrice: 18900,
    discountRate: 10,
    image: "/abstract-book-cover.png",
    category: "자기계발",
    description: "양자역학과 영성을 결합한 혁신적인 삶의 방식. 의식의 변화를 통한 삶의 질 향상 방법을 제시합니다.",
    isbn: "9788957071234",
    publishDate: "2023-12-01",
    pages: 350,
    rating: 4.4,
    reviewCount: 600,
    stock: 35
  }
]

export const getBookById = (id: string): Book | undefined => {
  return demoBooks.find(book => book.id === id)
}

export const getBooksByCategory = (category: string): Book[] => {
  return demoBooks.filter(book => book.category === category)
}

export const getFeaturedBooks = (): Book[] => {
  return demoBooks.slice(0, 5)
}

export const getRecommendedBooks = (): Book[] => {
  return demoBooks.slice(5, 10)
}



