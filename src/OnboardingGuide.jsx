import { useState, useEffect, useRef } from 'react'
import { X, ChevronRight, LayoutGrid, Home, Utensils, Map, Receipt, Users, Database, Play, RotateCcw } from 'lucide-react'

const GUIDE_STORAGE_KEY = 'onboarding_dismissed_v1'

const VISUAL_TIPS = [
  {
    id: 'nav',
    anchor: 'sidebar',
    icon: LayoutGrid,
    title: '탐색 메뉴',
    description: '왼쪽 사이드바에서 일정, 숙소, 식사, 활동, 비용, 가족 탭을 전환하세요.',
    position: { left: 68, top: '50%' },
    pulse: true,
  },
  {
    id: 'timeline',
    anchor: 'timeline',
    icon: Play,
    title: '타임라인 재생',
    description: '상단 타임라인의 ▶ 버튼으로 여행 경로 시뮬레이션을 시작할 수 있습니다.',
    position: { left: '50%', top: 80 },
    pulse: true,
  },
  {
    id: 'inspector',
    anchor: 'inspector',
    icon: Receipt,
    title: '인스펙터 패널',
    description: '오른쪽 패널에서 선택한 항목의 상세 정보와 메모를 편집할 수 있습니다.',
    position: { right: 320, top: '50%' },
    pulse: true,
  },
  {
    id: 'notion',
    anchor: 'notion',
    icon: Database,
    title: '노션 연동',
    description: '우측 하단 데이터베이스 버튼으로 노션과 데이터를 동기화할 수 있습니다.',
    position: { right: 20, bottom: 120 },
    pulse: true,
  },
]

function PulseRing({ color = '#58A6FF' }) {
  return (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full animate-ping"
        style={{ backgroundColor: color, opacity: 0.3 }}
      />
      <div
        className="relative h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

function TooltipCard({ tip, index, total, onNext, onDismiss }) {
  const Icon = tip.icon
  const isLast = index === total - 1

  const posStyle = {}
  if (tip.position.left !== undefined) posStyle.left = tip.position.left
  if (tip.position.right !== undefined) posStyle.right = tip.position.right
  if (tip.position.top !== undefined) posStyle.top = tip.position.top === '50%' ? '50%' : tip.position.top
  if (tip.position.bottom !== undefined) posStyle.bottom = tip.position.bottom

  const isLeftAnchored = tip.position.left !== undefined && typeof tip.position.left === 'number'

  return (
    <div
      className="fixed z-40 pointer-events-none"
      style={posStyle}
    >
      <div
        className="pointer-events-auto"
        style={{
          transform: tip.position.top === '50%' ? 'translateY(-50%)' : undefined,
          animation: 'guideCardIn 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div
          className="relative flex flex-col gap-2 rounded-lg border p-3 shadow-xl"
          style={{
            width: 220,
            backgroundColor: '#0d1117ee',
            borderColor: '#58A6FF40',
            backdropFilter: 'blur(8px)',
            marginLeft: isLeftAnchored ? 12 : undefined,
          }}
        >
          {/* 화살표 */}
          {isLeftAnchored && (
            <div
              className="absolute -left-2 top-1/2 -translate-y-1/2 border-4 border-transparent"
              style={{ borderRightColor: '#58A6FF40' }}
            />
          )}

          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#58A6FF]/15">
              <Icon size={13} className="text-[#58A6FF]" />
            </div>
            <div className="text-xs font-semibold text-[#C9D1D9]">{tip.title}</div>
          </div>
          <p className="text-xs leading-relaxed text-[#8B949E]">{tip.description}</p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#4B5563]">
              {index + 1} / {total}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className="rounded px-2 py-0.5 text-xs text-[#8B949E] transition-colors hover:text-[#C9D1D9]"
              >
                건너뛰기
              </button>
              <button
                type="button"
                onClick={isLast ? onDismiss : onNext}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors"
                style={{ backgroundColor: '#58A6FF1a', color: '#58A6FF' }}
              >
                {isLast ? '완료' : (
                  <>다음 <ChevronRight size={11} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OnboardingGuide({ onOpenNotionSetup }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(GUIDE_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [tipIndex, setTipIndex] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [dismissed])

  const dismiss = () => {
    setDismissed(true)
    setVisible(false)
    try { localStorage.setItem(GUIDE_STORAGE_KEY, 'true') } catch {}
  }

  const nextTip = () => {
    const current = VISUAL_TIPS[tipIndex]
    if (current?.id === 'notion' && onOpenNotionSetup) {
      onOpenNotionSetup()
    }
    if (tipIndex < VISUAL_TIPS.length - 1) {
      setTipIndex((i) => i + 1)
    } else {
      dismiss()
    }
  }

  if (!visible || dismissed) return null

  const tip = VISUAL_TIPS[tipIndex]

  return (
    <>
      <style>{`
        @keyframes guideCardIn {
          from { opacity: 0; transform: translateX(-8px) scale(0.96); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>

      {/* 반투명 오버레이 (클릭은 통과) */}
      <div className="fixed inset-0 z-30 pointer-events-none" />

      {/* 각 팁 카드 */}
      <TooltipCard
        tip={tip}
        index={tipIndex}
        total={VISUAL_TIPS.length}
        onNext={nextTip}
        onDismiss={dismiss}
      />
    </>
  )
}

export function OnboardingResetButton() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      setShow(localStorage.getItem(GUIDE_STORAGE_KEY) === 'true')
    } catch {}
  }, [])

  const reset = () => {
    try {
      localStorage.removeItem(GUIDE_STORAGE_KEY)
      window.location.reload()
    } catch {}
  }

  if (!show) return null

  return (
    <button
      type="button"
      onClick={reset}
      title="튜토리얼 다시 보기"
      className="flex items-center justify-center px-3 py-3.5 text-[#8B949E] transition-colors hover:bg-[#1f2a34] hover:text-[#C9D1D9]"
    >
      <RotateCcw size={18} strokeWidth={1.6} />
    </button>
  )
}
