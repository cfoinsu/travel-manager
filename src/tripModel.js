import { DAYS, TIME_SLOTS, TRIP_META } from './tripData'

export const COLLECTION_BY_TYPE = {
  family: 'families',
  location: 'locations',
  route: 'routes',
  itineraryItem: 'itineraryItems',
  meal: 'meals',
  activity: 'activities',
  stayItem: 'stayItems',
  expense: 'expenses',
  task: 'tasks',
}

export const ENTITY_PAGE = {
  family: 'families',
  location: 'stay',
  route: 'itinerary',
  itineraryItem: 'itinerary',
  meal: 'meals',
  activity: 'activities',
  stayItem: 'stay',
  expense: 'expenses',
  task: 'itinerary',
}

const DEFAULT_SELECTION = { type: 'activity', id: 'thu-transit' }
export const TRIP_DOCUMENT_STORAGE_KEY = 'trip-command-center/v4-public'
export const VIEWER_PROFILE_STORAGE_KEY = 'trip-command-center/viewer/v4-public'
const LEGACY_TRIP_DOCUMENT_STORAGE_KEYS = ['trip-command-center/v3-public', 'trip-command-center/v2', 'trip-command-center/v1']
const LEGACY_VIEWER_PROFILE_STORAGE_KEYS = ['trip-command-center/viewer/v3-public', 'trip-command-center/viewer']
const TIMELINE_HOURS_PER_SLOT = 24 / Math.max(TIME_SLOTS.length || 1, 1)
const PUBLIC_BASECAMP_ADDRESS = '제주시 애월읍 어음10길 85-29 (와일리제주)'
const PUBLIC_BASECAMP_COORDINATES = { lat: 33.456, lng: 126.341 }

const MAPS_LINKS = {
  airbnb: TRIP_META.airbnb.url,
  grill: 'https://www.google.com/maps/search/?api=1&query=협재+해녀의집+제주',
  twoGuys: 'https://www.google.com/maps/search/?api=1&query=제주+흑돼지+애월',
  mountainRoom: 'https://www.google.com/maps/search/?api=1&query=한림공원+제주',
  priestStation: 'https://www.google.com/maps/search/?api=1&query=협재해수욕장+제주',
  aroundHorn: 'https://www.google.com/maps/search/?api=1&query=애월+카페거리+제주',
  yosemite: 'https://www.google.com/maps/search/?api=1&query=협재해수욕장+제주',
}

const SHARED_CONVOY_WINDOWS = {
  thuDinner: { startSlot: 2.94, endSlot: 3 },
  thuDinnerReturn: { startSlot: 3.17, endSlot: 3.23 },
  friLunch: { startSlot: 6.1, endSlot: 6.22 },
  friLunchReturn: { startSlot: 6.44, endSlot: 6.56 },
  satYosemite: { startSlot: 9.02, endSlot: 9.22 },
  satDinner: { startSlot: 10.78, endSlot: 10.96 },
  satDinnerReturn: { startSlot: 11.2, endSlot: 11.3 },
}

function getConvoyWindowSpan(window) {
  return Number((window.endSlot - window.startSlot).toFixed(2))
}

const PUBLIC_FAMILY_PROFILES = {
  'north-star': {
    title: '이씨 가족',
    name: '이씨 가족',
    shortOrigin: '수원',
    origin: '수원',
    originAddress: '경기도 수원시 팔달구 인계동',
    originCoordinates: { lat: 37.5583, lng: 126.7906 },
    responsibility: '간식 + 아이 짐',
    routeSummary: '수원 → 김포공항 → 제주공항 → 와일리제주.',
    note: '1진 도착 커버리지 담당 공개 여행 유닛.',
  },
  'silver-peak': {
    title: '김씨 가족',
    name: '김씨 가족',
    shortOrigin: '서울',
    origin: '서울',
    originAddress: '서울특별시 중구 을지로',
    originCoordinates: { lat: 37.5583, lng: 126.7906 },
    responsibility: '아이스박스 + 아침 과일',
    routeSummary: '서울 → 김포공항 → 제주공항 → 와일리제주.',
    note: '당일 서울 출발 커버리지 담당 공개 여행 유닛.',
  },
  'desert-bloom': {
    title: '박씨 가족',
    name: '박씨 가족',
    shortOrigin: '대전',
    origin: '대전',
    originAddress: '대전광역시 서구 둔산동',
    originCoordinates: { lat: 36.7166, lng: 127.499 },
    responsibility: '바베큐 장비 + 일요일 점심',
    routeSummary: '대전 → 청주공항 → 제주공항 → 와일리제주.',
    note: '지연 도착 브랜치 담당 공개 여행 유닛.',
  },
}

const PUBLIC_BASECAMP = {
  name: '와일리제주 (Wylie Jeju)',
  address: PUBLIC_BASECAMP_ADDRESS,
  coordinates: PUBLIC_BASECAMP_COORDINATES,
  summary: '제주시 애월읍 와일리제주. 제주공항에서 약 30분 거리. 전 가족 도착·휴식·출발 거점.',
  accessNote: '입주 및 출입 안내는 공개 버전에서 생략됩니다.',
  directionsNote: '제주공항에서 애월읍 방면 약 26km. 렌터카 이용 권장.',
  parkingNote: '주차 안내는 공개 버전에서 단순화되어 있습니다.',
  lockNote: null,
  checkIn: '체크인 오후 3시 이후',
  checkOut: '체크아웃 오전 11시 이전',
  wifiNetwork: 'Wyliehouse_jeju',
  wifiPassword: 'Wylie0102!',
  hostName: null,
  coHostName: null,
  guestSummary: '1층 2명 / 2층 4명 수용. 3가족 총 9명 기준 배정.',
  confirmationCode: null,
  vehicleFee: '렌터카 별도 운영. 공항 픽업 후 각 가족 이동.',
  externalUrl: null,
  manualUrl: null,
  photos: [
    {
      id: 'public-basecamp-exterior',
      label: 'Basecamp exterior reference',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
      sourceUrl: null,
    },
    {
      id: 'public-basecamp-interior',
      label: 'Basecamp interior reference',
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
      sourceUrl: null,
    },
  ],
}

const PUBLIC_STAY_SUMMARIES = {
  'stay-basecamp': '와일리제주를 거점으로 전 가족 입주·정착·출발 운영.',
  'stay-gate-access': '입주 절차는 공개 버전에서 일반화되어 있습니다.',
  'stay-room-assignments': '1층 2명 / 2층 4명. 방 배정은 공개 버전에서 일반화되어 있습니다.',
  'stay-beach-parking': '렌터카 주차 안내는 공개 버전에서 단순화되어 있습니다.',
}

const PUBLIC_STAY_NOTES = {
  'stay-basecamp': '도착 안내는 공개 버전에서 개략적으로만 유지됩니다.',
  'stay-gate-access': '구체적인 출입 안내는 공개되지 않습니다.',
  'stay-room-assignments': '가족별 방 배정은 공개되지 않습니다.',
  'stay-beach-parking': '차량 계획은 공개 버전에서 일반화되어 있습니다.',
}

const PUBLIC_EXPENSE_PAYER = 'Shared'

const LOCATION_MEDIA = {
  'pine-airbnb': PUBLIC_BASECAMP.photos,
  'grill-pml': [
    {
      id: 'grill-dining',
      label: 'Dinner reference',
      imageUrl:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.grill,
    },
  ],
  'two-guys-pizza': [
    {
      id: 'two-guys-pizza-dining',
      label: 'Pizza dinner reference',
      imageUrl:
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.twoGuys,
    },
  ],
  'mountain-room': [
    {
      id: 'mountain-room-dining',
      label: 'Mountain Room reference',
      imageUrl:
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.mountainRoom,
    },
  ],
  'priest-station': [
    {
      id: 'priest-station-stop',
      label: 'Roadside lunch reference',
      imageUrl:
        'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.priestStation,
    },
  ],
  'around-horn': [
    {
      id: 'around-horn-dining',
      label: 'Return dinner reference',
      imageUrl:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.aroundHorn,
    },
  ],
  yosemite: [
    {
      id: 'yosemite-view',
      label: 'West entrance reference',
      imageUrl:
        'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.yosemite,
    },
  ],
}

const DAY_NAME_TO_ID = {
  Thursday: 'thu',
  Friday: 'fri',
  Saturday: 'sat',
  Sunday: 'sun',
  목요일: 'thu',
  금요일: 'fri',
  토요일: 'thu',
  일요일: 'fri',
  월요일: 'sat',
}

const LEGACY_FAMILY_TASKS = {
  'north-star': {
    'car-pack': 'task-car-pack',
    'kid-bag': 'task-kid-bag',
    groceries: 'task-road-snacks',
    firewood: 'task-firewood',
  },
  'silver-peak': {
    'lake-gear': 'task-lake-gear',
    breakfast: 'task-breakfast-fruit',
    'kids-shoes': 'task-kids-shoes',
    charger: 'task-charger',
  },
  'desert-bloom': {
    'late-arrival': 'task-late-arrival',
    'grill-kit': 'task-grill-kit',
    'yosemite-daypack': 'task-yosemite-daypacks',
    'park-pass': 'task-park-docs',
  },
}

function createDefaultTripMeta() {
  return {
    title: TRIP_META.title,
    subtitle: TRIP_META.subtitle,
    commandName: TRIP_META.commandName,
  }
}

function toNonNegativeInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function parseHeadcountParts(headcount) {
  if (typeof headcount !== 'string') return { adults: null, children: null }
  const numbers = headcount.match(/\d+/g)?.map((item) => Number.parseInt(item, 10)) || []

  return {
    adults: Number.isFinite(numbers[0]) ? numbers[0] : null,
    children: Number.isFinite(numbers[1]) ? numbers[1] : null,
  }
}

export function formatFamilyHeadcount({ adults = 0, children = 0 } = {}) {
  const safeAdults = Math.max(Number.parseInt(adults, 10) || 0, 0)
  const safeChildren = Math.max(Number.parseInt(children, 10) || 0, 0)
  const adultLabel = safeAdults === 1 ? '1 adult' : `${safeAdults} adults`
  const childLabel = safeChildren === 1 ? '1 child' : `${safeChildren} children`

  if (safeChildren <= 0) return adultLabel
  if (safeAdults <= 0) return childLabel
  return `${adultLabel} / ${childLabel}`
}

function normalizeFamilyRecord(family, fallback = {}) {
  const seed = fallback || {}
  const parsedHeadcount = parseHeadcountParts(family?.headcount || seed?.headcount)
  const adults = toNonNegativeInteger(
    family?.adults,
    parsedHeadcount.adults ?? toNonNegativeInteger(seed?.adults, 0),
  )
  const children = toNonNegativeInteger(
    family?.children,
    parsedHeadcount.children ?? toNonNegativeInteger(seed?.children, 0),
  )
  const title = family?.title || family?.name || seed?.title || seed?.name || 'New family'
  const origin = family?.origin || seed?.origin || ''

  return {
    ...seed,
    ...family,
    type: 'family',
    title,
    name: family?.name || title,
    shortOrigin: family?.shortOrigin || seed?.shortOrigin || origin,
    origin,
    adults,
    children,
    headcount: formatFamilyHeadcount({ adults, children }),
    plannedStopIds: Array.isArray(family?.plannedStopIds)
      ? family.plannedStopIds
      : Array.isArray(seed?.plannedStopIds)
        ? seed.plannedStopIds
        : [],
    taskIds: Array.isArray(family?.taskIds)
      ? family.taskIds
      : Array.isArray(seed?.taskIds)
        ? seed.taskIds
        : [],
    linkedEntityKeys: Array.isArray(family?.linkedEntityKeys)
      ? family.linkedEntityKeys
      : Array.isArray(seed?.linkedEntityKeys)
        ? seed.linkedEntityKeys
        : [],
  }
}

export function makeEntityKey(type, id) {
  return `${type}:${id}`
}

export function parseEntityKey(key) {
  const [type, ...rest] = key.split(':')
  return { type, id: rest.join(':') }
}

