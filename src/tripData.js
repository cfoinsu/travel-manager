const PUBLIC_BASECAMP_LOCATION = '제주시 애월읍 어음10길 85-29 (와일리제주)'
const PUBLIC_BASECAMP_COORDINATES = { lat: 33.456, lng: 126.341 }

export const TRIP_META = {
  title: '와일리제주 광복절 가족여행',
  subtitle: '토 8/15 ~ 월 8/17',
  commandName: '여행매니저',
  airbnb: {
    name: '와일리제주 (Wylie Jeju)',
    url: 'https://www.wylie.co.kr/lodging/main',
    manualUrl: null,
    location: PUBLIC_BASECAMP_LOCATION,
    checkIn: '체크인 오후 3시 이후',
    checkOut: '체크아웃 오전 11시 이전',
    gateNote: '출입 및 주차 안내는 공개 데모에서 생략됩니다.',
    parkingNote: '주차 안내는 공개 버전에서 단순화되어 있습니다.',
    directionsNote: '제주공항에서 약 30분(26km), 애월읍 방향 진입 후 현장 안내에 따르세요.',
    lockNote: null,
    wifiNetwork: 'Wyliehouse_jeju',
    wifiPassword: 'Wylie0102!',
    hostName: null,
    coHostName: null,
    guestSummary: '1층 2명 / 2층 4명 수용. 3가족 총 9명 기준 배정.',
    confirmationCode: null,
    vehicleFee: '렌터카 별도 운영. 공항 픽업 후 각 가족 이동.',
  },
}

export const MAP_POINTS = [
  {
    id: 'sf-silver-peak',
    label: '김씨 가족',
    caption: '서울 (김포→제주)',
    familyId: 'silver-peak',
    focusDay: 'thursday',
    tone: 'critical',
    position: { lat: 37.5583, lng: 126.7906 },
  },
  {
    id: 'sf-desert-bloom',
    label: '박씨 가족',
    caption: '대전 (청주→제주)',
    familyId: 'desert-bloom',
    focusDay: 'friday',
    tone: 'violet',
    position: { lat: 36.7166, lng: 127.499 },
  },
  {
    id: 'la-north-star',
    label: '이씨 가족',
    caption: '수원 (김포→제주)',
    familyId: 'north-star',
    focusDay: 'thursday',
    tone: 'warning',
    position: { lat: 37.5583, lng: 126.7906 },
  },
  {
    id: 'pine-mountain-lake',
    label: '베이스캠프',
    caption: '와일리제주 (애월읍)',
    familyId: 'all',
    focusDay: 'all',
    tone: 'success',
    position: PUBLIC_BASECAMP_COORDINATES,
  },
  {
    id: 'yosemite',
    label: '협재해수욕장',
    caption: '주요 활동 거점',
    familyId: 'all',
    focusDay: 'friday',
    tone: 'muted',
    position: { lat: 33.394, lng: 126.239 },
  },
]

export const MAP_ROUTES = [
  {
    id: 'route-sf-silver-peak',
    familyId: 'silver-peak',
    focusDay: 'thursday',
    tone: 'critical',
    path: [
      { lat: 37.5583, lng: 126.7906 },
      { lat: 33.5065, lng: 126.4934 },
      PUBLIC_BASECAMP_COORDINATES,
    ],
  },
  {
    id: 'route-sf-desert-bloom',
    familyId: 'desert-bloom',
    focusDay: 'friday',
    tone: 'violet',
    dashed: true,
    path: [
      { lat: 36.7166, lng: 127.499 },
      { lat: 33.5065, lng: 126.4934 },
      PUBLIC_BASECAMP_COORDINATES,
    ],
  },
  {
    id: 'route-la-north-star',
    familyId: 'north-star',
    focusDay: 'thursday',
    tone: 'warning',
    path: [
      { lat: 37.5583, lng: 126.7906 },
      { lat: 33.5065, lng: 126.4934 },
      PUBLIC_BASECAMP_COORDINATES,
    ],
  },
  {
    id: 'route-yosemite-day',
    familyId: 'all',
    focusDay: 'friday',
    tone: 'muted',
    path: [
      PUBLIC_BASECAMP_COORDINATES,
      { lat: 33.404, lng: 126.247 },
      { lat: 33.394, lng: 126.239 },
    ],
  },
]

export const MAP_FACILITIES = [
  {
    id: 'jeju-airport',
    label: '제주국제공항',
    caption: '입·출국 허브',
    category: 'logistics',
    position: { lat: 33.5065, lng: 126.4934 },
  },
  {
    id: 'hanrim-park',
    label: '한림공원',
    caption: '일요일 가족 나들이',
    category: 'activity',
    position: { lat: 33.404, lng: 126.247 },
  },
  {
    id: 'hyeopjae-beach',
    label: '협재해수욕장',
    caption: '에메랄드 바다 / 아이 친화',
    category: 'activity',
    position: { lat: 33.394, lng: 126.239 },
  },
  {
    id: 'aewol-cafe',
    label: '애월 카페거리',
    caption: '해안 카페 / 음료 정차',
    category: 'logistics',
    position: { lat: 33.4647, lng: 126.3092 },
  },
]

