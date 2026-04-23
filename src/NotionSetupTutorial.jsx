import { useState, useEffect } from 'react'
import { CheckCircle, Circle, ChevronRight, ChevronLeft, X, ExternalLink, Database, Key, Link, Play, AlertTriangle } from 'lucide-react'

const STEPS = [
  {
    id: 'intro',
    title: '노션 데이터베이스 연동',
    subtitle: '가족 여행 데이터를 노션과 동기화합니다',
    description: '이 튜토리얼을 따라하면 노션 데이터베이스와 연동하여 가족 준비 현황, 체크리스트, 비용 정보를 노션에서도 관리할 수 있습니다.',
    icon: Database,
    action: null,
    tip: null,
  },
  {
    id: 'create-integration',
    title: '1단계: 노션 인테그레이션 생성',
    subtitle: 'API 키 발급',
    description: '노션 개발자 포털에서 새 인테그레이션을 만들고 API 키를 발급받습니다.',
    icon: Key,
    steps: [
      { label: 'notion.so/my-integrations 접속', url: 'https://www.notion.so/my-integrations' },
      { label: '"새 인테그레이션" 클릭' },
      { label: '이름 입력 (예: 가족여행 대시보드)' },
      { label: '연결할 워크스페이스 선택' },
      { label: '"제출" 클릭 후 Internal Integration Secret 복사' },
    ],
    fieldLabel: 'API 키 (Internal Integration Secret)',
    fieldKey: 'apiKey',
    fieldPlaceholder: 'secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    tip: 'secret_ 으로 시작하는 긴 문자열입니다.',
  },
  {
    id: 'create-database',
    title: '2단계: 노션 데이터베이스 생성',
    subtitle: '여행 관리용 데이터베이스',
    description: '노션에서 새 페이지를 만들고 아래 구조로 데이터베이스를 생성합니다.',
    icon: Database,
    dbSchema: [
      { property: '이름', type: '제목 (Title)', required: true },
      { property: '출발지', type: '텍스트 (Text)', required: true },
      { property: '준비도', type: '숫자 (Number)', required: true },
      { property: '상태', type: '선택 (Select)', required: true },
      { property: 'ETA', type: '텍스트 (Text)', required: false },
      { property: '담당', type: '텍스트 (Text)', required: false },
    ],
    steps: [
      { label: '노션에서 새 페이지 생성 (/ 입력 후 "데이터베이스" 선택)' },
      { label: '"인라인 데이터베이스" 선택' },
      { label: '위 속성들을 차례로 추가' },
      { label: '페이지 공유 → 인테그레이션 초대 (이름으로 검색)' },
    ],
    tip: '인테그레이션을 데이터베이스에 공유하지 않으면 접근 권한 오류가 발생합니다.',
  },
  {
    id: 'get-database-id',
    title: '3단계: 데이터베이스 ID 복사',
    subtitle: '연동할 데이터베이스 식별',
    description: '노션 데이터베이스 URL에서 ID를 복사합니다.',
    icon: Link,
    steps: [
      { label: '생성한 데이터베이스 페이지 열기' },
      { label: '우측 상단 "..." 메뉴 → "링크 복사"' },
      { label: 'URL에서 데이터베이스 ID 추출' },
    ],
    urlExample: 'notion.so/[워크스페이스]/\n[데이터베이스-ID]?v=...',
    urlHighlight: '데이터베이스-ID 부분 (32자리 영숫자)',
    fieldLabel: '데이터베이스 ID',
    fieldKey: 'databaseId',
    fieldPlaceholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    tip: '32자리 영숫자로 구성된 ID입니다. 하이픈(-) 포함 또는 미포함 모두 가능합니다.',
  },
  {
    id: 'connect',
    title: '4단계: 연결 확인',
    subtitle: '연동 테스트',
    description: '입력한 API 키와 데이터베이스 ID로 연결을 테스트합니다.',
    icon: Play,
    tip: '연결에 성공하면 데이터 동기화를 시작할 수 있습니다.',
  },
]