export function getCollection(doc, type) {
  const collectionName = COLLECTION_BY_TYPE[type]
  return collectionName ? doc[collectionName] || [] : []
}

export function getEntityById(doc, type, id) {
  return getCollection(doc, type).find((item) => item.id === id) || null
}

export function getEntityBySelection(doc, selection) {
  if (!selection?.type || !selection?.id) return null
  return getEntityById(doc, selection.type, selection.id)
}

export function getEntityTitle(entity) {
  if (!entity) return 'No selection'
  return entity.title || entity.name || entity.label || entity.meal || entity.id
}

export function getDayMeta(dayId) {
  return DAYS.find((day) => day.id === dayId) || null
}

export function getSlotLabel(slotIndex) {
  const safeSlotIndex = Number.isFinite(slotIndex) ? Math.max(slotIndex, 0) : 0
  const dayIndex = Math.floor(safeSlotIndex / TIME_SLOTS.length)
  const slotIndexWithinDay = Math.floor(safeSlotIndex % TIME_SLOTS.length)
  const slot = TIME_SLOTS[slotIndexWithinDay]
  const day = DAYS[dayIndex]
  if (!day) return `${slot}:00`

  const fractionalSlot = safeSlotIndex - Math.floor(safeSlotIndex)
  const baseHour = Number(slot) || 0
  const totalMinutes = Math.round((baseHour + fractionalSlot * 6) * 60)
  const hour24 = Math.floor(totalMinutes / 60) % 24
  const minute = totalMinutes % 60
  const meridiem = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 || 12

  return `${day.shortLabel} ${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${meridiem}`
}

export function getRouteSimulationWindow(doc, route) {
  if (!route) {
    return { start: 0, end: 1 }
  }

  if (route.linkedEntityKey) {
    const linked = parseEntityKey(route.linkedEntityKey)
    if (linked.type === 'itineraryItem') {
      const linkedItem = doc?.itineraryItems?.find((item) => item.id === linked.id)
      if (linkedItem && Number.isFinite(linkedItem.startSlot)) {
        const fallbackSpan = Number.isFinite(linkedItem.span) && linkedItem.span > 0 ? linkedItem.span : 1
        const span = getRouteDurationSlotSpan(route, fallbackSpan)
        return {
          start: linkedItem.startSlot,
          end: linkedItem.startSlot + span,
        }
      }
    }
  }

  const start = Number.isFinite(route.simulationStartSlot) ? route.simulationStartSlot : 0
  const fallbackSpan =
    Number.isFinite(route.simulationEndSlot) && route.simulationEndSlot > start
      ? route.simulationEndSlot - start
      : 1
  const end = start + getRouteDurationSlotSpan(route, fallbackSpan)
  return { start, end }
}

export function getRouteDurationSlotSpan(route, fallbackSpan = 1) {
  const simulationStartSlot = Number(route?.simulationStartSlot)
  const simulationEndSlot = Number(route?.simulationEndSlot)
  if (
    Number.isFinite(simulationStartSlot) &&
    Number.isFinite(simulationEndSlot) &&
    simulationEndSlot > simulationStartSlot
  ) {
    return simulationEndSlot - simulationStartSlot
  }

  const durationSeconds = Number(route?.durationSeconds)
  if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
    return durationSeconds / 3600 / TIMELINE_HOURS_PER_SLOT
  }
  return fallbackSpan
}

export function getItineraryItemEffectiveSpan(doc, item) {
  if (!item) return 1

  const fallbackSpan = Number.isFinite(item.span) && item.span > 0 ? item.span : 1
  if (!item.routeId) return fallbackSpan

  const route = doc?.routes?.find((candidate) => candidate.id === item.routeId)
  return getRouteDurationSlotSpan(route, fallbackSpan)
}

export function isEntityOnPage(entity, pageId) {
  if (!entity) return false
  if (entity.type === 'location') {
    return ['stay', 'meals', 'activities', 'itinerary'].includes(pageId)
  }
  return ENTITY_PAGE[entity.type] === pageId
}

function buildLocations() {
  return [
    {
      id: 'pine-airbnb',
      type: 'location',
      title: TRIP_META.airbnb.name,
      category: 'stay',
      dayId: 'all',
      address: TRIP_META.airbnb.location,
      coordinates: PUBLIC_BASECAMP.coordinates,
      externalUrl: MAPS_LINKS.airbnb,
      summary: '전체 운영 거점. 출입, 주차, 방 배정, 정착 물류 모두 여기서 진행.',
      parkingNote: TRIP_META.airbnb.parkingNote,
      accessNote: TRIP_META.airbnb.gateNote,
      directionsNote: TRIP_META.airbnb.directionsNote,
      lockNote: TRIP_META.airbnb.lockNote,
      checkIn: TRIP_META.airbnb.checkIn,
      checkOut: TRIP_META.airbnb.checkOut,
      wifiNetwork: TRIP_META.airbnb.wifiNetwork,
      wifiPassword: TRIP_META.airbnb.wifiPassword,
      hostName: TRIP_META.airbnb.hostName,
      coHostName: TRIP_META.airbnb.coHostName,
      guestSummary: TRIP_META.airbnb.guestSummary,
      confirmationCode: TRIP_META.airbnb.confirmationCode,
      vehicleFee: TRIP_META.airbnb.vehicleFee,
      manualUrl: TRIP_META.airbnb.manualUrl,
      photos: LOCATION_MEDIA['pine-airbnb'],
      linkedEntityKeys: [
        makeEntityKey('stayItem', 'stay-basecamp'),
        makeEntityKey('stayItem', 'stay-gate-access'),
        makeEntityKey('stayItem', 'stay-room-assignments'),
        makeEntityKey('stayItem', 'stay-checkout-reset'),
      ],
    },
    {
      id: 'north-star-kettleman-lunch',
      type: 'location',
      title: '제주공항 픽업 포인트',
      category: 'logistics',
      dayId: 'thu',
      stopType: '공항 픽업',
      placesQuery: '제주국제공항',
      address: '제주특별자치도 제주시 공항로 2',
      coordinates: { lat: 33.5065, lng: 126.4934 },
      externalUrl: 'https://www.google.com/maps/search/?api=1&query=제주국제공항',
      summary: '이씨·김씨 가족 제주공항 도착. 렌터카 픽업 후 와일리제주로 이동.',
      linkedEntityKeys: [
        makeEntityKey('family', 'north-star'),
        makeEntityKey('itineraryItem', 'north-star-drive'),
      ],
      photos: [],
    },
    {
      id: 'north-star-oakdale-break',
      type: 'location',
      title: '제주공항 도착 허브',
      category: 'logistics',
      dayId: 'thu',
      stopType: '공항 집결',
      placesQuery: '제주국제공항',
      address: '제주특별자치도 제주시 공항로 2',
      coordinates: { lat: 33.5065, lng: 126.4934 },
      externalUrl: 'https://www.google.com/maps/search/?api=1&query=제주국제공항',
      summary: '전 가족 제주공항 집결. 렌터카 픽업 및 와일리제주 이동 출발 기점.',
      linkedEntityKeys: [
        makeEntityKey('family', 'north-star'),
        makeEntityKey('family', 'silver-peak'),
        makeEntityKey('itineraryItem', 'north-star-drive'),
        makeEntityKey('itineraryItem', 'silver-peak-drive'),
      ],
      photos: [],
    },
    {
      id: 'grill-pml',
      type: 'location',
      title: '협재 해녀의 집',
      category: 'meal',
      dayId: 'fri',
      placesQuery: '협재 해녀의집 제주',
      address: '제주시 한림읍 협재리 협재해수욕장 인근',
      coordinates: { lat: 33.394, lng: 126.239 },
      externalUrl: MAPS_LINKS.grill,
      summary: '일요일 점심. 협재해수욕장 인근 해녀 식당. 성게국수·전복죽으로 제주 맛 체험.',
      reservationNote: '현장 방문. 성수기 대기 가능.',
      photos: LOCATION_MEDIA['grill-pml'],
      linkedEntityKeys: [makeEntityKey('meal', 'fri-lunch')],
    },
    {
      id: 'two-guys-pizza',
      type: 'location',
      title: '제주 흑돼지 구이',
      category: 'meal',
      dayId: 'fri',
      placesQuery: '제주 흑돼지 애월',
      address: '제주시 애월읍 인근 흑돼지 전문점',
      coordinates: { lat: 33.4647, lng: 126.3092 },
      externalUrl: MAPS_LINKS.twoGuys,
      summary: '일요일 저녁 제주 흑돼지 구이. 제주 여행 필수 코스. 애월읍 인근 예약 필요.',
      reservationNote: '광복절 연휴 성수기 예약 필수.',
      photos: LOCATION_MEDIA['two-guys-pizza'],
      linkedEntityKeys: [makeEntityKey('meal', 'thu-dinner')],
    },
    {
      id: 'mountain-room',
      type: 'location',
      title: '한림공원',
      category: 'activity',
      dayId: 'fri',
      placesQuery: '한림공원 제주',
      address: '제주시 한림읍 한림로 300',
      coordinates: { lat: 33.404, lng: 126.247 },
      externalUrl: MAPS_LINKS.mountainRoom,
      summary: '협재해수욕장 인근 한림공원. 아이들 친화 관광지. 협재와 함께 일요일 코스.',
      reservationNote: '유료 입장. 현장 구매.',
      photos: LOCATION_MEDIA['mountain-room'],
      linkedEntityKeys: [],
    },
    {
      id: 'priest-station',
      type: 'location',
      title: '협재해수욕장',
      category: 'activity',
      dayId: 'fri',
      placesQuery: '협재해수욕장 제주',
      address: '제주시 한림읍 협재리',
      coordinates: { lat: 33.394, lng: 126.239 },
      externalUrl: MAPS_LINKS.priestStation,
      summary: '에메랄드빛 제주 서쪽 해변. 아이 친화, 수심 얕음. 일요일 메인 활동 거점.',
      reservationNote: '무료 입장. 성수기 주차 혼잡 주의.',
      photos: LOCATION_MEDIA['priest-station'],
      linkedEntityKeys: [],
    },
    {
      id: 'around-horn',
      type: 'location',
      title: '애월 카페거리',
      category: 'logistics',
      dayId: 'fri',
      placesQuery: '애월 카페거리 제주',
      address: '제주시 애월읍 애월해안로',
      coordinates: { lat: 33.4647, lng: 126.3092 },
      externalUrl: MAPS_LINKS.aroundHorn,
      summary: '와일리제주 인근 해안 카페거리. 저녁 식사 후 산책 또는 음료 타임.',
      reservationNote: '현장 방문.',
      photos: LOCATION_MEDIA['around-horn'],
      linkedEntityKeys: [makeEntityKey('meal', 'sat-dinner')],
    },
    {
      id: 'pine-lake-beach',
      type: 'location',
      title: '협재해수욕장',
      category: 'activity',
      dayId: 'fri',
      address: '제주시 한림읍 협재리',
      coordinates: { lat: 33.394, lng: 126.239 },
      externalUrl: 'https://www.google.com/maps/search/?api=1&query=협재해수욕장+제주',
      summary: '일요일 메인 활동 구역. 에메랄드빛 제주 서쪽 해변. 아이 친화, 수심 얕음.',
      photos: LOCATION_MEDIA['pine-airbnb'],
      linkedEntityKeys: [
        makeEntityKey('activity', 'fri-lake'),
        makeEntityKey('itineraryItem', 'fri-lake'),
      ],
    },
    {
      id: 'yosemite',
      type: 'location',
      title: '협재해수욕장 & 한림공원',
      category: 'activity',
      dayId: 'fri',
      placesQuery: '협재해수욕장 제주',
      address: '제주시 한림읍 협재리',
      coordinates: { lat: 33.394, lng: 126.239 },
      externalUrl: MAPS_LINKS.yosemite,
      summary: '일요일 메인 앵커. 협재해수욕장 + 한림공원. 아이 친화 최적 코스.',
      photos: LOCATION_MEDIA.yosemite,
      linkedEntityKeys: [
        makeEntityKey('activity', 'fri-lake'),
        makeEntityKey('itineraryItem', 'fri-lake'),
      ],
    },
    {
      id: 'big-oak-flat',
      type: 'location',
      title: '한림공원 입구',
      category: 'activity',
      dayId: 'fri',
      address: '제주시 한림읍 한림로 300',
      coordinates: { lat: 33.404, lng: 126.247 },
      externalUrl: 'https://www.google.com/maps/search/?api=1&query=한림공원+제주',
      summary: '협재해수욕장과 세트로 운영. 아이들 용암동굴·식물원 체험.',
      linkedEntityKeys: [makeEntityKey('activity', 'fri-lake')],
      photos: LOCATION_MEDIA.yosemite,
    },
    {
      id: 'groveland-grocery',
      type: 'location',
      title: '애월 이마트 / 마트',
      category: 'logistics',
      dayId: 'thu',
      address: '제주시 애월읍 인근',
      coordinates: { lat: 33.456, lng: 126.341 },
      externalUrl: 'https://www.google.com/maps/search/?api=1&query=애월+마트+제주',
      summary: '체크인 직후 또는 일요일 당일 마지막 식재료 보충 정차.',
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'groceries'),
        makeEntityKey('task', 'task-grocery-run'),
      ],
      photos: [],
    },
    {
      id: 'groveland-fuel',
      type: 'location',
      title: '제주공항 렌터카 반납',
      category: 'logistics',
      dayId: 'sat',
      address: '제주시 공항로 2 제주국제공항',
      coordinates: { lat: 33.5065, lng: 126.4934 },
      externalUrl: 'https://www.google.com/maps/search/?api=1&query=제주국제공항',
      summary: '월요일 귀가 시 렌터카 반납 및 탑승 수속.',
      linkedEntityKeys: [
        makeEntityKey('family', 'north-star'),
        makeEntityKey('family', 'silver-peak'),
        makeEntityKey('family', 'desert-bloom'),
      ],
      photos: [],
    },
  ]
}