export const NAV_ITEMS = [
  { id: 'itinerary', label: '일정' },
  { id: 'stay', label: '숙소' },
  { id: 'meals', label: '식사' },
  { id: 'activities', label: '활동' },
  { id: 'expenses', label: '비용' },
  { id: 'families', label: '참여 가족' },
]

export const DAYS = [
  {
    id: 'thu',
    shortLabel: '토 8/15',
    title: '이동의 날 (광복절)',
    weather: '맑음',
    temperature: '30°C',
    caution: 'Low',
  },
  {
    id: 'fri',
    shortLabel: '일 8/16',
    title: '협재해수욕장 & 한림공원',
    weather: '구름 조금',
    temperature: '31°C',
    caution: 'Low',
  },
  {
    id: 'sat',
    shortLabel: '월 8/17',
    title: '귀가',
    weather: '맑음',
    temperature: '30°C',
    caution: 'Low',
  },
]

export const TIME_SLOTS = ['00', '06', '12', '18']

export const INITIAL_FAMILIES = [
  {
    id: 'north-star',
    name: '이씨 가족',
    origin: '수원',
    shortOrigin: '수원',
    status: '이동 중',
    eta: '토 오후 2시',
    driveTime: '약 1시간 (비행)',
    headcount: '어른 2명, 아이 1명',
    vehicle: '렌터카',
    responsibility: '간식 + 아이 짐',
    readiness: 82,
    routeSummary: '수원 → 김포공항 → 제주공항 → 와일리제주',
    checklist: [
      { id: 'flight-checkin', label: '항공 체크인 완료', done: true },
      { id: 'kid-bag', label: '아이 놀이 가방 준비', done: true },
      { id: 'snacks', label: '차량 간식 확보', done: false },
      { id: 'rental-car', label: '렌터카 예약 확인', done: false },
    ],
  },
  {
    id: 'silver-peak',
    name: '김씨 가족',
    origin: '서울',
    shortOrigin: '서울',
    status: '이동 중',
    eta: '토 오후 2시',
    driveTime: '약 1시간 (비행)',
    headcount: '어른 2명, 아이 1명',
    vehicle: '렌터카',
    responsibility: '아이스박스 + 아침 과일',
    readiness: 88,
    routeSummary: '서울 → 김포공항 → 제주공항 → 와일리제주',
    checklist: [
      { id: 'beach-gear', label: '해변 타월 & 튜브 준비', done: true },
      { id: 'breakfast', label: '아침 과일 챙김', done: true },
      { id: 'kids-shoes', label: '아이 여분 신발', done: false },
      { id: 'charger', label: '보조배터리 준비', done: true },
    ],
  },
  {
    id: 'desert-bloom',
    name: '박씨 가족',
    origin: '대전',
    shortOrigin: '대전',
    status: '금요일 합류',
    eta: '토 오후 4시',
    driveTime: '약 1시간 (비행)',
    headcount: '어른 2명, 아이 1명',
    vehicle: '렌터카',
    responsibility: '바베큐 장비 + 일요일 점심',
    readiness: 71,
    routeSummary: '대전 → 청주공항 → 제주공항 → 와일리제주',
    checklist: [
      { id: 'flight-checkin', label: '항공 체크인 완료', done: true },
      { id: 'grill-kit', label: '바베큐 장비 패킹', done: false },
      { id: 'beach-daypack', label: '협재해수욕장 당일 배낭', done: false },
      { id: 'jeju-pass', label: '제주 렌터카 예약 확인', done: true },
    ],
  },
]

export const ITINERARY_ROWS = [
  {
    id: 'travel',
    label: '이동',
    segments: [
      { id: 'north-star-flight', familyId: 'north-star', start: 1.75, span: 0.5, color: 'warning', label: '이씨 가족 비행' },
      { id: 'silver-peak-flight', familyId: 'silver-peak', start: 2.0, span: 0.5, color: 'critical', label: '김씨 가족 비행' },
      { id: 'desert-bloom-flight', familyId: 'desert-bloom', start: 2.5, span: 0.5, color: 'violet', label: '박씨 가족 비행' },
    ],
  },
  {
    id: 'activities',
    label: '주요 활동',
    segments: [
      { id: 'thu-arrive', start: 0.7, span: 2.53, color: 'critical', label: '비행 + 체크인' },
      { id: 'fri-beach', start: 4, span: 4, color: 'info', label: '협재해수욕장 & 한림공원' },
      { id: 'sat-return', start: 8, span: 3, color: 'success', label: '귀가' },
    ],
  },
  {
    id: 'support',
    label: '지원',
    segments: [
      { id: 'airbnb-checkin', start: 2, span: 1, color: 'muted', label: '와일리제주 체크인' },
      { id: 'groceries', start: 3.5, span: 0.5, color: 'muted', label: '마트 장보기' },
      { id: 'checkout-prep', start: 7, span: 1, color: 'muted', label: '체크아웃 준비' },
    ],
  },
]

