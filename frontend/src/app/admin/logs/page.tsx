"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaDatabase, FaArrowLeft, FaSearch, FaFilter, FaDownload, FaTrash, FaUser, FaCog, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaCalendar } from 'react-icons/fa'

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

  // 로그 생성 함수
  const createLog = (type: LogEntry['type'], level: LogEntry['level'], action: string, details: string, user?: string) => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      level,
      action,
      details,
      user,
      ip: '127.0.0.1' // 실제 환경에서는 실제 IP를 가져와야 함
    }

    const existingLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]')
    const newLogs = [logEntry, ...existingLogs].slice(0, 1000) // 최대 1000개 로그 유지
    localStorage.setItem('systemLogs', JSON.stringify(newLogs))
    
    return logEntry
  }

  // 샘플 로그 생성
  const generateSampleLogs = () => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    const sampleLogs: Omit<LogEntry, 'id' | 'timestamp' | 'ip'>[] = [
      { type: 'user', level: 'info', action: '로그인', details: '사용자가 로그인했습니다', user: 'admin' },
      { type: 'user', level: 'info', action: '회원가입', details: '새 사용자가 등록되었습니다', user: 'user123' },
      { type: 'system', level: 'success', action: '백업 생성', details: '시스템 백업이 성공적으로 생성되었습니다' },
      { type: 'user', level: 'info', action: '퀴즈 완료', details: 'AI 기초 퀴즈를 완료했습니다', user: 'user123' },
      { type: 'system', level: 'warning', action: '디스크 용량', details: '디스크 사용량이 80%를 초과했습니다' },
      { type: 'security', level: 'warning', action: '로그인 실패', details: '잘못된 비밀번호로 로그인 시도', user: 'unknown' },
      { type: 'error', level: 'error', action: 'API 오류', details: '외부 API 호출 중 타임아웃 발생' },
      { type: 'user', level: 'info', action: '설정 변경', details: '사용자 프로필 정보를 수정했습니다', user: 'admin' },
      { type: 'system', level: 'info', action: '서버 시작', details: '애플리케이션 서버가 시작되었습니다' },
      { type: 'user', level: 'info', action: '로그아웃', details: '사용자가 로그아웃했습니다', user: 'user123' }
    ]

    const existingLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]')
    if (existingLogs.length === 0) {
      const newLogs = sampleLogs.map((log, index) => ({
        ...log,
        id: Date.now().toString() + index,
        timestamp: new Date(Date.now() - index * 60000).toISOString(), // 1분씩 차이
        ip: `192.168.1.${100 + index}`
      }))
      localStorage.setItem('systemLogs', JSON.stringify(newLogs))
    }
  }

  // 로그 로드
  const loadLogs = () => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    const savedLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]')
    setLogs(savedLogs)
    setFilteredLogs(savedLogs)
  }

  useEffect(() => {
    generateSampleLogs()
    loadLogs()
  }, [])

  // 필터링
  useEffect(() => {
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === typeFilter)
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter)
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString()
      filtered = filtered.filter(log => new Date(log.timestamp).toDateString() === filterDate)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, typeFilter, levelFilter, dateFilter])

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
  const clearLogs = () => {
    const confirm = window.confirm('모든 로그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    if (confirm) {
      localStorage.removeItem('systemLogs')
      setLogs([])
      setFilteredLogs([])
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

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-white">{logs.length}</div>
            <div className="text-white/70 text-sm">총 로그</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-red-400">{logs.filter(l => l.level === 'error').length}</div>
            <div className="text-white/70 text-sm">오류</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-yellow-400">{logs.filter(l => l.level === 'warning').length}</div>
            <div className="text-white/70 text-sm">경고</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-purple-400">{filteredLogs.length}</div>
            <div className="text-white/70 text-sm">필터된 로그</div>
          </div>
        </div>

        {/* 로그 목록 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          {filteredLogs.length === 0 ? (
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