function buildFamilies() {
  return []
}

function buildFamilies_SAMPLE_BACKUP() {
  return [
    {
      id: 'north-star',
      type: 'family',
      title: '이씨 가족',
      name: '이씨 가족',
      shortOrigin: '수원',
      origin: '수원',
      originAddress: '경기도 수원시 팔달구 인계동',
      originCoordinates: { lat: 37.2636, lng: 127.0286 },
      arrivalDayId: 'thu',
      adults: 2,
      children: 1,
      eta: '토 오후 2시',
      driveTime: '약 1시간 (비행)',
      headcount: '어른 2명, 아이 1명',
      vehicle: '렌터카',
      vehicleLabel: '렌터카 1',
      responsibility: '간식 + 아이 짐',
      readiness: 82,
      status: '이동 중',
      routeSummary: '수원 → 김포공항 → 제주공항 → 와일리제주.',
      plannedStopIds: ['north-star-kettleman-lunch', 'north-star-oakdale-break'],
      taskIds: ['task-car-pack', 'task-kid-bag', 'task-road-snacks', 'task-firewood'],
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'north-star-drive'),
        makeEntityKey('meal', 'thu-dinner'),
        makeEntityKey('location', 'north-star-kettleman-lunch'),
        makeEntityKey('location', 'north-star-oakdale-break'),
      ],
      note: '토요일 도착 리드 가족. 첫날 와일리제주 오픈 담당.',
    },
    {
      id: 'silver-peak',
      type: 'family',
      title: '김씨 가족',
      name: '김씨 가족',
      shortOrigin: '서울',
      origin: '서울',
      originAddress: '서울특별시 중구 을지로',
      originCoordinates: { lat: 37.5583, lng: 126.7906 },
      arrivalDayId: 'thu',
      adults: 2,
      children: 1,
      eta: '토 오후 2시',
      driveTime: '약 1시간 (비행)',
      headcount: '어른 2명, 아이 1명',
      vehicle: '렌터카',
      vehicleLabel: '렌터카 2',
      responsibility: '아이스박스 + 아침 과일',
      readiness: 88,
      status: '이동 중',
      routeSummary: '서울 → 김포공항 → 제주공항 → 와일리제주.',
      plannedStopIds: ['north-star-oakdale-break'],
      taskIds: ['task-lake-gear', 'task-breakfast-fruit', 'task-kids-shoes', 'task-charger'],
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'silver-peak-drive'),
        makeEntityKey('meal', 'fri-breakfast'),
        makeEntityKey('location', 'north-star-oakdale-break'),
      ],
      note: '준비 상태 최상. 제주 협재 코스 유동 지원 역할.',
    },
    {
      id: 'desert-bloom',
      type: 'family',
      title: '박씨 가족',
      name: '박씨 가족',
      shortOrigin: '대전',
      origin: '대전',
      originAddress: '대전광역시 서구 둔산동',
      originCoordinates: { lat: 36.7166, lng: 127.499 },
      arrivalDayId: 'thu',
      adults: 2,
      children: 1,
      eta: '토 오후 4시',
      driveTime: '약 1시간 (비행)',
      headcount: '어른 2명, 아이 1명',
      vehicle: '렌터카',
      vehicleLabel: '렌터카 3',
      responsibility: '바베큐 장비 + 일요일 점심',
      readiness: 71,
      status: '금요일 합류',
      routeSummary: '대전 → 청주공항 → 제주공항 → 와일리제주.',
      plannedStopIds: [],
      taskIds: ['task-late-arrival', 'task-grill-kit', 'task-yosemite-daypacks', 'task-park-docs'],
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'desert-bloom-drive'),
        makeEntityKey('meal', 'sat-lunch'),
        makeEntityKey('meal', 'sat-dinner'),
      ],
      note: '토요일 늦은 도착. 광복절 연휴 청주공항 혼잡 대비.',
    },
  ]
}

