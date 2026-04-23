import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import {
  ArrowRight,
  CarFront,
  Cloud,
  CloudRain,
  Database,
  Download,
  ExternalLink,
  Flag,
  Gauge,
  Globe,
  Home,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  MessageSquare,
  Pause,
  Phone,
  Play,
  Receipt,
  RotateCcw,
  Route,
  Search,
  Settings,
  Star,
  Sun,
  Users,
  Utensils,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import palantirLogo from './assets/palantir-logo.svg'
import CommandMap from './CommandMap'
import InspectorRail from './InspectorRail'
import { NotionSetupTutorial } from './NotionSetupTutorial'
import { OnboardingGuide, OnboardingResetButton } from './OnboardingGuide'
import { useNotionSync } from './useNotionSync'
import { PUBLISH_CONFIG, isLiveExternalDataEnabled } from './publishConfig'
import { usePersistedTripState } from './usePersistedTripState'
import { DAYS, NAV_ITEMS, TIME_SLOTS } from './tripData'
import {
  ENTITY_PAGE,
  ensureSelectionForPage,
  getDayMeta,
  getEntityById,
  getEntityBySelection,
  getEntitySummary,
  getEntityTitle,
  getFamilyReadiness,
  formatFamilyHeadcount,
  TRIP_DOCUMENT_STORAGE_KEY,
  VIEWER_PROFILE_STORAGE_KEY,
  clearLegacyTripStorage,
  getInitialTripDocument,
  getLinkedEntities,
  getLocationForEntity,
  getPageNote,
  getRouteForEntity,
  getItineraryItemEffectiveSpan,
  getRouteSimulationWindow,
  getSearchResults,
  getSlotLabel,
  getTasksByFamily,
  getTasksForDay,
  getTasksForEntity,
  getTimelineContext,
  makeEntityKey,
  projectTripDocument,
  synchronizeRoutePaths,
  updateEntityInCollection,
} from './tripModel'
import { fetchWeatherBundle, getMapWeather, getMapWeatherTargets, getTripDayWeather } from './weather'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID
const SKIP_DEPRECATED_GOOGLE_ROUTING_IN_DEV = import.meta.env.VITE_DISABLE_LEGACY_GOOGLE_ROUTING === 'true'
const SKIP_DEPRECATED_GOOGLE_PLACES_IN_DEV = Boolean(import.meta.env?.DEV)

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const PAGE_ICONS = {
  itinerary: LayoutGrid,
  stay: Home,
  meals: Utensils,
  activities: MapIcon,
  expenses: Receipt,
  families: Users,
}

const WEATHER_ICONS = {
  sun: Sun,
  partly: Cloud,
  cloud: Cloud,
  rain: CloudRain,
  storm: CloudRain,
  fog: Cloud,
  wind: Cloud,
  snow: Cloud,
}

const STATUS_STYLES = {
  Transit: 'bg-[#58A6FF]/18 text-[#58A6FF]',
  'Friday Arrival': 'bg-[#D29922]/18 text-[#D29922]',
  Assigned: 'bg-[#58A6FF]/18 text-[#58A6FF]',
  Pending: 'bg-[#D29922]/18 text-[#D29922]',
  Open: 'bg-[#D29922]/18 text-[#D29922]',
  Settled: 'bg-[#3FB950]/18 text-[#3FB950]',
  Go: 'bg-[#3FB950]/18 text-[#3FB950]',
  Watch: 'bg-[#D29922]/18 text-[#D29922]',
  '이동 중': 'bg-[#58A6FF]/18 text-[#58A6FF]',
  '금요일 합류': 'bg-[#D29922]/18 text-[#D29922]',
  '확정': 'bg-[#58A6FF]/18 text-[#58A6FF]',
  '대기': 'bg-[#D29922]/18 text-[#D29922]',
  '완료': 'bg-[#3FB950]/18 text-[#3FB950]',
  '실행': 'bg-[#3FB950]/18 text-[#3FB950]',
  '주의': 'bg-[#D29922]/18 text-[#D29922]',
}

const TIMELINE_COLORS = {
  info: 'border-[#58A6FF] bg-[#58A6FF]/10 text-[#C9D1D9]',
  warning: 'border-[#D29922] bg-[#D29922]/10 text-[#D29922]',
  success: 'border-[#3FB950] bg-[#3FB950]/10 text-[#3FB950]',
  critical: 'border-[#F85149] bg-[#F85149]/10 text-[#F85149]',
  violet: 'border-[#A371F7] bg-[#A371F7]/10 text-[#A371F7]',
  muted: 'border-[#4B5563] bg-[#4B5563]/10 text-[#8B949E]',
}

const EXPENSE_SPLIT_LABELS = {
  equal: '균등 분할',
  manual: '수동 배분',
  individual: '개별 부담',
}

const PLAYBACK_SPEED_OPTIONS = [1, 2, 3, 4]
const TIMELINE_HOURS_PER_SLOT = 6
const TIMELINE_HOUR_STEPS = 24
const VISIBLE_TIMELINE_START_HOUR = 6
const VISIBLE_TIMELINE_END_HOUR = 24
const MISSION_LAUNCH_HOUR = 9
const VISIBLE_TIMELINE_SLOT_START = VISIBLE_TIMELINE_START_HOUR / TIMELINE_HOURS_PER_SLOT
const VISIBLE_TIMELINE_SLOT_END = VISIBLE_TIMELINE_END_HOUR / TIMELINE_HOURS_PER_SLOT
const VISIBLE_TIMELINE_SLOT_SPAN = VISIBLE_TIMELINE_SLOT_END - VISIBLE_TIMELINE_SLOT_START
const MISSION_TIME_PRESETS = [6, 9, 12, 15, 18, 21]
const PLAYBACK_SLOT_UNITS_PER_SECOND = 0.1
const MISSION_FEED_LIFETIME_MS = 3000
const MISSION_FEED_FADE_MS = 500
const MISSION_FEED_TICK_MS = 100
const PLAYBACK_MAX_FRAME_DELTA_SECONDS = 0.18
const PLAYBACK_STALL_RESET_SECONDS = 0.6

const SEEDED_PLAN_REFRESH_IDS = {
  families: new Set(['north-star', 'silver-peak', 'desert-bloom']),
  locations: new Set(['pine-airbnb', 'pine-lake-beach', 'yosemite', 'grill-pml', 'two-guys-pizza', 'mountain-room', 'priest-station', 'around-horn']),
  meals: new Set(['thu-dinner', 'fri-lunch', 'fri-dinner', 'sat-lunch', 'sat-dinner']),
  activities: new Set(['fri-lake', 'sat-yosemite']),
  tasks: new Set(['task-grill-kit', 'task-grocery-run', 'task-priest-station-plan']),
  itineraryItems: new Set([
    'north-star-drive',
    'silver-peak-drive',
    'desert-bloom-drive',
    'north-star-grill-shuttle',
    'silver-peak-grill-shuttle',
    'north-star-grill-return',
    'silver-peak-grill-return',
    'thu-dinner-ops',
    'fri-lake',
    'groceries',
    'park-prep',
    'north-star-lake-hop',
    'silver-peak-lake-hop',
    'north-star-mountain-room-return',
    'silver-peak-mountain-room-return',
    'north-star-yosemite-push',
    'silver-peak-yosemite-push',
    'desert-bloom-yosemite-push',
    'north-star-priest-station',
    'silver-peak-priest-station',
    'desert-bloom-priest-station',
    'north-star-basecamp-return',
    'silver-peak-basecamp-return',
    'desert-bloom-basecamp-return',
  ]),
  routes: new Set([
    'route-la-north-star',
    'route-sf-silver-peak',
    'route-sf-desert-bloom',
    'route-thu-grill-north-star',
    'route-thu-grill-silver-peak',
    'route-thu-return-north-star',
    'route-thu-return-silver-peak',
    'route-fri-beach-north-star',
    'route-fri-beach-silver-peak',
    'route-fri-return-north-star',
    'route-fri-return-silver-peak',
    'route-sat-yosemite-north-star',
    'route-sat-yosemite-silver-peak',
    'route-sat-yosemite-desert-bloom',
    'route-sat-priest-station-north-star',
    'route-sat-priest-station-silver-peak',
    'route-sat-priest-station-desert-bloom',
    'route-sat-basecamp-return-north-star',
    'route-sat-basecamp-return-silver-peak',
    'route-sat-basecamp-return-desert-bloom',
  ]),
}

const OBSOLETE_PLAN_ROUTE_IDS = new Set([
  'route-yosemite-day',
  'route-fri-beach-desert-bloom',
  'route-fri-mountain-room-north-star',
  'route-fri-mountain-room-silver-peak',
  'route-fri-mountain-room-desert-bloom',
  'route-fri-return-desert-bloom',
])

const OBSOLETE_PLAN_ITINERARY_IDS = new Set([
  'desert-bloom-lake-hop',
  'north-star-mountain-room',
  'silver-peak-mountain-room',
  'desert-bloom-mountain-room',
  'desert-bloom-mountain-room-return',
])

const DAY_BRIEFING_COPY = {
  thu: {
    code: '이동 / 제주 집결',
    tone: 'Amber',
    summary:
      '광복절 당일, 모든 가족이 비행기를 타고 제주에 무사히 도착하는 날입니다. 주요 리스크는 성수기 공항 혼잡, 렌터카 픽업 대기, 와일리제주 체크인 전 모멘텀 소실. 성공 기준: 전 가족 제주공항 도착, 렌터카 픽업 완료, 와일리제주 정착 후 흑돼지 저녁.',
    lookouts: [
      '광복절 연휴 공항은 극도로 혼잡. 출발 2시간 전 공항 도착을 원칙으로.',
      '렌터카 픽업이 가장 피할 수 있는 병목. 업체 위치·예약 번호를 미리 확인.',
      '저녁을 과도하게 계획하지 않는다. 흑돼지 저녁과 휴식이 이날의 임무.',
    ],
  },
  fri: {
    code: '협재해수욕장 & 한림공원',
    tone: 'Blue',
    summary:
      '일요일은 제주 여행의 핵심 날. 협재 해녀의 집 점심, 한림공원 관람, 협재해수욕장에서 물놀이. 아이 친화적 페이스 유지가 핵심. 저녁은 흑돼지 구이로 마무리.',
    lookouts: [
      '성수기 협재 주차는 극히 혼잡. 오전 일찍 출발해 주차 확보 우선.',
      '한림공원 → 협재 순서로 동선을 최적화. 아이들 체력 관리.',
      '흑돼지 저녁 예약 필수. 광복절 연휴 성수기 노쇼 주의.',
    ],
  },
  sat: {
    code: '귀가 / 마무리',
    tone: 'Red',
    summary:
      '월요일은 통제된 귀가입니다. 와일리제주 체크아웃, 렌터카 반납, 제주공항 출발이 목표. 아침이 여유로울수록 이번 여행 전체가 더 좋은 기억으로 남습니다.',
    lookouts: [
      '체크아웃 시간 엄수. 짐 정리와 집 원상 복구는 전날 밤 미리 시작.',
      '렌터카 반납 시간과 비행 시간 사이 여유 확보. 성수기 반납 대기 가능.',
      '공항 면세점·기념품은 시간 여유가 있을 때만. 탑승 여유 시간 우선.',
    ],
  },
  sun: {
    code: '귀가 / 마무리',
    tone: 'Green',
    summary:
      '일요일은 통제된 귀가입니다. 관광이 아니라 깔끔한 출발이 목표: 아침 식사, 짐 정리, 펜션 청소, 가족별 순차 출발. 아침이 여유로울수록 이번 여행 전체가 더 좋은 기억으로 남습니다.',
    lookouts: [
      '아침 식사를 간단히 하고 짐 정리를 일찍 시작해 체크아웃이 전체 분위기를 망치지 않도록.',
      '쓰레기 분리, 냉장고 정리, 최종 짐 싣기에 조용한 책임자를 지정.',
      "마지막으로 한 가지만 더' 확장을 피할 것. 목표는 우아한 퇴장이다.",
    ],
  },
}

const MISSION_OBJECTIVE_COPY = {
  thu: '전 가족을 제주 와일리제주에 안착시키고, 저녁 템포가 시작되기 전에 휴식 체계를 구축.',
  fri: '협재해수욕장·한림공원 운영 윈도우를 깔끔하게 운영하고, 조율 부담을 최소화하며, 아이들이 최대한 즐길 수 있게.',
  sat: '제주공항으로 원활히 귀가하고, 체크아웃·렌터카 반납·탑승을 여유 있게 마무리.',
  sun: '통제된 짐 정리를 실행하고, 체크아웃이 전체 분위기를 좌우하지 않도록 가족별 순차 출발 진행.',
}

const MISSION_LAUNCH_THEME = {
  thu: {
    accent: '#F2CC60',
    accentStrong: '#FFD76B',
    accentSoft: 'rgba(242, 204, 96, 0.14)',
    accentGlow: 'rgba(242, 204, 96, 0.28)',
    accentBorder: 'rgba(242, 204, 96, 0.34)',
    accentText: '#F2CC60',
    panelGlow: 'rgba(242, 204, 96, 0.18)',
  },
  fri: {
    accent: '#58A6FF',
    accentStrong: '#7AB8FF',
    accentSoft: 'rgba(88, 166, 255, 0.14)',
    accentGlow: 'rgba(88, 166, 255, 0.26)',
    accentBorder: 'rgba(88, 166, 255, 0.34)',
    accentText: '#58A6FF',
    panelGlow: 'rgba(88, 166, 255, 0.18)',
  },
  sat: {
    accent: '#F85149',
    accentStrong: '#FF7B72',
    accentSoft: 'rgba(248, 81, 73, 0.14)',
    accentGlow: 'rgba(248, 81, 73, 0.26)',
    accentBorder: 'rgba(248, 81, 73, 0.34)',
    accentText: '#F85149',
    panelGlow: 'rgba(248, 81, 73, 0.18)',
  },
  sun: {
    accent: '#3FB950',
    accentStrong: '#56D364',
    accentSoft: 'rgba(63, 185, 80, 0.14)',
    accentGlow: 'rgba(63, 185, 80, 0.26)',
    accentBorder: 'rgba(63, 185, 80, 0.34)',
    accentText: '#3FB950',
    panelGlow: 'rgba(63, 185, 80, 0.18)',
  },
}

const MISSION_LAUNCH_KEYFRAMES = `
  @keyframes mission-launch-panel-in {
    0% {
      opacity: 0;
      transform: translateY(24px) scale(0.97);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes mission-launch-halo {
    0%, 100% {
      transform: scale(1);
      opacity: 0.92;
    }
    50% {
      transform: scale(1.02);
      opacity: 1;
    }
  }

  @keyframes mission-launch-digit-in {
    0% {
      opacity: 0;
      transform: translateY(12px) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`

function formatCurrency(amount) {
  const value = Number.isFinite(amount) ? amount : Number(amount) || 0
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function parseCurrencyInput(value) {
  if (typeof value !== 'string') return Number(value) || 0
  const normalized = value.replace(/[^0-9.]/g, '')
  if (!normalized.trim()) return 0
  return Number(normalized) || 0
}

function getFamilyLabel(families, familyId) {
  return families.find((family) => family.id === familyId)?.title || '알 수 없는 가족'
}

function stampFamilyMetadata(item, familyId) {
  if (!familyId) return item

  const timestamp = new Date().toISOString()
  return {
    ...item,
    lastEditedByFamilyId: familyId,
    lastEditedAt: timestamp,
    createdByFamilyId: item.createdByFamilyId || familyId,
    createdAt: item.createdAt || timestamp,
  }
}

function buildEqualExpenseAllocations(amount, families) {
  if (!families.length) return []

  const totalCents = Math.max(Math.round((Number(amount) || 0) * 100), 0)
  const baseCents = Math.floor(totalCents / families.length)
  const remainder = totalCents - baseCents * families.length

  return families.map((family, index) => ({
    familyId: family.id,
    title: family.title,
    amount: (baseCents + (index < remainder ? 1 : 0)) / 100,
  }))
}

function getExpenseAllocations(expense, families) {
  if (!expense || !families.length) return []
  if (expense.allocationMode === 'individual') {
    return families.map((family) => ({
      familyId: family.id,
      title: family.title,
      amount: 0,
    }))
  }
  if (expense.allocationMode === 'manual') {
    return families.map((family) => ({
      familyId: family.id,
      title: family.title,
      amount: Number(expense.allocations?.[family.id]) || 0,
    }))
  }
  return buildEqualExpenseAllocations(expense.amount, families)
}

function buildManualAllocationSeed(amount, families) {
  return Object.fromEntries(
    buildEqualExpenseAllocations(amount, families).map((item) => [item.familyId, item.amount]),
  )
}

function getFamilyExpenseBurden(expenses, families) {
  const totals = Object.fromEntries(families.map((family) => [family.id, 0]))

  expenses.forEach((expense) => {
    if (expense.allocationMode === 'individual') return
    getExpenseAllocations(expense, families).forEach((allocation) => {
      totals[allocation.familyId] = (totals[allocation.familyId] || 0) + allocation.amount
    })
  })

  return families.map((family) => ({
    familyId: family.id,
    title: family.title,
    amount: totals[family.id] || 0,
  }))
}

function clampTimelineCursor(slot) {
  const maxCursor = DAYS.length * TIME_SLOTS.length - 0.001
  return Math.min(Math.max(slot, 0), maxCursor)
}

function getDayVisibleCursorRange(dayIndex) {
  const dayStart = dayIndex * TIME_SLOTS.length
  return {
    start: dayStart + VISIBLE_TIMELINE_SLOT_START,
    end: dayStart + VISIBLE_TIMELINE_SLOT_END,
  }
}

function projectCursorToVisibleTimelineRatio(cursorSlot, dayCount = DAYS.length) {
  const normalizedCursor = clampTimelineCursor(cursorSlot)
  const dayIndex = Math.min(Math.max(Math.floor(normalizedCursor / TIME_SLOTS.length), 0), dayCount - 1)
  const dayOffset = normalizedCursor - dayIndex * TIME_SLOTS.length
  const clampedDayOffset = Math.min(Math.max(dayOffset, VISIBLE_TIMELINE_SLOT_START), VISIBLE_TIMELINE_SLOT_END)
  const visibleCursor = dayIndex * VISIBLE_TIMELINE_SLOT_SPAN + (clampedDayOffset - VISIBLE_TIMELINE_SLOT_START)
  const totalVisibleSlots = Math.max(dayCount * VISIBLE_TIMELINE_SLOT_SPAN, 0.0001)
  return Math.min(Math.max(visibleCursor / totalVisibleSlots, 0), 0.999999)
}

function projectVisibleTimelineRatioToCursor(ratio, dayCount = DAYS.length) {
  const totalVisibleSlots = Math.max(dayCount * VISIBLE_TIMELINE_SLOT_SPAN, 0.0001)
  const clampedRatio = Math.min(Math.max(ratio, 0), 0.999999)
  const visibleCursor = clampedRatio * totalVisibleSlots
  const dayIndex = Math.min(Math.max(Math.floor(visibleCursor / VISIBLE_TIMELINE_SLOT_SPAN), 0), dayCount - 1)
  const dayVisibleOffset = visibleCursor - dayIndex * VISIBLE_TIMELINE_SLOT_SPAN
  return clampTimelineCursor(dayIndex * TIME_SLOTS.length + VISIBLE_TIMELINE_SLOT_START + dayVisibleOffset)
}

function getCursorHourInDay(cursorSlot) {
  const normalizedCursor = clampTimelineCursor(cursorSlot)
  const dayOffset = normalizedCursor - Math.floor(normalizedCursor / TIME_SLOTS.length) * TIME_SLOTS.length
  return dayOffset * TIMELINE_HOURS_PER_SLOT
}

function getMissionLaunchCursor(dayIndex) {
  return clampTimelineCursor(dayIndex * TIME_SLOTS.length + MISSION_LAUNCH_HOUR / TIMELINE_HOURS_PER_SLOT)
}

function getSuggestedPlaybackStartCursor(doc, cursorSlot, operationCheckpoints = []) {
  const windows = (doc.routes || [])
    .map((route) => getRouteSimulationWindow(doc, route))
    .filter((window) => Number.isFinite(window.start) && Number.isFinite(window.end))
    .sort((left, right) => left.start - right.start)
  const checkpoints = (operationCheckpoints || [])
    .filter((checkpoint) => Number.isFinite(checkpoint?.startSlot))
    .sort((left, right) => left.startSlot - right.startSlot)
  const routeLeadIn = 0.08
  const checkpointLeadIn = 0.03

  const normalizedCursor = clampTimelineCursor(cursorSlot)
  if (!windows.length && !checkpoints.length) return normalizedCursor

  const activeWindow = windows.find((window) => normalizedCursor >= window.start && normalizedCursor <= window.end)
  if (activeWindow) return normalizedCursor

  const nextWindow = windows.find((window) => window.start > normalizedCursor)
  const nextCheckpoint = checkpoints.find((checkpoint) => checkpoint.startSlot > normalizedCursor)

  if (nextCheckpoint && (!nextWindow || nextCheckpoint.startSlot <= nextWindow.start)) {
    return clampTimelineCursor(Math.max(nextCheckpoint.startSlot - checkpointLeadIn, 0))
  }

  if (nextWindow) {
    return clampTimelineCursor(Math.max(nextWindow.start - routeLeadIn, 0))
  }

  if (nextCheckpoint) {
    return clampTimelineCursor(Math.max(nextCheckpoint.startSlot - checkpointLeadIn, 0))
  }

  if (windows.length) {
    return clampTimelineCursor(Math.max(windows[0].start - routeLeadIn, 0))
  }

  return normalizedCursor
}

function getCurrentTripCursor(now = new Date()) {
  const currentYear = now.getFullYear()
  const tripStart = new Date(currentYear, 3, 9, 0, 0, 0, 0)
  const tripEnd = new Date(currentYear, 3, 13, 0, 0, 0, 0)
  const tripDurationHours = (tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60)
  const hoursIntoTrip = (now.getTime() - tripStart.getTime()) / (1000 * 60 * 60)
  const clampedHours = Math.min(Math.max(hoursIntoTrip, 0), tripDurationHours)
  return clampTimelineCursor(clampedHours / TIMELINE_HOURS_PER_SLOT)
}

function getCompactTravelLabel(item) {
  const status = (item?.status || '').toLowerCase()
  const title = (item?.title || '').toLowerCase()

  if (status.includes('return') || title.includes('rtb') || title.includes('homebound')) return 'RTB'
  if (status.includes('dinner') || title.includes('dinner')) return 'DIN'
  if (status.includes('lunch') || title.includes('lunch')) return 'LCH'
  if (status.includes('park') || title.includes('yosemite')) return 'YOS'
  if (status.includes('arrival') || title.includes('drive')) return 'DRV'
  if (status.includes('hop')) return 'HOP'

  const fallback = item?.status || item?.title || 'DRV'
  return fallback.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'DRV'
}

function getCursorDay(cursorSlot) {
  const dayIndex = Math.min(Math.floor(cursorSlot / TIME_SLOTS.length), DAYS.length - 1)
  return DAYS[Math.max(dayIndex, 0)] || DAYS[0]
}

function formatNameList(labels) {
  const cleanLabels = labels.filter(Boolean)
  if (!cleanLabels.length) return ''
  if (cleanLabels.length === 1) return cleanLabels[0]
  if (cleanLabels.length === 2) return `${cleanLabels[0]} + ${cleanLabels[1]}`
  return `${cleanLabels.slice(0, -1).join(', ')} + ${cleanLabels[cleanLabels.length - 1]}`
}

function stripDayPrefix(label) {
  return (label || '').replace(/^[A-Za-z]{3}\s+/, '')
}

function dedupeById(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (!item?.id) return false
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function pickMostFrequentEntity(items) {
  const counts = new Map()
  let bestItem = null
  let bestCount = 0

  items.forEach((item) => {
    if (!item?.id) return
    const nextCount = (counts.get(item.id) || 0) + 1
    counts.set(item.id, nextCount)
    if (nextCount > bestCount) {
      bestCount = nextCount
      bestItem = item
    }
  })

  return bestItem || items.find(Boolean) || null
}

function getRelatedTravelItemsForGate(doc, gate) {
  const gateItems = gate?.items || []
  const primaryItem = gateItems[0]
  if (!primaryItem) return []

  const gateEntityKeys = new Set(
    gateItems.flatMap((item) => [makeEntityKey('itineraryItem', item.id), ...(item.linkedEntityKeys || [])]),
  )
  const sameDayTravelItems = doc.itineraryItems.filter((item) => item.rowId === 'travel' && item.dayId === primaryItem.dayId)
  const directlyLinkedTravelItems = sameDayTravelItems.filter((item) =>
    (item.linkedEntityKeys || []).some((key) => gateEntityKeys.has(key)),
  )
  if (directlyLinkedTravelItems.length) return directlyLinkedTravelItems

  const launchWaveEnd = gate.startSlot + 1.2
  const sameWaveTravelItems = sameDayTravelItems.filter((item) => {
    const itemEnd = item.startSlot + getItineraryItemEffectiveSpan(doc, item)
    return itemEnd >= gate.startSlot - 0.1 && item.startSlot <= launchWaveEnd
  })
  if (sameWaveTravelItems.length) return sameWaveTravelItems

  return sameDayTravelItems.filter((item) => item.startSlot >= gate.startSlot - 0.25 && item.startSlot <= gate.startSlot + 0.55)
}

function buildOperationGateContext(doc, gate) {
  if (!gate?.items?.length) return null

  const primaryItem = gate.items[0]
  const dayId = primaryItem.dayId || gate.dayId || 'thu'
  const dayMeta = getDayMeta(dayId) || getCursorDay(gate.startSlot)
  const theme = MISSION_LAUNCH_THEME[dayId] || MISSION_LAUNCH_THEME.fri
  const briefing = DAY_BRIEFING_COPY[dayId] || DAY_BRIEFING_COPY.thu
  const gateItemsWithType = gate.items.map((item) => ({ ...item, type: 'itineraryItem' }))
  const linkedEntities = dedupeById(
    gateItemsWithType.flatMap((item) => getLinkedEntities(doc, item)),
  )
  const relatedTravelItems = getRelatedTravelItemsForGate(doc, gate)
  const relatedRoutes = dedupeById(
    relatedTravelItems
      .map((item) => getRouteForEntity(doc, { ...item, type: 'itineraryItem' }))
      .filter(Boolean),
  )
  const gateLocations = dedupeById(
    [
      getLocationForEntity(doc, { ...primaryItem, type: 'itineraryItem' }),
      ...linkedEntities.filter((entity) => entity.type === 'location'),
      ...relatedRoutes
        .map((route) => getEntityById(doc, 'location', route.destinationLocationId))
        .filter(Boolean),
    ].filter(Boolean),
  )
  const targetLocation = pickMostFrequentEntity(gateLocations)
  const familyIds = [
    ...gate.items.flatMap((item) => item.familyIds || []),
    ...relatedTravelItems.flatMap((item) => item.familyIds || []),
    ...relatedRoutes.map((route) => route.familyId).filter((familyId) => familyId && familyId !== 'all'),
  ]
  const families = dedupeById(
    familyIds
      .map((familyId) => getEntityById(doc, 'family', familyId))
      .filter(Boolean),
  )
  const unitCount = families.length || Math.max(relatedRoutes.length, 1)
  const launchLabel = stripDayPrefix(getSlotLabel(gate.startSlot))
  const etaSlot = relatedTravelItems.length
    ? Math.max(...relatedTravelItems.map((item) => item.startSlot + getItineraryItemEffectiveSpan(doc, item)))
    : gate.startSlot + getItineraryItemEffectiveSpan(doc, primaryItem)
  const etaLabel = stripDayPrefix(getSlotLabel(etaSlot))
  const participantLabel =
    !families.length
      ? gate.dayLabel || '전체 출발'
      : families.length === doc.families.length
        ? '전체 가족'
        : formatNameList(families.map((family) => family.title))
  const targetTitle = targetLocation?.title || gate.title
  const targetMeta = targetLocation ? getEntitySummary(targetLocation) : primaryItem.status || gate.subtitle
  const routeCount = relatedRoutes.length || Math.max(relatedTravelItems.length, 1)
  const deploymentLabel = targetLocation
    ? `${participantLabel} → ${targetTitle} 이동 중.`
    : `${participantLabel} — ${gate.title} 진행 중.`
  const objective = MISSION_OBJECTIVE_COPY[dayId] || `${participantLabel} → ${gate.title} 진입.`

  return {
    dayId,
    dayMeta,
    theme,
    title: gate.title,
    operationLabel: gate.subtitle || 'Primary operation',
    code: briefing.code,
    targetTitle,
    targetMeta,
    deploymentLabel,
    objective,
    launchLabel,
    etaLabel,
    unitCount,
    routeCount,
    families,
    briefingSummary: briefing.summary,
  }
}

function buildOperationCheckpoints(doc) {
  return DAYS.map((day, dayIndex) => {
    const mainOp = doc.itineraryItems
      .filter((item) => item.rowId === 'activities' && item.dayId === day.id)
      .sort((left, right) => left.startSlot - right.startSlot)[0]

    if (!mainOp) return null

    return {
      id: `op:main-op:${day.id}:${mainOp.id}`,
      dayId: day.id,
      startSlot: Math.max(mainOp.startSlot, getMissionLaunchCursor(dayIndex)),
      title: mainOp.title,
      subtitle: 'Primary operation',
      dayLabel: day.title,
      items: [mainOp],
      type: 'main-op',
      autoAdvanceMs: 4200,
    }
  }).filter(Boolean)
}

function findUpcomingOperationCheckpoint(checkpoints, cursorSlot, threshold = 0.14) {
  return checkpoints.find((item) => item.startSlot >= cursorSlot && item.startSlot - cursorSlot <= threshold) || null
}

function findCrossedOperationCheckpoint(checkpoints, previousCursor, nextCursor, triggeredIds) {
  return checkpoints.find((item) =>
    !triggeredIds.has(item.id)
    && previousCursor <= item.startSlot
    && nextCursor >= item.startSlot,
  ) || null
}

function getPlaybackHighlightLocation(doc, context) {
  return null
}

function buildDailyBriefing(doc, context) {
  const day = getCursorDay(context.cursorSlot)
  const base = DAY_BRIEFING_COPY[day.id] || DAY_BRIEFING_COPY.thu
  const meals = doc.meals.filter((meal) => meal.dayId === day.id).slice(0, 3)
  const activities = doc.activities.filter((activity) => activity.dayId === day.id).slice(0, 3)
  const tasks = getTasksForDay(doc, day.id).filter((task) => task.status !== 'done').slice(0, 4)
  const liveItems = context.liveEntities.filter((item) => item.dayId === day.id)
  const soonItems = [...context.nextEntities, ...context.prepSoon]
    .filter((item) => item.dayId === day.id)
    .slice(0, 4)

  return {
    day,
    code: base.code,
    tone: base.tone,
    summary: base.summary,
    lookouts: base.lookouts,
    meals,
    activities,
    tasks,
    liveItems,
    soonItems,
  }
}

function StatusPill({ children, tone = 'Transit', className }) {
  return (
    <span
      className={cn(
        'rounded-[2px] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider',
        STATUS_STYLES[tone] || 'bg-[#30363D] text-[#C9D1D9]',
        className,
      )}
    >
      {children}
    </span>
  )
}

function SectionTitle({ eyebrow, title, meta }) {
  return (
    <div className="mb-4">
      {eyebrow ? (
        <div className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#58A6FF]">
          {eyebrow}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-black uppercase tracking-[0.12em] text-[#C9D1D9]">
          {title}
        </h2>
        {meta ? <div className="text-[10px] font-bold text-[#8B949E]">{meta}</div> : null}
      </div>
    </div>
  )
}

function NotesBox({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-h-24 w-full resize-none border border-[#30363D] bg-[#0d1117] px-3 py-2 text-[11px] leading-relaxed text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
    />
  )
}

function getFamilyHeadcountLabel(family) {
  if (!family) return formatFamilyHeadcount()
  if (family.headcount) return family.headcount
  return formatFamilyHeadcount({
    adults: family.adults,
    children: family.children,
  })
}

function FieldLabel({ children, meta }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8B949E]">
        {children}
      </div>
      {meta ? <div className="text-[10px] text-[#8B949E]">{meta}</div> : null}
    </div>
  )
}

function TextField({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full border border-[#30363D] bg-[#0d1117] px-3 py-2 text-[11px] text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
    />
  )
}

function NumberField({ value, onChange, min = 0 }) {
  return (
    <input
      type="number"
      min={min}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full border border-[#30363D] bg-[#0d1117] px-3 py-2 text-[11px] text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
    />
  )
}

function SelectField({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full border border-[#30363D] bg-[#0d1117] px-3 py-2 text-[11px] text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function StatTile({ label, value, tone = 'default' }) {
  const toneClasses = {
    default: 'border-[#30363D] bg-[#0d1117] text-[#C9D1D9]',
    accent: 'border-[#58A6FF]/40 bg-[#58A6FF]/10 text-[#C9D1D9]',
    success: 'border-[#3FB950]/30 bg-[#3FB950]/10 text-[#C9D1D9]',
  }

  return (
    <div className={`border px-3 py-3 ${toneClasses[tone] || toneClasses.default}`}>
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8B949E]">{label}</div>
      <div className="mt-2 text-[15px] font-black uppercase tracking-[0.08em]">{value}</div>
    </div>
  )
}

function toWholeNumber(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function SelectableCard({ selected, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full border text-left transition-colors hover:border-[#58A6FF]/40 hover:bg-[#1f2a34]/40',
        selected ? 'border-[#58A6FF] bg-[#24313d]/60' : 'border-[#30363D] bg-[#161b22]',
        className,
      )}
    >
      {children}
    </button>
  )
}

function PageNotesCard({ title, value, onChange, onConvert, placeholder }) {
  return (
    <div className="border border-[#30363D] bg-[#161b22] p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B949E]">{title}</div>
        <button
          type="button"
          onClick={onConvert}
          className="text-[9px] font-black uppercase tracking-wider text-[#58A6FF]"
        >
          할 일로 전환
        </button>
      </div>
      <NotesBox value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}

function AppShell({
  doc,
  tripMeta,
  onSetSelectedPage,
  onExport,
  onSearchChange,
  searchResults,
  onOpenEntity,
  families,
  activeFamily,
  onSetActiveFamily,
  onOpenNotionSetup,
  notionSyncStatus,
  onReset,
  onAddFamily,
  children,
}) {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#0d1117] font-sans text-[#C9D1D9] antialiased">
      {/* 사이드바 — 아이콘 + 라벨 */}
      <div className="flex w-[72px] flex-col border-r border-[#30363D] bg-[#0d1117]">
        {/* 로고 */}
        <div className="flex h-14 items-center justify-center border-b border-[#30363D]">
          <span className="text-[11px] font-black tracking-widest text-[#58A6FF]">TM</span>
        </div>

        {/* 메인 탭 */}
        <nav className="flex flex-col gap-0.5 p-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = PAGE_ICONS[item.id]
            const active = doc.selectedPage === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSetSelectedPage(item.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded py-2.5 transition-all',
                  active
                    ? 'bg-[#58A6FF]/15 text-[#58A6FF]'
                    : 'text-[#8B949E] hover:bg-[#1f2a34] hover:text-[#C9D1D9]',
                )}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.6} />
                <span className="text-[8px] font-bold tracking-wide">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* 하단 유틸 버튼 */}
        <div className="mt-auto border-t border-[#30363D] p-1.5 space-y-0.5">
          <button type="button" onClick={onExport}
            className="flex w-full flex-col items-center gap-1 rounded py-2 text-[#8B949E] transition-colors hover:bg-[#1f2a34] hover:text-[#C9D1D9]"
            title="내보내기">
            <Download size={16} strokeWidth={1.6} />
            <span className="text-[7px] font-bold tracking-wide">내보내기</span>
          </button>
          <button type="button" onClick={onOpenNotionSetup}
            className={cn('flex w-full flex-col items-center gap-1 rounded py-2 transition-colors hover:bg-[#1f2a34]',
              notionSyncStatus === 'success' ? 'text-[#3FB950]' : 'text-[#8B949E] hover:text-[#C9D1D9]')}
            title="노션 연동">
            <Database size={16} strokeWidth={1.6} />
            <span className="text-[7px] font-bold tracking-wide">노션</span>
          </button>
          <button type="button" onClick={onReset}
            className="flex w-full flex-col items-center gap-1 rounded py-2 text-[#8B949E] transition-colors hover:bg-[#1f2a34] hover:text-[#F85149]"
            title="초기화">
            <RotateCcw size={16} strokeWidth={1.6} />
            <span className="text-[7px] font-bold tracking-wide">초기화</span>
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 상단 헤더 — 간소화 */}
        <div className="flex h-12 items-center justify-between border-b border-[#30363D] bg-[#161b22] px-4">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-bold text-[#C9D1D9]">
              {tripMeta?.commandName || '여행매니저'}
            </span>
            {tripMeta?.subtitle && (
              <>
                <div className="h-3 w-px bg-[#30363D]" />
                <span className="text-[11px] text-[#8B949E]">{tripMeta.subtitle}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#4B5563]">접속 중</span>
              <div className="flex items-center gap-1">
                {families.map((family) => (
                  <button
                    key={family.id}
                    type="button"
                    onClick={() => onSetActiveFamily(family.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                      activeFamily?.id === family.id
                        ? 'bg-[#58A6FF]/20 text-[#58A6FF] ring-1 ring-[#58A6FF]/40'
                        : 'text-[#8B949E] hover:bg-[#1f2a34] hover:text-[#C9D1D9]',
                    )}
                  >
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      activeFamily?.id === family.id ? 'bg-[#58A6FF]' : 'bg-[#30363D]'
                    )} />
                    {family.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]"
              />
              <input
                type="text"
                value={doc.ui.searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="검색..."
                className="w-64 rounded-[2px] border border-[#30363D] bg-[#0d1117] py-1.5 pl-10 pr-4 text-[11px] outline-none focus:border-[#58A6FF]"
              />
              {doc.ui.searchQuery && searchResults.length ? (
                <div className="absolute right-0 top-10 z-40 w-80 border border-[#30363D] bg-[#161b22] shadow-xl">
                  {searchResults.map((item) => (
                    <button
                      key={`${item.type}:${item.id}`}
                      type="button"
                      onClick={() => onOpenEntity(item.type, item.id)}
                      className="flex w-full items-center justify-between border-b border-[#30363D]/40 px-3 py-2 text-left last:border-b-0 hover:bg-[#1f2a34]/60"
                    >
                      <div>
                        <div className="text-[11px] font-bold text-[#C9D1D9]">{getEntityTitle(item)}</div>
                        <div className="text-[10px] text-[#8B949E]">{getEntitySummary(item)}</div>
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-[#58A6FF]">
                        {({'family':'가족','meal':'식사','expense':'비용','activity':'활동','location':'장소','itineraryItem':'일정','task':'할 일','route':'경로'})[item.type] || item.type}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {!activeFamily ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b0f14]/90 backdrop-blur-md">
          <div className="w-[440px] overflow-hidden rounded-xl border border-[#30363D] bg-[#161b22] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
            {/* 상단 헤더 */}
            <div className="border-b border-[#30363D] bg-gradient-to-br from-[#58A6FF]/10 to-transparent px-6 py-5">
              <div className="mb-1 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#58A6FF]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#58A6FF]">여행매니저</span>
              </div>
              <h2 className="text-[20px] font-bold text-[#E6EDF3]">어느 가족으로 시작할까요?</h2>
              <p className="mt-1 text-[12px] text-[#8B949E]">선택 후 메모·비용·체크리스트에 작성자가 자동 표시됩니다.</p>
            </div>

            {/* 가족 목록 */}
            <div className="p-4 space-y-2">
              {families.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#30363D] px-4 py-8 text-center">
                  <Users size={32} strokeWidth={1} className="mx-auto mb-3 text-[#30363D]" />
                  <div className="text-[13px] font-bold text-[#8B949E]">아직 등록된 가족이 없어요</div>
                  <div className="mt-1 text-[11px] text-[#4B5563]">아래 버튼으로 첫 번째 가족을 추가하세요</div>
                </div>
              )}
              {families.map((family) => (
                <button
                  key={family.id}
                  type="button"
                  onClick={() => onSetActiveFamily(family.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-[#30363D] bg-[#0d1117] px-4 py-3.5 text-left transition-all hover:border-[#58A6FF]/50 hover:bg-[#1a2433]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#58A6FF]/15 text-[13px] font-bold text-[#58A6FF]">
                      {(family.title || '?')[0]}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#C9D1D9]">{family.title}</div>
                      <div className="text-[11px] text-[#8B949E]">
                        {family.shortOrigin} 출발 · {getFamilyHeadcountLabel(family)}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[#58A6FF]" />
                </button>
              ))}
              <button
                type="button"
                onClick={onAddFamily}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#58A6FF]/30 bg-[#58A6FF]/5 px-4 py-3 text-[12px] font-bold text-[#58A6FF] transition-all hover:border-[#58A6FF]/60 hover:bg-[#58A6FF]/10"
              >
                <Flag size={14} />
                + 새 가족 추가
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function FamilyList({ doc, selection, onSelectEntity }) {
  return (
    <div className="overflow-hidden border border-[#30363D] bg-[#0d1117]">
      {doc.families.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="text-[#30363D]">
            <Users size={48} strokeWidth={1} />
          </div>
          <div className="text-[14px] font-bold text-[#C9D1D9]">아직 등록된 가족이 없어요</div>
          <div className="text-[12px] text-[#8B949E]">아래 버튼을 눌러 첫 번째 가족을 추가하세요</div>
        </div>
      ) : (
        doc.families.map((family) => {
          const selected = selection.type === 'family' && selection.id === family.id
          return (
            <button
              key={family.id}
              type="button"
              onClick={() => onSelectEntity('family', family.id)}
              className={cn(
                'flex w-full items-start justify-between gap-3 border-b border-[#30363D]/50 px-4 py-3 text-left last:border-b-0',
                selected ? 'bg-[#24313d] shadow-[inset_4px_0_0_#58A6FF]' : 'hover:bg-[#1f2a34]/60',
              )}
            >
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#C9D1D9]">
                  {family.title}
                </div>
                <div className="text-[10px] font-medium text-[#8B949E]">
                  {family.shortOrigin} 출발 · {getFamilyHeadcountLabel(family)}
                </div>
              </div>
              <StatusPill tone={family.status}>{family.status}</StatusPill>
            </button>
          )
        })
      )}
    </div>
  )
}

function ScenarioControls({ doc, cursorSlot = doc.ui.timeline.cursorSlot, onSetCursor }) {
  const clampedCursor = clampTimelineCursor(cursorSlot)
  const cursorDayIndex = Math.min(Math.max(Math.floor(clampedCursor / TIME_SLOTS.length), 0), DAYS.length - 1)
  const selectedDay = DAYS[cursorDayIndex]
  const cursorHour = getCursorHourInDay(clampedCursor)
  const selectedHour = MISSION_TIME_PRESETS.reduce((bestHour, hour) => (
    Math.abs(hour - cursorHour) < Math.abs(bestHour - cursorHour) ? hour : bestHour
  ), MISSION_TIME_PRESETS[0])
  const selectedSlotValue = String(selectedHour).padStart(2, '0')

  return (
    <div className="border border-[#30363D] bg-[#161b22] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#58A6FF]">
            Scenario Mode
          </div>
          <div className="mt-1 text-[12px] font-black uppercase tracking-[0.12em] text-[#C9D1D9]">
            Time scrub
          </div>
        </div>
        <div className="rounded-[2px] border border-[#30363D] bg-[#0d1117] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#8B949E]">
          {selectedDay.shortLabel} {selectedSlotValue}
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {DAYS.map((day, dayIndex) => (
          <button
            key={day.id}
            type="button"
            onClick={() => onSetCursor(dayIndex * TIME_SLOTS.length + selectedHour / TIMELINE_HOURS_PER_SLOT)}
            className={cn(
              'border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider',
              day.id === selectedDay.id
                ? 'border-[#58A6FF] bg-[#58A6FF]/10 text-[#58A6FF]'
                : 'border-[#30363D] bg-[#0d1117] text-[#8B949E]',
            )}
          >
            {day.shortLabel}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {MISSION_TIME_PRESETS.map((hour) => {
          const slot = String(hour).padStart(2, '0')
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSetCursor(cursorDayIndex * TIME_SLOTS.length + hour / TIMELINE_HOURS_PER_SLOT)}
              className={cn(
                'flex-1 border px-2 py-2 text-[10px] font-mono',
                slot === selectedSlotValue
                  ? 'border-[#58A6FF] bg-[#58A6FF]/10 text-[#58A6FF]'
                  : 'border-[#30363D] bg-[#0d1117] text-[#8B949E]',
              )}
            >
              {slot}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DailyBriefingModal({ briefing, onClose, onOpenEntity }) {
  if (!briefing) return null

  const toneStyles = {
    Amber: 'border-[#D29922]/40 text-[#D29922]',
    Blue: 'border-[#58A6FF]/40 text-[#58A6FF]',
    Red: 'border-[#F85149]/40 text-[#F85149]',
    Green: 'border-[#3FB950]/40 text-[#3FB950]',
  }

  const railSection = (title, items, emptyLabel) => (
    <div className="border border-[#30363D] bg-[#0d1117]">
      <div className="border-b border-[#30363D]/50 px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#8B949E]">
        {title}
      </div>
      <div className="p-4">
        {items.length ? (
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={`${item.type}:${item.id}`}
                type="button"
                onClick={() => onOpenEntity(item.type, item.id)}
                className="flex w-full items-start justify-between gap-3 border border-[#30363D] bg-[#161b22] px-3 py-3 text-left transition-colors hover:border-[#58A6FF]/40"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-[#C9D1D9]">{getEntityTitle(item)}</div>
                  <div className="mt-1 text-[10px] leading-relaxed text-[#8B949E]">{getEntitySummary(item)}</div>
                </div>
                {'status' in item && item.status ? <StatusPill tone={item.status}>{item.status}</StatusPill> : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-[#8B949E]">{emptyLabel}</div>
        )}
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-8 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '100% 4px, 4px 100%',
        }}
      />
      <div
        className="relative max-h-full w-full max-w-5xl overflow-hidden border border-[#30363D] bg-[#10161e] shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[#30363D] bg-[linear-gradient(135deg,rgba(88,166,255,0.08),rgba(13,17,23,0.95)_58%)] px-6 py-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-[#58A6FF]">
                오늘의 브리핑
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[22px] font-black uppercase tracking-[0.14em] text-[#F0F6FC]">
                  {briefing.day.title}
                </h2>
                <span className={`border px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${toneStyles[briefing.tone] || toneStyles.Blue}`}>
                  {briefing.code}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 border border-[#30363D] bg-[#0d1117] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#C9D1D9] transition-colors hover:border-[#58A6FF]/40 hover:text-[#58A6FF]"
            >
              <X size={14} />
              닫기
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="border border-[#30363D] bg-[#0d1117]/85 p-4">
              <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#8B949E]">요약</div>
              <p className="text-[13px] leading-7 text-[#C9D1D9]">{briefing.summary}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="border border-[#30363D] bg-[#0d1117] p-4 text-center">
                <div className="text-[8px] font-black uppercase tracking-widest text-[#8B949E]">현재 진행</div>
                <div className="mt-2 text-[22px] font-black text-[#F0F6FC]">{briefing.liveItems.length}</div>
              </div>
              <div className="border border-[#30363D] bg-[#0d1117] p-4 text-center">
                <div className="text-[8px] font-black uppercase tracking-widest text-[#8B949E]">예정</div>
                <div className="mt-2 text-[22px] font-black text-[#F0F6FC]">{briefing.soonItems.length}</div>
              </div>
              <div className="border border-[#30363D] bg-[#0d1117] p-4 text-center">
                <div className="text-[8px] font-black uppercase tracking-widest text-[#8B949E]">할 일</div>
                <div className="mt-2 text-[22px] font-black text-[#F0F6FC]">{briefing.tasks.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid max-h-[calc(100vh-220px)] gap-5 overflow-y-auto p-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="border border-[#30363D] bg-[#161b22] p-4">
              <SectionTitle eyebrow="주요 체크포인트" title="오늘 핵심 포인트" />
              <div className="space-y-3">
                {briefing.lookouts.map((item) => (
                  <div key={item} className="border border-[#30363D] bg-[#0d1117] px-3 py-3 text-[11px] leading-relaxed text-[#C9D1D9]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {railSection('현재 활성', briefing.liveItems, '이 날 아직 활성 항목이 없습니다.')}
            {railSection('Coming up', briefing.soonItems, 'No immediate follow-ups are queued right now.')}
          </div>

          <div className="space-y-5">
            <div className="border border-[#30363D] bg-[#161b22] p-4">
              <SectionTitle eyebrow="오늘의 일정" title="활동 + 식사" />
              <div className="space-y-3">
                {briefing.activities.map((activity) => (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => onOpenEntity('activity', activity.id)}
                    className="flex w-full items-start justify-between gap-3 border border-[#30363D] bg-[#0d1117] px-3 py-3 text-left transition-colors hover:border-[#58A6FF]/40"
                  >
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#C9D1D9]">{activity.title}</div>
                      <div className="mt-1 text-[10px] text-[#8B949E]">{activity.window}</div>
                    </div>
                    <StatusPill tone={activity.status}>{activity.status}</StatusPill>
                  </button>
                ))}
                {briefing.meals.map((meal) => (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => onOpenEntity('meal', meal.id)}
                    className="flex w-full items-start justify-between gap-3 border border-[#30363D] bg-[#0d1117] px-3 py-3 text-left transition-colors hover:border-[#58A6FF]/40"
                  >
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#C9D1D9]">{meal.title}</div>
                      <div className="mt-1 text-[10px] text-[#8B949E]">{meal.timeLabel}</div>
                    </div>
                    <StatusPill tone={meal.status}>{meal.status}</StatusPill>
                  </button>
                ))}
                {!briefing.activities.length && !briefing.meals.length ? (
                  <div className="text-[11px] text-[#8B949E]">오늘 일정이 아직 없습니다.</div>
                ) : null}
              </div>
            </div>

            <div className="border border-[#30363D] bg-[#161b22] p-4">
              <SectionTitle eyebrow="미완료 항목" title="미완료 할 일" />
              <div className="space-y-2">
                {briefing.tasks.length ? briefing.tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onOpenEntity('task', task.id)}
                    className="w-full border border-[#30363D] bg-[#0d1117] px-3 py-3 text-left text-[11px] text-[#C9D1D9] transition-colors hover:border-[#58A6FF]/40"
                  >
                    {task.title}
                  </button>
                )) : (
                  <div className="text-[11px] text-[#8B949E]">미완료 할 일이 없습니다. 순항 중 🙂</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MissionLaunchModal({ doc, gate, remainingMs, onProceed, onAbort }) {
  if (!gate) return null

  const context = buildOperationGateContext(doc, gate)
  if (!context) return null

  const totalMs = gate.autoAdvanceMs || 4200
  const progress = Math.min(Math.max(1 - remainingMs / totalMs, 0), 1)
  const radius = 76
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  const countdownValue = Math.max(1, 3 - Math.min(2, Math.floor(progress * 3)))
  const theme = context.theme
  const statusCards = [
    { label: 'Launch', value: context.launchLabel, icon: Flag },
    { label: 'ETA', value: context.etaLabel, icon: Route },
    { label: '이동 가족 수', value: `${context.unitCount}`, icon: Users },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#03070b]/28 px-6 py-8 backdrop-blur-[2px]">
      <style>{MISSION_LAUNCH_KEYFRAMES}</style>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            `radial-gradient(circle at 50% 42%, ${theme.accentGlow}, transparent 24%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(180deg, rgba(3,7,11,0.12), rgba(3,7,11,0.82))`,
          backgroundSize: '100% 100%, 100% 9px, 9px 100%, 100% 100%',
        }}
      />
      <div
        className="relative w-full max-w-[720px] overflow-hidden border bg-[linear-gradient(180deg,rgba(7,11,17,0.86),rgba(4,8,13,0.94))] shadow-[0_30px_96px_rgba(0,0,0,0.62)]"
        style={{
          borderColor: theme.accentBorder,
          boxShadow: `0 30px 96px rgba(0, 0, 0, 0.62), 0 0 0 1px ${theme.panelGlow}`,
          animation: 'mission-launch-panel-in 420ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(120deg, ${theme.accentSoft}, transparent 38%), radial-gradient(circle at 78% 18%, ${theme.panelGlow}, transparent 24%)`,
          }}
        />

        <div className="relative border-b border-white/8 px-7 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: theme.accentText }}>
                {context.dayMeta?.title || gate.dayLabel} Mission Launch
              </div>
              <div className="mt-2 text-[12px] font-black uppercase tracking-[0.18em] text-[#8B949E]">
                {context.code}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-[32px] font-black uppercase tracking-[0.05em] text-[#F0F6FC] sm:text-[38px]">
              {context.title}
            </div>
            <div className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-[#C9D1D9]">
              {context.deploymentLabel}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusCards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.label}
                    className="inline-flex items-center gap-2 border px-3 py-2 text-[11px] font-semibold text-[#F0F6FC]"
                    style={{
                      borderColor: theme.accentBorder,
                      background: 'rgba(12, 17, 24, 0.72)',
                    }}
                  >
                    <Icon size={12} style={{ color: theme.accentText }} />
                    <span className="uppercase tracking-[0.14em] text-[#8B949E]">{card.label}</span>
                    <span>{card.value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative grid gap-6 px-7 py-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-center">
          <div className="flex items-center justify-center">
            <div
              className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full border"
              style={{
                borderColor: theme.accentBorder,
                background: `radial-gradient(circle, ${theme.accentSoft}, rgba(8,12,18,0.12) 60%, transparent 75%)`,
                animation: 'mission-launch-halo 2.6s ease-in-out infinite',
              }}
            >
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 190 190">
                <circle cx="95" cy="95" r={radius} fill="none" stroke="rgba(48,54,61,0.72)" strokeWidth="9" />
                <circle
                  cx="95"
                  cy="95"
                  r={radius}
                  fill="none"
                  stroke={theme.accentStrong}
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-[16px] rounded-full border border-white/8" />
              <div className="relative text-center">
                <div className="text-[8px] font-black uppercase tracking-[0.22em] text-[#8B949E]">Launch In</div>
                <div
                  key={countdownValue}
                  className="mt-2 text-[78px] font-black leading-none text-[#F0F6FC]"
                  style={{ animation: 'mission-launch-digit-in 220ms ease-out' }}
                >
                  {countdownValue}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-white/8 bg-[#0b1118]/76 px-5 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#8B949E]">
                <MapPin size={12} style={{ color: theme.accentText }} />
                Target
              </div>
              <div className="mt-2 text-[20px] font-black uppercase tracking-[0.05em] text-[#F0F6FC]">
                {context.targetTitle}
              </div>
              <div className="mt-3 text-[14px] leading-relaxed text-[#C9D1D9]">
                {context.objective}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onAbort}
                className="border px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#F0F6FC] transition-colors hover:border-[#F0F6FC]/30 hover:bg-white/6"
                style={{
                  borderColor: 'rgba(255,255,255,0.14)',
                  background: 'rgba(13,17,23,0.78)',
                }}
              >
                Abort
              </button>
              <button
                type="button"
                onClick={onProceed}
                className="inline-flex items-center gap-2 border px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition-colors"
                style={{
                  borderColor: theme.accentBorder,
                  background: theme.accentSoft,
                  color: theme.accentStrong,
                }}
              >
                Proceed Now
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MissionFeedTray({ items, onActivateItem }) {
  if (!items.length) return null

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-40 w-[320px]" aria-live="polite" aria-atomic="false">
      <div className="pointer-events-auto flex max-h-[calc(100vh-2rem)] flex-col-reverse gap-2 overflow-y-auto pr-1">
        {items.map((item) => {
          const FeedIcon =
            item.kind === 'departure'
              ? CarFront
              : item.kind === 'arrival'
                ? Flag
                : item.kind === 'onsite' && item.entityType === 'meal'
                  ? Utensils
                  : MapPin

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onActivateItem(item)}
              className={`w-full rounded-2xl border px-4 py-3 text-left shadow-[0_18px_40px_rgba(0,0,0,0.42)] backdrop-blur transition-all duration-500 ease-out ${
                item.phase === 'fading'
                  ? 'translate-y-2 opacity-0'
                  : 'translate-y-0 opacity-100'
              }`}
              style={{
                borderColor: `${item.tone}66`,
                background: 'linear-gradient(180deg, rgba(17,22,29,0.96), rgba(11,16,24,0.94))',
                boxShadow: `0 18px 40px rgba(0,0,0,0.42), 0 0 0 1px ${item.tone}22`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                  style={{ borderColor: `${item.tone}66`, backgroundColor: `${item.tone}18`, color: item.tone }}
                >
                  <FeedIcon size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: item.tone }}>
                      {item.subtitle}
                    </div>
                  </div>
                  <div className="mt-1 truncate text-[13px] font-black uppercase tracking-[0.06em] text-[#F0F6FC]">
                    {item.title}
                  </div>
                  <div className="mt-1 truncate text-[10px] uppercase tracking-[0.14em] text-[#8B949E]">
                    {item.caption}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SituationBoard({ context, onOpenEntity, onOpenBriefing }) {
  const sections = [
    { title: '현재 진행', items: context.liveEntities, emptyLabel: 'Nothing active in this window.' },
    { title: 'Coming up', items: [...context.nextEntities, ...context.prepSoon].slice(0, 4), emptyLabel: 'No immediate follow-ups.' },
  ]

  return (
    <div className="border border-[#30363D] bg-[#161b22]">
      <div className="border-b border-[#30363D] bg-[#1f2a34]/30 p-5">
        <div className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-[#58A6FF]">
          Current situation
        </div>
        <div className="text-[18px] font-black text-[#F0F6FC]">{context.cursorLabel}</div>
        <div className="mt-1 text-[11px] text-[#8B949E]">
          {context.liveEntities.length
            ? `${context.liveEntities.length}개 항목 진행 중`
            : 'No live items in this window'}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="border border-[#30363D] bg-[#0d1117] px-3 py-2 text-center">
            <div className="text-[8px] font-black uppercase tracking-widest text-[#8B949E]">Live</div>
            <div className="mt-1 text-[13px] font-black text-[#C9D1D9]">{context.liveEntities.length}</div>
          </div>
          <div className="border border-[#30363D] bg-[#0d1117] px-3 py-2 text-center">
            <div className="text-[8px] font-black uppercase tracking-widest text-[#8B949E]">Soon</div>
            <div className="mt-1 text-[13px] font-black text-[#C9D1D9]">
              {context.nextEntities.length + context.prepSoon.length}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenBriefing}
          className="mt-4 flex w-full items-center justify-center border border-[#58A6FF]/30 bg-[#58A6FF]/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#58A6FF] transition-colors hover:border-[#58A6FF] hover:bg-[#58A6FF]/14"
        >
          Daily briefing
        </button>
      </div>

      <div className="space-y-4 p-4">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#8B949E]">
              {section.title}
            </div>
            <div className="overflow-hidden border border-[#30363D] bg-[#0d1117]">
              {section.items.length ? section.items.map((item) => (
                <button
                  key={`${item.type}:${item.id}`}
                  type="button"
                  onClick={() => onOpenEntity(item.type, item.id)}
                  className="flex w-full items-start justify-between gap-3 border-b border-[#30363D]/30 px-4 py-3 text-left last:border-b-0 hover:bg-[#1f2a34]/40"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[#C9D1D9]">{getEntityTitle(item)}</div>
                    <div className="mt-1 text-[10px] leading-relaxed text-[#8B949E]">
                      {getEntitySummary(item)}
                    </div>
                  </div>
                  {'status' in item && item.status ? <StatusPill tone={item.status}>{item.status}</StatusPill> : null}
                </button>
              )) : (
                <div className="px-4 py-3 text-[11px] text-[#8B949E]">{section.emptyLabel}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimelineBoard({
  doc,
  selection,
  onSelectEntity,
  onSetCursor,
  weatherDays,
  cursorSlot = doc.ui.timeline.cursorSlot,
  isPlaying = false,
  playbackSpeed = 1,
  onTogglePlayback,
  onRestartPlayback,
  onSetPlaybackSpeed,
}) {
  const days = weatherDays?.length ? weatherDays : DAYS
  const totalVisibleSlots = days.length * VISIBLE_TIMELINE_SLOT_SPAN
  const visibleHoursPerDay = VISIBLE_TIMELINE_END_HOUR - VISIBLE_TIMELINE_START_HOUR
  const timelineRef = useRef(null)
  const draggingRef = useRef(false)
  const [liveNow, setLiveNow] = useState(() => new Date())
  const [hoverCursorSlot, setHoverCursorSlot] = useState(null)
  const rowHeights = {
    travel: 72,
    activities: 44,
    support: 44,
  }
  const rows = [
    { id: 'travel', label: 'Transit' },
    { id: 'activities', label: '주요 활동' },
    { id: 'support', label: 'Support' },
  ]
  const rowLayouts = rows.map((row, index) => ({
    ...row,
    height: rowHeights[row.id] || 40,
    top: rows.slice(0, index).reduce((sum, item) => sum + (rowHeights[item.id] || 40), 0),
  }))
  const timelineHeight = rowLayouts.reduce((sum, row) => sum + row.height, 0)
  const familyLaneMap = new Map(doc.families.map((family, index) => [family.id, index]))
  const actualTimelineRatio = projectCursorToVisibleTimelineRatio(getCurrentTripCursor(liveNow), days.length)
  const actualNowLabel = `${liveNow.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })} ${liveNow.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  const hoverCursorLabel = hoverCursorSlot == null ? null : getSlotLabel(hoverCursorSlot)
  const cursorRatio = projectCursorToVisibleTimelineRatio(cursorSlot, days.length)

  useEffect(() => {
    const timerId = window.setInterval(() => setLiveNow(new Date()), 60 * 1000)
    return () => window.clearInterval(timerId)
  }, [])

  const scrubToClientX = useCallback((clientX) => {
    if (!timelineRef.current) return null
    const bounds = timelineRef.current.getBoundingClientRect()
    const ratio = Math.min(Math.max((clientX - bounds.left) / bounds.width, 0), 0.999999)
    return projectVisibleTimelineRatioToCursor(ratio, days.length)
  }, [days.length])

  useEffect(() => {
    const handlePointerUp = () => {
      draggingRef.current = false
    }

    window.addEventListener('mouseup', handlePointerUp)
    return () => window.removeEventListener('mouseup', handlePointerUp)
  }, [])

  return (
    <div className="shrink-0 border-t border-[#30363D] bg-[#161b22] shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
      <div className="flex h-14 border-b border-[#30363D]/50">
        <div className="flex w-28 flex-col justify-center gap-1 border-r border-[#30363D] bg-[#0d1117]/50 px-2">
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={onTogglePlayback}
              className="inline-flex h-7 w-7 items-center justify-center border border-[#58A6FF]/40 bg-[#58A6FF]/10 text-[#58A6FF] transition-colors hover:border-[#58A6FF]"
              title={isPlaying ? 'Pause playback' : 'Play playback'}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} className="translate-x-[1px]" />}
            </button>
            <button
              type="button"
              onClick={onRestartPlayback}
              className="inline-flex h-7 w-7 items-center justify-center border border-[#30363D] bg-[#0d1117] text-[#8B949E] transition-colors hover:border-[#58A6FF]/40 hover:text-[#C9D1D9]"
              title="처음부터 재생"
            >
              <RotateCcw size={13} />
            </button>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Gauge size={10} className="text-[#8B949E]" />
            <button
              type="button"
              onClick={() => {
                const currentIndex = PLAYBACK_SPEED_OPTIONS.indexOf(playbackSpeed)
                const nextSpeed = PLAYBACK_SPEED_OPTIONS[(currentIndex + 1) % PLAYBACK_SPEED_OPTIONS.length]
                onSetPlaybackSpeed?.(nextSpeed)
              }}
              className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8B949E] transition-colors hover:text-[#C9D1D9]"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>
        <div className="flex flex-1 divide-x divide-[#30363D]/30">
          {days.map((day) => {
            const WeatherIcon = WEATHER_ICONS[day.weatherIconKey] || Cloud
            return (
              <div key={day.id} className="flex flex-1 items-center gap-3 px-4">
                <WeatherIcon size={18} className="text-[#58A6FF]" />
                <div>
                  <div className="text-[9px] font-black uppercase tracking-tighter text-[#8B949E]">
                    {day.weather}
                  </div>
                  <div className="text-[11px] font-bold text-[#C9D1D9]">{day.temperature}</div>
                  {day.weatherLocation ? (
                    <div className="text-[9px] text-[#8B949E]">{day.weatherLocation}</div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex" style={{ height: `${timelineHeight}px` }}>
        <div className="flex w-28 flex-col border-r border-[#30363D] bg-[#0d1117]/50">
          {rowLayouts.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-center border-b border-[#30363D]/30 px-2 text-center text-[9px] font-black uppercase tracking-widest text-[#8B949E] last:border-b-0"
              style={{ height: `${row.height}px` }}
            >
              {row.label}
            </div>
          ))}
        </div>

        <div
          ref={timelineRef}
          className="relative flex-1 overflow-hidden cursor-col-resize"
          style={{ height: `${timelineHeight}px` }}
          onMouseLeave={() => {
            if (!draggingRef.current) setHoverCursorSlot(null)
          }}
          onMouseDown={(event) => {
            draggingRef.current = true
            const nextCursorSlot = scrubToClientX(event.clientX)
            if (nextCursorSlot != null) {
              setHoverCursorSlot(nextCursorSlot)
              onSetCursor?.(nextCursorSlot)
            }
          }}
          onMouseMove={(event) => {
            const nextCursorSlot = scrubToClientX(event.clientX)
            if (nextCursorSlot == null) return
            setHoverCursorSlot(nextCursorSlot)
            if (draggingRef.current) {
              onSetCursor?.(nextCursorSlot)
            }
          }}
          onClick={(event) => {
            const nextCursorSlot = scrubToClientX(event.clientX)
            if (nextCursorSlot != null) {
              onSetCursor?.(nextCursorSlot)
            }
          }}
        >
          <div className="absolute inset-0">
            {Array.from({ length: days.length * visibleHoursPerDay + 1 }).map((_, index) => {
              const hour = index % visibleHoursPerDay
              const actualHour = VISIBLE_TIMELINE_START_HOUR + hour
              const isMajor = hour % TIMELINE_HOURS_PER_SLOT === 0
              return (
                <div
                  key={`grid-${index}`}
                  className={cn(
                    'absolute bottom-0 top-0',
                    isMajor ? 'border-l border-[#30363D]/32' : 'border-l border-[#30363D]/10',
                  )}
                  style={{ left: `${(index / (days.length * visibleHoursPerDay)) * 100}%` }}
                  data-hour={actualHour}
                />
              )
            })}
          </div>

          <div className="absolute inset-0">
            {rowLayouts.map((row) => {
              const rowItems = doc.itineraryItems.filter((item) => item.rowId === row.id)
              const laneCount = row.id === 'travel' ? Math.max(doc.families.length, 1) : 1
              const laneHeight = row.height / laneCount

              return (
                <div
                  key={row.id}
                  className="absolute left-0 right-0 border-b border-[#30363D]/30 last:border-b-0"
                  style={{ top: `${row.top}px`, height: `${row.height}px` }}
                >
                  {row.id === 'travel'
                    ? doc.families.slice(1).map((_, index) => (
                        <div
                          key={`travel-divider-${index}`}
                          className="absolute left-0 right-0 border-t border-[#30363D]/20"
                          style={{ top: `${laneHeight * (index + 1)}px` }}
                        />
                      ))
                    : null}

                  {rowItems.map((item) => {
                    const itemSpan = getItineraryItemEffectiveSpan(doc, item)
                    const itemEnd = item.startSlot + itemSpan
                    const itemDayIndex = Math.min(Math.max(Math.floor(item.startSlot / TIME_SLOTS.length), 0), days.length - 1)
                    const visibleRange = getDayVisibleCursorRange(itemDayIndex)
                    const clippedStart = Math.max(item.startSlot, visibleRange.start)
                    const clippedEnd = Math.min(itemEnd, visibleRange.end)
                    if (clippedEnd <= clippedStart) return null
                    const laneIndex =
                      row.id === 'travel' ? familyLaneMap.get(item.familyIds?.[0]) ?? 0 : 0
                    const itemTop = row.id === 'travel' ? laneIndex * laneHeight + 2 : 6
                    const itemHeight = row.id === 'travel' ? laneHeight - 4 : row.height - 12
                    const selected = selection.type === item.type && selection.id === item.id
                    const compactTravelItem = row.id === 'travel' && itemSpan <= 0.22
                    const shortTravelItem = row.id === 'travel' && itemSpan <= 0.42
                    const compactTravelLabel = compactTravelItem ? getCompactTravelLabel(item) : null

                    const itemWidthPercent = (
                      projectCursorToVisibleTimelineRatio(clippedEnd, days.length)
                      - projectCursorToVisibleTimelineRatio(clippedStart, days.length)
                    ) * 100
                    const travelMinWidthPx =
                      row.id === 'travel'
                        ? compactTravelItem
                          ? 26
                          : shortTravelItem
                            ? 34
                            : 0
                        : 0

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onSetCursor?.(item.startSlot)
                          onSelectEntity(item.type, item.id)
                        }}
                        className={cn(
                          'absolute flex cursor-pointer items-center rounded-[1px] border px-2 text-left transition-[transform,box-shadow] hover:-translate-y-[1px]',
                          TIMELINE_COLORS[item.color],
                          selected ? 'ring-1 ring-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.15)]' : '',
                          compactTravelItem ? 'justify-center px-1' : '',
                        )}
                        title={item.title}
                        style={{
                          top: `${itemTop}px`,
                          height: `${itemHeight}px`,
                          left: `${projectCursorToVisibleTimelineRatio(clippedStart, days.length) * 100}%`,
                          width:
                            row.id === 'travel' && travelMinWidthPx
                              ? `max(${itemWidthPercent}%, ${travelMinWidthPx}px)`
                              : `${itemWidthPercent}%`,
                        }}
                      >
                        {row.id === 'travel' ? (
                          <span className={cn('flex min-w-0 items-center gap-1', compactTravelItem ? 'justify-center' : '')}>
                            {compactTravelItem ? null : <CarFront size={10} className="shrink-0" />}
                            <span
                              className={cn(
                                'truncate font-black uppercase',
                                compactTravelItem ? 'text-[7px] tracking-[0.12em]' : 'text-[8px] tracking-widest',
                              )}
                            >
                              {compactTravelItem ? compactTravelLabel : item.title}
                            </span>
                          </span>
                        ) : (
                          <span className="truncate text-[8px] font-black uppercase tracking-widest">
                            {item.title}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

          <div
            className="absolute bottom-0 top-0 z-10 w-px bg-[#58A6FF] shadow-[0_0_6px_rgba(88,166,255,0.8)]"
            style={{ left: `${actualTimelineRatio * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[#58A6FF] px-2 py-0.5 text-[9px] font-black uppercase text-[#0A0C10]">
              now
            </div>
            <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0d1117] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#58A6FF]">
              {actualNowLabel}
            </div>
          </div>

          {hoverCursorSlot != null ? (
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-[15] w-px bg-white/30"
              style={{ left: `${projectCursorToVisibleTimelineRatio(hoverCursorSlot, days.length) * 100}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap border border-white/15 bg-[#0d1117]/90 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-[#C9D1D9]">
                {hoverCursorLabel}
              </div>
            </div>
          ) : null}

          <div
            className="absolute bottom-0 top-0 z-20 w-px bg-white shadow-[0_0_8px_white]"
            style={{ left: `${cursorRatio * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 text-[9px] font-black uppercase text-[#0A0C10]">
              cursor
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-10 border-t border-[#30363D] bg-[#0d1117]">
        <div className="flex w-28 items-center justify-center border-r border-[#30363D] px-2">
          <div className="text-center text-[9px] font-black uppercase tracking-[0.16em] text-[#8B949E]">
            mission scrub
          </div>
        </div>
        <div className="flex flex-1 divide-x divide-[#30363D]/50">
          {days.map((day, dayIndex) => (
            <div key={day.id} className="relative flex flex-1 flex-col">
              <div className="absolute -top-2 left-2 bg-[#0d1117] px-1.5 text-[8px] font-black uppercase tracking-widest text-[#58A6FF]">
                {day.shortLabel}
              </div>
              <div className="flex h-full">
                {Array.from({ length: visibleHoursPerDay }).map((_, hourOffset) => {
                  const hour = VISIBLE_TIMELINE_START_HOUR + hourOffset
                  const hourCursor = clampTimelineCursor(dayIndex * TIME_SLOTS.length + hour / TIMELINE_HOURS_PER_SLOT)
                  const showLabel = (hour - VISIBLE_TIMELINE_START_HOUR) % 3 === 0
                  const isActive = Math.abs(cursorSlot - hourCursor) < (1 / TIMELINE_HOURS_PER_SLOT) / 2

                  return (
                    <button
                      key={`${day.id}-${hour}`}
                      type="button"
                      onMouseEnter={() => setHoverCursorSlot(hourCursor)}
                      onMouseLeave={() => {
                        if (!draggingRef.current) setHoverCursorSlot(null)
                      }}
                      onClick={() => onSetCursor?.(hourCursor)}
                      className={cn(
                        'flex flex-1 cursor-pointer items-center justify-center border-r border-[#30363D]/10 text-[9px] font-mono transition-colors last:border-r-0',
                        isActive
                          ? 'bg-[#58A6FF]/10 text-[#58A6FF]'
                          : 'text-[#8B949E] hover:bg-[#1f2a34]/40 hover:text-[#C9D1D9]',
                      )}
                    >
                      {showLabel ? String(hour).padStart(2, '0') : ''}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function IntelAction({ icon: Icon, label, onClick, tone = 'default' }) {
  const tones = {
    default: 'border-[#30363D] bg-[#0d1117] text-[#C9D1D9] hover:border-[#58A6FF]/40 hover:text-[#58A6FF]',
    amber: 'border-[#D29922]/30 bg-[#D29922]/10 text-[#D29922] hover:border-[#D29922]',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors',
        tones[tone] || tones.default,
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  )
}

function InfoRow({ icon: Icon, label, value, muted = false }) {
  if (!value) return null

  return (
    <div className="flex items-start gap-2 text-[11px]">
      {Icon ? <Icon size={13} className="mt-0.5 text-[#58A6FF]" /> : null}
      <div className="min-w-0">
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8B949E]">{label}</div>
        <div className={muted ? 'mt-0.5 text-[#8B949E]' : 'mt-0.5 text-[#C9D1D9]'}>{value}</div>
      </div>
    </div>
  )
}

function formatMealTravelSignal(meal, location) {
  if (!location) return 'Venue pending'
  if (location.id === 'pine-airbnb') return 'Basecamp meal'
  if (location.basecampDrive?.durationText) {
    return `${location.basecampDrive.durationText} from basecamp`
  }
  if (meal.dayId === 'sat') return 'Park day lunch'
  return 'Venue intel loading'
}

function getMealContextNarrative(meal, location, linkedMission) {
  if (location?.id === 'pine-airbnb') {
    return 'Cook-in coverage keeps the day flexible and reduces logistics overhead for families with kids.'
  }
  if (meal.id === 'sat-lunch') {
    return '협재·한림공원 일정 도중 포함된 식사 정차로, 이동 흐름·아이 에너지에 따라 타이밍이 결정된다.'
  }
  if (meal.id === 'fri-dinner') {
    return '해변 시간과 박씨 가족 합류 후의 리셋 밸브. 여유 마진을 지키는 것이 무엇을 더 추가하는 것보다 중요하다.'
  }
  if (meal.id === 'thu-dinner') {
    return '첫날 저녁은 마찰 없이 진행되어야 도착·체크인·방 셋업 과정이 다른 가족에게 연쇄적으로 영향을 주지 않는다.'
  }
  return linkedMission?.summary || location?.summary || meal.note
}

function getMealMedia(location) {
  const seen = new Set()
  return [...(location?.livePhotos || []), ...(location?.photos || [])].filter((media) => {
    const key = media.imageUrl || media.id
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const ACTIVITY_RESEARCH = {
  'thu-transit': {
    headline: '도착일은 야망이 아닌 원활한 안착을 최우선으로.',
    cards: [
      {
        eyebrow: '저녁 목표',
        title: '체크인, 긴장 해소, 저녁 식사, 마무리',
        bullets: [
          '각 가족이 펜션에 도착해 필수품만 풀고, 첫날 밤을 편하게 보낼 에너지를 보존하는 것이 목표.',
          '저녁 식사를 리셋 포인트로 활용. 도착 후 선택적 심부름이나 관광을 겹쳐 쌓지 않는다.',
          '누군가 늦는다면 최소 침실 셋업 후 저녁/휴식 모드로 직행하는 것이 플랜 B.',
        ],
      },
      {
        eyebrow: '이동 집중',
        title: '각 가족은 서로 다른 이동 플레이북을 따른다',
        bullets: [
          '이씨 가족은 수원에서 장거리 이동. 중간 휴게소 정차와 저녁 타이밍이 가장 중요.',
          '김씨 가족은 서울 출발로 유연한 지원 역할 가능. 다른 가족이 늦을 경우 대응 가능.',
          '먼저 도착한 가족이 모든 셋업을 혼자 떠맡지 않도록 도착 역할을 사전에 명확히 배분.',
        ],
      },
    ],
  },
  'fri-lake': {
    headline: '일요일은 협재해수욕장·한림공원 중심으로, 아이 에너지 최우선.',
    cards: [
      {
        eyebrow: '협재해수욕장',
        title: '제주 서쪽 최고 해변에서 물놀이',
        bullets: [
          '협재해수욕장은 에메랄드빛 수색과 얕은 수심으로 어린이 물놀이에 최적. 성수기에도 넓은 편.',
          '해녀의 집에서 점심(성게국수·전복죽)으로 제주 맛을 체험. 현장 대기 가능.',
          '비양도 뷰가 아름다워 사진 스폿으로도 제격. 일몰 전 여유 있게 이동 계획 필요.',
        ],
      },
      {
        eyebrow: '한림공원',
        title: '아이 친화 관광지와 연계 동선',
        bullets: [
          '한림공원은 협재 바로 옆. 용암동굴, 아열대식물원, 민속관 등 아이들이 흥미로워 할 코스.',
          '오전 한림공원 → 점심 해녀의 집 → 오후 협재해수욕장 순서가 가장 무난한 동선.',
          '저녁 흑돼지 예약 시간 맞춰 협재에서 애월로 이동 타이밍 사전 설정.',
        ],
      },
    ],
  },
  'sat-yosemite': {
    headline: '협재해수욕장은 월요일 귀가 전 마지막 아침 여유 공간.',
    cards: [
      {
        eyebrow: '귀가 전 여유',
        title: '체크아웃 후 공항 이동 동선',
        bullets: [
          '와일리제주 체크아웃 후 제주공항까지 약 40분. 렌터카 반납 시간 반드시 확인.',
          '성수기 광복절 연휴 복귀 항공편은 혼잡. 탑승 2시간 전 공항 도착 권장.',
          '귀가 당일 아침 식사는 숙소 주변에서 간단히. 시간 여유 분산을 우선시.',
        ],
      },
      {
        eyebrow: '운영 주의사항',
        title: '귀가 날은 단순하게',
        bullets: [
          '관광 추가 욕심 금지. 체크아웃·렌터카·공항이 이날의 전부.',
          '면세점 쇼핑은 여유 시간이 확실할 때만. 탑승 게이트 우선.',
          '아이들 여행 피로가 누적된 날. 이동 속도를 느리게 설계.',
        ],
      },
    ],
  },
  'sun-home': {
    headline: '일요일은 무난하고, 질서정연하고, 미리 결정된 느낌일 때 성공이다.',
    cards: [
      {
        eyebrow: '아침 흐름',
        title: '아침 식사, 정리, 순차 출발',
        bullets: [
          '아침 식사를 일찍 시작해 청소와 최종 짐 정리가 체크아웃 직전에 겹치지 않도록.',
          '한 명은 펜션 정리, 다른 한 명은 차량 짐 싣기를 담당해 같은 사람이 두 가지 다 하지 않도록.',
          '가능하면 토요일 밤에 아이들 짐을 미리 싸두고 아침에는 필수품만 꺼내두기.',
        ],
      },
      {
        eyebrow: '출발 로직',
        title: '일요일 마찰을 줄인다',
        bullets: [
          '구역별로 최종 점검: 주방, 욕실, 침실, 충전 케이블, 야외 장비.',
          '쓰레기 분리, 냉장고 정리, 젖은 물품은 예상치 못한 마감 작업이 아닌 명시적 체크아웃 태스크로.',
          '필요하면 순차 출발. 모든 가족을 동일한 체크아웃 병목에 몰아넣지 않는다.',
        ],
      },
    ],
  },
}

const JIANG_ROAD_TRIP_STOP_DEFAULTS = [
  {
    id: 'north-star-kettleman-lunch',
    type: 'location',
    title: '제주공항 렌터카 픽업',
    category: 'logistics',
    dayId: 'thu',
    stopType: '렌터카 픽업',
    placesQuery: '제주국제공항',
    address: '제주특별자치도 제주시 공항로 2',
    coordinates: { lat: 33.5065, lng: 126.4934 },
    externalUrl: 'https://www.google.com/maps/search/?api=1&query=제주국제공항',
    summary: '제주공항 도착 후 렌터카 픽업. 성수기 대기 가능. 예약 번호 미리 준비.',
    linkedEntityKeys: [makeEntityKey('family', 'north-star'), makeEntityKey('itineraryItem', 'north-star-drive')],
    photos: [],
    note: '',
  },
  {
    id: 'north-star-oakdale-break',
    type: 'location',
    title: '제주공항 집결',
    category: 'logistics',
    dayId: 'thu',
    stopType: '전 가족 집결',
    placesQuery: '제주국제공항',
    address: '제주특별자치도 제주시 공항로 2',
    coordinates: { lat: 33.5065, lng: 126.4934 },
    externalUrl: 'https://www.google.com/maps/search/?api=1&query=제주국제공항',
    summary: '전 가족 제주공항 집결. 렌터카 픽업 후 와일리제주로 출발.',
    linkedEntityKeys: [makeEntityKey('family', 'north-star'), makeEntityKey('itineraryItem', 'north-star-drive')],
    photos: [],
    note: '',
  },
]

const FAMILY_VEHICLE_DEFAULTS = {
  'north-star': {
    originAddress: '김포공항 출발',
    originCoordinates: { lat: 37.5583, lng: 126.7906 },
    vehicleLabel: '비행편 1',
    plannedStopIds: ['north-star-kettleman-lunch', 'north-star-oakdale-break'],
    routeSummary: '김포공항 → 제주공항 비행 후 렌터카 픽업, 와일리제주로 이동.',
  },
  'silver-peak': {
    originAddress: '김포공항 출발',
    originCoordinates: { lat: 37.5583, lng: 126.7906 },
    vehicleLabel: '비행편 2',
    plannedStopIds: ['north-star-oakdale-break'],
    routeSummary: '김포공항 → 제주공항 비행 후 와일리제주 직행.',
  },
  'desert-bloom': {
    originAddress: '청주공항 출발',
    originCoordinates: { lat: 36.7166, lng: 127.499 },
    vehicleLabel: '비행편 3',
    plannedStopIds: [],
    routeSummary: '청주공항 → 제주공항 비행 후 와일리제주 직행.',
  },
}

const YOSEMITE_ROUTE_DEFAULTS = {
  title: '협재해수욕장',
  placesQuery: '협재해수욕장 제주',
  address: '제주시 한림읍 협재리',
  coordinates: { lat: 33.394, lng: 126.239 },
  externalUrl: 'https://www.google.com/maps/search/?api=1&query=협재해수욕장+제주',
  summary:
    '일요일 협재해수욕장 메인 루트 앵커. 에메랄드빛 해변 중심으로 물놀이, 해녀의 집 점심, 한림공원 연계 동선 구체화.',
}

const ROUTE_SIM_DEFAULTS = {
  'route-la-north-star': {
    originCoordinates: { lat: 34.1184, lng: -118.3004 },
    stopLocationIds: ['north-star-kettleman-lunch', 'north-star-oakdale-break'],
    destinationLocationId: 'pine-airbnb',
    simulationStartSlot: 1.75,
    simulationEndSlot: 2.67,
    durationSeconds: 5.5 * 60 * 60,
    simulationMilestones: [
      { t: 0, progress: 0 },
      { t: 0.46, progress: 0.44 },
      { t: 0.56, progress: 0.44 },
      { t: 0.82, progress: 0.82 },
      { t: 0.9, progress: 0.82 },
      { t: 1, progress: 1 },
    ],
  },
  'route-sf-silver-peak': {
    originCoordinates: { lat: 37.7955, lng: -122.3937 },
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
  },
  'route-sf-desert-bloom': {
    originCoordinates: { lat: 39.5296, lng: -119.8138 },
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
  },
}

function ActivityResearchCard({ eyebrow, title, bullets }) {
  return (
    <div className="border border-[#30363D] bg-[#0d1117] p-4">
      <SectionTitle eyebrow={eyebrow} title={title} />
      <div className="space-y-2">
        {bullets.map((bullet) => (
          <div key={bullet} className="text-[11px] leading-relaxed text-[#C9D1D9]">
            {bullet}
          </div>
        ))}
      </div>
    </div>
  )
}

function TransitStopCard({ stop, onSelectEntity }) {
  return (
    <button
      type="button"
      onClick={() => onSelectEntity('location', stop.id)}
      className="border border-[#30363D] bg-[#0d1117] p-4 text-left transition-colors hover:border-[#58A6FF]/40 hover:bg-[#1f2a34]/30"
    >
      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#D29922]">
        {stop.stopType || 'Stop'}
      </div>
      <div className="mt-1 text-[12px] font-black uppercase tracking-[0.08em] text-[#C9D1D9]">{stop.title}</div>
      <div className="mt-2 text-[10px] leading-relaxed text-[#8B949E]">{stop.summary || stop.address}</div>
      {stop.address ? <div className="mt-2 text-[10px] text-[#8B949E]">{stop.address}</div> : null}
    </button>
  )
}

function ItineraryPage({
  doc,
  selection,
  onSelectEntity,
  onOpenEntity,
  onSetCursor,
  onUpdateMapUi,
  onHydrateRouteDetails,
  onUpdatePageNote,
  onConvertPageNote,
  weatherDays,
  mapWeather,
  mapWeatherTargets,
}) {
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [playbackCursorSlot, setPlaybackCursorSlot] = useState(null)
  const [isPlaybackPlaying, setIsPlaybackPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [missionFeedItems, setMissionFeedItems] = useState([])
  const [missionFeedNow, setMissionFeedNow] = useState(() => Date.now())
  const [operationGate, setOperationGate] = useState(null)
  const [operationGateRemainingMs, setOperationGateRemainingMs] = useState(0)
  const playbackCursorRef = useRef(doc.ui.timeline.cursorSlot)
  const playbackRunRef = useRef({ anchorCursor: doc.ui.timeline.cursorSlot, anchorTimestamp: null })
  const operationGateRef = useRef(null)
  const triggeredOperationCheckpointIdsRef = useRef(new Set())
  const effectiveCursorSlot = playbackCursorSlot ?? doc.ui.timeline.cursorSlot
  const context = useMemo(() => getTimelineContext(doc, effectiveCursorSlot), [doc, effectiveCursorSlot])
  const dailyBriefing = useMemo(() => buildDailyBriefing(doc, context), [doc, context])
  const operationCheckpoints = useMemo(() => buildOperationCheckpoints(doc), [doc])
  const playbackHighlightLocationId = useMemo(
    () => (isPlaybackPlaying ? getPlaybackHighlightLocation(doc, context) : null),
    [context, doc, isPlaybackPlaying],
  )
  const renderedMissionFeedItems = useMemo(() => {
    const expirationMs = MISSION_FEED_LIFETIME_MS + MISSION_FEED_FADE_MS
    return missionFeedItems
      .map((item) => {
        const ageMs = Math.max(missionFeedNow - (item.createdAt || 0), 0)
        if (ageMs >= expirationMs) return null
        return {
          ...item,
          phase: ageMs >= MISSION_FEED_LIFETIME_MS ? 'fading' : 'visible',
        }
      })
      .filter(Boolean)
  }, [missionFeedItems, missionFeedNow])

  useEffect(() => {
    playbackCursorRef.current = effectiveCursorSlot
  }, [effectiveCursorSlot])

  useEffect(() => {
    operationGateRef.current = operationGate
  }, [operationGate])

  const updateMissionFeedItems = useCallback((updater) => {
    setMissionFeedItems((current) => (typeof updater === 'function' ? updater(current) : updater))
  }, [])

  const clearMissionFeed = useCallback(() => {
    setMissionFeedNow(Date.now())
    updateMissionFeedItems([])
  }, [])

  useEffect(() => {
    if (!missionFeedItems.length) return undefined

    const tick = () => {
      const now = Date.now()
      const expirationMs = MISSION_FEED_LIFETIME_MS + MISSION_FEED_FADE_MS
      setMissionFeedNow(now)
      updateMissionFeedItems((current) => {
        const next = current.filter((item) => now - (item.createdAt || 0) < expirationMs)
        return next.length === current.length ? current : next
      })
    }

    tick()
    const intervalId = window.setInterval(tick, MISSION_FEED_TICK_MS)
    return () => window.clearInterval(intervalId)
  }, [missionFeedItems.length, updateMissionFeedItems])

  const handlePlaybackFeedItems = useCallback((items) => {
    const nextItems = (Array.isArray(items) ? items : [items]).filter(Boolean)
    if (!nextItems.length) return

    const createdAt = Date.now()
    updateMissionFeedItems((current) => {
      const next = [...current]
      nextItems.forEach((item) => {
        const nextItem = {
          ...item,
          createdAt,
        }
        const existingIndex = next.findIndex((existing) => existing.key === item.key)
        if (existingIndex >= 0) {
          next.splice(existingIndex, 1)
        }
        next.push(nextItem)
      })
      return next
    })
    setMissionFeedNow(createdAt)
  }, [updateMissionFeedItems])

  const handleMissionFeedActivate = useCallback((item) => {
    if (item.entityType && item.entityId) {
      onOpenEntity(item.entityType, item.entityId)
      return
    }

    if (item.locationId) {
      onSelectEntity('location', item.locationId)
      return
    }

    if (item.familyId) {
      onSelectEntity('family', item.familyId)
    }
  }, [onOpenEntity, onSelectEntity])

  const proceedOperationGate = useCallback(() => {
    operationGateRef.current = null
    setOperationGate(null)
    setOperationGateRemainingMs(0)
  }, [])

  const armOperationCheckpointsFromCursor = useCallback((cursorSlot) => {
    const normalizedCursor = clampTimelineCursor(cursorSlot)
    triggeredOperationCheckpointIdsRef.current = new Set(
      operationCheckpoints
        .filter((checkpoint) => checkpoint.startSlot <= normalizedCursor + 0.001)
        .map((checkpoint) => checkpoint.id),
    )
  }, [operationCheckpoints])

  const triggerOperationGate = useCallback((checkpoint) => {
    const holdCursor = clampTimelineCursor(checkpoint.startSlot)
    playbackCursorRef.current = holdCursor
    setPlaybackCursorSlot(holdCursor)
    setOperationGate({
      ...checkpoint,
      autoAdvanceMs: checkpoint.autoAdvanceMs || 3000,
    })
    setOperationGateRemainingMs(checkpoint.autoAdvanceMs || 3000)
  }, [])

  const abortOperationGate = useCallback(() => {
    const committedCursor = clampTimelineCursor(playbackCursorRef.current)
    operationGateRef.current = null
    setIsPlaybackPlaying(false)
    setPlaybackCursorSlot(null)
    setOperationGate(null)
    setOperationGateRemainingMs(0)
    onSetCursor(committedCursor)
  }, [onSetCursor])

  useEffect(() => {
    if (!operationGate) return undefined

    setOperationGateRemainingMs(operationGate.autoAdvanceMs)
    const startedAt = Date.now()
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const remaining = Math.max(operationGate.autoAdvanceMs - elapsed, 0)
      setOperationGateRemainingMs(remaining)
      if (remaining <= 0) {
        window.clearInterval(intervalId)
        proceedOperationGate()
      }
    }, 80)

    return () => window.clearInterval(intervalId)
  }, [operationGate, proceedOperationGate])

  useEffect(() => {
    if (!briefingOpen) return undefined

    console.info('[TripCommand] Daily briefing opened', {
      cursorSlot: effectiveCursorSlot,
      day: dailyBriefing?.day?.id,
    })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        console.info('[TripCommand] Daily briefing closed via Escape')
        setBriefingOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [briefingOpen])

  useEffect(() => {
    if (!isPlaybackPlaying) return undefined

    let frameId = null
    const maxCursor = clampTimelineCursor(DAYS.length * TIME_SLOTS.length)
    playbackRunRef.current = {
      anchorCursor: playbackCursorRef.current,
      anchorTimestamp: null,
    }

    const animate = (timestamp) => {
      if (operationGateRef.current) {
        playbackRunRef.current.anchorTimestamp = timestamp
        frameId = window.requestAnimationFrame(animate)
        return
      }

      const previousTimestamp = playbackRunRef.current.anchorTimestamp
      playbackRunRef.current.anchorTimestamp = timestamp

      if (previousTimestamp == null) {
        frameId = window.requestAnimationFrame(animate)
        return
      }

      const rawDeltaSeconds = Math.max((timestamp - previousTimestamp) / 1000, 0)
      const deltaSeconds =
        rawDeltaSeconds > PLAYBACK_STALL_RESET_SECONDS
          ? 0
          : Math.min(rawDeltaSeconds, PLAYBACK_MAX_FRAME_DELTA_SECONDS)
      const currentCursor = playbackCursorRef.current
      const nextCursor = clampTimelineCursor(
        currentCursor + deltaSeconds * PLAYBACK_SLOT_UNITS_PER_SECOND * playbackSpeed,
      )
      const crossedCheckpoint = findCrossedOperationCheckpoint(
        operationCheckpoints,
        currentCursor,
        nextCursor,
        triggeredOperationCheckpointIdsRef.current,
      )

      if (crossedCheckpoint) {
        triggeredOperationCheckpointIdsRef.current.add(crossedCheckpoint.id)
        triggerOperationGate(crossedCheckpoint)
        playbackRunRef.current.anchorTimestamp = timestamp
        frameId = window.requestAnimationFrame(animate)
        return
      }

      playbackCursorRef.current = nextCursor
      setPlaybackCursorSlot(nextCursor)

      if (nextCursor >= maxCursor - 0.002) {
        setIsPlaybackPlaying(false)
        setPlaybackCursorSlot(null)
        onSetCursor(maxCursor)
        return
      }

      frameId = window.requestAnimationFrame(animate)
    }

    frameId = window.requestAnimationFrame(animate)
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [isPlaybackPlaying, onSetCursor, operationCheckpoints, playbackSpeed, triggerOperationGate])

  const handleTimelineCursorChange = useCallback(
    (slot) => {
      const nextCursor = clampTimelineCursor(slot)
      setOperationGate(null)
      setOperationGateRemainingMs(0)
      operationGateRef.current = null
      armOperationCheckpointsFromCursor(nextCursor)
      clearMissionFeed()
      if (isPlaybackPlaying) {
        playbackRunRef.current = {
          anchorCursor: nextCursor,
          anchorTimestamp: null,
        }
        playbackCursorRef.current = nextCursor
        setPlaybackCursorSlot(nextCursor)
      return
      }
      setPlaybackCursorSlot(null)
      onSetCursor(nextCursor)
    },
    [armOperationCheckpointsFromCursor, clearMissionFeed, isPlaybackPlaying, onSetCursor],
  )

  const handleTogglePlayback = useCallback(() => {
    console.info('[TripCommand] Playback button clicked', {
      isPlaybackPlaying,
      cursorSlot: playbackCursorRef.current,
      playbackSpeed,
    })

    if (isPlaybackPlaying) {
      const committedCursor = clampTimelineCursor(playbackCursorRef.current)
      setIsPlaybackPlaying(false)
      setPlaybackCursorSlot(null)
      operationGateRef.current = null
      setOperationGate(null)
      setOperationGateRemainingMs(0)
      console.info('[TripCommand] Playback paused', { committedCursor })
      onSetCursor(committedCursor)
      return
    }

    const startingCursor = getSuggestedPlaybackStartCursor(doc, doc.ui.timeline.cursorSlot, operationCheckpoints)
    armOperationCheckpointsFromCursor(startingCursor)
    clearMissionFeed()
    playbackRunRef.current = {
      anchorCursor: startingCursor,
      anchorTimestamp: null,
    }
    playbackCursorRef.current = startingCursor
    setPlaybackCursorSlot(startingCursor)
    setIsPlaybackPlaying(true)
    console.info('[TripCommand] Playback started', { startingCursor, playbackSpeed })
  }, [armOperationCheckpointsFromCursor, clearMissionFeed, doc, doc.ui.timeline.cursorSlot, isPlaybackPlaying, onSetCursor, operationCheckpoints, playbackSpeed])

  const handleRestartPlayback = useCallback(() => {
    const restartCursor = 0
    console.info('[TripCommand] Playback restarted', { restartCursor, isPlaybackPlaying })
    setOperationGate(null)
    setOperationGateRemainingMs(0)
    operationGateRef.current = null
    triggeredOperationCheckpointIdsRef.current.clear()
    clearMissionFeed()
    playbackRunRef.current = {
      anchorCursor: restartCursor,
      anchorTimestamp: null,
    }
    playbackCursorRef.current = restartCursor
    if (isPlaybackPlaying) {
      setPlaybackCursorSlot(restartCursor)
      return
    }
    onSetCursor(restartCursor)
  }, [clearMissionFeed, isPlaybackPlaying, onSetCursor])

  const handleOpenBriefing = useCallback(() => {
    console.info('[TripCommand] Daily briefing button clicked', {
      cursorSlot: effectiveCursorSlot,
      day: dailyBriefing?.day?.id,
    })
    setBriefingOpen(true)
  }, [dailyBriefing?.day?.id, effectiveCursorSlot])

  return (
    <>
      <div className="grid h-full min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] overflow-hidden">
        <div className="min-h-0 overflow-y-auto border-r border-[#30363D] bg-[#0d1117]">
          <div className="space-y-4 p-4">
            <SituationBoard context={context} onOpenEntity={onOpenEntity} onOpenBriefing={handleOpenBriefing} />
            <div>
              <SectionTitle eyebrow="이동 계획" title="이동 가족" meta={`${doc.families.length} families`} />
              <FamilyList doc={doc} selection={selection} onSelectEntity={onSelectEntity} />
            </div>
            <div>
              <ScenarioControls doc={doc} cursorSlot={effectiveCursorSlot} onSetCursor={handleTimelineCursorChange} />
            </div>
            <div>
              <PageNotesCard
                title="계획 메모"
                value={getPageNote(doc, 'itinerary')}
                onChange={(value) => onUpdatePageNote('itinerary', value)}
                onConvert={() => onConvertPageNote('itinerary')}
                placeholder="일정 계획 메모 추가..."
              />
            </div>
          </div>
        </div>

        <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
          <div className="relative min-h-0 min-w-0 overflow-hidden">
            <CommandMap
              locations={doc.locations}
              routes={doc.routes}
              families={doc.families}
              itineraryItems={doc.itineraryItems}
              meals={doc.meals}
              activities={doc.activities}
              cursorSlot={effectiveCursorSlot}
              mapUi={doc.ui.map}
              mapWeather={mapWeather}
              mapWeatherTargets={mapWeatherTargets}
              selectedLocationId={getLocationForEntity(doc, getEntityBySelection(doc, selection))?.id || null}
              selectedRouteId={getRouteForEntity(doc, getEntityBySelection(doc, selection))?.id || null}
              playbackActive={isPlaybackPlaying}
              playbackHighlightLocationId={playbackHighlightLocationId}
              onUpdateMapUi={onUpdateMapUi}
              onHydrateRouteDetails={onHydrateRouteDetails}
              onSelectEntity={onSelectEntity}
              onPlaybackFeedItems={handlePlaybackFeedItems}
            />
            <MissionFeedTray
              items={renderedMissionFeedItems}
              onActivateItem={handleMissionFeedActivate}
            />
          </div>
          <div className="min-w-0 shrink-0">
            <TimelineBoard
              doc={doc}
              selection={selection}
              onSelectEntity={onSelectEntity}
              onSetCursor={handleTimelineCursorChange}
              weatherDays={weatherDays}
              cursorSlot={effectiveCursorSlot}
              isPlaying={isPlaybackPlaying}
              playbackSpeed={playbackSpeed}
              onTogglePlayback={handleTogglePlayback}
              onRestartPlayback={handleRestartPlayback}
              onSetPlaybackSpeed={setPlaybackSpeed}
            />
          </div>
        </div>
      </div>
      {briefingOpen ? (
        <DailyBriefingModal
          briefing={dailyBriefing}
          onClose={() => setBriefingOpen(false)}
          onOpenEntity={(type, id) => {
            onOpenEntity(type, id)
            setBriefingOpen(false)
          }}
        />
      ) : null}
      {operationGate ? (
        <MissionLaunchModal
          doc={doc}
          gate={operationGate}
          remainingMs={operationGateRemainingMs}
          onProceed={proceedOperationGate}
          onAbort={abortOperationGate}
        />
      ) : null}
    </>
  )
}

function StayPage({ doc, selection, onSelectEntity, onUpdatePageNote, onConvertPageNote }) {
  const airbnb = getEntityById(doc, 'location', 'pine-airbnb')
  const showExternalListing = Boolean(airbnb?.externalUrl)
  const showManual = Boolean(airbnb?.manualUrl)
  const isSanitizedStay = !showExternalListing && !showManual

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(380px,440px)_1fr] overflow-hidden">
      <div className="overflow-y-auto border-r border-[#30363D] bg-[#161b22] p-6">
        <SectionTitle eyebrow="베이스캠프" title={airbnb?.title || '베이스캠프'} meta={doc.tripMeta?.subtitle} />
        <SelectableCard
          selected={selection.type === 'location' && selection.id === airbnb.id}
          onClick={() => onSelectEntity('location', airbnb.id)}
          className="mb-6 p-4"
        >
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8B949E]">Location</div>
          <div className="text-[12px] text-[#C9D1D9]">{airbnb.address}</div>
          {showExternalListing ? (
            <div className="mt-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#58A6FF]">
              숙소 페이지 <ExternalLink size={12} />
            </div>
          ) : null}
        </SelectableCard>
        <div className="space-y-4">
          {doc.stayItems.map((item) => (
            <SelectableCard
              key={item.id}
              selected={selection.type === item.type && selection.id === item.id}
              onClick={() => onSelectEntity(item.type, item.id)}
              className="p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[12px] font-black uppercase tracking-widest text-[#C9D1D9]">{item.title}</div>
                <div className="text-[9px] font-black uppercase tracking-wider text-[#58A6FF]">{item.category}</div>
              </div>
              <div className="text-[11px] leading-relaxed text-[#8B949E]">{item.summary}</div>
            </SelectableCard>
          ))}
        </div>
      </div>
      <div className="overflow-y-auto bg-[#0d1117] p-6">
        <SectionTitle eyebrow="베이스캠프 정보" title="도착 · 입실 · 숙소 운영" />
        <div className="mb-6 space-y-3">

          {/* 핵심 정보 카드 */}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <div className="border border-[#30363D] bg-[#161b22] p-3">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[#58A6FF]">체크인</div>
              <div className="text-[12px] font-bold text-[#C9D1D9]">{airbnb.checkIn}</div>
            </div>
            <div className="border border-[#30363D] bg-[#161b22] p-3">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[#58A6FF]">체크아웃</div>
              <div className="text-[12px] font-bold text-[#C9D1D9]">{airbnb.checkOut}</div>
            </div>
            {airbnb.wifiNetwork ? (
              <div className="border border-[#30363D] bg-[#161b22] p-3">
                <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[#58A6FF]">와이파이</div>
                <div className="text-[11px] font-bold text-[#C9D1D9]">{airbnb.wifiNetwork}</div>
                {airbnb.wifiPassword && <div className="mt-0.5 text-[10px] text-[#8B949E]">{airbnb.wifiPassword}</div>}
              </div>
            ) : null}
            {airbnb.vehicleFee ? (
              <div className="border border-[#30363D] bg-[#161b22] p-3">
                <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[#58A6FF]">렌터카</div>
                <div className="text-[11px] text-[#C9D1D9]">{airbnb.vehicleFee}</div>
              </div>
            ) : null}
          </div>

          {/* 안내 텍스트 행 */}
          {(airbnb.directionsNote || airbnb.gateNote || airbnb.parkingNote || airbnb.confirmationCode) && (
            <div className="divide-y divide-[#21262D] border border-[#30363D] bg-[#161b22]">
              {airbnb.directionsNote && (
                <div className="flex gap-4 px-4 py-3">
                  <div className="w-20 shrink-0 pt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#58A6FF]">찾아오는 길</div>
                  <div className="text-[11px] leading-relaxed text-[#8B949E]">{airbnb.directionsNote}</div>
                </div>
              )}
              {airbnb.gateNote && (
                <div className="flex gap-4 px-4 py-3">
                  <div className="w-20 shrink-0 pt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#58A6FF]">출입 안내</div>
                  <div className="text-[11px] leading-relaxed text-[#8B949E]">{airbnb.gateNote}</div>
                </div>
              )}
              {airbnb.parkingNote && (
                <div className="flex gap-4 px-4 py-3">
                  <div className="w-20 shrink-0 pt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#58A6FF]">주차 안내</div>
                  <div className="text-[11px] leading-relaxed text-[#8B949E]">{airbnb.parkingNote}</div>
                </div>
              )}
              {airbnb.confirmationCode && (
                <div className="flex gap-4 px-4 py-3">
                  <div className="w-20 shrink-0 pt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#58A6FF]">예약 확인</div>
                  <div className="font-mono text-[11px] text-[#C9D1D9]">{airbnb.confirmationCode}</div>
                </div>
              )}
            </div>
          )}

          {/* 주소 + 링크 */}
          <div className="flex flex-wrap gap-2">
            {airbnb.address && (
              <div className="flex items-center gap-2 border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#8B949E]">
                <MapPin size={12} className="shrink-0 text-[#58A6FF]" />
                {airbnb.address}
              </div>
            )}
            {showExternalListing && (
              <button type="button" onClick={() => window.open(airbnb.externalUrl, '_blank', 'noreferrer')}
                className="inline-flex items-center gap-1.5 border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#58A6FF] transition-colors hover:border-[#58A6FF]/40">
                숙소 페이지 <ExternalLink size={12} />
              </button>
            )}
            {showManual && (
              <button type="button" onClick={() => window.open(airbnb.manualUrl, '_blank', 'noreferrer')}
                className="inline-flex items-center gap-1.5 border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#58A6FF] transition-colors hover:border-[#58A6FF]/40">
                숙소 이용 안내 <ExternalLink size={12} />
              </button>
            )}
          </div>

          {/* 사진 */}
          {(airbnb.photos || []).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {(airbnb.photos || []).slice(0, 2).map((media) => (
                <a key={media.id} href={media.sourceUrl || media.imageUrl} target="_blank" rel="noreferrer"
                  className="group overflow-hidden border border-[#30363D] bg-[#0d1117]">
                  <div className="h-28 w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{ backgroundImage: `url(${media.imageUrl})` }} />
                  <div className="flex items-center justify-between gap-3 px-3 py-2 text-[10px] font-bold text-[#C9D1D9]">
                    <span>{media.label}</span>
                    <ExternalLink size={12} className="text-[#58A6FF]" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <SectionTitle eyebrow="숙소 운영" title="숙소 배정" meta="취침·도착·정리" />
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {doc.families.map((family, index) => (
            <SelectableCard
              key={family.id}
              selected={selection.type === 'family' && selection.id === family.id}
              onClick={() => onSelectEntity('family', family.id)}
              className="p-4"
            >
              <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-[#C9D1D9]">
                Room {index + 1}
              </div>
              <div className="text-[12px] font-bold text-[#58A6FF]">{family.title}</div>
              <div className="mt-1 text-[10px] text-[#8B949E]">{getFamilyHeadcountLabel(family)}</div>
            </SelectableCard>
          ))}
        </div>
        <PageNotesCard
          title="숙소 메모"
          value={getPageNote(doc, 'stay')}
          onChange={(value) => onUpdatePageNote('stay', value)}
          onConvert={() => onConvertPageNote('stay')}
          placeholder="체크인 안내, 취침 관련 사항, 조용히 해야 할 시간대, 숙소 물류 등 기록..."
        />
      </div>
    </div>
  )
}

function MealsPage({ doc, selection, onSelectEntity, onToggleMealStatus, onUpdatePageNote, onConvertPageNote }) {
  const selectedMeal = selection.type === 'meal'
    ? getEntityById(doc, 'meal', selection.id) || doc.meals[0]
    : doc.meals[0]
  const selectedLocation = getLocationForEntity(doc, selectedMeal)
  const selectedTasks = getTasksForEntity(doc, selectedMeal).filter((task) => task.status !== 'done').slice(0, 2)
  const linkedMission = getLinkedEntities(doc, selectedMeal).find(
    (entity) => entity.type === 'activity' || entity.type === 'itineraryItem',
  )
  const media = getMealMedia(selectedLocation).slice(0, 3)
  const travelSummary = selectedLocation?.basecampDrive
    ? `${selectedLocation.basecampDrive.durationText} · ${selectedLocation.basecampDrive.distanceText}`
    : selectedLocation?.id === 'pine-airbnb'
      ? '이동 불필요'
      : '경로 정보 로드 후 소요 시간이 표시됩니다.'
  const hoursPreview = selectedLocation?.openingHours?.slice(0, 3).join(' | ')
  const ratingSummary = selectedLocation?.rating
    ? `${selectedLocation.rating.toFixed(1)} rating${selectedLocation.userRatingsTotal ? ` · ${selectedLocation.userRatingsTotal} reviews` : ''}`
    : '장소 정보 불러오는 중'

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(360px,0.78fr)_minmax(520px,1.22fr)] overflow-hidden">
      <div className="overflow-y-auto border-r border-[#30363D] bg-[#161b22] p-6">
        <SectionTitle eyebrow="식사 물류" title="공동 식사 계획" meta="담당·준비·아이 친화" />
        <div className="space-y-3">
          {doc.meals.map((meal) => (
            <div
              key={meal.id}
              className={cn(
                'grid grid-cols-[1fr_auto] gap-3 border px-4 py-4 transition-colors',
                selection.type === 'meal' && selection.id === meal.id ? 'bg-[#24313d]/50' : '',
                selection.type === 'meal' && selection.id === meal.id
                  ? 'border-[#58A6FF]'
                  : 'border-[#30363D] bg-[#0d1117] hover:border-[#58A6FF]/30 hover:bg-[#1f2a34]/30',
              )}
            >
              <button
                type="button"
                onClick={() => onSelectEntity('meal', meal.id)}
                className="grid min-w-0 grid-cols-[86px_1fr_120px] gap-3 text-left"
              >
                <div>
                  <div className="font-bold text-[#8B949E]">{getDayMeta(meal.dayId)?.shortLabel || meal.dayId}</div>
                  <div className="mt-1 text-[12px] font-black text-[#C9D1D9]">{meal.timeLabel}</div>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[#C9D1D9]">{meal.title}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#D29922]">
                    {getLocationForEntity(doc, meal)?.title || 'Venue pending'}
                  </div>
                  <div className="mt-2 text-[10px] leading-relaxed text-[#8B949E]">{meal.note}</div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B949E]">
                    {meal.reservationType}
                  </div>
                  <div className="text-[10px] text-[#C9D1D9]">{meal.owner}</div>
                  <div className="text-[10px] text-[#8B949E]">
                    {formatMealTravelSignal(meal, getLocationForEntity(doc, meal))}
                  </div>
                </div>
              </button>
              <div className="justify-self-end">
                <button
                  type="button"
                  onClick={() => onToggleMealStatus(meal.id)}
                  className="border border-transparent"
                >
                  <StatusPill tone={meal.status}>{meal.status}</StatusPill>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-y-auto bg-[#0d1117] p-6">
        {selectedMeal ? (
          <>
            <div className="border border-[#30363D] bg-[#161b22] p-5">
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#58A6FF]">
                    Venue planning surface
                  </div>
                  <h2 className="text-[18px] font-black uppercase tracking-[0.12em] text-[#C9D1D9]">
                    {selectedMeal.title}
                  </h2>
                  <div className="mt-2 text-[11px] text-[#8B949E]">
                    {getDayMeta(selectedMeal.dayId)?.title} at {selectedMeal.timeLabel} · {selectedMeal.reservationType}
                  </div>
                </div>
                <StatusPill tone={selectedMeal.status}>{selectedMeal.status}</StatusPill>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {selectedLocation?.externalUrl ? (
                  <IntelAction
                    icon={MapPin}
                    label="지도에서 열기"
                    onClick={() => window.open(selectedLocation.externalUrl, '_blank', 'noreferrer')}
                  />
                ) : null}
                {selectedLocation?.websiteUrl ? (
                  <IntelAction
                    icon={Globe}
                    label="공식 사이트"
                    onClick={() => window.open(selectedLocation.websiteUrl, '_blank', 'noreferrer')}
                  />
                ) : null}
                {linkedMission ? (
                  <IntelAction
                    icon={Route}
                    label={`Linked to ${linkedMission.title}`}
                    onClick={() => onSelectEntity(linkedMission.type, linkedMission.id)}
                    tone="amber"
                  />
                ) : null}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="border border-[#30363D] bg-[#0d1117] p-4">
                  <SectionTitle eyebrow="장소 정보" title={selectedLocation?.title || '장소 미정'} meta={ratingSummary} />
                  <div className="space-y-3">
                    <InfoRow icon={MapPin} label="위치" value={selectedLocation?.address || '장소 확인 중'} />
                    <InfoRow icon={Phone} label="연락처" value={selectedLocation?.phoneNumber} />
                    <InfoRow icon={Star} label="예약 메모" value={selectedLocation?.reservationNote || selectedMeal.note} muted />
                    <InfoRow
                      icon={ExternalLink}
                      label="운영 시간"
                      value={hoursPreview || 'Opening hours will appear when place details are available.'}
                      muted={!hoursPreview}
                    />
                  </div>
                </div>

                <div className="border border-[#30363D] bg-[#0d1117] p-4">
                  <SectionTitle eyebrow="이동 정보" title="이동 · 준비 정보" meta={travelSummary} />
                  <div className="space-y-3">
                    <InfoRow
                      icon={Route}
                      label="베이스캠프에서"
                      value={travelSummary}
                      muted={!selectedLocation?.basecampDrive && selectedLocation?.id !== 'pine-airbnb'}
                    />
                    <InfoRow
                      icon={ArrowRight}
                      label="포함 이유"
                      value={getMealContextNarrative(selectedMeal, selectedLocation, linkedMission)}
                      muted
                    />
                    {selectedTasks.length ? (
                      <div className="rounded-[2px] border border-[#30363D] bg-[#161b22] px-3 py-3">
                        <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#8B949E]">
                          Critical calls
                        </div>
                        <div className="space-y-2">
                          {selectedTasks.map((task) => (
                            <div key={task.id} className="text-[11px] text-[#C9D1D9]">
                              {task.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {media.length ? (
              <div className="mt-5 border border-[#30363D] bg-[#161b22] p-5">
                <SectionTitle eyebrow="장소 이미지" title="장소 이미지" meta={`${media.length}개 이미지`} />
                <div className="grid gap-4 md:grid-cols-3">
                  {media.map((item) => (
                    <a
                      key={item.id}
                      href={item.sourceUrl || selectedLocation?.externalUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden border border-[#30363D] bg-[#0d1117]"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.label}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="border-t border-[#30363D] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#C9D1D9]">
                        {item.label}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-5">
              <PageNotesCard
                title="식사 메모"
                value={getPageNote(doc, 'meals')}
                onChange={(value) => onUpdatePageNote('meals', value)}
                onConvert={() => onConvertPageNote('meals')}
                placeholder="장보기 전략, 알레르기 메모, 아이 대체 식사, 식당 타이밍 결정 등 기록..."
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function ActivitiesPage({ doc, selection, onSelectEntity, onUpdatePageNote, onConvertPageNote, onAddActivity }) {
  const selectedActivity = useMemo(
    () => (selection.type === 'activity' ? doc.activities.find((activity) => activity.id === selection.id) || doc.activities[0] : doc.activities[0]),
    [doc.activities, selection],
  )
  const selectedLocation = useMemo(() => getLocationForEntity(doc, selectedActivity), [doc, selectedActivity])
  const linkedEntities = useMemo(() => getLinkedEntities(doc, selectedActivity), [doc, selectedActivity])
  const linkedTimelineItems = useMemo(
    () => linkedEntities.filter((entity) => entity.type === 'itineraryItem'),
    [linkedEntities],
  )
  const research = selectedActivity ? ACTIVITY_RESEARCH[selectedActivity.id] : null
  const transitFamilies = useMemo(() => {
    if (!selectedActivity || selectedActivity.id !== 'thu-transit') return []

    return linkedTimelineItems
      .filter((item) => item.familyIds?.length === 1)
      .map((item) => {
        const family = getEntityById(doc, 'family', item.familyIds[0])
        const route = getRouteForEntity(doc, item)
        const stops = (route?.stopLocationIds || [])
          .map((stopId) => getEntityById(doc, 'location', stopId))
          .filter(Boolean)

        return family && route
          ? {
              family,
              route,
              itineraryItem: item,
              stops,
            }
          : null
      })
      .filter(Boolean)
  }, [doc, linkedTimelineItems, selectedActivity])
  const [selectedTransitFamilyId, setSelectedTransitFamilyId] = useState(null)
  useEffect(() => {
    if (!transitFamilies.length) {
      setSelectedTransitFamilyId(null)
      return
    }

    if (!transitFamilies.some((entry) => entry.family.id === selectedTransitFamilyId)) {
      setSelectedTransitFamilyId(transitFamilies[0].family.id)
    }
  }, [selectedTransitFamilyId, transitFamilies])
  const selectedTransitPlan = useMemo(
    () => transitFamilies.find((entry) => entry.family.id === selectedTransitFamilyId) || transitFamilies[0] || null,
    [selectedTransitFamilyId, transitFamilies],
  )
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDayId, setDraftDayId] = useState('fri')
  const [draftWindow, setDraftWindow] = useState('Fri / flexible')
  const [draftDescription, setDraftDescription] = useState('')

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(560px,1fr)] overflow-hidden">
      <div className="overflow-y-auto border-r border-[#30363D] bg-[#161b22] p-6">
        <SectionTitle eyebrow="활동 현황" title="일별 활동" meta={`${doc.activities.length} tracked`} />
        <div className="space-y-4">
          {doc.activities.map((activity) => (
            <SelectableCard
              key={activity.id}
              selected={selection.type === 'activity' && selection.id === activity.id}
              onClick={() => onSelectEntity('activity', activity.id)}
              className="p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[13px] font-black uppercase tracking-widest text-[#C9D1D9]">{activity.title}</h3>
                <StatusPill tone={activity.status}>{activity.status}</StatusPill>
              </div>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#58A6FF]">
                {activity.window}
              </div>
              <p className="mb-3 text-[11px] leading-relaxed text-[#C9D1D9]">{activity.description}</p>
              <div className="border-t border-[#30363D]/50 pt-3 text-[10px] leading-relaxed text-[#8B949E]">
                <span className="font-black uppercase tracking-widest text-[#D29922]">Fallback:</span> {activity.backup}
              </div>
            </SelectableCard>
          ))}
        </div>
        <div className="mt-5 border border-[#30363D] bg-[#0d1117] p-4">
          <SectionTitle eyebrow="계획" title="활동 추가" />
          <div className="space-y-3">
            <input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="활동 제목"
              className="w-full border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
            />
            <div className="grid grid-cols-[110px_1fr] gap-2">
              <select
                value={draftDayId}
                onChange={(event) => setDraftDayId(event.target.value)}
                className="border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
              >
                {DAYS.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.shortLabel.toUpperCase()}
                  </option>
                ))}
              </select>
              <input
                value={draftWindow}
                onChange={(event) => setDraftWindow(event.target.value)}
                placeholder="시간대 라벨"
                className="w-full border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
              />
            </div>
            <NotesBox
              value={draftDescription}
              onChange={setDraftDescription}
              placeholder="간단한 설명 또는 계획 목적..."
            />
            <button
              type="button"
              onClick={() => {
                if (!draftTitle.trim()) return
                onAddActivity({
                  title: draftTitle.trim(),
                  dayId: draftDayId,
                  window: draftWindow.trim(),
                  description: draftDescription.trim(),
                })
                setDraftTitle('')
                setDraftDescription('')
              }}
              className="w-full border border-[#30363D] bg-[#161b22] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#C9D1D9] transition-colors hover:border-[#58A6FF]/40 hover:text-[#58A6FF]"
            >
              Add activity
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto bg-[#0d1117] p-6">
        {selectedActivity ? (
          <>
            <div className="border border-[#30363D] bg-[#161b22] p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#58A6FF]">
                    Mission planning surface
                  </div>
                  <h2 className="text-[18px] font-black uppercase tracking-[0.12em] text-[#C9D1D9]">
                    {selectedActivity.title}
                  </h2>
                  <div className="mt-2 text-[11px] text-[#8B949E]">
                    {getDayMeta(selectedActivity.dayId)?.title || selectedActivity.dayId} · {selectedActivity.window}
                  </div>
                </div>
                <StatusPill tone={selectedActivity.status}>{selectedActivity.status}</StatusPill>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {selectedLocation?.externalUrl ? (
                  <IntelAction
                    icon={MapPin}
                    label="장소 열기"
                    onClick={() => window.open(selectedLocation.externalUrl, '_blank', 'noreferrer')}
                  />
                ) : null}
                {selectedLocation ? (
                  <IntelAction
                    icon={Route}
                    label={`Inspect ${selectedLocation.title}`}
                    onClick={() => onSelectEntity('location', selectedLocation.id)}
                    tone="amber"
                  />
                ) : null}
              </div>

              <div className="border border-[#30363D] bg-[#0d1117] p-4">
                <SectionTitle eyebrow="오늘의 미션" title="오늘의 의미" />
                <div className="space-y-3">
                  <InfoRow icon={ArrowRight} label="핵심 계획" value={selectedActivity.description} />
                  <InfoRow icon={MapPin} label="거점 장소" value={selectedLocation?.title || '거점 장소 미설정'} />
                  <InfoRow icon={Search} label="조사 메모" value={research?.headline || selectedActivity.note || '이 날의 미션 세부 내용을 입력하세요.'} muted />
                  <InfoRow icon={Settings} label="대안 계획" value={selectedActivity.backup} muted />
                </div>
              </div>
            </div>

            {selectedActivity.id === 'thu-transit' && selectedTransitPlan ? (
              <div className="mt-5 border border-[#30363D] bg-[#161b22] p-5">
                <SectionTitle eyebrow="이동 계획" title="가족별 이동" meta={`${transitFamilies.length} active routes`} />
                <div className="mb-4 flex flex-wrap gap-2">
                  {transitFamilies.map((entry) => (
                    <button
                      key={entry.family.id}
                      type="button"
                      onClick={() => {
                        setSelectedTransitFamilyId(entry.family.id)
                        onSelectEntity('family', entry.family.id)
                      }}
                      className={cn(
                        'border px-3 py-2 text-[10px] font-black uppercase tracking-wider',
                        selectedTransitPlan.family.id === entry.family.id
                          ? 'border-[#58A6FF] bg-[#58A6FF]/10 text-[#58A6FF]'
                          : 'border-[#30363D] bg-[#0d1117] text-[#C9D1D9]',
                      )}
                    >
                      {entry.family.title}
                    </button>
                  ))}
                </div>
                <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="border border-[#30363D] bg-[#0d1117] p-4">
                    <SectionTitle eyebrow="선택된 가족" title={selectedTransitPlan.family.title} meta={selectedTransitPlan.family.eta} />
                    <div className="space-y-3">
                      <InfoRow icon={MapPin} label="출발지" value={selectedTransitPlan.family.origin} />
                      <InfoRow icon={Route} label="경로 요약" value={selectedTransitPlan.family.routeSummary} muted />
                      <InfoRow
                        icon={Users}
                        label="차량 / 인원"
                        value={`${selectedTransitPlan.family.vehicle} · ${getFamilyHeadcountLabel(selectedTransitPlan.family)}`}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <IntelAction
                        icon={Users}
                        label="가족 상세"
                        onClick={() => onSelectEntity('family', selectedTransitPlan.family.id)}
                      />
                      <IntelAction
                        icon={Route}
                        label="경로 상세"
                        onClick={() => onSelectEntity('route', selectedTransitPlan.route.id)}
                        tone="amber"
                      />
                    </div>
                  </div>
                  <div className="border border-[#30363D] bg-[#0d1117] p-4">
                    <SectionTitle eyebrow="경유지 계획" title="경유지" meta={`${selectedTransitPlan.stops.length} planned`} />
                    {selectedTransitPlan.stops.length ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        {selectedTransitPlan.stops.map((stop) => (
                          <TransitStopCard key={stop.id} stop={stop} onSelectEntity={onSelectEntity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#8B949E]">이 경로에 경유지 계획이 없습니다.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : research?.cards?.length ? (
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {research.cards.map((card) => (
                  <ActivityResearchCard
                    key={`${selectedActivity.id}-${card.title}`}
                    eyebrow={card.eyebrow}
                    title={card.title}
                    bullets={card.bullets}
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-5">
              <PageNotesCard
                title="활동 메모"
                value={getPageNote(doc, 'activities')}
                onChange={(value) => onUpdatePageNote('activities', value)}
                onConvert={() => onConvertPageNote('activities')}
                placeholder="대체 계획, 세부 일정, 날씨 대응 트리거, 새 활동 아이디어 등 기록..."
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function ExpensesPage({
  doc,
  selection,
  currentFamily,
  onSelectEntity,
  onAddExpense,
  onToggleExpenseSettled,
  onUpdateExpenseFields,
  onSetExpenseAllocationMode,
  onUpdateExpenseAllocation,
  onResetExpenseAllocationsToEqual,
  onUpdatePageNote,
  onConvertPageNote,
}) {
  const activeExpenseId =
    selection.type === 'expense' && doc.expenses.some((expense) => expense.id === selection.id)
      ? selection.id
      : doc.expenses[0]?.id
  const activeExpense = doc.expenses.find((expense) => expense.id === activeExpenseId) || null
  const [amountDraft, setAmountDraft] = useState('')
  const [manualAllocationDrafts, setManualAllocationDrafts] = useState({})
  const [customPayerDraft, setCustomPayerDraft] = useState('')
  const total = useMemo(() => doc.expenses.reduce((sum, expense) => sum + expense.amount, 0), [doc.expenses])
  const outstanding = useMemo(
    () => doc.expenses.filter((expense) => !expense.settled).reduce((sum, expense) => sum + expense.amount, 0),
    [doc.expenses],
  )
  const familyBurden = useMemo(() => getFamilyExpenseBurden(doc.expenses, doc.families), [doc.expenses, doc.families])
  const activeAllocations = useMemo(
    () => (activeExpense ? getExpenseAllocations(activeExpense, doc.families) : []),
    [activeExpense, doc.families],
  )
  const manualAllocatedTotal = useMemo(
    () => activeAllocations.reduce((sum, allocation) => sum + allocation.amount, 0),
    [activeAllocations],
  )
  const allocationDelta = activeExpense?.allocationMode === 'manual'
    ? Number((activeExpense.amount || 0) - manualAllocatedTotal)
    : 0
  const payerOptions = useMemo(
    () => [
      ...doc.families.map((family) => family.title),
      '전체 가족',
      '미지정',
    ],
    [doc.families],
  )
  const payerMode = activeExpense && payerOptions.includes(activeExpense.payer) ? activeExpense.payer : '__custom__'

  useEffect(() => {
    if (!activeExpense) return

    setAmountDraft(activeExpense.amount === 0 ? '' : String(activeExpense.amount))
    setCustomPayerDraft(payerMode === '__custom__' ? activeExpense.payer || '' : '')
  }, [activeExpense, payerMode])

  useEffect(() => {
    if (!activeExpense || activeExpense.allocationMode !== 'manual') {
      setManualAllocationDrafts({})
      return
    }

    setManualAllocationDrafts(
      Object.fromEntries(
        getExpenseAllocations(activeExpense, doc.families).map((allocation) => [
          allocation.familyId,
          allocation.amount === 0 ? '' : String(allocation.amount),
        ]),
      ),
    )
  }, [activeExpense, doc.families])

  const commitAmountDraft = useCallback(() => {
    if (!activeExpense) return
    const parsed = parseCurrencyInput(amountDraft)
    onUpdateExpenseFields(activeExpense.id, { amount: parsed })
    setAmountDraft(parsed === 0 ? '' : String(parsed))
  }, [activeExpense, amountDraft, onUpdateExpenseFields])

  const commitManualAllocationDraft = useCallback((familyId) => {
    if (!activeExpense) return
    const parsed = parseCurrencyInput(manualAllocationDrafts[familyId] || '')
    onUpdateExpenseAllocation(activeExpense.id, familyId, parsed)
    setManualAllocationDrafts((current) => ({
      ...current,
      [familyId]: parsed === 0 ? '' : String(parsed),
    }))
  }, [activeExpense, manualAllocationDrafts, onUpdateExpenseAllocation])

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(420px,0.95fr)_minmax(440px,1.05fr)] overflow-hidden">
      <div className="overflow-y-auto border-r border-[#30363D] bg-[#161b22] p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <SectionTitle eyebrow="공동 비용" title="비용 내역" meta="편집 가능 · 분담 지원" />
          <button
            type="button"
            onClick={onAddExpense}
            className="border border-[#58A6FF]/40 bg-[#58A6FF]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#C9D1D9]"
          >
            비용 추가
          </button>
        </div>
        {currentFamily ? (
          <div className="mb-4 border border-[#30363D] bg-[#0d1117] px-3 py-2 text-[11px] text-[#8B949E]">
            Adding and editing as <span className="font-bold text-[#C9D1D9]">{currentFamily.title}</span>.
          </div>
        ) : null}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="border border-[#30363D] bg-[#0d1117] p-4">
            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#8B949E]">총 지출</div>
            <div className="text-[20px] font-black text-[#C9D1D9]">{formatCurrency(total)}</div>
          </div>
          <div className="border border-[#30363D] bg-[#0d1117] p-4">
            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#8B949E]">미정산</div>
            <div className="text-[20px] font-black text-[#D29922]">{formatCurrency(outstanding)}</div>
          </div>
        </div>

        <div className="border border-[#30363D] bg-[#0d1117]">
          {doc.expenses.map((expense) => (
            <div
              key={expense.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectEntity('expense', expense.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelectEntity('expense', expense.id)
                }
              }}
              className={cn(
                'grid cursor-pointer grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_100px_92px] items-center gap-3 border-b border-[#30363D]/40 px-4 py-3 last:border-b-0',
                activeExpenseId === expense.id ? 'bg-[#24313d]/50' : 'hover:bg-[#1f2a34]/40',
              )}
            >
              <div className="min-w-0 text-left">
                <div className="font-bold text-[#C9D1D9]">{expense.title}</div>
                <div className="text-[10px] text-[#8B949E]">
                  {expense.payer} · {expense.split}
                </div>
                {(expense.createdByFamilyId || expense.lastEditedByFamilyId) ? (
                  <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#58A6FF]">
                    {expense.createdByFamilyId ? `작성: ${getFamilyLabel(doc.families, expense.createdByFamilyId)}` : ''}
                    {expense.createdByFamilyId && expense.lastEditedByFamilyId ? ' · ' : ''}
                    {expense.lastEditedByFamilyId ? `수정: ${getFamilyLabel(doc.families, expense.lastEditedByFamilyId)}` : ''}
                  </div>
                ) : null}
              </div>
              <div className="min-w-0 text-[11px] text-[#C9D1D9]">
                {expense.allocationMode === 'individual'
                  ? '개별 부담'
                  : `${doc.families.length} families`}
              </div>
              <div className="font-mono text-[12px] text-[#C9D1D9]">{formatCurrency(expense.amount)}</div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleExpenseSettled(expense.id)
                }}
                className="justify-self-end"
              >
                <StatusPill tone={expense.settled ? 'Settled' : 'Open'}>
                  {expense.settled ? 'Settled' : 'Open'}
                </StatusPill>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto bg-[#0d1117] p-6">
        {activeExpense ? (
          <>
            <SectionTitle
              eyebrow="선택된 비용"
              title={activeExpense.title}
              meta={activeExpense.settled ? 'Settled' : 'Open'}
            />
            {(activeExpense.createdByFamilyId || activeExpense.lastEditedByFamilyId) ? (
              <div className="mb-4 border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#8B949E]">
                {activeExpense.createdByFamilyId ? (
                  <span>작성: <span className="font-bold text-[#C9D1D9]">{getFamilyLabel(doc.families, activeExpense.createdByFamilyId)}</span></span>
                ) : null}
                {activeExpense.createdByFamilyId && activeExpense.lastEditedByFamilyId ? ' · ' : null}
                {activeExpense.lastEditedByFamilyId ? (
                  <span>수정: <span className="font-bold text-[#C9D1D9]">{getFamilyLabel(doc.families, activeExpense.lastEditedByFamilyId)}</span></span>
                ) : null}
              </div>
            ) : null}

            <div className="mb-6 grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8B949E]">Expense title</span>
                  <input
                    value={activeExpense.title || ''}
                    onChange={(event) => onUpdateExpenseFields(activeExpense.id, { title: event.target.value })}
                    className="border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8B949E]">Payer</span>
                  <div className="grid gap-2">
                    <select
                      value={payerMode}
                      onChange={(event) => {
                        const value = event.target.value
                        if (value === '__custom__') {
                          onUpdateExpenseFields(activeExpense.id, { payer: customPayerDraft || activeExpense.payer || '' })
                          return
                        }
                        onUpdateExpenseFields(activeExpense.id, { payer: value })
                      }}
                      className="border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
                    >
                      {payerOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      <option value="__custom__">Custom...</option>
                    </select>
                    {payerMode === '__custom__' ? (
                      <input
                        value={customPayerDraft}
                        onChange={(event) => setCustomPayerDraft(event.target.value)}
                        onBlur={() => onUpdateExpenseFields(activeExpense.id, { payer: customPayerDraft.trim() || '미지정' })}
                        placeholder="결제자 직접 입력"
                        className="border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
                      />
                    ) : null}
                  </div>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8B949E]">Amount</span>
                  <input
                    inputMode="decimal"
                    value={amountDraft}
                    onChange={(event) => setAmountDraft(event.target.value)}
                    onBlur={commitAmountDraft}
                    onFocus={(event) => event.target.select()}
                    placeholder="0"
                    className="border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
                  />
                </label>
                <div className="grid gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8B949E]">Settlement</span>
                  <button
                    type="button"
                    onClick={() => onToggleExpenseSettled(activeExpense.id)}
                    className={cn(
                      'border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-left',
                      activeExpense.settled
                        ? 'border-[#3FB950]/30 bg-[#3FB950]/10 text-[#3FB950]'
                        : 'border-[#D29922]/30 bg-[#D29922]/10 text-[#D29922]',
                    )}
                  >
                    {activeExpense.settled ? 'Settled' : 'Open'}
                  </button>
                </div>
              </div>

              <div className="border border-[#30363D] bg-[#161b22] p-4">
                <SectionTitle eyebrow="분담 방식" title="가족별 부담" meta={EXPENSE_SPLIT_LABELS[activeExpense.allocationMode] || activeExpense.split} />
                <div className="mb-4 flex flex-wrap gap-2">
                  {[
                    { id: 'equal', label: '균등 분할' },
                    { id: 'manual', label: '수동 배분' },
                    { id: 'individual', label: '개별 부담' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => onSetExpenseAllocationMode(activeExpense.id, mode.id)}
                      className={cn(
                        'border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em]',
                        activeExpense.allocationMode === mode.id
                          ? 'border-[#58A6FF]/50 bg-[#58A6FF]/12 text-[#C9D1D9]'
                          : 'border-[#30363D] bg-[#0d1117] text-[#8B949E]',
                      )}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {activeExpense.allocationMode === 'individual' ? (
                  <div className="text-[11px] leading-relaxed text-[#8B949E]">
                    This cost is marked as family-specific, so it does not contribute to shared reimbursement totals.
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {activeAllocations.map((allocation) => (
                      <div
                        key={allocation.familyId}
                        className="grid grid-cols-[minmax(0,1fr)_132px] items-center gap-3 border border-[#30363D]/60 bg-[#0d1117] px-3 py-3"
                      >
                        <div>
                          <div className="text-[11px] font-bold text-[#C9D1D9]">{allocation.title}</div>
                          <div className="text-[10px] text-[#8B949E]">
                            {activeExpense.allocationMode === 'equal' ? 'Auto-calculated share' : 'Assigned share'}
                          </div>
                        </div>
                        {activeExpense.allocationMode === 'manual' ? (
                          <input
                            inputMode="decimal"
                            value={manualAllocationDrafts[allocation.familyId] ?? ''}
                            onChange={(event) =>
                              setManualAllocationDrafts((current) => ({
                                ...current,
                                [allocation.familyId]: event.target.value,
                              }))
                            }
                            onBlur={() => commitManualAllocationDraft(allocation.familyId)}
                            onFocus={(event) => event.target.select()}
                            placeholder="0"
                            className="border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
                          />
                        ) : (
                          <div className="text-right text-[12px] font-black text-[#C9D1D9]">{formatCurrency(allocation.amount)}</div>
                        )}
                      </div>
                    ))}

                    {activeExpense.allocationMode === 'manual' ? (
                      <>
                        <div className="mt-2 flex items-center justify-between border border-[#30363D]/60 bg-[#0d1117] px-3 py-3">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8B949E]">Manual total</div>
                            <div className="text-[12px] font-bold text-[#C9D1D9]">
                              {formatCurrency(manualAllocatedTotal)} / {formatCurrency(activeExpense.amount)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onResetExpenseAllocationsToEqual(activeExpense.id)}
                            className="border border-[#30363D] bg-[#161b22] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#C9D1D9]"
                          >
                            균등 분할로 초기화
                          </button>
                        </div>
                        {Math.abs(allocationDelta) > 0.009 ? (
                          <div className="border border-[#D29922]/30 bg-[#D29922]/10 px-3 py-2 text-[11px] text-[#D29922]">
                            {allocationDelta > 0
                              ? `${formatCurrency(allocationDelta)} 아직 미배정.`
                              : `${formatCurrency(Math.abs(allocationDelta))} 초과 배정. 가족별 금액을 조정해주세요.`}
                          </div>
                        ) : (
                          <div className="border border-[#3FB950]/30 bg-[#3FB950]/10 px-3 py-2 text-[11px] text-[#3FB950]">
                            수동 배분 금액이 합계와 정확히 일치합니다.
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>

              <label className="grid gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8B949E]">Expense note</span>
                <textarea
                  value={activeExpense.note || ''}
                  onChange={(event) => onUpdateExpenseFields(activeExpense.id, { note: event.target.value })}
                  rows={4}
                  className="border border-[#30363D] bg-[#161b22] px-3 py-2 text-[11px] leading-relaxed text-[#C9D1D9] outline-none focus:border-[#58A6FF]"
                />
              </label>
            </div>
          </>
        ) : null}

        <div className="mb-6 border border-[#30363D] bg-[#161b22] p-4">
          <SectionTitle eyebrow="공동 부담" title="가족별 비용" />
          <div className="grid gap-2">
            {familyBurden.map((entry) => (
              <div
                key={entry.familyId}
                className="flex items-center justify-between border border-[#30363D]/60 bg-[#0d1117] px-3 py-2"
              >
                <div className="text-[11px] font-bold text-[#C9D1D9]">{entry.title}</div>
                <div className="text-[12px] font-black text-[#C9D1D9]">{formatCurrency(entry.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        <PageNotesCard
          title="비용 메모"
          value={getPageNote(doc, 'expenses')}
          onChange={(value) => onUpdatePageNote('expenses', value)}
          onConvert={() => onConvertPageNote('expenses')}
          placeholder="분담 가정, 현금 항목, 여행 후 정산 사항 등 기록..."
        />
      </div>
    </div>
  )
}

function FamiliesPage({ doc, selection, onSelectEntity, onUpdatePageNote, onConvertPageNote }) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[360px_1fr] overflow-hidden">
      <div className="overflow-y-auto border-r border-[#30363D] bg-[#161b22] p-6">
        <SectionTitle eyebrow="이동 가족" title="가족 현황" />
        <FamilyList doc={doc} selection={selection} onSelectEntity={onSelectEntity} />
        <div className="mt-5">
          <PageNotesCard
            title="가족 메모"
            value={getPageNote(doc, 'families')}
            onChange={(value) => onUpdatePageNote('families', value)}
            onConvert={() => onConvertPageNote('families')}
            placeholder="가족 간 협조 세부 사항 기록..."
          />
        </div>
      </div>

      <div className="overflow-y-auto bg-[#0d1117] p-6">
        <SectionTitle eyebrow="준비 현황" title="가족별 할 일" />
        {doc.families.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="text-[#30363D]">
              <Users size={48} strokeWidth={1} />
            </div>
            <div className="text-[14px] font-bold text-[#C9D1D9]">아직 등록된 가족이 없어요</div>
            <div className="text-[12px] text-[#8B949E]">아래 버튼을 눌러 첫 번째 가족을 추가하세요</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {doc.families.map((family) => {
              const tasks = getTasksByFamily(doc, family.id)
              const readiness = getFamilyReadiness(doc, family.id)
              return (
                <SelectableCard
                  key={family.id}
                  selected={selection.type === 'family' && selection.id === family.id}
                  onClick={() => onSelectEntity('family', family.id)}
                  className="p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-black uppercase tracking-widest text-[#C9D1D9]">{family.title}</div>
                      <div className="text-[10px] text-[#8B949E]">{family.origin}</div>
                    </div>
                    <StatusPill tone={family.status}>{family.status}</StatusPill>
                  </div>
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full border border-[#30363D]/30 bg-[#0d1117]">
                    <div
                      className="h-full bg-[#58A6FF] shadow-[0_0_8px_rgba(88,166,255,0.4)]"
                      style={{ width: `${readiness}%` }}
                    />
                  </div>
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-[#C9D1D9]">{task.title}</span>
                        <span className={task.status === 'done' ? 'text-[#3FB950]' : 'text-[#D29922]'}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </SelectableCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function FamiliesWorkspacePage({
  doc,
  tripMeta,
  selection,
  currentFamilyId,
  onSelectEntity,
  onSetActiveFamily,
  onUpdatePageNote,
  onConvertPageNote,
  onUpdateTripMeta,
  onUpdateFamilyFields,
  onAddFamily,
}) {
  const selectedFamily =
    doc.families.find((family) => selection.type === 'family' && selection.id === family.id) || doc.families[0] || null
  const familyTasks = selectedFamily ? getTasksByFamily(doc, selectedFamily.id) : []
  const readiness = selectedFamily ? getFamilyReadiness(doc, selectedFamily.id) : 0
  const tripProfile = tripMeta || doc.tripMeta || {}
  const statusOptions = [...new Set([
    selectedFamily?.status,
    'Pending',
    'Transit',
    'Assigned',
    'Go',
    'Watch',
  ].filter(Boolean))].map((value) => ({ value, label: value }))
  const dayOptions = DAYS.map((day) => ({
    value: day.id,
    label: `${day.shortLabel} - ${day.title}`,
  }))

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[380px_1fr] overflow-hidden">
      <div className="overflow-y-auto border-r border-[#30363D] bg-[#161b22] p-6">
        <SectionTitle eyebrow="여행 설정" title="여행 정보" />
        <div className="space-y-4 border border-[#30363D] bg-[#0d1117] p-4">
          <div>
            <FieldLabel>Trip title</FieldLabel>
            <TextField
              value={tripProfile.title || ''}
              onChange={(value) => onUpdateTripMeta({ title: value })}
              placeholder="여행 제목 입력"
            />
          </div>
          <div>
            <FieldLabel>Trip dates</FieldLabel>
            <TextField
              value={tripProfile.subtitle || ''}
              onChange={(value) => onUpdateTripMeta({ subtitle: value })}
              placeholder="8월 15일 - 8월 17일"
            />
          </div>
          <div>
            <FieldLabel>Header name</FieldLabel>
            <TextField
              value={tripProfile.commandName || ''}
              onChange={(value) => onUpdateTripMeta({ commandName: value })}
              placeholder="여행매니저"
            />
          </div>
        </div>

        <div className="mt-6">
          <SectionTitle eyebrow="이동 가족" title="가족 현황" meta={`${doc.families.length} families`} />
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={onAddFamily}
              className="border border-[#30363D] bg-[#0d1117] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#C9D1D9] transition-colors hover:border-[#58A6FF]/40 hover:text-[#58A6FF]"
            >
              가족 추가
            </button>
          </div>
          <FamilyList doc={doc} selection={selection} onSelectEntity={onSelectEntity} />
        </div>

        <div className="mt-5">
          <PageNotesCard
            title="가족 메모"
            value={getPageNote(doc, 'families')}
            onChange={(value) => onUpdatePageNote('families', value)}
            onConvert={() => onConvertPageNote('families')}
            placeholder="인원 변경, 도착 예상, 공유 메모 등을 입력하세요..."
          />
        </div>
      </div>

      <div className="overflow-y-auto bg-[#0d1117] p-6">
        {selectedFamily ? (
          <div className="space-y-5">
            <div className="border border-[#30363D] bg-[#161b22] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#58A6FF]">
                    Family editor
                  </div>
                  <div className="mt-2 text-[22px] font-black uppercase tracking-[0.08em] text-[#E6EDF3]">
                    {selectedFamily.title}
                  </div>
                  <div className="mt-2 text-[12px] text-[#8B949E]">
                    Update who is going, when they arrive, and what this family owns.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedFamily.id === currentFamilyId ? (
                    <div className="border border-[#58A6FF]/40 bg-[#58A6FF]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#C9D1D9]">
                      Active editor profile
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSetActiveFamily(selectedFamily.id)}
                      className="border border-[#30363D] bg-[#0d1117] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#C9D1D9] transition-colors hover:border-[#58A6FF]/40 hover:text-[#58A6FF]"
                    >
                      Use as editor profile
                    </button>
                  )}
                  <StatusPill tone={selectedFamily.status}>{selectedFamily.status}</StatusPill>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <StatTile label="인원" value={getFamilyHeadcountLabel(selectedFamily)} tone="accent" />
                <StatTile label="준비도" value={`${readiness}%`} tone={readiness >= 80 ? 'success' : 'default'} />
                <StatTile label="미완료" value={`${familyTasks.filter((task) => task.status !== 'done').length}`} />
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <div className="border border-[#30363D] bg-[#161b22] p-5">
                  <SectionTitle eyebrow="구성원" title="가족 상세" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Family label</FieldLabel>
                      <TextField
                        value={selectedFamily.title || ''}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { title: value, name: value })}
                        placeholder="홍씨 가족"
                      />
                    </div>
                    <div>
                      <FieldLabel>Short tag</FieldLabel>
                      <TextField
                        value={selectedFamily.shortOrigin || ''}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { shortOrigin: value })}
                        placeholder="서울"
                      />
                    </div>
                    <div>
                      <FieldLabel>Origin city</FieldLabel>
                      <TextField
                        value={selectedFamily.origin || ''}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { origin: value })}
                        placeholder="서울"
                      />
                    </div>
                    <div>
                      <FieldLabel>Origin detail</FieldLabel>
                      <TextField
                        value={selectedFamily.originAddress || ''}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { originAddress: value })}
                        placeholder="공항 픽업 또는 출발 동네"
                      />
                    </div>
                    <div>
                      <FieldLabel>Arrival day</FieldLabel>
                      <SelectField
                        value={selectedFamily.arrivalDayId || dayOptions[0]?.value || 'thu'}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { arrivalDayId: value })}
                        options={dayOptions}
                      />
                    </div>
                    <div>
                      <FieldLabel>ETA</FieldLabel>
                      <TextField
                        value={selectedFamily.eta || ''}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { eta: value })}
                        placeholder="2:00 PM"
                      />
                    </div>
                    <div>
                      <FieldLabel>Vehicle</FieldLabel>
                      <TextField
                        value={selectedFamily.vehicle || ''}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { vehicle: value })}
                        placeholder="렌터카"
                      />
                    </div>
                    <div>
                      <FieldLabel>Call sign</FieldLabel>
                      <TextField
                        value={selectedFamily.vehicleLabel || ''}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { vehicleLabel: value })}
                        placeholder="차량 1"
                      />
                    </div>
                    <div>
                      <FieldLabel>Adults</FieldLabel>
                      <NumberField
                        value={selectedFamily.adults ?? 0}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { adults: value })}
                      />
                    </div>
                    <div>
                      <FieldLabel>Children</FieldLabel>
                      <NumberField
                        value={selectedFamily.children ?? 0}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { children: value })}
                      />
                    </div>
                    <div>
                      <FieldLabel>Status</FieldLabel>
                      <SelectField
                        value={selectedFamily.status || statusOptions[0]?.value || 'Pending'}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { status: value })}
                        options={statusOptions}
                      />
                    </div>
                    <div>
                      <FieldLabel meta={getFamilyHeadcountLabel(selectedFamily)}>Task owner</FieldLabel>
                      <TextField
                        value={selectedFamily.responsibility || ''}
                        onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { responsibility: value })}
                        placeholder="간식, 유모차, 체크인 담당 등"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <FieldLabel>Route summary</FieldLabel>
                    <NotesBox
                      value={selectedFamily.routeSummary || ''}
                      onChange={(value) => onUpdateFamilyFields(selectedFamily.id, { routeSummary: value })}
                      placeholder="도착 계획 및 경유지 메모를 입력하세요..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="border border-[#30363D] bg-[#161b22] p-5">
                  <SectionTitle eyebrow="체크리스트" title="가족 할 일" meta={`${familyTasks.length} linked`} />
                  {familyTasks.length ? (
                    <div className="space-y-2">
                      {familyTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between border border-[#30363D] bg-[#0d1117] px-3 py-2 text-[11px]"
                        >
                          <span className="text-[#C9D1D9]">{task.title}</span>
                          <span className={task.status === 'done' ? 'text-[#3FB950]' : 'text-[#D29922]'}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] leading-relaxed text-[#8B949E]">
                      No tasks are directly assigned yet. You can still update the family profile now and add tasks from the inspector later.
                    </div>
                  )}
                </div>

                <div className="border border-[#30363D] bg-[#161b22] p-5">
                  <SectionTitle eyebrow="요약" title="저장 내용 확인" />
                  <div className="space-y-2 text-[11px] leading-relaxed text-[#8B949E]">
                    <div>Trip title, dates, and header name save automatically to local storage.</div>
                    <div>Adults and children update the family headcount immediately.</div>
                    <div>Arrival, vehicle, and responsibility changes stay after refresh.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="text-[#30363D]">
              <Users size={48} strokeWidth={1} />
            </div>
            <div className="text-[14px] font-bold text-[#C9D1D9]">아직 등록된 가족이 없어요</div>
            <div className="text-[12px] text-[#8B949E]">아래 버튼을 눌러 첫 번째 가족을 추가하세요</div>
          </div>
        )}
      </div>
    </div>
  )
}

function withRefreshedFamilies(nextDoc) {
  return {
    ...nextDoc,
    families: nextDoc.families.map((family) => ({
      ...family,
      readiness: getFamilyReadiness(nextDoc, family.id),
    })),
  }
}

function App() {
  const [doc, setDoc] = usePersistedTripState(TRIP_DOCUMENT_STORAGE_KEY, getInitialTripDocument())
  const [viewerProfile, setViewerProfile] = usePersistedTripState(VIEWER_PROFILE_STORAGE_KEY, { familyId: null })
  const visibilityMode = PUBLISH_CONFIG.visibilityMode
  const liveExternalData = isLiveExternalDataEnabled()
  const displayDoc = useMemo(() => projectTripDocument(doc, visibilityMode), [doc, visibilityMode])
  const locationIntelHydrationRef = useRef(new Set())
  const startupTimelineSyncRef = useRef(false)
  const [weatherState, setWeatherState] = useState({
    status: 'loading',
    targets: {},
    updatedAt: null,
    error: null,
  })

  const selection = displayDoc.selection
  const currentFamily = displayDoc.families.find((family) => family.id === viewerProfile?.familyId) || null
  const currentFamilyId = currentFamily?.id || null
  const tripMeta = displayDoc.tripMeta || {}
  const selectedEntity = getEntityBySelection(displayDoc, selection)
  const selectedLocation = getLocationForEntity(displayDoc, selectedEntity)
  const selectedRoute = getRouteForEntity(displayDoc, selectedEntity)

  useEffect(() => {
    clearLegacyTripStorage()
  }, [])

  const setActiveFamilyProfile = useCallback((familyId) => {
    setViewerProfile({ familyId })
  }, [setViewerProfile])

  const updateTripMeta = useCallback((patch) => {
    setDoc((current) => ({
      ...current,
      tripMeta: {
        ...(current.tripMeta || {}),
        ...patch,
      },
    }))
  }, [setDoc])

  const updateFamilyFields = useCallback((familyId, patch) => {
    if (!familyId || !patch) return

    setDoc((current) => {
      const nextFamilies = current.families.map((family) => {
        if (family.id !== familyId) return family

        const adults = toWholeNumber(
          Object.prototype.hasOwnProperty.call(patch, 'adults') ? patch.adults : family.adults,
          family.adults ?? 0,
        )
        const children = toWholeNumber(
          Object.prototype.hasOwnProperty.call(patch, 'children') ? patch.children : family.children,
          family.children ?? 0,
        )
        const nextTitle = Object.prototype.hasOwnProperty.call(patch, 'title') ? patch.title : family.title
        const nextOrigin = Object.prototype.hasOwnProperty.call(patch, 'origin') ? patch.origin : family.origin

        return stampFamilyMetadata({
          ...family,
          ...patch,
          title: nextTitle,
          name: Object.prototype.hasOwnProperty.call(patch, 'name') ? patch.name : nextTitle,
          shortOrigin:
            Object.prototype.hasOwnProperty.call(patch, 'shortOrigin')
              ? patch.shortOrigin
              : family.shortOrigin || nextOrigin,
          origin: nextOrigin,
          adults,
          children,
          headcount: formatFamilyHeadcount({ adults, children }),
        }, currentFamilyId)
      })

      return withRefreshedFamilies({
        ...current,
        families: nextFamilies,
      })
    })
  }, [currentFamilyId, setDoc])

  const addFamily = useCallback(() => {
    const familyId = `family-user-${Date.now()}`
    const newFamily = stampFamilyMetadata({
      id: familyId,
      type: 'family',
      title: '새 가족',
      name: '새 가족',
      shortOrigin: '미정',
      origin: '미정',
      originAddress: '',
      originCoordinates: null,
      arrivalDayId: DAYS[0]?.id || 'thu',
      eta: '',
      driveTime: '',
      adults: 2,
      children: 0,
      headcount: formatFamilyHeadcount({ adults: 2, children: 0 }),
      vehicle: '',
      vehicleLabel: '',
      responsibility: '',
      readiness: 100,
      status: '대기',
      routeSummary: '이동 계획 미정',
      plannedStopIds: [],
      taskIds: [],
      linkedEntityKeys: [],
      note: '',
      isCustom: true,
    }, currentFamilyId)

    setDoc((current) => withRefreshedFamilies({
      ...current,
      selectedPage: 'families',
      selection: { type: 'family', id: familyId },
      families: [...current.families, newFamily],
    }))
    setViewerProfile({ familyId })
  }, [currentFamilyId, setDoc, setViewerProfile])

  useEffect(() => {
    if (startupTimelineSyncRef.current) return
    startupTimelineSyncRef.current = true

    const nowCursor = getCurrentTripCursor()
    setDoc((current) => ({
      ...current,
      ui: {
        ...current.ui,
        timeline: {
          ...current.ui.timeline,
          cursorSlot: nowCursor,
        },
        map: {
          ...current.ui.map,
          focusFamilyId: 'all',
          focusDayId: 'all',
        },
      },
    }))
  }, [setDoc])

  useEffect(() => {
    const jiangRoute = doc.routes.find((route) => route.id === 'route-la-north-star')
    const jiangFamily = doc.families.find((family) => family.id === 'north-star')
    const yosemiteLocation = doc.locations.find((location) => location.id === 'yosemite')
    const missingStopLocations = JIANG_ROAD_TRIP_STOP_DEFAULTS.filter(
      (stop) => !doc.locations.some((location) => location.id === stop.id),
    )

    const needsRouteStops = jiangRoute && !jiangRoute.stopLocationIds?.length
    const needsFamilyStops = jiangFamily && !jiangFamily.plannedStopIds?.length
    const needsVehicleFamilyBackfill = doc.families.some((family) => {
      const defaults = FAMILY_VEHICLE_DEFAULTS[family.id]
      if (!defaults) return false
      return (
        !family.originAddress ||
        !family.originCoordinates ||
        !family.vehicleLabel ||
        (defaults.plannedStopIds?.length && !family.plannedStopIds?.length)
      )
    })
    const needsVehicleRouteBackfill = doc.routes.some((route) => {
      const defaults = ROUTE_SIM_DEFAULTS[route.id]
      if (!defaults) return false
      return (
        ('simulationStartSlot' in defaults && route.simulationStartSlot == null) ||
        ('simulationEndSlot' in defaults && route.simulationEndSlot == null) ||
        ('durationSeconds' in defaults && route.durationSeconds == null) ||
        ('originCoordinates' in defaults && !route.originCoordinates) ||
        ('destinationLocationId' in defaults && !route.destinationLocationId) ||
        ('stopLocationIds' in defaults && !Array.isArray(route.stopLocationIds))
      )
    })
    const needsYosemiteBackfill =
      yosemiteLocation &&
      (
        yosemiteLocation.title !== YOSEMITE_ROUTE_DEFAULTS.title ||
        yosemiteLocation.placesQuery !== YOSEMITE_ROUTE_DEFAULTS.placesQuery ||
        yosemiteLocation.coordinates?.lat !== YOSEMITE_ROUTE_DEFAULTS.coordinates.lat ||
        yosemiteLocation.coordinates?.lng !== YOSEMITE_ROUTE_DEFAULTS.coordinates.lng
      )

    if (
      !needsRouteStops &&
      !needsFamilyStops &&
      !missingStopLocations.length &&
      !needsVehicleFamilyBackfill &&
      !needsVehicleRouteBackfill &&
      !needsYosemiteBackfill
    ) {
      return
    }

    setDoc((current) => {
      const nextLocations = [
        ...current.locations,
        ...JIANG_ROAD_TRIP_STOP_DEFAULTS.filter(
          (stop) => !current.locations.some((location) => location.id === stop.id),
        ),
      ].map((location) =>
        location.id === 'yosemite'
          ? {
              ...location,
              ...YOSEMITE_ROUTE_DEFAULTS,
            }
          : location,
      )
      const nextFamilies = current.families.map((family) => {
        const defaults = FAMILY_VEHICLE_DEFAULTS[family.id]
        if (!defaults && family.id !== 'north-star') return family

        return {
          ...family,
          originAddress: family.originAddress || defaults?.originAddress,
          originCoordinates: family.originCoordinates || defaults?.originCoordinates,
          vehicleLabel: family.vehicleLabel || defaults?.vehicleLabel,
          plannedStopIds: family.plannedStopIds?.length ? family.plannedStopIds : defaults?.plannedStopIds || family.plannedStopIds,
          routeSummary: family.routeSummary || defaults?.routeSummary || family.routeSummary,
        }
      })

      const nextRoutes = synchronizeRoutePaths(
        current.routes.map((route) => {
          const defaults = ROUTE_SIM_DEFAULTS[route.id]
          if (!defaults) return route

          return {
            ...route,
            originCoordinates: route.originCoordinates || defaults.originCoordinates || route.path?.[0],
            path:
              route.path?.length > 1 && defaults.originCoordinates
                ? [route.originCoordinates || defaults.originCoordinates, ...route.path.slice(1)]
                : route.path,
            stopLocationIds:
              Array.isArray(route.stopLocationIds)
                ? route.stopLocationIds
                : defaults.stopLocationIds ?? route.stopLocationIds,
            destinationLocationId: route.destinationLocationId || defaults.destinationLocationId || route.destinationLocationId,
            simulationStartSlot:
              'simulationStartSlot' in defaults
                ? route.simulationStartSlot ?? defaults.simulationStartSlot
                : route.simulationStartSlot,
            simulationEndSlot:
              'simulationEndSlot' in defaults
                ? route.simulationEndSlot ?? defaults.simulationEndSlot
                : route.simulationEndSlot,
            durationSeconds:
              'durationSeconds' in defaults
                ? route.durationSeconds ?? defaults.durationSeconds
                : route.durationSeconds,
            simulationMilestones:
              'simulationMilestones' in defaults
                ? route.simulationMilestones?.length ? route.simulationMilestones : defaults.simulationMilestones
                : route.simulationMilestones,
          }
        }),
        nextLocations,
      )

      return {
        ...current,
        locations: nextLocations,
        families: nextFamilies,
        routes: nextRoutes,
      }
    })
  }, [doc.families, doc.locations, doc.routes, setDoc])

  const searchResults = useMemo(
    () => getSearchResults(displayDoc, displayDoc.ui.searchQuery),
    [displayDoc],
  )
  const timelineWeatherDays = useMemo(
    () => DAYS.map((day) => ({ ...day, ...getTripDayWeather(weatherState.targets, day) })),
    [weatherState.targets],
  )
  const mapWeather = useMemo(
    () => getMapWeather(weatherState.targets, doc.ui.map.focusDayId),
    [doc.ui.map.focusDayId, weatherState.targets],
  )
  const mapWeatherTargets = useMemo(
    () => getMapWeatherTargets(weatherState.targets, doc.ui.map.focusDayId),
    [doc.ui.map.focusDayId, weatherState.targets],
  )

  const setSelectedPage = useCallback((pageId) => {
    setDoc((current) => ({
      ...current,
      selectedPage: pageId,
      selection: ensureSelectionForPage(current, pageId),
      ui: {
        ...current.ui,
        searchQuery: '',
      },
    }))
  }, [setDoc])

  const selectEntity = useCallback((type, id) => {
    setDoc((current) => {
      if (current.selection?.type === type && current.selection?.id === id && current.ui.searchQuery === '') {
        return current
      }

      return {
        ...current,
        selection: { type, id },
        ui: { ...current.ui, searchQuery: '' },
      }
    })
  }, [setDoc])

  const openEntity = useCallback((type, id) => {
    setDoc((current) => ({
      ...current,
      selection: { type, id },
      ui: { ...current.ui, searchQuery: '' },
    }))
  }, [setDoc])

  const hydrateLocationDetails = useCallback((locationId, patch) => {
    if (!locationId || !patch) return

    setDoc((current) => {
      let changed = false
      const locations = current.locations.map((location) => {
        if (location.id !== locationId) return location

        const nextLocation = {
          ...location,
          ...patch,
        }

        if (JSON.stringify(nextLocation) !== JSON.stringify(location)) {
          changed = true
        }

        return nextLocation
      })

      if (!changed) return current

      return {
        ...current,
        locations,
        routes: synchronizeRoutePaths(current.routes, locations),
      }
    })
  }, [setDoc])

  const hydrateRouteDetails = useCallback((routeId, patch) => {
    if (!routeId || !patch) return

    setDoc((current) => {
      let changed = false
      const routes = current.routes.map((route) => {
        if (route.id !== routeId) return route

        const nextRoute = {
          ...route,
          ...patch,
        }

        if (JSON.stringify(nextRoute) !== JSON.stringify(route)) {
          changed = true
        }

        return nextRoute
      })

      if (!changed) return current

      return {
        ...current,
        routes,
      }
    })
  }, [setDoc])

  const updateLocationFields = useCallback((locationId, patch) => {
    setDoc((current) => {
      const locations = current.locations.map((location) =>
        location.id === locationId ? stampFamilyMetadata({ ...location, ...patch }, currentFamilyId) : location,
      )

      return {
        ...current,
        locations,
        routes: synchronizeRoutePaths(current.routes, locations),
      }
    })
  }, [currentFamilyId, setDoc])

  useEffect(() => {
    if (!liveExternalData) return
    if (!GOOGLE_MAPS_API_KEY) return

    const basecampLocation = doc.locations.find((location) => location.id === 'pine-airbnb')
    const pendingPlaceLocations = doc.locations.filter((location) => {
      if (!location.placesQuery) return false

      const needsPlaceMatch = location.placesQuery && !location.placeId
      const needsPlaceDetails = location.placeId && !location.websiteUrl && !location.phoneNumber && !location.rating
      const needsDriveProfile =
        location.category === 'meal' &&
        location.id !== 'pine-airbnb' &&
        basecampLocation?.coordinates &&
        !location.basecampDrive

      return (needsPlaceMatch || needsPlaceDetails || needsDriveProfile) && !locationIntelHydrationRef.current.has(location.id)
    })

    if (!pendingPlaceLocations.length) return

    let cancelled = false

    async function hydrateMealIntel() {
      try {
        if (!window.__tripCommandCenterMapsConfigured) {
          setOptions({
            key: GOOGLE_MAPS_API_KEY,
            version: 'weekly',
            mapIds: GOOGLE_MAP_ID ? [GOOGLE_MAP_ID] : undefined,
          })
          window.__tripCommandCenterMapsConfigured = true
        }

        await importLibrary('maps')
        await importLibrary('places')
        const google = window.google
        if (cancelled || !google) return

        const placesContainer = document.createElement('div')
        const placesService = SKIP_DEPRECATED_GOOGLE_PLACES_IN_DEV
          ? null
          : new google.maps.places.PlacesService(placesContainer)
        const directionsService = SKIP_DEPRECATED_GOOGLE_ROUTING_IN_DEV
          ? null
          : new google.maps.DirectionsService()

        const findPlaceMatch = (location) =>
          new Promise((resolve, reject) => {
            if (!location.placesQuery || location.placeId) {
              resolve(null)
              return
            }

            if (SKIP_DEPRECATED_GOOGLE_PLACES_IN_DEV) {
              resolve(null)
              return
            }

            placesService.findPlaceFromQuery(
              {
                query: location.placesQuery,
                fields: ['name', 'formatted_address', 'geometry', 'place_id'],
              },
              (results, status) => {
                if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.length) {
                  reject(new Error(`Place match failed for ${location.id}: ${status}`))
                  return
                }
                resolve(results[0])
              },
            )
          })

        const fetchPlaceDetails = (placeId) =>
          new Promise((resolve, reject) => {
            if (!placeId) {
              resolve(null)
              return
            }

            if (SKIP_DEPRECATED_GOOGLE_PLACES_IN_DEV) {
              resolve(null)
              return
            }

            placesService.getDetails(
              {
                placeId,
                fields: ['formatted_phone_number', 'website', 'rating', 'user_ratings_total', 'opening_hours', 'photos'],
              },
              (result, status) => {
                if (status !== google.maps.places.PlacesServiceStatus.OK || !result) {
                  reject(new Error(`Place details failed for ${placeId}: ${status}`))
                  return
                }
                resolve(result)
              },
            )
          })

        const fetchDriveProfile = (origin, destination) =>
          new Promise((resolve, reject) => {
            if (!origin || !destination) {
              resolve(null)
              return
            }

            if (SKIP_DEPRECATED_GOOGLE_ROUTING_IN_DEV) {
              resolve(null)
              return
            }

            directionsService.route(
              {
                origin,
                destination,
                travelMode: google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: false,
              },
              (result, status) => {
                if (status !== 'OK' || !result?.routes?.length) {
                  reject(new Error(`Drive profile failed: ${status}`))
                  return
                }

                const leg = result.routes[0]?.legs?.[0]
                resolve(
                  leg
                    ? {
                        distanceText: leg.distance?.text || '',
                        distanceMeters: leg.distance?.value || 0,
                        durationText: leg.duration?.text || '',
                        durationSeconds: leg.duration?.value || 0,
                      }
                    : null,
                )
              },
            )
          })

        for (const location of pendingPlaceLocations) {
          locationIntelHydrationRef.current.add(location.id)

          try {
            const matchedPlace = await findPlaceMatch(location)
            if (cancelled) return

            const coordinates = matchedPlace?.geometry?.location
              ? {
                  lat: matchedPlace.geometry.location.lat(),
                  lng: matchedPlace.geometry.location.lng(),
                }
              : location.coordinates
            const placeId = matchedPlace?.place_id || location.placeId
            const placeDetails = placeId ? await fetchPlaceDetails(placeId) : null
            if (cancelled) return

            const livePhotos = (placeDetails?.photos || []).slice(0, 3).map((photo, index) => ({
              id: `${location.id}-live-photo-${index + 1}`,
              label: index === 0 ? 'Live venue photo' : `Venue photo ${index + 1}`,
              imageUrl: photo.getUrl({ maxWidth: 900 }),
              sourceUrl: placeId ? `https://www.google.com/maps/place/?q=place_id:${placeId}` : location.externalUrl,
            }))

            let basecampDrive = location.basecampDrive
            if (location.category === 'meal' && basecampLocation?.coordinates && !basecampDrive) {
              try {
                basecampDrive = await fetchDriveProfile(basecampLocation.coordinates, coordinates)
              } catch {
                basecampDrive = location.basecampDrive
              }
            }

            hydrateLocationDetails(location.id, {
              title: matchedPlace?.name || location.title,
              address: matchedPlace?.formatted_address || location.address,
              coordinates,
              placeId,
              externalUrl: placeId ? `https://www.google.com/maps/place/?q=place_id:${placeId}` : location.externalUrl,
              phoneNumber: placeDetails?.formatted_phone_number || location.phoneNumber,
              websiteUrl: placeDetails?.website || location.websiteUrl,
              rating: placeDetails?.rating || location.rating,
              userRatingsTotal: placeDetails?.user_ratings_total || location.userRatingsTotal,
              openingHours: placeDetails?.opening_hours?.weekday_text || location.openingHours,
              livePhotos: livePhotos.length ? livePhotos : location.livePhotos,
              basecampDrive,
            })
          } catch {
            // Keep fallback meal intel if Google data is unavailable.
          } finally {
            locationIntelHydrationRef.current.delete(location.id)
          }
        }
      } catch {
        // Keep seeded meal data if Google libraries fail to load.
      }
    }

    hydrateMealIntel()

    return () => {
      cancelled = true
    }
  }, [doc.locations, hydrateLocationDetails, liveExternalData])

  useEffect(() => {
    if (!liveExternalData) {
      setWeatherState({
        status: 'idle',
        targets: {},
        updatedAt: null,
        error: null,
      })
      return
    }

    const basecamp = doc.locations.find((location) => location.id === 'pine-airbnb')
    const yosemite = doc.locations.find((location) => location.id === 'yosemite')
    if (!basecamp?.coordinates || !yosemite?.coordinates) return

    let cancelled = false

    const loadWeather = async () => {
      try {
        const [basecampBundle, yosemiteBundle] = await Promise.all([
          fetchWeatherBundle({ label: 'Groveland Basecamp', coordinates: basecamp.coordinates }),
          fetchWeatherBundle({ label: 'Yosemite West Entrance', coordinates: yosemite.coordinates }),
        ])

        if (cancelled) return

        setWeatherState({
          status: 'ready',
          targets: {
            basecamp: basecampBundle,
            yosemite: yosemiteBundle,
          },
          updatedAt: new Date().toISOString(),
          error: null,
        })
      } catch (error) {
        if (cancelled) return
        setWeatherState((current) => ({
          ...current,
          status: 'error',
          error: error?.message || 'Weather fetch failed',
        }))
      }
    }

    loadWeather()
    const refreshId = window.setInterval(loadWeather, 10 * 60 * 1000)

    return () => {
      cancelled = true
      window.clearInterval(refreshId)
    }
  }, [doc.locations, liveExternalData])

  const updatePageNote = (pageId, value) => {
    setDoc((current) => ({
      ...current,
      pageNotes: { ...current.pageNotes, [pageId]: value },
      pageNoteMeta: {
        ...(current.pageNoteMeta || {}),
        [pageId]: currentFamilyId
          ? {
              updatedByFamilyId: currentFamilyId,
              updatedAt: new Date().toISOString(),
            }
          : current.pageNoteMeta?.[pageId],
      },
    }))
  }

  const updateEntityNote = (type, id, value) => {
    setDoc((current) => {
      const collectionName = {
        family: 'families',
        location: 'locations',
        route: 'routes',
        itineraryItem: 'itineraryItems',
        meal: 'meals',
        activity: 'activities',
        stayItem: 'stayItems',
        expense: 'expenses',
        task: 'tasks',
      }[type]
      if (!collectionName) return current
      return {
        ...current,
        [collectionName]: updateEntityInCollection(current[collectionName], id, (item) => ({
          ...stampFamilyMetadata(item, currentFamilyId),
          note: value,
        })),
      }
    })
  }

  const toggleTask = (taskId) => {
    setDoc((current) => {
      const nextDoc = {
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === taskId
            ? { ...task, status: task.status === 'done' ? 'open' : 'done' }
            : task,
        ),
      }
      return withRefreshedFamilies(nextDoc)
    })
  }

  const addTask = (entityType, entityId, title) => {
    setDoc((current) => {
      const entity = getEntityById(current, entityType, entityId)
      if (!entity || !title.trim()) return current
      const newTaskId = `task-user-${Date.now()}`
      const newTask = {
        id: newTaskId,
        type: 'task',
        title,
        dayId: entity.dayId || 'all',
        status: 'open',
        ownerFamilyId:
          entityType === 'family'
            ? entity.id
            : entity.familyIds?.length === 1
              ? entity.familyIds[0]
              : null,
        linkedEntityKeys: [makeEntityKey(entityType, entityId)],
        note: '',
      }
      const stampedTask = stampFamilyMetadata(newTask, currentFamilyId)

      const collectionName = {
        family: 'families',
        location: 'locations',
        route: 'routes',
        itineraryItem: 'itineraryItems',
        meal: 'meals',
        activity: 'activities',
        stayItem: 'stayItems',
        expense: 'expenses',
        task: 'tasks',
      }[entityType]

      const nextDoc = {
        ...current,
        tasks: [...current.tasks, stampedTask],
        [collectionName]:
          entityType === 'task'
            ? current[collectionName]
            : updateEntityInCollection(current[collectionName], entityId, (item) => ({
                ...item,
                taskIds: [...(item.taskIds || []), newTaskId],
              })),
      }

      return withRefreshedFamilies(nextDoc)
    })
  }

  const addActivity = ({ title, dayId, window, description }) => {
    if (!title?.trim()) return

    const fallbackWindow = `${getDayMeta(dayId)?.shortLabel?.toUpperCase() || dayId?.toUpperCase() || 'DAY'} / flexible`
    const newActivity = stampFamilyMetadata({
      id: `activity-user-${Date.now()}`,
      type: 'activity',
      title: title.trim(),
      dayId: dayId || 'fri',
      window: window?.trim() || fallbackWindow,
      status: 'Pending',
      riskLevel: 'Low',
      weatherSensitivity: 'Low',
      locationId: dayId === 'sun' ? 'pine-airbnb' : null,
      linkedEntityKeys: [],
      taskIds: [],
      description: description?.trim() || 'Custom activity stub. Define the actual plan, why it matters, and what the fallback looks like.',
      backup: 'If this becomes too ambitious, downgrade to the easiest nearby alternative.',
      note: '',
    }, currentFamilyId)

    setDoc((current) => ({
      ...current,
      activities: [...current.activities, newActivity],
      selection: { type: 'activity', id: newActivity.id },
    }))
  }

  const convertNoteToTask = (entityType, entityId) => {
    const entity = getEntityById(doc, entityType, entityId)
    if (!entity?.note?.trim()) return
    addTask(entityType, entityId, entity.note.trim().split('\n')[0].slice(0, 96))
  }

  const convertPageNoteToTask = (pageId) => {
    const note = getPageNote(doc, pageId)
    if (!note.trim()) return
    const pageToEntityType = {
      itinerary: 'activity',
      stay: 'stayItem',
      meals: 'meal',
      activities: 'activity',
      expenses: 'expense',
      families: 'family',
    }
    const entityType = pageToEntityType[pageId]
    const collectionName = ENTITY_PAGE[entityType] ? {
      activity: 'activities',
      stayItem: 'stayItems',
      meal: 'meals',
      expense: 'expenses',
      family: 'families',
    }[entityType] : null
    const target = collectionName ? doc[collectionName]?.[0] : null
    if (!target) return
    addTask(target.type, target.id, note.trim().split('\n')[0].slice(0, 96))
  }

  const toggleMealStatus = (mealId) => {
    setDoc((current) => ({
      ...current,
      meals: current.meals.map((meal) =>
        meal.id === mealId
          ? stampFamilyMetadata({ ...meal, status: meal.status === 'Assigned' ? 'Pending' : 'Assigned' }, currentFamilyId)
          : meal,
      ),
    }))
  }

  const toggleExpenseSettled = (expenseId) => {
    setDoc((current) => ({
      ...current,
      expenses: current.expenses.map((expense) =>
        expense.id === expenseId
          ? stampFamilyMetadata({ ...expense, settled: !expense.settled }, currentFamilyId)
          : expense,
      ),
    }))
  }

  const updateExpenseFields = (expenseId, patch) => {
    setDoc((current) => ({
      ...current,
      expenses: current.expenses.map((expense) => {
        if (expense.id !== expenseId) return expense

        const nextExpense = { ...expense, ...patch }
        if ('amount' in patch && nextExpense.allocationMode === 'equal') {
          nextExpense.allocations = {}
        }
        return stampFamilyMetadata(nextExpense, currentFamilyId)
      }),
    }))
  }

  const setExpenseAllocationMode = (expenseId, allocationMode) => {
    setDoc((current) => ({
      ...current,
      expenses: current.expenses.map((expense) => {
        if (expense.id !== expenseId) return expense

        if (allocationMode === 'manual') {
          return stampFamilyMetadata({
            ...expense,
            allocationMode,
            split: EXPENSE_SPLIT_LABELS[allocationMode],
            allocations:
              expense.allocationMode === 'manual' && expense.allocations && Object.keys(expense.allocations).length
                ? expense.allocations
                : buildManualAllocationSeed(expense.amount, current.families),
          }, currentFamilyId)
        }

        return stampFamilyMetadata({
          ...expense,
          allocationMode,
          split: EXPENSE_SPLIT_LABELS[allocationMode],
          allocations: {},
        }, currentFamilyId)
      }),
    }))
  }

  const updateExpenseAllocation = (expenseId, familyId, amount) => {
    setDoc((current) => ({
      ...current,
      expenses: current.expenses.map((expense) =>
        expense.id === expenseId
          ? stampFamilyMetadata({
              ...expense,
              allocationMode: 'manual',
              split: EXPENSE_SPLIT_LABELS.manual,
              allocations: {
                ...(expense.allocations || {}),
                [familyId]: amount,
              },
            }, currentFamilyId)
          : expense,
      ),
    }))
  }

  const resetExpenseAllocationsToEqual = (expenseId) => {
    setDoc((current) => ({
      ...current,
      expenses: current.expenses.map((expense) =>
        expense.id === expenseId
          ? stampFamilyMetadata({
              ...expense,
              allocationMode: 'manual',
              split: EXPENSE_SPLIT_LABELS.manual,
              allocations: buildManualAllocationSeed(expense.amount, current.families),
            }, currentFamilyId)
          : expense,
      ),
    }))
  }

  const addExpense = () => {
    setDoc((current) => {
      const familyLabel = getFamilyLabel(current.families, currentFamilyId)
      const newExpense = stampFamilyMetadata({
        id: `expense-user-${Date.now()}`,
        type: 'expense',
        title: '새 공동 지출',
        payer: currentFamilyId ? familyLabel : '미지정',
        amount: 0,
        split: EXPENSE_SPLIT_LABELS.equal,
        allocationMode: 'equal',
        allocations: {},
        settled: false,
        linkedEntityKeys: currentFamilyId ? [makeEntityKey('family', currentFamilyId)] : [],
        note: '',
      }, currentFamilyId)

      return {
        ...current,
        expenses: [...current.expenses, newExpense],
        selection: { type: 'expense', id: newExpense.id },
        selectedPage: 'expenses',
      }
    })
  }

  const updateMapUi = (patch) => {
    setDoc((current) => ({
      ...current,
      ui: {
        ...current.ui,
        map: { ...current.ui.map, ...patch },
      },
    }))
  }

  const setTimelineCursor = useCallback((cursorSlot) => {
    setDoc((current) => ({
      ...current,
      ui: {
        ...current.ui,
        timeline: { ...current.ui.timeline, cursorSlot: clampTimelineCursor(cursorSlot) },
      },
    }))
  }, [setDoc])

  const updateSearchQuery = (searchQuery) => {
    setDoc((current) => ({
      ...current,
      ui: { ...current.ui, searchQuery },
    }))
  }

  const resetAllData = () => {
    if (!window.confirm('모든 데이터를 초기화하고 기본값으로 되돌립니다.\n저장된 가족, 비용, 메모 등이 모두 삭제됩니다.\n계속하시겠습니까?')) return
    try {
      localStorage.removeItem('trip-command-center/v4-public')
      localStorage.removeItem('trip-command-center/viewer/v4-public')
      localStorage.removeItem('notion_config')
      localStorage.removeItem('onboarding_dismissed_v1')
    } catch {}
    window.location.reload()
  }

  const exportState = () => {
    const blob = new Blob([JSON.stringify(displayDoc, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${(tripMeta.commandName || 'family-trip-command-center').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'family-trip-command-center'}.json`
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  const pageProps = {
    doc: displayDoc,
    tripMeta,
    selection,
    currentFamily,
    currentFamilyId,
    onSelectEntity: selectEntity,
    onOpenEntity: openEntity,
    onUpdatePageNote: updatePageNote,
    onConvertPageNote: convertPageNoteToTask,
    onAddActivity: addActivity,
  }

  let content = null
  if (displayDoc.selectedPage === 'itinerary') {
    content = (
      <ItineraryPage
        {...pageProps}
        onSetCursor={setTimelineCursor}
        onUpdateMapUi={updateMapUi}
        onHydrateRouteDetails={hydrateRouteDetails}
        weatherDays={timelineWeatherDays}
        mapWeather={mapWeather}
        mapWeatherTargets={mapWeatherTargets}
      />
    )
  } else if (displayDoc.selectedPage === 'stay') {
    content = <StayPage {...pageProps} />
  } else if (displayDoc.selectedPage === 'meals') {
    content = <MealsPage {...pageProps} onToggleMealStatus={toggleMealStatus} />
  } else if (displayDoc.selectedPage === 'activities') {
    content = <ActivitiesPage {...pageProps} />
  } else if (displayDoc.selectedPage === 'expenses') {
    content = (
      <ExpensesPage
        {...pageProps}
        onToggleExpenseSettled={toggleExpenseSettled}
        onUpdateExpenseFields={updateExpenseFields}
        onSetExpenseAllocationMode={setExpenseAllocationMode}
        onUpdateExpenseAllocation={updateExpenseAllocation}
        onResetExpenseAllocationsToEqual={resetExpenseAllocationsToEqual}
        onAddExpense={addExpense}
      />
    )
  } else if (displayDoc.selectedPage === 'families') {
    content = (
      <FamiliesWorkspacePage
        {...pageProps}
        onSetActiveFamily={setActiveFamilyProfile}
        onUpdateTripMeta={updateTripMeta}
        onUpdateFamilyFields={updateFamilyFields}
        onAddFamily={addFamily}
      />
    )
  }

  const mainWithInspector = (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto] overflow-hidden">
      <div className="flex min-h-0 min-w-0 overflow-hidden">{content}</div>
      <InspectorRail
        doc={displayDoc}
        pageId={displayDoc.selectedPage}
        selection={selection}
        activeFamilyId={currentFamilyId}
        onSelectEntity={selectEntity}
        onUpdateLocationFields={updateLocationFields}
        onToggleTask={toggleTask}
        onUpdateEntityNote={updateEntityNote}
        onAddTask={addTask}
        onConvertNoteToTask={convertNoteToTask}
        onToggleMealStatus={toggleMealStatus}
        onToggleExpenseSettled={toggleExpenseSettled}
      />
    </div>
  )

  const {
    config: notionConfig,
    saveConfig: saveNotionConfig,
    syncStatus: notionSyncStatus,
    syncError: notionSyncError,
    testConnection: testNotionConnection,
  } = useNotionSync()

  const [showNotionTutorial, setShowNotionTutorial] = useState(false)

  return (
    <>
      <AppShell
        doc={displayDoc}
        tripMeta={tripMeta}
        onSetSelectedPage={setSelectedPage}
        onExport={exportState}
        onSearchChange={updateSearchQuery}
        searchResults={searchResults}
        onOpenEntity={openEntity}
        families={displayDoc.families}
        activeFamily={currentFamily}
        onSetActiveFamily={setActiveFamilyProfile}
        onOpenNotionSetup={() => setShowNotionTutorial(true)}
        notionSyncStatus={notionSyncStatus}
        onReset={resetAllData}
        onAddFamily={addFamily}
      >
        {mainWithInspector}
      </AppShell>

      <OnboardingGuide onOpenNotionSetup={() => setShowNotionTutorial(true)} />

      {showNotionTutorial && (
        <NotionSetupTutorial
          onClose={() => setShowNotionTutorial(false)}
          notionConfig={notionConfig}
          onSaveConfig={saveNotionConfig}
          onTestConnection={testNotionConnection}
          syncStatus={notionSyncStatus}
          syncError={notionSyncError}
        />
      )}
    </>
  )
}

export default App
