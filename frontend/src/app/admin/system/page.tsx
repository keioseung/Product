"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaCog, FaDownload, FaUpload, FaDatabase, FaTrash, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaSave, FaPalette, FaGlobe } from 'react-icons/fa'

interface BackupData {
  users: any[]
  aiInfos: any[]
  userProgress: any[]
  settings: any
  timestamp: string
}

export default function SystemManagementPage() {
  const router = useRouter()
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupHistory, setBackupHistory] = useState<string[]>([])
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'ko',
    autoBackup: true,
    backupInterval: '24', // hours
    maxBackups: 10,
    enableNotifications: true,
    enableAnalytics: true
  })

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      // 백업 히스토리 로드
      const history = JSON.parse(localStorage.getItem('backupHistory') || '[]')
      setBackupHistory(history)

      // 설정 로드
      const savedSettings = localStorage.getItem('systemSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    }
  }, [])

  // 백업 생성
  const createBackup = () => {
    setIsBackingUp(true)
    
    try {
      const backupData: BackupData = {
        users: JSON.parse(localStorage.getItem('users') || '[]'),
        aiInfos: JSON.parse(localStorage.getItem('aiInfos') || '[]'),
        userProgress: JSON.parse(localStorage.getItem('userProgress') || '[]'),
        settings: JSON.parse(localStorage.getItem('systemSettings') || '{}'),
        timestamp: new Date().toISOString()
      }

      const fileName = `ai_mastery_backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`
      const dataStr = JSON.stringify(backupData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = fileName
      link.click()

      // 백업 히스토리에 추가
      const newHistory = [fileName, ...backupHistory.slice(0, settings.maxBackups - 1)]
      setBackupHistory(newHistory)
      localStorage.setItem('backupHistory', JSON.stringify(newHistory))

      alert('백업이 성공적으로 생성되었습니다!')
    } catch (error) {
      console.error('Backup failed:', error)
      alert('백업 생성 중 오류가 발생했습니다.')
    } finally {
      setIsBackingUp(false)
    }
  }

  // 백업 복원
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsRestoring(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string)
        
        // 데이터 검증
        if (!backupData.timestamp || !backupData.users) {
          throw new Error('유효하지 않은 백업 파일입니다.')
        }

        const confirmRestore = window.confirm(
          `백업 파일 (${new Date(backupData.timestamp).toLocaleString()})을 복원하시겠습니까?\n\n현재 데이터가 모두 덮어씌워집니다.`
        )

        if (confirmRestore) {
          // 데이터 복원
          localStorage.setItem('users', JSON.stringify(backupData.users || []))
          localStorage.setItem('aiInfos', JSON.stringify(backupData.aiInfos || []))
          localStorage.setItem('userProgress', JSON.stringify(backupData.userProgress || []))
          if (backupData.settings) {
            localStorage.setItem('systemSettings', JSON.stringify(backupData.settings))
            setSettings(backupData.settings)
          }

          alert('백업이 성공적으로 복원되었습니다!')
          window.location.reload()
        }
      } catch (error) {
        console.error('Restore failed:', error)
        alert('백업 복원 중 오류가 발생했습니다. 파일을 확인해주세요.')
      } finally {
        setIsRestoring(false)
      }
    }

    reader.readAsText(file)
  }

  // 모든 데이터 삭제
  const clearAllData = () => {
    const confirmClear = window.confirm(
      '모든 사용자 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!\n(관리자 계정은 유지됩니다)'
    )

    if (confirmClear) {
      const secondConfirm = window.confirm('정말로 모든 데이터를 삭제하시겠습니까?')
      
      if (secondConfirm) {
        // 현재 로그인한 관리자 계정만 유지
        const currentUser = localStorage.getItem('currentUser')
        const adminUser = currentUser ? JSON.parse(currentUser) : null
        
        localStorage.removeItem('users')
        localStorage.removeItem('aiInfos')
        localStorage.removeItem('userProgress')
        localStorage.removeItem('backupHistory')
        
        // 관리자 계정 복원
        if (adminUser && adminUser.role === 'admin') {
          localStorage.setItem('users', JSON.stringify([adminUser]))
        }

        setBackupHistory([])
        alert('모든 데이터가 삭제되었습니다.')
        window.location.reload()
      }
    }
  }

  // 설정 저장
  const saveSettings = () => {
    localStorage.setItem('systemSettings', JSON.stringify(settings))
    alert('설정이 저장되었습니다!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />

      <div className="relative z-10 p-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaCog className="text-gray-400" />
              시스템 관리
            </h1>
            <p className="text-white/70 mt-1">시스템 백업, 복원 및 설정을 관리할 수 있습니다</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 백업 및 복원 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
              <FaDatabase className="text-blue-400" />
              데이터 관리
            </h2>

            <div className="space-y-4">
              {/* 백업 생성 */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">백업 생성</h3>
                <p className="text-white/70 text-sm mb-4">
                  모든 사용자 데이터, AI 정보, 설정을 JSON 파일로 백업합니다.
                </p>
                <button
                  onClick={createBackup}
                  disabled={isBackingUp}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaDownload className="w-4 h-4" />
                  {isBackingUp ? '백업 생성 중...' : '백업 생성'}
                </button>
              </div>

              {/* 백업 복원 */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">백업 복원</h3>
                <p className="text-white/70 text-sm mb-4">
                  이전에 생성한 백업 파일을 업로드하여 데이터를 복원합니다.
                </p>
                <label className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <FaUpload className="w-4 h-4" />
                  {isRestoring ? '복원 중...' : '백업 파일 선택'}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isRestoring}
                  />
                </label>
              </div>

              {/* 데이터 삭제 */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <h3 className="text-red-300 font-semibold mb-3 flex items-center gap-2">
                  <FaExclamationTriangle className="w-4 h-4" />
                  위험 영역
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  모든 사용자 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                </p>
                <button
                  onClick={clearAllData}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaTrash className="w-4 h-4" />
                  모든 데이터 삭제
                </button>
              </div>
            </div>

            {/* 백업 히스토리 */}
            {backupHistory.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white font-semibold mb-4">최근 백업</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {backupHistory.slice(0, 5).map((backup, index) => (
                    <div key={index} className="text-white/70 text-sm bg-white/5 p-2 rounded">
                      {backup}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 시스템 설정 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
              <FaPalette className="text-purple-400" />
              시스템 설정
            </h2>

            <div className="space-y-6">
              {/* 테마 설정 */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">테마</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="dark" className="bg-gray-800">다크 모드</option>
                  <option value="light" className="bg-gray-800">라이트 모드</option>
                  <option value="auto" className="bg-gray-800">시스템 설정</option>
                </select>
              </div>

              {/* 언어 설정 */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">언어</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="ko" className="bg-gray-800">한국어</option>
                  <option value="en" className="bg-gray-800">English</option>
                  <option value="ja" className="bg-gray-800">日本語</option>
                </select>
              </div>

              {/* 자동 백업 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white/80 text-sm font-medium">자동 백업</label>
                  <p className="text-white/50 text-xs">정기적으로 자동 백업을 생성합니다</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
                  className={`w-12 h-6 rounded-full transition-all ${
                    settings.autoBackup ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.autoBackup ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* 백업 주기 */}
              {settings.autoBackup && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">백업 주기 (시간)</label>
                  <select
                    value={settings.backupInterval}
                    onChange={(e) => setSettings({ ...settings, backupInterval: e.target.value })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="6" className="bg-gray-800">6시간</option>
                    <option value="12" className="bg-gray-800">12시간</option>
                    <option value="24" className="bg-gray-800">24시간</option>
                    <option value="168" className="bg-gray-800">7일</option>
                  </select>
                </div>
              )}

              {/* 최대 백업 수 */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">최대 백업 보관 수</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxBackups}
                  onChange={(e) => setSettings({ ...settings, maxBackups: parseInt(e.target.value) || 10 })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* 알림 설정 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white/80 text-sm font-medium">알림 활성화</label>
                  <p className="text-white/50 text-xs">시스템 알림을 받습니다</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
                  className={`w-12 h-6 rounded-full transition-all ${
                    settings.enableNotifications ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.enableNotifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* 분석 데이터 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white/80 text-sm font-medium">사용자 분석</label>
                  <p className="text-white/50 text-xs">익명화된 사용 데이터를 수집합니다</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enableAnalytics: !settings.enableAnalytics })}
                  className={`w-12 h-6 rounded-full transition-all ${
                    settings.enableAnalytics ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.enableAnalytics ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* 설정 저장 */}
              <button
                onClick={saveSettings}
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <FaSave className="w-4 h-4" />
                설정 저장
              </button>
            </div>
          </div>
        </div>

        {/* 시스템 정보 */}
        <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
            <FaGlobe className="text-cyan-400" />
            시스템 정보
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('users') || '[]').length : 0}
              </div>
              <div className="text-white/70 text-sm">총 사용자</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('aiInfos') || '[]').length : 0}
              </div>
              <div className="text-white/70 text-sm">AI 정보</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{backupHistory.length}</div>
              <div className="text-white/70 text-sm">백업 수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">1.0.0</div>
              <div className="text-white/70 text-sm">버전</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 