function buildItineraryItems() {
  return [
    {
      id: 'north-star-drive',
      type: 'itineraryItem',
      title: '이씨 가족 이동',
      rowId: 'travel',
      dayId: 'thu',
      startSlot: 1.75,
      span: 0.92,
      color: 'warning',
      familyIds: ['north-star'],
      routeId: 'route-la-north-star',
      status: 'Transit',
      riskLevel: 'Medium',
      taskIds: ['task-car-pack', 'task-kid-bag', 'task-road-snacks'],
      linkedEntityKeys: [
        makeEntityKey('family', 'north-star'),
        makeEntityKey('location', 'north-star-kettleman-lunch'),
        makeEntityKey('location', 'north-star-oakdale-break'),
      ],
    },
    {
      id: 'silver-peak-drive',
      type: 'itineraryItem',
      title: '김씨 가족 이동',
      rowId: 'travel',
      dayId: 'thu',
      startSlot: 2.09,
      span: 0.58,
      color: 'critical',
      familyIds: ['silver-peak'],
      routeId: 'route-sf-silver-peak',
      status: 'Transit',
      riskLevel: 'Low',
      taskIds: ['task-lake-gear', 'task-breakfast-fruit'],
      linkedEntityKeys: [
        makeEntityKey('family', 'silver-peak'),
        makeEntityKey('location', 'north-star-oakdale-break'),
      ],
    },
    {
      id: 'desert-bloom-drive',
      type: 'itineraryItem',
      title: '박씨 가족 이동',
      rowId: 'travel',
      dayId: 'fri',
      startSlot: 5.33,
      span: 0.83,
      color: 'violet',
      familyIds: ['desert-bloom'],
      routeId: 'route-sf-desert-bloom',
      status: 'Friday Arrival',
      riskLevel: 'Medium',
      taskIds: ['task-late-arrival'],
      linkedEntityKeys: [makeEntityKey('family', 'desert-bloom')],
    },
    {
      id: 'north-star-grill-shuttle',
      type: 'itineraryItem',
      title: 'Dinner shuttle',
      rowId: 'travel',
      dayId: 'thu',
      startSlot: SHARED_CONVOY_WINDOWS.thuDinner.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.thuDinner),
      color: 'warning',
      familyIds: ['north-star'],
      routeId: 'route-thu-grill-north-star',
      status: 'Short hop',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'north-star'), makeEntityKey('meal', 'thu-dinner')],
    },
    {
      id: 'silver-peak-grill-shuttle',
      type: 'itineraryItem',
      title: 'Dinner shuttle',
      rowId: 'travel',
      dayId: 'thu',
      startSlot: SHARED_CONVOY_WINDOWS.thuDinner.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.thuDinner),
      color: 'critical',
      familyIds: ['silver-peak'],
      routeId: 'route-thu-grill-silver-peak',
      status: 'Short hop',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'silver-peak'), makeEntityKey('meal', 'thu-dinner')],
    },
    {
      id: 'north-star-grill-return',
      type: 'itineraryItem',
      title: 'Dinner RTB',
      rowId: 'travel',
      dayId: 'thu',
      startSlot: SHARED_CONVOY_WINDOWS.thuDinnerReturn.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.thuDinnerReturn),
      color: 'warning',
      familyIds: ['north-star'],
      routeId: 'route-thu-return-north-star',
      status: 'Return',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'north-star'), makeEntityKey('meal', 'thu-dinner')],
    },
    {
      id: 'silver-peak-grill-return',
      type: 'itineraryItem',
      title: 'Dinner RTB',
      rowId: 'travel',
      dayId: 'thu',
      startSlot: SHARED_CONVOY_WINDOWS.thuDinnerReturn.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.thuDinnerReturn),
      color: 'critical',
      familyIds: ['silver-peak'],
      routeId: 'route-thu-return-silver-peak',
      status: 'Return',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'silver-peak'), makeEntityKey('meal', 'thu-dinner')],
    },
    {
      id: 'north-star-lake-hop',
      type: 'itineraryItem',
      title: 'Lunch shuttle',
      rowId: 'travel',
      dayId: 'fri',
      startSlot: SHARED_CONVOY_WINDOWS.friLunch.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.friLunch),
      color: 'warning',
      familyIds: ['north-star'],
      routeId: 'route-fri-beach-north-star',
      status: 'Lunch transit',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'north-star'), makeEntityKey('meal', 'fri-lunch')],
    },
    {
      id: 'silver-peak-lake-hop',
      type: 'itineraryItem',
      title: 'Lunch shuttle',
      rowId: 'travel',
      dayId: 'fri',
      startSlot: SHARED_CONVOY_WINDOWS.friLunch.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.friLunch),
      color: 'critical',
      familyIds: ['silver-peak'],
      routeId: 'route-fri-beach-silver-peak',
      status: 'Lunch transit',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'silver-peak'), makeEntityKey('meal', 'fri-lunch')],
    },
    {
      id: 'north-star-mountain-room-return',
      type: 'itineraryItem',
      title: 'RTB',
      rowId: 'travel',
      dayId: 'fri',
      startSlot: SHARED_CONVOY_WINDOWS.friLunchReturn.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.friLunchReturn),
      color: 'warning',
      familyIds: ['north-star'],
      routeId: 'route-fri-return-north-star',
      status: 'Return',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'north-star'), makeEntityKey('meal', 'fri-lunch')],
    },
    {
      id: 'silver-peak-mountain-room-return',
      type: 'itineraryItem',
      title: 'RTB',
      rowId: 'travel',
      dayId: 'fri',
      startSlot: SHARED_CONVOY_WINDOWS.friLunchReturn.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.friLunchReturn),
      color: 'critical',
      familyIds: ['silver-peak'],
      routeId: 'route-fri-return-silver-peak',
      status: 'Return',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'silver-peak'), makeEntityKey('meal', 'fri-lunch')],
    },
    {
      id: 'north-star-yosemite-push',
      type: 'itineraryItem',
      title: 'Yosemite push',
      rowId: 'travel',
      dayId: 'sat',
      startSlot: SHARED_CONVOY_WINDOWS.satYosemite.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.satYosemite),
      color: 'warning',
      familyIds: ['north-star'],
      routeId: 'route-sat-yosemite-north-star',
      status: 'Park entry',
      riskLevel: 'Medium',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'north-star'), makeEntityKey('activity', 'sat-yosemite')],
    },
    {
      id: 'silver-peak-yosemite-push',
      type: 'itineraryItem',
      title: 'Yosemite push',
      rowId: 'travel',
      dayId: 'sat',
      startSlot: SHARED_CONVOY_WINDOWS.satYosemite.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.satYosemite),
      color: 'critical',
      familyIds: ['silver-peak'],
      routeId: 'route-sat-yosemite-silver-peak',
      status: 'Park entry',
      riskLevel: 'Medium',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'silver-peak'), makeEntityKey('activity', 'sat-yosemite')],
    },
    {
      id: 'desert-bloom-yosemite-push',
      type: 'itineraryItem',
      title: 'Yosemite push',
      rowId: 'travel',
      dayId: 'sat',
      startSlot: SHARED_CONVOY_WINDOWS.satYosemite.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.satYosemite),
      color: 'violet',
      familyIds: ['desert-bloom'],
      routeId: 'route-sat-yosemite-desert-bloom',
      status: 'Park entry',
      riskLevel: 'Medium',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'desert-bloom'), makeEntityKey('activity', 'sat-yosemite')],
    },
    {
      id: 'north-star-priest-station',
      type: 'itineraryItem',
      title: 'Dinner stop',
      rowId: 'travel',
      dayId: 'sat',
      startSlot: SHARED_CONVOY_WINDOWS.satDinner.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.satDinner),
      color: 'warning',
      familyIds: ['north-star'],
      routeId: 'route-sat-priest-station-north-star',
      status: 'Dinner transit',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'north-star'), makeEntityKey('meal', 'sat-dinner')],
    },
    {
      id: 'silver-peak-priest-station',
      type: 'itineraryItem',
      title: 'Dinner stop',
      rowId: 'travel',
      dayId: 'sat',
      startSlot: SHARED_CONVOY_WINDOWS.satDinner.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.satDinner),
      color: 'critical',
      familyIds: ['silver-peak'],
      routeId: 'route-sat-priest-station-silver-peak',
      status: 'Dinner transit',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'silver-peak'), makeEntityKey('meal', 'sat-dinner')],
    },
    {
      id: 'desert-bloom-priest-station',
      type: 'itineraryItem',
      title: 'Dinner stop',
      rowId: 'travel',
      dayId: 'sat',
      startSlot: SHARED_CONVOY_WINDOWS.satDinner.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.satDinner),
      color: 'violet',
      familyIds: ['desert-bloom'],
      routeId: 'route-sat-priest-station-desert-bloom',
      status: 'Dinner transit',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'desert-bloom'), makeEntityKey('meal', 'sat-dinner')],
    },
    {
      id: 'north-star-basecamp-return',
      type: 'itineraryItem',
      title: 'Basecamp RTB',
      rowId: 'travel',
      dayId: 'sat',
      startSlot: SHARED_CONVOY_WINDOWS.satDinnerReturn.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.satDinnerReturn),
      color: 'warning',
      familyIds: ['north-star'],
      routeId: 'route-sat-basecamp-return-north-star',
      status: 'Return',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'north-star'), makeEntityKey('meal', 'sat-dinner')],
    },
    {
      id: 'silver-peak-basecamp-return',
      type: 'itineraryItem',
      title: 'Basecamp RTB',
      rowId: 'travel',
      dayId: 'sat',
      startSlot: SHARED_CONVOY_WINDOWS.satDinnerReturn.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.satDinnerReturn),
      color: 'critical',
      familyIds: ['silver-peak'],
      routeId: 'route-sat-basecamp-return-silver-peak',
      status: 'Return',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'silver-peak'), makeEntityKey('meal', 'sat-dinner')],
    },
    {
      id: 'desert-bloom-basecamp-return',
      type: 'itineraryItem',
      title: 'Basecamp RTB',
      rowId: 'travel',
      dayId: 'sat',
      startSlot: SHARED_CONVOY_WINDOWS.satDinnerReturn.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.satDinnerReturn),
      color: 'violet',
      familyIds: ['desert-bloom'],
      routeId: 'route-sat-basecamp-return-desert-bloom',
      status: 'Return',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'desert-bloom'), makeEntityKey('meal', 'sat-dinner')],
    },
    {
      id: 'north-star-homebound',
      type: 'itineraryItem',
      title: 'Homebound',
      rowId: 'travel',
      dayId: 'sun',
      startSlot: 14.02,
      span: 1.55,
      color: 'warning',
      familyIds: ['north-star'],
      routeId: 'route-sun-home-north-star',
      status: 'Home',
      riskLevel: 'Medium',
      taskIds: ['task-cabin-reset'],
      linkedEntityKeys: [makeEntityKey('family', 'north-star'), makeEntityKey('activity', 'sun-home')],
    },
    {
      id: 'silver-peak-homebound',
      type: 'itineraryItem',
      title: 'Homebound',
      rowId: 'travel',
      dayId: 'sun',
      startSlot: 14.08,
      span: 1.35,
      color: 'critical',
      familyIds: ['silver-peak'],
      routeId: 'route-sun-home-silver-peak',
      status: 'Home',
      riskLevel: 'Low',
      taskIds: ['task-cabin-reset'],
      linkedEntityKeys: [makeEntityKey('family', 'silver-peak'), makeEntityKey('activity', 'sun-home')],
    },
    {
      id: 'desert-bloom-homebound',
      type: 'itineraryItem',
      title: 'Homebound',
      rowId: 'travel',
      dayId: 'sun',
      startSlot: 14.16,
      span: 1.3,
      color: 'violet',
      familyIds: ['desert-bloom'],
      routeId: 'route-sun-home-desert-bloom',
      status: 'Home',
      riskLevel: 'Low',
      taskIds: ['task-cabin-reset'],
      linkedEntityKeys: [makeEntityKey('family', 'desert-bloom'), makeEntityKey('activity', 'sun-home')],
    },
    {
      id: 'thu-dinner-ops',
      type: 'itineraryItem',
      title: 'Transit + settle in',
      rowId: 'activities',
      dayId: 'thu',
      startSlot: 0.7,
      span: 2.53,
      color: 'critical',
      locationId: 'pine-airbnb',
      status: 'Arrival day',
      riskLevel: 'Medium',
      linkedEntityKeys: [makeEntityKey('meal', 'thu-dinner'), makeEntityKey('activity', 'thu-transit')],
      taskIds: ['task-gate-access', 'task-room-assignments'],
    },
    {
      id: 'fri-lake',
      type: 'itineraryItem',
      title: 'Pine Mountain Lake reset day',
      rowId: 'activities',
      dayId: 'fri',
      startSlot: 4,
      span: 4,
      color: 'info',
      locationId: 'pine-lake-beach',
      status: 'Go',
      riskLevel: 'Low',
      linkedEntityKeys: [makeEntityKey('activity', 'fri-lake')],
      taskIds: ['task-grocery-run'],
    },
    {
      id: 'sat-yosemite',
      type: 'itineraryItem',
      title: 'Yosemite day mission',
      rowId: 'activities',
      dayId: 'sat',
      startSlot: 8,
      span: 4,
      color: 'warning',
      locationId: 'yosemite',
      status: 'Watch',
      riskLevel: 'High',
      linkedEntityKeys: [makeEntityKey('activity', 'sat-yosemite')],
      taskIds: ['task-pack-yosemite-bags', 'task-park-docs', 'task-priest-station-plan'],
    },
    {
      id: 'sun-return',
      type: 'itineraryItem',
      title: 'Drive home',
      rowId: 'activities',
      dayId: 'sun',
      startSlot: 12,
      span: 3,
      color: 'success',
      locationId: 'pine-airbnb',
      status: 'Go',
      riskLevel: 'Low',
      linkedEntityKeys: [makeEntityKey('activity', 'sun-home')],
      taskIds: ['task-cabin-reset'],
    },
    {
      id: 'airbnb-checkin',
      type: 'itineraryItem',
      title: 'Basecamp check-in',
      rowId: 'support',
      dayId: 'thu',
      startSlot: 2,
      span: 1,
      color: 'muted',
      locationId: 'pine-airbnb',
      status: 'Assigned',
      riskLevel: 'Low',
      linkedEntityKeys: [makeEntityKey('stayItem', 'stay-basecamp')],
      taskIds: ['task-gate-access', 'task-room-assignments'],
    },
    {
      id: 'groceries',
      type: 'itineraryItem',
      title: 'Groceries and restock',
      rowId: 'support',
      dayId: 'fri',
      startSlot: 4,
      span: 1,
      color: 'muted',
      locationId: 'groveland-grocery',
      status: 'Pending',
      riskLevel: 'Low',
      linkedEntityKeys: [makeEntityKey('meal', 'fri-dinner'), makeEntityKey('meal', 'sun-breakfast')],
      taskIds: ['task-grocery-run'],
    },
    {
      id: 'park-prep',
      type: 'itineraryItem',
      title: 'Yosemite prep window',
      rowId: 'support',
      dayId: 'fri',
      startSlot: 7,
      span: 1,
      color: 'muted',
      locationId: 'pine-airbnb',
      status: 'Pending',
      riskLevel: 'Medium',
      linkedEntityKeys: [makeEntityKey('activity', 'sat-yosemite')],
      taskIds: ['task-pack-yosemite-bags', 'task-priest-station-plan'],
    },
  ]
}

function buildMeals() {
  return [
    {
      id: 'thu-dinner',
      type: 'meal',
      title: 'Two Guys Pizza Pies',
      dayId: 'thu',
      startSlot: 3,
      status: 'Assigned',
      owner: 'Walk-in',
      reservationType: 'First-night dinner',
      timeLabel: '6:00 PM',
      locationId: 'two-guys-pizza',
      linkedEntityKeys: [makeEntityKey('itineraryItem', 'thu-dinner-ops')],
      taskIds: ['task-gate-access'],
      note: 'Simple first-night pizza dinner plan around 6:00 PM with a one-hour stop before heading back to basecamp.',
    },
    {
      id: 'fri-breakfast',
      type: 'meal',
      title: 'Basecamp breakfast',
      dayId: 'fri',
      startSlot: 4,
      status: 'Assigned',
      owner: 'Shared',
      reservationType: 'Cook-in',
      timeLabel: '8:00 AM',
      locationId: 'pine-airbnb',
      linkedEntityKeys: [makeEntityKey('activity', 'fri-lake')],
      taskIds: ['task-breakfast-fruit'],
      note: 'Keep breakfast easy at basecamp before the local Friday reset day.',
    },
    {
      id: 'fri-lunch',
      type: 'meal',
      title: 'The Grill at Pine Mountain Lake',
      dayId: 'fri',
      startSlot: 6.22,
      status: 'Assigned',
      owner: 'Shared',
      reservationType: 'Local outing',
      timeLabel: '1:15 PM',
      locationId: 'grill-pml',
      linkedEntityKeys: [makeEntityKey('activity', 'fri-lake')],
      taskIds: ['task-grocery-run'],
      note: 'Light local lunch outing so Friday gets one clean movement window without creating a complicated evening drive.',
    },
    {
      id: 'fri-dinner',
      type: 'meal',
      title: 'Basecamp dinner',
      dayId: 'fri',
      startSlot: 7.04,
      status: 'Assigned',
      owner: 'Shared',
      reservationType: 'Cook-in',
      timeLabel: '6:30 PM',
      locationId: 'pine-airbnb',
      linkedEntityKeys: [makeEntityKey('activity', 'fri-lake')],
      taskIds: ['task-late-arrival'],
      note: 'Dinner at home so there is no Friday evening convoy after the lunch outing.',
    },
    {
      id: 'sat-lunch',
      type: 'meal',
      title: 'Packed Yosemite lunch',
      dayId: 'sat',
      startSlot: 10,
      status: 'Assigned',
      owner: 'Shared',
      reservationType: 'Pack-out',
      timeLabel: '12:30 PM',
      locationId: 'yosemite',
      linkedEntityKeys: [makeEntityKey('activity', 'sat-yosemite')],
      taskIds: ['task-pack-yosemite-bags'],
      note: 'Keep lunch portable so the park day stays flexible and the return dinner stop can happen closer to Groveland.',
    },
    {
      id: 'sat-dinner',
      type: 'meal',
      title: 'Around The Horn Brewing Company',
      dayId: 'sat',
      startSlot: 10.98,
      status: 'Assigned',
      owner: 'Walk-in',
      reservationType: 'Return-drive dinner',
      timeLabel: '5:55 PM',
      locationId: 'around-horn',
      linkedEntityKeys: [makeEntityKey('activity', 'sat-yosemite')],
      taskIds: ['task-grill-kit', 'task-grocery-run'],
      note: 'Dinner stop on the way back from Yosemite so the families do not have to push deep into the park for a restaurant and then double back.',
    },
    {
      id: 'sun-breakfast',
      type: 'meal',
      title: 'Basecamp brunch before departure',
      dayId: 'sun',
      startSlot: 13,
      status: 'Assigned',
      owner: 'Shared',
      reservationType: 'Cook-in',
      timeLabel: '9:00 AM',
      locationId: 'pine-airbnb',
      linkedEntityKeys: [makeEntityKey('activity', 'sun-home')],
      taskIds: ['task-cabin-reset'],
      note: 'Cook brunch at basecamp before checkout and the drive home.',
    },
  ]
}

