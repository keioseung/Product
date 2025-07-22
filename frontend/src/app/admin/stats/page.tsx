"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaChartBar, FaUsers, FaBrain, FaClipboard, FaBookOpen, FaComments, FaDatabase, FaArrowLeft, FaCalendar, FaTrophy, FaFire, FaEye } from 'react-icons/fa'

interface UserProgress {
  sessionId: string
  date: string
  learnedInfo: any
  stats: any
}

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalQuizzes: number
  totalContent: number
  recentActivity: any[]
  popularTopics: { name: string; count: number }[]
  weeklyProgress: { day: string; users: number; quizzes: number }[]
}

export default function AdminStatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalQuizzes: 0,
    totalContent: 0,
    recentActivity: [],
    popularTopics: [],
    weeklyProgress: []
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    // 사용자 데이터
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '[]')
    
    // 컨텐츠 데이터
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
    const baseContents = JSON.parse(localStorage.getItem('baseContents') || '[]')
    const aiInfos = JSON.parse(localStorage.getItem('aiInfos') || '[]')
    const prompts = JSON.parse(localStorage.getItem('prompts') || '[]')

    // 최근 7일간 활동한 사용자
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const activeUsers = userProgress.filter((progress: UserProgress) => 
      new Date(progress.date) >= sevenDaysAgo
    ).length

    // 인기 토픽 (샘플 데이터)
    const topics = ['AI 기초', '머신러닝', '딥러닝', '자연어처리', '컴퓨터비전']
    const popularTopics = topics.map(topic => ({
      name: topic,
      count: Math.floor(Math.random() * 50) + 10
    })).sort((a, b) => b.count - a.count)

    // 주간 진행률 (샘플 데이터)
    const weekDays = ['월', '화', '수', '목', '금', '토', '일']
    const weeklyProgress = weekDays.map(day => ({
      day,
      users: Math.floor(Math.random() * 20) + 5,
      quizzes: Math.floor(Math.random() * 30) + 10
    }))

    // 최근 활동 (샘플 데이터)
    const recentActivity = [
      { user: 'user123', action: 'AI 기초 퀴즈 완료', time: '5분 전' },
      { user: 'admin', action: '새 컨텐츠 추가', time: '10분 전' },
      { user: 'user456', action: '회원가입', time: '15분 전' },
      { user: 'user789', action: '머신러닝 학습 완료', time: '20분 전' },
      { user: 'user101', action: '딥러닝 퀴즈 시작', time: '25분 전' }
    ]

    setStats({
      totalUsers: users.length,
      activeUsers,
      totalQuizzes: quizzes.length,
      totalContent: baseContents.length + aiInfos.length + prompts.length,
      recentActivity,
      popularTopics,
      weeklyProgress
    })
  }

  // 간단한 프로그레스 바 컴포넌트
  const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
    <div className="w-full bg-white/10 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${color}`} 
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  )

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
              <FaChartBar className="text-yellow-400" />
              사용자 통계 & 대시보드
            </h1>
            <p className="text-white/70 mt-1">전체 시스템 현황과 사용자 활동을 확인할 수 있습니다</p>
          </div>
        </div>

        {/* 메인 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                <div className="text-white/70 text-sm">총 사용자</div>
              </div>
              <FaUsers className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-green-400 text-sm">+{Math.floor(stats.totalUsers * 0.1)} 이번 주</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-white">{stats.activeUsers}</div>
                <div className="text-white/70 text-sm">활성 사용자</div>
              </div>
              <FaFire className="w-8 h-8 text-orange-400" />
            </div>
            <div className="text-blue-400 text-sm">최근 7일</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-white">{stats.totalQuizzes}</div>
                <div className="text-white/70 text-sm">총 퀴즈</div>
              </div>
              <FaClipboard className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="text-purple-400 text-sm">다양한 주제</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-white">{stats.totalContent}</div>
                <div className="text-white/70 text-sm">총 컨텐츠</div>
              </div>
              <FaBookOpen className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-cyan-400 text-sm">학습 자료</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 인기 토픽 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
              <FaTrophy className="text-yellow-400" />
              인기 토픽
            </h2>
            <div className="space-y-4">
              {stats.popularTopics.map((topic, index) => (
                <div key={topic.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-white/20 text-white'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-white font-medium">{topic.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <ProgressBar value={topic.count} max={60} color="bg-gradient-to-r from-yellow-400 to-orange-500" />
                    </div>
                    <span className="text-white/70 text-sm w-8">{topic.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 주간 활동 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
              <FaCalendar className="text-blue-400" />
              주간 활동
            </h2>
            <div className="space-y-4">
              {stats.weeklyProgress.map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="text-white font-medium w-8">{day.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="text-xs text-white/70 mb-1">사용자</div>
                        <ProgressBar value={day.users} max={25} color="bg-gradient-to-r from-purple-400 to-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-white/70 mb-1">퀴즈</div>
                        <ProgressBar value={day.quizzes} max={40} color="bg-gradient-to-r from-blue-400 to-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-400 text-sm">{day.users}</div>
                    <div className="text-blue-400 text-sm">{day.quizzes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
            <FaEye className="text-cyan-400" />
            실시간 활동
          </h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-300 font-medium">{activity.user}</span>
                  <span className="text-white/70">{activity.action}</span>
                </div>
                <span className="text-white/50 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 