export const INITIAL_MEALS = [
  { id: 'thu-dinner', day: '토요일', meal: '와일리제주 첫날 바베큐', owner: '공동', status: 'Assigned', note: '체크인 후 와일리제주 테라스에서 바베큐. 이동 피로를 풀며 가볍게 시작.' },
  { id: 'fri-breakfast', day: '일요일', meal: '베이스캠프 아침 식사', owner: '공동', status: 'Assigned', note: '일요일 아침은 와일리에서 여유롭게. 협재 출발 전 든든히.' },
  { id: 'fri-lunch', day: '일요일', meal: '협재 해녀의 집', owner: '현장 방문', status: 'Assigned', note: '협재해수욕장 근처 해녀 식당. 성게국수·전복죽으로 제주 맛 체험.' },
  { id: 'fri-dinner', day: '일요일', meal: '제주 흑돼지 구이', owner: '현장 방문', status: 'Assigned', note: '제주 흑돼지는 필수. 애월읍 인근 흑돼지 전문점 예약 필요.' },
  { id: 'sat-breakfast', day: '월요일', meal: '베이스캠프 브런치 후 체크아웃', owner: '공동', status: 'Assigned', note: '체크아웃 전 와일리에서 브런치. 짐 정리 후 공항으로 이동.' },
]

export const INITIAL_EXPENSES = [
  { id: 'airbnb', label: '와일리제주 숙박', payer: '이씨 가족', amount: 900000, split: '3가족 분담', settled: false },
  { id: 'flights', label: '항공권 (각 가족)', payer: '각 가족', amount: 0, split: '개별 부담', settled: true },
  { id: 'rental-car', label: '렌터카', payer: '김씨 가족', amount: 200000, split: '공동 분담', settled: false },
  { id: 'groceries', label: '식재료 & 장보기', payer: '김씨 가족', amount: 120000, split: '공동 식비', settled: false },
]

export const ACTIVITIES = [
  {
    id: 'thu-transit',
    title: '비행 + 체크인',
    status: 'Go',
    window: '토요일 / 오후',
    description: '3가족 제주 입도. 공항 픽업 후 렌터카로 와일리제주 이동. 첫날 목표는 도착과 체크인, 가벼운 저녁 바베큐.',
    backup: '항공 지연 시 저녁 바베큐 시간 조정. 시장 방문은 다음날로 이동.',
  },
  {
    id: 'fri-lake',
    title: '협재해수욕장 & 한림공원',
    status: 'Go',
    window: '일요일 / 종일',
    description: '제주 에메랄드 바다. 협재해수욕장은 아이들 천국. 한림공원 선택 코스 추가. 점심은 해녀의 집.',
    backup: '날씨 변화 시 한림공원 위주로 일정 전환. 카페 투어 추가.',
  },
  {
    id: 'sat-yosemite',
    title: '체크아웃 & 귀가',
    status: 'Go',
    window: '월요일 / 오전',
    description: '짐 정리, 와일리제주 원상복구, 체크아웃. 공항으로 이동 후 각 가족 항공편 탑승.',
    backup: '전날 밤 짐 사전 정리로 아침 혼잡 최소화. 동문시장 짧게 들르기.',
  },
]

export const STAY_DETAILS = {
  commandSummary: '베이스캠프는 제주시 애월읍 와일리제주. 제주공항에서 약 30분 거리.',
  houseOps: [
    '1층 2명 / 2층 4명 수용. 가족 구성에 맞게 방 배정 사전 조율.',
    '와이파이: Wyliehouse_jeju / Wylie0102!',
    '렌터카 픽업 공항에서 진행 후 와일리제주로 직행.',
    '체크아웃 당일 아침 공항 이동 시간 역산해 짐 정리 스케줄 확정.',
  ],
  rooms: [
    { label: '1층', assignment: '이씨 가족 (2명)' },
    { label: '2층', assignment: '김씨 가족 + 박씨 가족 (최대 4명)' },
    { label: '공용 거실', assignment: '아이들 놀이 공간 / 공동 활용' },
  ],
}

export const INITIAL_NOTES = {
  itinerary: '미션 우선순위: 광복절 연휴 공항 혼잡 최소화. 일요일 협재를 여유 있게 즐길 것.',
  stay: '와이파이 Wyliehouse_jeju / Wylie0102! 도착 즉시 공유. 1층·2층 방 배정 사전 확인.',
  meals: '흑돼지 식당 예약 필수 (성수기). 협재 해녀의 집은 현장 방문.',
  activities: '협재해수욕장이 하이라이트. 아이들 수영 장비 필수 지참.',
  expenses: '숙박·렌터카는 선결제 후 정산. 항공권은 개별 부담으로 처리.',
  families: '광복절 연휴 공항 혼잡 예상. 탑승 2시간 전 도착 원칙.',
}