function buildActivities() {
  return [
    {
      id: 'thu-transit',
      type: 'activity',
      title: 'Transit + settle in',
      dayId: 'thu',
      window: 'Thu / all day',
      status: 'Go',
      riskLevel: 'Medium',
      weatherSensitivity: 'Low',
      locationId: 'pine-airbnb',
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'north-star-drive'),
        makeEntityKey('itineraryItem', 'silver-peak-drive'),
        makeEntityKey('itineraryItem', 'thu-dinner-ops'),
        makeEntityKey('meal', 'thu-dinner'),
      ],
      taskIds: ['task-gate-access', 'task-room-assignments'],
      description: 'Two families move on Thursday. First-night goal is arrival, check-in, kid decompression, and an easy pizza dinner that does not create more logistics churn.',
      backup: 'If traffic spikes, shift to minimum-viable check-in and keep the first-night setup light.',
      note: 'The main objective is to avoid asking the first family on site to do all the setup work.',
    },
    {
      id: 'fri-lake',
      type: 'activity',
      title: 'Pine Mountain Lake Reset Day',
      dayId: 'fri',
      window: 'Fri / all day',
      status: 'Go',
      riskLevel: 'Low',
      weatherSensitivity: 'Low',
      locationId: 'pine-lake-beach',
      linkedEntityKeys: [
        makeEntityKey('meal', 'fri-breakfast'),
        makeEntityKey('meal', 'fri-lunch'),
        makeEntityKey('meal', 'fri-dinner'),
        makeEntityKey('itineraryItem', 'fri-lake'),
      ],
      taskIds: ['task-grocery-run', 'task-late-arrival'],
      description: 'Keep Friday local. One lunch outing, no evening convoy, and enough slack to absorb the Riveras arriving without scrambling the rest of the trip.',
      backup: 'If timing drifts, skip the lunch run and keep the whole day centered on basecamp and the lake area.',
      note: 'Friday is now the reset day, not the ambitious day.',
    },
    {
      id: 'sat-yosemite',
      type: 'activity',
      title: 'Yosemite Day',
      dayId: 'sat',
      window: 'Sat / early start',
      status: 'Watch',
      riskLevel: 'High',
      weatherSensitivity: 'High',
      locationId: 'yosemite',
      linkedEntityKeys: [
        makeEntityKey('meal', 'sat-lunch'),
        makeEntityKey('meal', 'sat-dinner'),
        makeEntityKey('itineraryItem', 'sat-yosemite'),
      ],
      taskIds: ['task-pack-yosemite-bags', 'task-park-docs', 'task-priest-station-plan'],
      description: 'Primary excursion day. Use Big Oak Flat as the actual route anchor, keep lunch packed, and hit a sensible Groveland dinner stop on the way back.',
      backup: 'If park conditions drift, trim Yosemite dwell time and preserve the return-drive dinner stop.',
      note: 'This should feel like one clean outbound drive and one clean return sequence.',
    },
    {
      id: 'sun-home',
      type: 'activity',
      title: 'Sunday Return',
      dayId: 'sun',
      window: 'Sun / checkout',
      status: 'Go',
      riskLevel: 'Low',
      weatherSensitivity: 'Low',
      locationId: 'pine-airbnb',
      linkedEntityKeys: [
        makeEntityKey('meal', 'sun-breakfast'),
        makeEntityKey('itineraryItem', 'sun-return'),
      ],
      taskIds: ['task-cabin-reset'],
      description: 'Pack, cabin reset, brunch, and staggered drive home windows.',
      backup: 'Pre-pack Saturday night to reduce the Sunday morning chaos tax.',
      note: 'Sunday should feel boring in the best possible way.',
    },
  ]
}

function buildStayItems() {
  return [
    {
      id: 'stay-basecamp',
      type: 'stayItem',
      title: 'Basecamp overview',
      dayId: 'thu',
      locationId: 'pine-airbnb',
      category: 'overview',
      summary: 'Basecamp operations run through the Groveland-area staging house.',
      linkedEntityKeys: [makeEntityKey('location', 'pine-airbnb')],
      taskIds: ['task-gate-access', 'task-room-assignments'],
      note: 'Everything gets easier if arrival protocol and room assignments are decided before wheels-up.',
    },
    {
      id: 'stay-gate-access',
      type: 'stayItem',
      title: 'Gate and access protocol',
      dayId: 'thu',
      locationId: 'pine-airbnb',
      category: 'access',
      summary: TRIP_META.airbnb.gateNote,
      linkedEntityKeys: [makeEntityKey('location', 'pine-airbnb')],
      taskIds: ['task-gate-access'],
      note: 'Confirm visitor access before Thursday departures.',
    },
    {
      id: 'stay-room-assignments',
      type: 'stayItem',
      title: 'Room assignments',
      dayId: 'thu',
      locationId: 'pine-airbnb',
      category: 'sleep',
      summary: 'Room 1 Parkers, Room 2 Jiangs, Room 3 Riveras, kid overflow flexible.',
      linkedEntityKeys: [
        makeEntityKey('family', 'north-star'),
        makeEntityKey('family', 'silver-peak'),
        makeEntityKey('family', 'desert-bloom'),
      ],
      taskIds: ['task-room-assignments'],
      note: 'Stage room assignments before the first family arrives.',
    },
    {
      id: 'stay-beach-parking',
      type: 'stayItem',
      title: 'Beach and parking intel',
      dayId: 'fri',
      locationId: 'pine-airbnb',
      category: 'parking',
      summary: TRIP_META.airbnb.parkingNote,
      linkedEntityKeys: [makeEntityKey('activity', 'fri-lake')],
      taskIds: [],
      note: 'Keep one consolidated vehicle plan for Friday so nobody gets stranded in a parking scramble.',
    },
    {
      id: 'stay-checkout-reset',
      type: 'stayItem',
      title: 'Checkout reset',
      dayId: 'sun',
      locationId: 'pine-airbnb',
      category: 'checkout',
      summary: 'Sunday departure should be pre-staged on Saturday night.',
      linkedEntityKeys: [makeEntityKey('activity', 'sun-home')],
      taskIds: ['task-cabin-reset'],
      note: 'Do the annoying part on Saturday night.',
    },
  ]
}

function buildExpenses() {
  return [
    {
      id: 'airbnb',
      type: 'expense',
      title: 'Basecamp booking',
      payer: 'Parkers',
      amount: 1280,
      split: 'Equal split',
      allocationMode: 'equal',
      allocations: {},
      settled: false,
      linkedEntityKeys: [makeEntityKey('stayItem', 'stay-basecamp')],
      note: 'Largest shared cost; keep visibility high and drama low.',
    },
    {
      id: 'groceries',
      type: 'expense',
      title: 'Groceries',
      payer: 'Jiangs',
      amount: 210,
      split: 'Equal split',
      allocationMode: 'equal',
      allocations: {},
      settled: false,
      linkedEntityKeys: [
        makeEntityKey('meal', 'fri-lunch'),
        makeEntityKey('meal', 'sat-dinner'),
      ],
      note: 'Main food spend is really supporting the cook-in windows.',
    },
    {
      id: 'gas',
      type: 'expense',
      title: 'Gas + driving',
      payer: 'Each family',
      amount: 0,
      split: 'Individual',
      allocationMode: 'individual',
      allocations: {},
      settled: true,
      linkedEntityKeys: [
        makeEntityKey('family', 'north-star'),
        makeEntityKey('family', 'silver-peak'),
        makeEntityKey('family', 'desert-bloom'),
      ],
      note: 'Tracked for awareness only.',
    },
    {
      id: 'parking',
      type: 'expense',
      title: 'Activity / gate / parking extras',
      payer: 'Unassigned',
      amount: 60,
      split: 'Manual allocation',
      allocationMode: 'manual',
      allocations: {
        'north-star': 20,
        'silver-peak': 20,
        'desert-bloom': 20,
      },
      settled: false,
      linkedEntityKeys: [
        makeEntityKey('activity', 'fri-lake'),
        makeEntityKey('activity', 'sat-yosemite'),
      ],
      note: 'Useful bucket for the annoying little stuff.',
    },
  ]
}