function StepIndicator({ currentStep, total }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-300"
          style={{
            width: i === currentStep ? 20 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === currentStep
              ? '#58A6FF'
              : i < currentStep
              ? '#3FB950'
              : '#30363D',
          }}
        />
      ))}
    </div>
  )
}

function SchemaTable({ schema }) {
  return (
    <div className="overflow-hidden rounded border border-[#30363D]">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#30363D] bg-[#161B22]">
            <th className="px-3 py-2 text-left text-[#8B949E]">속성 이름</th>
            <th className="px-3 py-2 text-left text-[#8B949E]">타입</th>
            <th className="px-3 py-2 text-center text-[#8B949E]">필수</th>
          </tr>
        </thead>
        <tbody>
          {schema.map((row, i) => (
            <tr key={i} className="border-b border-[#21262D] last:border-0">
              <td className="px-3 py-2 font-mono text-[#C9D1D9]">{row.property}</td>
              <td className="px-3 py-2 text-[#8B949E]">{row.type}</td>
              <td className="px-3 py-2 text-center">
                {row.required
                  ? <span className="text-[#3FB950]">●</span>
                  : <span className="text-[#30363D]">○</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function NotionSetupTutorial({ onClose, notionConfig, onSaveConfig, onTestConnection, syncStatus, syncError }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formValues, setFormValues] = useState({
    apiKey: notionConfig?.apiKey || '',
    databaseId: notionConfig?.databaseId || '',
  })
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const isFirstStep = currentStep === 0
  const isConnectStep = step.id === 'connect'

  const handleFieldChange = (key, value) => {
    const next = { ...formValues, [key]: value.trim() }
    setFormValues(next)
    onSaveConfig(next)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await onTestConnection()
    setTestResult(result)
    setTesting(false)
  }

  const canProceed = () => {
    if (step.fieldKey === 'apiKey') return formValues.apiKey.length > 0
    if (step.fieldKey === 'databaseId') return formValues.databaseId.length > 0
    if (isConnectStep) return testResult?.ok === true
    return true
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-[#30363D] bg-[#0d1117] shadow-2xl"
        style={{
          animation: 'slideInUp 0.3s cubic-bezier(0.16,1,0.3,1)',
          maxHeight: '90vh',
        }}
      >
        <style>{`
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-[#21262D] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#58A6FF]/15">
              <Database size={16} className="text-[#58A6FF]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#C9D1D9]">노션 데이터베이스 연동 가이드</div>
              <div className="text-xs text-[#8B949E]">단계별 설정 튜토리얼</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-[#8B949E] transition-colors hover:bg-[#21262D] hover:text-[#C9D1D9]"
          >
            <X size={16} />
          </button>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="border-b border-[#21262D] px-5 py-3">
          <StepIndicator currentStep={currentStep} total={STEPS.length} />
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4">
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[#58A6FF]">
              {step.subtitle}
            </div>
            <h2 className="mb-2 text-base font-semibold text-[#C9D1D9]">{step.title}</h2>
            <p className="text-sm leading-relaxed text-[#8B949E]">{step.description}</p>
          </div>

          {/* 단계 목록 */}
          {step.steps && (
            <ol className="mb-4 space-y-2">
              {step.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1f2a34] text-xs font-mono text-[#58A6FF]">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#C9D1D9]">
                    {s.label}
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1.5 inline-flex items-center gap-0.5 text-[#58A6FF] underline-offset-2 hover:underline"
                      >
                        바로가기 <ExternalLink size={11} />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )}

          {/* 데이터베이스 스키마 테이블 */}
          {step.dbSchema && (
            <div className="mb-4">
              <div className="mb-2 text-xs font-medium text-[#8B949E]">데이터베이스 구조</div>
              <SchemaTable schema={step.dbSchema} />
            </div>
          )}

          {/* URL 예시 */}
          {step.urlExample && (
            <div className="mb-4 rounded border border-[#30363D] bg-[#161B22] p-3">
              <div className="mb-1 text-xs text-[#8B949E]">URL 예시</div>
              <code className="text-xs text-[#C9D1D9] whitespace-pre">{step.urlExample}</code>
              <div className="mt-2 text-xs text-[#58A6FF]">↑ {step.urlHighlight}</div>
            </div>
          )}

          {/* 입력 필드 */}
          {step.fieldKey && (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-[#8B949E]">
                {step.fieldLabel}
              </label>
              <input
                type="text"
                value={formValues[step.fieldKey] || ''}
                onChange={(e) => handleFieldChange(step.fieldKey, e.target.value)}
                placeholder={step.fieldPlaceholder}
                className="w-full rounded border border-[#30363D] bg-[#0d1117] px-3 py-2 font-mono text-xs text-[#C9D1D9] placeholder-[#30363D] focus:border-[#58A6FF] focus:outline-none"
              />
            </div>
          )}

          {/* 연결 테스트 단계 */}
          {isConnectStep && (
            <div className="space-y-3">
              <div className="rounded border border-[#30363D] bg-[#161B22] p-3 text-xs">
                <div className="mb-1 text-[#8B949E]">API 키</div>
                <div className="font-mono text-[#C9D1D9] truncate">
                  {formValues.apiKey ? `${formValues.apiKey.slice(0, 20)}...` : <span className="text-[#F85149]">미입력</span>}
                </div>
              </div>
              <div className="rounded border border-[#30363D] bg-[#161B22] p-3 text-xs">
                <div className="mb-1 text-[#8B949E]">데이터베이스 ID</div>
                <div className="font-mono text-[#C9D1D9] truncate">
                  {formValues.databaseId || <span className="text-[#F85149]">미입력</span>}
                </div>
              </div>

              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !formValues.apiKey || !formValues.databaseId}
                className="flex w-full items-center justify-center gap-2 rounded border border-[#30363D] py-2 text-sm font-medium transition-colors disabled:opacity-40"
                style={{
                  backgroundColor: testing ? '#1f2a34' : '#58A6FF1a',
                  color: '#58A6FF',
                  borderColor: testing ? '#30363D' : '#58A6FF40',
                }}
              >
                {testing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#58A6FF] border-t-transparent" />
                    연결 중...
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    연결 테스트
                  </>
                )}
              </button>

              {testResult && (
                <div
                  className="flex items-start gap-2 rounded border p-3 text-xs"
                  style={{
                    borderColor: testResult.ok ? '#3FB95040' : '#F8514940',
                    backgroundColor: testResult.ok ? '#3FB9500d' : '#F851490d',
                    color: testResult.ok ? '#3FB950' : '#F85149',
                  }}
                >
                  {testResult.ok
                    ? <CheckCircle size={14} className="mt-0.5 shrink-0" />
                    : <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  }
                  <div>
                    {testResult.ok
                      ? `연결 성공! "${testResult.title}" 데이터베이스에 접근 가능합니다.`
                      : testResult.error
                    }
                    {testResult.isCors && (
                      <div className="mt-1 text-[#8B949E]">
                        직접 연동을 위해서는 백엔드 프록시 서버가 필요합니다. 데이터는 로컬에서 계속 관리됩니다.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 팁 */}
          {step.tip && (
            <div className="flex items-start gap-2 rounded bg-[#1f2a34] p-3 text-xs text-[#8B949E]">
              <span className="text-[#D29922]">💡</span>
              <span>{step.tip}</span>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between border-t border-[#21262D] px-5 py-4">
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={isFirstStep}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm text-[#8B949E] transition-colors hover:bg-[#21262D] hover:text-[#C9D1D9] disabled:opacity-30"
          >
            <ChevronLeft size={14} />
            이전
          </button>

          <div className="text-xs text-[#8B949E]">
            {currentStep + 1} / {STEPS.length}
          </div>

          {isLastStep ? (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors"
              style={{ backgroundColor: '#3FB9501a', color: '#3FB950', border: '1px solid #3FB95040' }}
            >
              <CheckCircle size={14} />
              완료
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors"
              style={{ backgroundColor: '#58A6FF1a', color: '#58A6FF', border: '1px solid #58A6FF40' }}
            >
              다음
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
