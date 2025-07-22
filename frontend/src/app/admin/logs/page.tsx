"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaDatabase, FaArrowLeft, FaSearch, FaFilter, FaDownload, FaTrash, FaUser, FaCog, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaCalendar } from 'react-icons/fa'
import { logsAPI } from '@/lib/api'

interface LogEntry {
  id: string
  timestamp: string
  type: 'user' | 'system' | 'error' | 'security'
  level: 'info' | 'warning' | 'error' | 'success'
  user?: string
  action: string
  details: string
  ip?: string
}

export default function LogsManagementPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    total_logs: 0,
    today_logs: 0,
    by_level: { error: 0, warning: 0, info: 0, success: 0 },
    by_type: { user: 0, system: 0, security: 0 }
  })

  // 로그 및 통계 로드
  const loadLogs = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // 필터 파라미터 구성
      const params: any = {
        limit: 100
      }
      
      if (typeFilter !== 'all') params.log_type = typeFilter
      if (levelFilter !== 'all') params.log_level = levelFilter
      if (searchTerm) params.action = searchTerm
      if (dateFilter) params.start_date = dateFilter
      
      // 로그 목록과 통계를 동시에 가져오기
      const [logsResponse, statsResponse] = await Promise.all([
        logsAPI.getLogs(params),
        logsAPI.getLogStats()
      ])
      
      setLogs(logsResponse.logs || [])
      setFilteredLogs(logsResponse.logs || [])
      setStats(statsResponse)
      
    } catch (error: any) {
      console.error('Failed to load logs:', error)
      if (error.response?.status === 403) {
        setError('관리자 권한이 필요합니다.')
        setTimeout(() => router.push('/admin'), 2000)
      } else {
        setError('로그를 불러오는데 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [typeFilter, levelFilter, searchTerm, dateFilter])

  // 필터링은 백엔드에서 처리되므로 제거

  // 로그 내보내기
  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `logs_export_${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  // 로그 삭제
  const clearLogs = async () => {
    const confirmClear = window.confirm('모든 로그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    if (confirmClear) {
      try {
        await logsAPI.clearLogs()
        await loadLogs() // 목록 새로고침
        alert('모든 로그가 삭제되었습니다.')
      } catch (error: any) {
        console.error('Failed to clear logs:', error)
        setError('로그 삭제에 실패했습니다.')
      }
    }
  }

  // 로그 레벨 아이콘
  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return <FaExclamationTriangle className="text-red-400" />
      case 'warning': return <FaExclamationTriangle className="text-yellow-400" />
      case 'success': return <FaCheckCircle className="text-green-400" />
      default: return <FaInfoCircle className="text-blue-400" />
    }
  }

  // 로그 타입 아이콘
  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'user': return <FaUser className="text-purple-400" />
      case 'system': return <FaCog className="text-cyan-400" />
      case 'security': return <FaExclamationTriangle className="text-red-400" />
      default: return <FaInfoCircle className="text-gray-400" />
    }
  }

  // 날짜 포맷
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />

      <div className="relative z-10 p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <FaDatabase className="text-red-400" />
                로그 관리
              </h1>
              <p className="text-white/70 mt-1">시스템 로그 및 사용자 활동을 조회할 수 있습니다</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <FaDownload className="w-4 h-4" />
              내보내기
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <FaTrash className="w-4 h-4" />
              전체 삭제
            </button>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="mb-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="로그 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="all" className="bg-gray-800">모든 타입</option>
              <option value="user" className="bg-gray-800">사용자</option>
              <option value="system" className="bg-gray-800">시스템</option>
              <option value="security" className="bg-gray-800">보안</option>
              <option value="error" className="bg-gray-800">오류</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="all" className="bg-gray-800">모든 레벨</option>
              <option value="info" className="bg-gray-800">정보</option>
              <option value="warning" className="bg-gray-800">경고</option>
              <option value="error" className="bg-gray-800">오류</option>
              <option value="success" className="bg-gray-800">성공</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 text-red-400">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-white">{stats.total_logs}</div>
            <div className="text-white/70 text-sm">총 로그</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-cyan-400">{stats.today_logs}</div>
            <div className="text-white/70 text-sm">오늘 로그</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-red-400">{stats.by_level.error}</div>
            <div className="text-white/70 text-sm">오류</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-yellow-400">{stats.by_level.warning}</div>
            <div className="text-white/70 text-sm">경고</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-purple-400">{stats.by_type.user}</div>
            <div className="text-white/70 text-sm">사용자 활동</div>
          </div>
        </div>

        {/* 로그 목록 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-white/70">
              로그를 불러오는 중...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-white/70">
              {searchTerm || typeFilter !== 'all' || levelFilter !== 'all' || dateFilter 
                ? '검색 조건에 맞는 로그가 없습니다.' 
                : '로그가 없습니다.'
              }
            </div>
          ) : (
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-white/5 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      {getTypeIcon(log.type)}
                      {getLevelIcon(log.level)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-medium">{log.action}</span>
                        {log.user && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {log.user}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.type === 'user' ? 'bg-purple-500/20 text-purple-300' :
                          log.type === 'system' ? 'bg-cyan-500/20 text-cyan-300' :
                          log.type === 'security' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      
                      <p className="text-white/70 text-sm mb-2">{log.details}</p>
                      
                      <div className="flex items-center gap-4 text-white/50 text-xs">
                        <span className="flex items-center gap-1">
                          <FaCalendar className="w-3 h-3" />
                          {formatDate(log.timestamp)}
                        </span>
                        {log.ip && (
                          <span>IP: {log.ip}</span>
                        )}
                        <span>ID: {log.id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 