function buildTasks() {
  return [
    {
      id: 'task-car-pack',
      type: 'task',
      title: '출발 전날 짐 패킹 완료',
      dayId: 'thu',
      status: 'done',
      ownerFamilyId: 'north-star',
      linkedEntityKeys: [
        makeEntityKey('family', 'north-star'),
        makeEntityKey('itineraryItem', 'north-star-drive'),
      ],
      note: '',
    },
    {
      id: 'task-kid-bag',
      type: 'task',
      title: '아이 놀이 가방 준비',
      dayId: 'thu',
      status: 'done',
      ownerFamilyId: 'north-star',
      linkedEntityKeys: [
        makeEntityKey('family', 'north-star'),
        makeEntityKey('itineraryItem', 'north-star-drive'),
      ],
      note: '',
    },
    {
      id: 'task-road-snacks',
      type: 'task',
      title: '차량 간식 확보',
      dayId: 'thu',
      status: 'open',
      ownerFamilyId: 'north-star',
      linkedEntityKeys: [
        makeEntityKey('family', 'north-star'),
        makeEntityKey('meal', 'thu-dinner'),
      ],
      note: '',
    },
    {
      id: 'task-firewood',
      type: 'task',
      title: '도착 후 장작 구입',
      dayId: 'thu',
      status: 'open',
      ownerFamilyId: 'north-star',
      linkedEntityKeys: [
        makeEntityKey('family', 'north-star'),
        makeEntityKey('meal', 'sat-dinner'),
      ],
      note: '',
    },
    {
      id: 'task-lake-gear',
      type: 'task',
      title: '해변 타월 & 튜브 준비',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'silver-peak',
      linkedEntityKeys: [
        makeEntityKey('family', 'silver-peak'),
        makeEntityKey('activity', 'fri-lake'),
      ],
      note: '',
    },
    {
      id: 'task-breakfast-fruit',
      type: 'task',
      title: '아침 과일 챙김',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'silver-peak',
      linkedEntityKeys: [
        makeEntityKey('family', 'silver-peak'),
        makeEntityKey('meal', 'fri-breakfast'),
      ],
      note: '',
    },
    {
      id: 'task-kids-shoes',
      type: 'task',
      title: '아이 여분 신발',
      dayId: 'fri',
      status: 'open',
      ownerFamilyId: 'silver-peak',
      linkedEntityKeys: [
        makeEntityKey('family', 'silver-peak'),
        makeEntityKey('activity', 'fri-lake'),
      ],
      note: '',
    },
    {
      id: 'task-charger',
      type: 'task',
      title: '보조배터리 준비',
      dayId: 'thu',
      status: 'done',
      ownerFamilyId: 'silver-peak',
      linkedEntityKeys: [
        makeEntityKey('family', 'silver-peak'),
        makeEntityKey('itineraryItem', 'silver-peak-drive'),
      ],
      note: '',
    },
    {
      id: 'task-late-arrival',
      type: 'task',
      title: '금요일 합류 일정 확정',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'desert-bloom',
      linkedEntityKeys: [
        makeEntityKey('family', 'desert-bloom'),
        makeEntityKey('activity', 'fri-lake'),
        makeEntityKey('meal', 'fri-dinner'),
      ],
      note: '',
    },
    {
      id: 'task-grill-kit',
      type: 'task',
      title: '바베큐 장비 패킹',
      dayId: 'sat',
      status: 'open',
      ownerFamilyId: 'desert-bloom',
      linkedEntityKeys: [
        makeEntityKey('family', 'desert-bloom'),
        makeEntityKey('meal', 'sat-dinner'),
      ],
      note: '',
    },
    {
      id: 'task-yosemite-daypacks',
      type: 'task',
      title: '협재해수욕장 당일 준비 (물놀이 용품)',
      dayId: 'fri',
      status: 'open',
      ownerFamilyId: 'desert-bloom',
      linkedEntityKeys: [
        makeEntityKey('family', 'desert-bloom'),
        makeEntityKey('activity', 'sat-yosemite'),
      ],
      note: '',
    },
    {
      id: 'task-park-docs',
      type: 'task',
      title: '국립공원 입장 서류 확인',
      dayId: 'sat',
      status: 'done',
      ownerFamilyId: 'desert-bloom',
      linkedEntityKeys: [
        makeEntityKey('family', 'desert-bloom'),
        makeEntityKey('activity', 'sat-yosemite'),
      ],
      note: '',
    },
    {
      id: 'task-gate-access',
      type: 'task',
      title: '체크인 절차 및 도착 순서 확인',
      dayId: 'thu',
      status: 'open',
      ownerFamilyId: null,
      linkedEntityKeys: [
        makeEntityKey('stayItem', 'stay-gate-access'),
        makeEntityKey('activity', 'thu-transit'),
      ],
      note: '',
    },
    {
      id: 'task-room-assignments',
      type: 'task',
      title: '첫 가족 도착 전 방 배정 완료',
      dayId: 'thu',
      status: 'open',
      ownerFamilyId: null,
      linkedEntityKeys: [
        makeEntityKey('stayItem', 'stay-room-assignments'),
        makeEntityKey('activity', 'thu-transit'),
      ],
      note: '',
    },
    {
      id: 'task-grocery-run',
      type: 'task',
      title: '금요일 식재료 & 보충 구매',
      dayId: 'fri',
      status: 'open',
      ownerFamilyId: null,
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'groceries'),
        makeEntityKey('meal', 'fri-lunch'),
        makeEntityKey('meal', 'fri-dinner'),
        makeEntityKey('meal', 'sun-breakfast'),
      ],
      note: '',
    },
    {
      id: 'task-pack-yosemite-bags',
      type: 'task',
      title: '토요일 귀가 전날 밤 짐 사전 준비',
      dayId: 'fri',
      status: 'open',
      ownerFamilyId: null,
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'park-prep'),
        makeEntityKey('activity', 'sat-yosemite'),
      ],
      note: '',
    },
    {
      id: 'task-priest-station-plan',
      type: 'task',
      title: '토요일 귀환 저녁 식사 일정 확정',
      dayId: 'fri',
      status: 'open',
      ownerFamilyId: null,
      linkedEntityKeys: [
        makeEntityKey('meal', 'sat-dinner'),
        makeEntityKey('activity', 'sat-yosemite'),
      ],
      note: '',
    },
    {
      id: 'task-cabin-reset',
      type: 'task',
      title: '일요일 아침 전 펜션 원상복구 사전 준비',
      dayId: 'sat',
      status: 'open',
      ownerFamilyId: null,
      linkedEntityKeys: [
        makeEntityKey('stayItem', 'stay-checkout-reset'),
        makeEntityKey('activity', 'sun-home'),
      ],
      note: '',
    },
  ]
}

function buildRoutes() {
  return [
    {
      id: 'route-sf-silver-peak',
      type: 'route',
      title: '김씨 가족 이동 경로',
      dayId: 'thu',
      familyId: 'silver-peak',
      tone: 'critical',
      originCoordinates: { lat: 37.5665, lng: 126.9780 },
      stopLocationIds: ['north-star-oakdale-break'],
      destinationLocationId: 'pine-airbnb',
      simulationStartSlot: 2.09,
      simulationEndSlot: 2.67,
      durationSeconds: 3.5 * 60 * 60,
      simulationMilestones: [
        { t: 0, progress: 0 },
        { t: 0.72, progress: 0.74 },
        { t: 0.82, progress: 0.74 },
        { t: 1, progress: 1 },
      ],
      path: [
        { lat: 37.5583, lng: 126.7906 },
        { lat: 33.5065, lng: 126.4934 },
        PUBLIC_BASECAMP_COORDINATES,
      ],
      linkedEntityKey: makeEntityKey('itineraryItem', 'silver-peak-drive'),
    },
    {
      id: 'route-sf-desert-bloom',
      type: 'route',
      title: '박씨 가족 이동 경로',
      dayId: 'fri',
      familyId: 'desert-bloom',
      tone: 'violet',
      dashed: true,
      originCoordinates: { lat: 36.3504, lng: 127.3845 },
      stopLocationIds: [],
      destinationLocationId: 'pine-airbnb',
      simulationStartSlot: 5.33,
      simulationEndSlot: 6.16,
      durationSeconds: 5 * 60 * 60,
      simulationMilestones: [
        { t: 0, progress: 0 },
        { t: 0.52, progress: 0.5 },
        { t: 1, progress: 1 },
      ],
      path: [
        { lat: 36.7166, lng: 127.499 },
        { lat: 33.5065, lng: 126.4934 },
        PUBLIC_BASECAMP_COORDINATES,
      ],
      linkedEntityKey: makeEntityKey('itineraryItem', 'desert-bloom-drive'),
    },
    {
      id: 'route-la-north-star',
      type: 'route',
      title: '이씨 가족 이동 경로',
      dayId: 'thu',
      familyId: 'north-star',
      tone: 'warning',
      originCoordinates: { lat: 37.2636, lng: 127.0286 },
      stopLocationIds: ['north-star-kettleman-lunch', 'north-star-oakdale-break'],
      destinationLocationId: 'pine-airbnb',
      simulationStartSlot: 1.75,
      simulationEndSlot: 2.67,
      durationSeconds: 5.5 * 60 * 60,
      simulationMilestones: [
        { t: 0, progress: 0 },
        { t: 0.42, progress: 0.38 },
        { t: 0.54, progress: 0.38 },
        { t: 0.76, progress: 0.74 },
        { t: 0.87, progress: 0.74 },
        { t: 0.96, progress: 0.9 },
        { t: 0.985, progress: 0.9 },
        { t: 1, progress: 1 },
      ],
      path: [
        { lat: 37.5583, lng: 126.7906 },
        { lat: 33.5065, lng: 126.4934 },
        PUBLIC_BASECAMP_COORDINATES,
      ],
      linkedEntityKey: makeEntityKey('itineraryItem', 'north-star-drive'),
    },
    {
      id: 'route-thu-grill-north-star',
      type: 'route',
      title: '이씨 가족 → 흑돼지 저녁',
      dayId: 'thu',
      familyId: 'north-star',
      tone: 'warning',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      destinationLocationId: 'two-guys-pizza',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.thuDinner.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.thuDinner.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'north-star-grill-shuttle'),
    },
    {
      id: 'route-thu-grill-silver-peak',
      type: 'route',
      title: '김씨 가족 → 흑돼지 저녁',
      dayId: 'thu',
      familyId: 'silver-peak',
      tone: 'critical',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      destinationLocationId: 'two-guys-pizza',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.thuDinner.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.thuDinner.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'silver-peak-grill-shuttle'),
    },
    {
      id: 'route-thu-return-north-star',
      type: 'route',
      title: '이씨 가족 베이스캠프 귀환',
      dayId: 'thu',
      familyId: 'north-star',
      tone: 'warning',
      originCoordinates: { lat: 33.464, lng: 126.309 },
      destinationLocationId: 'pine-airbnb',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.thuDinnerReturn.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.thuDinnerReturn.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'north-star-grill-return'),
    },
    {
      id: 'route-thu-return-silver-peak',
      type: 'route',
      title: '김씨 가족 베이스캠프 귀환',
      dayId: 'thu',
      familyId: 'silver-peak',
      tone: 'critical',
      originCoordinates: { lat: 33.464, lng: 126.309 },
      destinationLocationId: 'pine-airbnb',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.thuDinnerReturn.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.thuDinnerReturn.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'silver-peak-grill-return'),
    },
    {
      id: 'route-fri-beach-north-star',
      type: 'route',
      title: '이씨 가족 → 협재해수욕장',
      dayId: 'fri',
      familyId: 'north-star',
      tone: 'warning',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      destinationLocationId: 'grill-pml',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.friLunch.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.friLunch.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'north-star-lake-hop'),
    },
    {
      id: 'route-fri-beach-silver-peak',
      type: 'route',
      title: '김씨 가족 → 협재해수욕장',
      dayId: 'fri',
      familyId: 'silver-peak',
      tone: 'critical',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      destinationLocationId: 'grill-pml',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.friLunch.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.friLunch.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'silver-peak-lake-hop'),
    },
    {
      id: 'route-fri-return-north-star',
      type: 'route',
      title: '이씨 가족 협재 후 귀환',
      dayId: 'fri',
      familyId: 'north-star',
      tone: 'warning',
      originCoordinates: { lat: 33.394, lng: 126.239 },
      destinationLocationId: 'pine-airbnb',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.friLunchReturn.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.friLunchReturn.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'north-star-mountain-room-return'),
    },
    {
      id: 'route-fri-return-silver-peak',
      type: 'route',
      title: '김씨 가족 협재 후 귀환',
      dayId: 'fri',
      familyId: 'silver-peak',
      tone: 'critical',
      originCoordinates: { lat: 33.394, lng: 126.239 },
      destinationLocationId: 'pine-airbnb',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.friLunchReturn.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.friLunchReturn.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'silver-peak-mountain-room-return'),
    },
    {
      id: 'route-sat-yosemite-north-star',
      type: 'route',
      title: '이씨 가족 → 협재해수욕장',
      dayId: 'sat',
      familyId: 'north-star',
      tone: 'warning',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      destinationLocationId: 'yosemite',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.satYosemite.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.satYosemite.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'north-star-yosemite-push'),
    },
    {
      id: 'route-sat-yosemite-silver-peak',
      type: 'route',
      title: '김씨 가족 → 협재해수욕장',
      dayId: 'sat',
      familyId: 'silver-peak',
      tone: 'critical',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      destinationLocationId: 'yosemite',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.satYosemite.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.satYosemite.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'silver-peak-yosemite-push'),
    },
    {
      id: 'route-sat-yosemite-desert-bloom',
      type: 'route',
      title: '박씨 가족 → 협재해수욕장',
      dayId: 'sat',
      familyId: 'desert-bloom',
      tone: 'violet',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      destinationLocationId: 'yosemite',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.satYosemite.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.satYosemite.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'desert-bloom-yosemite-push'),
    },
    {
      id: 'route-sat-priest-station-north-star',
      type: 'route',
      title: '이씨 가족 → 흑돼지 저녁',
      dayId: 'sat',
      familyId: 'north-star',
      tone: 'warning',
      originCoordinates: { lat: 33.394, lng: 126.239 },
      destinationLocationId: 'around-horn',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.satDinner.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.satDinner.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'north-star-priest-station'),
    },
    {
      id: 'route-sat-priest-station-silver-peak',
      type: 'route',
      title: '김씨 가족 → 흑돼지 저녁',
      dayId: 'sat',
      familyId: 'silver-peak',
      tone: 'critical',
      originCoordinates: { lat: 33.394, lng: 126.239 },
      destinationLocationId: 'around-horn',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.satDinner.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.satDinner.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'silver-peak-priest-station'),
    },
    {
      id: 'route-sat-priest-station-desert-bloom',
      type: 'route',
      title: '박씨 가족 → 흑돼지 저녁',
      dayId: 'sat',
      familyId: 'desert-bloom',
      tone: 'violet',
      originCoordinates: { lat: 33.394, lng: 126.239 },
      destinationLocationId: 'around-horn',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.satDinner.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.satDinner.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'desert-bloom-priest-station'),
    },
    {
      id: 'route-sat-basecamp-return-north-star',
      type: 'route',
      title: '이씨 가족 베이스캠프 귀환',
      dayId: 'sat',
      familyId: 'north-star',
      tone: 'warning',
      originCoordinates: { lat: 33.4647, lng: 126.3092 },
      destinationLocationId: 'pine-airbnb',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.satDinnerReturn.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.satDinnerReturn.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'north-star-basecamp-return'),
    },
    {
      id: 'route-sat-basecamp-return-silver-peak',
      type: 'route',
      title: '김씨 가족 베이스캠프 귀환',
      dayId: 'sat',
      familyId: 'silver-peak',
      tone: 'critical',
      originCoordinates: { lat: 33.4647, lng: 126.3092 },
      destinationLocationId: 'pine-airbnb',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.satDinnerReturn.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.satDinnerReturn.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'silver-peak-basecamp-return'),
    },
    {
      id: 'route-sat-basecamp-return-desert-bloom',
      type: 'route',
      title: '박씨 가족 베이스캠프 귀환',
      dayId: 'sat',
      familyId: 'desert-bloom',
      tone: 'violet',
      originCoordinates: { lat: 33.4647, lng: 126.3092 },
      destinationLocationId: 'pine-airbnb',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.satDinnerReturn.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.satDinnerReturn.endSlot,
      linkedEntityKey: makeEntityKey('itineraryItem', 'desert-bloom-basecamp-return'),
    },
    {
      id: 'route-sun-home-north-star',
      type: 'route',
      title: '이씨 가족 귀가 (제주공항)',
      dayId: 'sat',
      familyId: 'north-star',
      tone: 'warning',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      stopLocationIds: ['north-star-kettleman-lunch'],
      simulationStartSlot: 11.0,
      simulationEndSlot: 12.0,
      path: [
        PUBLIC_BASECAMP_COORDINATES,
        { lat: 33.5065, lng: 126.4934 },
      ],
      linkedEntityKey: makeEntityKey('itineraryItem', 'north-star-homebound'),
    },
    {
      id: 'route-sun-home-silver-peak',
      type: 'route',
      title: '김씨 가족 귀가 (제주공항)',
      dayId: 'sat',
      familyId: 'silver-peak',
      tone: 'critical',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      stopLocationIds: ['north-star-oakdale-break'],
      simulationStartSlot: 11.08,
      simulationEndSlot: 12.08,
      path: [
        PUBLIC_BASECAMP_COORDINATES,
        { lat: 33.5065, lng: 126.4934 },
      ],
      linkedEntityKey: makeEntityKey('itineraryItem', 'silver-peak-homebound'),
    },
    {
      id: 'route-sun-home-desert-bloom',
      type: 'route',
      title: '박씨 가족 귀가 (제주공항)',
      dayId: 'sat',
      familyId: 'desert-bloom',
      tone: 'violet',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      stopLocationIds: ['north-star-oakdale-break'],
      simulationStartSlot: 11.16,
      simulationEndSlot: 12.16,
      path: [
        PUBLIC_BASECAMP_COORDINATES,
        { lat: 33.5065, lng: 126.4934 },
      ],
      linkedEntityKey: makeEntityKey('itineraryItem', 'desert-bloom-homebound'),
    },
  ]
}

