import { useState, useCallback, useEffect } from 'react'

const NOTION_PROXY_BASE = '/api/notion'

export function useNotionSync() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('notion_config')
      return saved ? JSON.parse(saved) : { apiKey: '', databaseId: '', enabled: false }
    } catch {
      return { apiKey: '', databaseId: '', enabled: false }
    }
  })
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | success | error
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const [syncError, setSyncError] = useState(null)

  const saveConfig = useCallback((newConfig) => {
    const merged = { ...config, ...newConfig }
    setConfig(merged)
    localStorage.setItem('notion_config', JSON.stringify(merged))
  }, [config])

  const testConnection = useCallback(async () => {
    if (!config.apiKey || !config.databaseId) {
      return { ok: false, error: 'API 키와 데이터베이스 ID를 입력해주세요.' }
    }

    setSyncStatus('syncing')
    setSyncError(null)

    try {
      const res = await fetch(`${NOTION_PROXY_BASE}/databases/${config.databaseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
      })

      if (res.ok) {
        const data = await res.json()
        setSyncStatus('success')
        return { ok: true, title: data.title?.[0]?.plain_text || '연결됨' }
      } else {
        const err = await res.json().catch(() => ({}))
        const message = err.message || `오류 ${res.status}`
        setSyncError(message)
        setSyncStatus('error')
        return { ok: false, error: message }
      }
    } catch (e) {
      const message = 'CORS 제한으로 인해 브라우저에서 직접 연결할 수 없습니다. 백엔드 프록시가 필요합니다.'
      setSyncError(message)
      setSyncStatus('error')
      return { ok: false, error: message, isCors: true }
    }
  }, [config])

  const pushTripData = useCallback(async (doc) => {
    if (!config.enabled || !config.apiKey || !config.databaseId) return
    setSyncStatus('syncing')
    try {
      const families = doc.families || []
      for (const family of families) {
        await fetch(`${NOTION_PROXY_BASE}/pages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parent: { database_id: config.databaseId },
            properties: {
              '이름': { title: [{ text: { content: family.title || family.name || '' } }] },
              '출발지': { rich_text: [{ text: { content: family.origin || '' } }] },
              '준비도': { number: family.readiness ?? 0 },
              '상태': { select: { name: family.status || '대기' } },
            },
          }),
        })
      }
      setLastSyncAt(new Date().toISOString())
      setSyncStatus('success')
    } catch (e) {
      setSyncError(e.message)
      setSyncStatus('error')
    }
  }, [config])

  return {
    config,
    saveConfig,
    syncStatus,
    lastSyncAt,
    syncError,
    testConnection,
    pushTripData,
  }
}