export function createInitialTripDocument() {
  return {
    schemaVersion: 5,
    tripMeta: createDefaultTripMeta(),
    selectedPage: 'itinerary',
    selection: DEFAULT_SELECTION,
    pageNotes: {
      itinerary: '최우선: 금요일 도착 혼잡 최소화, 토요일은 아이들이 편하게 즐길 수 있도록.',
      stay: '첫 번째 가족이 모든 준비를 혼자 하지 않도록 도착 프로토콜을 명확히 정한다.',
      meals: '토요일은 제주공항 인근 식사로 시작. 일요일은 협재 해녀의 집 점심 후 흑돼지 저녁. 월요일은 귀가 전 공항 근처 마지막 식사.',
      activities: '협재해수욕장이 핵심 일정. 일요일은 한림공원과 협재해수욕장, 애월 카페거리까지 여유롭게.',
      expenses: '간단하게 유지. 정확한 회계보다 공유 가시성이 더 중요하다.',
      families: '각 가족은 목요일 아침 출발 전 자신의 역할 패키지를 숙지해야 한다.',
    },
    pageNoteMeta: {},
    ui: {
      searchQuery: '',
      timeline: {
        mode: 'scenario',
        cursorSlot: 3,
      },
      map: {
        showRoutes: true,
        showFacilities: true,
        showTraffic: false,
        focusFamilyId: 'all',
        focusDayId: 'all',
      },
    },
    families: buildFamilies().map((family) => normalizeFamilyRecord(family, family)),
    locations: buildLocations(),
    routes: synchronizeRoutePaths(buildRoutes(), buildLocations()),
    itineraryItems: buildItineraryItems(),
    meals: buildMeals(),
    activities: buildActivities(),
    stayItems: buildStayItems(),
    expenses: buildExpenses(),
    tasks: buildTasks(),
  }
}

export function synchronizeRoutePaths(routes = [], locations = []) {
  const locationById = new Map(locations.map((location) => [location.id, location]))

  return routes.map((route) => {
    if (!route.originCoordinates || !route.destinationLocationId) return route

    const destination = locationById.get(route.destinationLocationId)?.coordinates
    const stopPoints = (route.stopLocationIds || [])
      .map((locationId) => locationById.get(locationId)?.coordinates)
      .filter(Boolean)

    if (!destination) return route

    return {
      ...route,
      path: [route.originCoordinates, ...stopPoints, destination],
    }
  })
}

export function migrateLegacyState(raw) {
  const doc = createInitialTripDocument()
  if (!raw || typeof raw !== 'object') return doc

  if (raw.tripMeta && typeof raw.tripMeta === 'object') {
    doc.tripMeta = { ...doc.tripMeta, ...raw.tripMeta }
  }

  if (typeof raw.selectedPage === 'string') {
    doc.selectedPage = raw.selectedPage
  }

  if (raw.notes && typeof raw.notes === 'object') {
    doc.pageNotes = { ...doc.pageNotes, ...raw.notes }
  }

  if (Array.isArray(raw.meals)) {
    doc.meals = doc.meals.map((meal) => {
      const existing = raw.meals.find((item) => item.id === meal.id)
      return existing ? { ...meal, status: existing.status || meal.status, note: existing.note || meal.note } : meal
    })
  }

  if (Array.isArray(raw.expenses)) {
    doc.expenses = doc.expenses.map((expense) => {
      const existing = raw.expenses.find((item) => item.id === expense.id)
      return existing
        ? {
            ...expense,
            settled: typeof existing.settled === 'boolean' ? existing.settled : expense.settled,
            title: existing.title || expense.title,
            payer: existing.payer || expense.payer,
            amount: typeof existing.amount === 'number' ? existing.amount : expense.amount,
            split: existing.split || expense.split,
            allocationMode: existing.allocationMode || expense.allocationMode,
            allocations: existing.allocations && typeof existing.allocations === 'object'
              ? existing.allocations
              : expense.allocations,
            note: existing.note || expense.note,
          }
        : expense
    })
  }

  if (Array.isArray(raw.families)) {
    doc.families = doc.families.map((family) => {
      const existing = raw.families.find((item) => item.id === family.id)
      return existing
        ? {
            ...family,
            readiness: typeof existing.readiness === 'number' ? existing.readiness : family.readiness,
            status: existing.status || family.status,
            responsibility: existing.responsibility || family.responsibility,
            routeSummary: existing.routeSummary || family.routeSummary,
          }
        : family
    })

    const taskStatusById = {}
    raw.families.forEach((family) => {
      const mapping = LEGACY_FAMILY_TASKS[family.id] || {}
      ;(family.checklist || []).forEach((item) => {
        const taskId = mapping[item.id]
        if (taskId) {
          taskStatusById[taskId] = item.done ? 'done' : 'open'
        }
      })
    })

    doc.tasks = doc.tasks.map((task) =>
      taskStatusById[task.id] ? { ...task, status: taskStatusById[task.id] } : task,
    )

    if (typeof raw.selectedFamilyId === 'string') {
      doc.selection = { type: 'family', id: raw.selectedFamilyId }
    }
  }

  doc.families = doc.families.map((family) => normalizeFamilyRecord(family, family))

  return doc
}

function refreshSeededCollection(existing = [], seeded = [], options = {}) {
  const { normalizeItem } = options
  const existingById = new Map(existing.map((item) => [item.id, item]))
  const seededIds = new Set(seeded.map((item) => item.id))

  const mergedSeeded = seeded.map((item) => {
    const current = existingById.get(item.id)
    const merged = current ? { ...item, ...current } : item
    return normalizeItem ? normalizeItem(merged, item) : merged
  })

  const customItems = existing
    .filter((item) => !seededIds.has(item.id))
    .map((item) => (normalizeItem ? normalizeItem(item, null) : item))

  return [...mergedSeeded, ...customItems]
}

function routeStructureMatches(currentRoute, seededRoute) {
  if (!currentRoute || !seededRoute) return false

  const currentOrigin = currentRoute.originCoordinates || null
  const seededOrigin = seededRoute.originCoordinates || null
  const sameOrigin =
    currentOrigin?.lat === seededOrigin?.lat
    && currentOrigin?.lng === seededOrigin?.lng

  const currentStops = currentRoute.stopLocationIds || []
  const seededStops = seededRoute.stopLocationIds || []
  const sameStops =
    currentStops.length === seededStops.length
    && currentStops.every((stopId, index) => stopId === seededStops[index])

  return sameOrigin && sameStops && currentRoute.destinationLocationId === seededRoute.destinationLocationId
}

function refreshSeededDoc(doc) {
  const seeded = createInitialTripDocument()
  const families = refreshSeededCollection(doc.families, seeded.families, {
    normalizeItem: normalizeFamilyRecord,
  })
  const locations = refreshSeededCollection(doc.locations, seeded.locations)
  const routes = refreshSeededCollection(doc.routes, seeded.routes)
  const itineraryItems = refreshSeededCollection(doc.itineraryItems, seeded.itineraryItems)
  const meals = refreshSeededCollection(doc.meals, seeded.meals)
  const activities = refreshSeededCollection(doc.activities, seeded.activities)
  const stayItems = refreshSeededCollection(doc.stayItems, seeded.stayItems)
  const expenses = refreshSeededCollection(doc.expenses, seeded.expenses)
  const tasks = refreshSeededCollection(doc.tasks, seeded.tasks)

  return {
    ...seeded,
    ...doc,
    schemaVersion: seeded.schemaVersion,
    tripMeta: {
      ...seeded.tripMeta,
      ...(doc.tripMeta || {}),
    },
    pageNotes: {
      ...seeded.pageNotes,
      ...(doc.pageNotes || {}),
    },
    pageNoteMeta: doc.pageNoteMeta || {},
    ui: {
      ...seeded.ui,
      ...(doc.ui || {}),
      timeline: {
        ...seeded.ui.timeline,
        ...(doc.ui?.timeline || {}),
      },
      map: {
        ...seeded.ui.map,
        ...(doc.ui?.map || {}),
      },
    },
    families,
    locations,
    itineraryItems,
    meals,
    activities,
    stayItems,
    expenses,
    tasks,
    routes: synchronizeRoutePaths(routes, locations),
  }
}

export function getInitialTripDocument() {
  if (typeof window === 'undefined') return createInitialTripDocument()

  try {
    const rawCurrent = window.localStorage.getItem(TRIP_DOCUMENT_STORAGE_KEY)
    if (rawCurrent) {
      const parsed = JSON.parse(rawCurrent)
      if (parsed?.locations && parsed?.selection) return refreshSeededDoc(parsed)
      return refreshSeededDoc(migrateLegacyState(parsed))
    }
  } catch {
    return createInitialTripDocument()
  }

  return createInitialTripDocument()
}

export function clearLegacyTripStorage() {
  if (typeof window === 'undefined') return
  LEGACY_TRIP_DOCUMENT_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key))
  LEGACY_VIEWER_PROFILE_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key))
}

export function getLocationForEntity(doc, entity) {
  if (!entity) return null
  if (entity.type === 'location') return entity
  if (!entity.locationId) return null
  return getEntityById(doc, 'location', entity.locationId)
}

export function getTasksForEntity(doc, entity) {
  if (!entity) return []
  const entityKey = makeEntityKey(entity.type, entity.id)
  return doc.tasks.filter((task) => {
    if (entity.taskIds?.includes(task.id)) return true
    return (task.linkedEntityKeys || []).includes(entityKey)
  })
}

export function getLinkedEntities(doc, entity) {
  if (!entity) return []

  const seen = new Set()
  const linked = []

  const pushEntity = (item) => {
    if (!item) return
    const key = makeEntityKey(item.type, item.id)
    if (key === makeEntityKey(entity.type, entity.id) || seen.has(key)) return
    seen.add(key)
    linked.push(item)
  }

  ;(entity.linkedEntityKeys || []).forEach((key) => {
    const ref = parseEntityKey(key)
    pushEntity(getEntityById(doc, ref.type, ref.id))
  })

  if (entity.locationId) {
    pushEntity(getEntityById(doc, 'location', entity.locationId))
  }

  getTasksForEntity(doc, entity).forEach(pushEntity)

  return linked
}

export function getEntitySummary(entity) {
  if (!entity) return ''
  if (entity.type === 'family') return `${entity.origin} inbound, ${entity.headcount}`
  if (entity.type === 'meal') return `${getDayMeta(entity.dayId)?.shortLabel || entity.dayId} at ${entity.timeLabel}`
  if (entity.type === 'activity') return entity.window
  if (entity.type === 'location') return entity.address
  if (entity.type === 'stayItem') return entity.category
  if (entity.type === 'expense') return `${entity.payer} · $${entity.amount}`
  if (entity.type === 'itineraryItem') return getSlotLabel(entity.startSlot)
  if (entity.type === 'task') return entity.status
  return ''
}

export function getSearchResults(doc, query) {
  if (!query?.trim()) return []
  const normalized = query.trim().toLowerCase()
  const types = ['family', 'meal', 'activity', 'location', 'stayItem', 'expense', 'itineraryItem', 'task']
  const items = types.flatMap((type) =>
    getCollection(doc, type).map((item) => ({
      ...item,
      type,
      searchText: [
        item.title,
        item.name,
        item.summary,
        item.note,
        item.address,
        item.description,
        item.backup,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    })),
  )

  return items
    .filter((item) => item.searchText.includes(normalized))
    .slice(0, 8)
}

export function getTimelineContext(doc, overrideCursorSlot = doc.ui.timeline.cursorSlot) {
  const cursorSlot = overrideCursorSlot
  const liveEntities = [...doc.itineraryItems, ...doc.meals].filter((item) => {
    const span = getItineraryItemEffectiveSpan(doc, item)
    return cursorSlot >= item.startSlot && cursorSlot < item.startSlot + span
  })

  const nextEntities = [...doc.itineraryItems, ...doc.meals]
    .filter((item) => item.startSlot > cursorSlot)
    .sort((a, b) => a.startSlot - b.startSlot)
    .slice(0, 4)

  const prepSoon = nextEntities
    .flatMap((item) => getTasksForEntity(doc, item))
    .filter((task) => task.status !== 'done')
    .filter((task, index, array) => array.findIndex((candidate) => candidate.id === task.id) === index)
    .slice(0, 5)

  const riskWatch = [...doc.activities, ...doc.itineraryItems]
    .filter((item) => item.riskLevel === 'High' || item.status === 'Watch')
    .slice(0, 4)

  return {
    cursorSlot,
    cursorLabel: getSlotLabel(cursorSlot),
    liveEntities,
    nextEntities,
    prepSoon,
    riskWatch,
  }
}

export function getDependencyPrompts(doc, entity) {
  const tasks = getTasksForEntity(doc, entity).filter((task) => task.status !== 'done')
  return tasks.slice(0, 3).map((task) => ({
    id: `prompt-${entity.type}-${entity.id}-${task.id}`,
    label: task.title,
    reason: entity.type === 'activity'
      ? `${getEntityTitle(entity)} depends on this before go-time.`
      : 'This is still unresolved and is linked to the selected item.',
  }))
}

export function getRouteForEntity(doc, entity) {
  if (!entity) return null
  if (entity.routeId) return getEntityById(doc, 'route', entity.routeId)
  const entityKey = makeEntityKey(entity.type, entity.id)
  const directRoute = doc.routes.find((route) => route.linkedEntityKey === entityKey)
  if (directRoute) return directRoute

  for (const linkedKey of entity.linkedEntityKeys || []) {
    const linkedRoute = doc.routes.find((route) => route.linkedEntityKey === linkedKey)
    if (linkedRoute) return linkedRoute
  }

  return null
}

export function updateEntityInCollection(collection, id, updater) {
  return collection.map((item) => (item.id === id ? updater(item) : item))
}

function replacePublicStrings(value) {
  if (typeof value !== 'string' || !value) return value
  return value
}

function sanitizePublicText(value, fallback = '') {
  if (typeof value !== 'string') return fallback
  return replacePublicStrings(value)
}

function sanitizeFamilyEntity(family) {
  const profile = PUBLIC_FAMILY_PROFILES[family.id]
  if (!profile) {
    return {
      ...family,
      note: '',
    }
  }

  return {
    ...family,
    title: profile.title,
    name: profile.name,
    shortOrigin: profile.shortOrigin,
    origin: profile.origin,
    originAddress: profile.originAddress,
    originCoordinates: profile.originCoordinates,
    responsibility: profile.responsibility,
    routeSummary: profile.routeSummary,
    note: profile.note,
  }
}

function sanitizeLocationEntity(location) {
  if (location.id === 'pine-airbnb') {
    return {
      ...location,
      title: PUBLIC_BASECAMP.name,
      address: PUBLIC_BASECAMP.address,
      coordinates: PUBLIC_BASECAMP.coordinates,
      summary: PUBLIC_BASECAMP.summary,
      accessNote: PUBLIC_BASECAMP.accessNote,
      directionsNote: PUBLIC_BASECAMP.directionsNote,
      parkingNote: PUBLIC_BASECAMP.parkingNote,
      lockNote: PUBLIC_BASECAMP.lockNote,
      checkIn: PUBLIC_BASECAMP.checkIn,
      checkOut: PUBLIC_BASECAMP.checkOut,
      wifiNetwork: PUBLIC_BASECAMP.wifiNetwork,
      wifiPassword: PUBLIC_BASECAMP.wifiPassword,
      hostName: PUBLIC_BASECAMP.hostName,
      coHostName: PUBLIC_BASECAMP.coHostName,
      guestSummary: PUBLIC_BASECAMP.guestSummary,
      confirmationCode: PUBLIC_BASECAMP.confirmationCode,
      vehicleFee: PUBLIC_BASECAMP.vehicleFee,
      externalUrl: PUBLIC_BASECAMP.externalUrl,
      manualUrl: PUBLIC_BASECAMP.manualUrl,
      photos: PUBLIC_BASECAMP.photos,
      livePhotos: [],
      websiteUrl: null,
      phoneNumber: null,
      reservationNote: null,
      note: '',
    }
  }

  return {
    ...location,
    title: sanitizePublicText(location.title),
    summary: sanitizePublicText(location.summary),
    note: '',
    reservationNote: sanitizePublicText(location.reservationNote || ''),
    address: sanitizePublicText(location.address),
  }
}

function sanitizeStayItemEntity(item) {
  return {
    ...item,
    title: sanitizePublicText(item.title),
    summary: PUBLIC_STAY_SUMMARIES[item.id] || sanitizePublicText(item.summary),
    note: PUBLIC_STAY_NOTES[item.id] || '',
  }
}

function sanitizeExpenseEntity(expense) {
  return {
    ...expense,
    title: sanitizePublicText(expense.title),
    payer: PUBLIC_EXPENSE_PAYER,
    allocations: {},
    note: '',
  }
}

function sanitizeGenericEntity(entity) {
  return {
    ...entity,
    title: sanitizePublicText(entity.title),
    name: sanitizePublicText(entity.name),
    summary: sanitizePublicText(entity.summary),
    note: '',
    description: sanitizePublicText(entity.description),
    backup: sanitizePublicText(entity.backup),
    routeSummary: sanitizePublicText(entity.routeSummary),
    owner: sanitizePublicText(entity.owner),
    payer: sanitizePublicText(entity.payer),
  }
}

export function projectTripDocument(doc, visibilityMode = 'public') {
  if (visibilityMode !== 'public') return doc

  const sanitizedFamilies = doc.families.map(sanitizeFamilyEntity)

  const projected = {
    ...doc,
    pageNotes: Object.fromEntries(Object.keys(doc.pageNotes || {}).map((key) => [key, ''])),
    pageNoteMeta: {},
    families: sanitizedFamilies,
    locations: doc.locations.map(sanitizeLocationEntity),
    stayItems: doc.stayItems.map(sanitizeStayItemEntity),
    expenses: doc.expenses.map(sanitizeExpenseEntity),
    meals: doc.meals.map(sanitizeGenericEntity),
    activities: doc.activities.map(sanitizeGenericEntity),
    itineraryItems: doc.itineraryItems.map(sanitizeGenericEntity),
    tasks: doc.tasks.map(sanitizeGenericEntity),
  }

  projected.routes = synchronizeRoutePaths(
    doc.routes.map((route) => {
      const nextRoute = {
        ...route,
        title: sanitizePublicText(route.title),
        note: '',
      }

      if (route.id === 'route-sf-desert-bloom') {
        nextRoute.originCoordinates = PUBLIC_FAMILY_PROFILES['desert-bloom'].originCoordinates
        if (route.path?.length) {
          nextRoute.path = [PUBLIC_FAMILY_PROFILES['desert-bloom'].originCoordinates, ...route.path.slice(1)]
        }
      }

      if (route.id === 'route-sun-home-desert-bloom' && route.path?.length) {
        nextRoute.path = [
          ...route.path.slice(0, -1),
          PUBLIC_FAMILY_PROFILES['desert-bloom'].originCoordinates,
        ]
      }

      return nextRoute
    }),
    projected.locations,
  )

  return projected
}

export function getSelectablePageEntities(doc, pageId) {
  switch (pageId) {
    case 'itinerary':
      return [...doc.activities, ...doc.itineraryItems]
    case 'stay':
      return [...doc.stayItems, ...doc.locations.filter((location) => location.category === 'stay')]
    case 'meals':
      return doc.meals
    case 'activities':
      return doc.activities
    case 'expenses':
      return doc.expenses
    case 'families':
      return doc.families
    default:
      return []
  }
}

export function ensureSelectionForPage(doc, pageId) {
  const selected = getEntityBySelection(doc, doc.selection)
  if (selected && isEntityOnPage(selected, pageId)) return doc.selection
  const fallback = getSelectablePageEntities(doc, pageId)[0]
  return fallback ? { type: fallback.type, id: fallback.id } : DEFAULT_SELECTION
}

export function getTasksByFamily(doc, familyId) {
  return doc.tasks.filter((task) => task.ownerFamilyId === familyId)
}

export function getFamilyReadiness(doc, familyId) {
  const tasks = getTasksByFamily(doc, familyId)
  if (!tasks.length) return 100
  const doneCount = tasks.filter((task) => task.status === 'done').length
  return Math.round((doneCount / tasks.length) * 100)
}

export function getTasksForDay(doc, dayId) {
  return doc.tasks.filter((task) => task.dayId === dayId)
}

export function getPageNote(doc, pageId) {
  return doc.pageNotes[pageId] || ''
}

export function getFamilyFilterOptions(doc) {
  return [
    { id: 'all', label: 'All Families' },
    ...doc.families.map((family) => ({ id: family.id, label: family.title })),
  ]
}
