"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaClipboard, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSearch, FaSave, FaTimes, FaQuestionCircle } from 'react-icons/fa'

interface Quiz {
  id: number
  topic: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct: number
  explanation: string
  created_at: string
}

export default function QuizManagementPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    topic: '',
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct: 1,
    explanation: ''
  })

  // 퀴즈 목록 로드
  const loadQuizzes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/quiz/topics`)
      if (response.ok) {
        const topicList = await response.json()
        setTopics(topicList)
        
        // 모든 토픽의 퀴즈 로드
        const allQuizzes: Quiz[] = []
        for (const topic of topicList) {
          const quizResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/quiz/${topic}`)
          if (quizResponse.ok) {
            const topicQuizzes = await quizResponse.json()
            allQuizzes.push(...topicQuizzes)
          }
        }
        setQuizzes(allQuizzes)
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuizzes()
  }, [])

  // 필터링된 퀴즈 목록
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.topic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTopic = selectedTopic === 'all' || quiz.topic === selectedTopic
    return matchesSearch && matchesTopic
  })

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      topic: '',
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct: 1,
      explanation: ''
    })
  }

  // 퀴즈 추가
  const handleAddQuiz = async () => {
    if (!formData.topic || !formData.question || !formData.option1 || !formData.option2) {
      alert('필수 필드를 모두 입력해주세요.')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/quiz/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsAddModalOpen(false)
        resetForm()
        loadQuizzes()
        alert('퀴즈가 성공적으로 추가되었습니다!')
      } else {
        alert('퀴즈 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error adding quiz:', error)
      alert('퀴즈 추가 중 오류가 발생했습니다.')
    }
  }

  // 퀴즈 수정
  const handleEditQuiz = async () => {
    if (!editingQuiz || !formData.topic || !formData.question) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/quiz/${editingQuiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsEditModalOpen(false)
        setEditingQuiz(null)
        resetForm()
        loadQuizzes()
        alert('퀴즈가 성공적으로 수정되었습니다!')
      } else {
        alert('퀴즈 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error updating quiz:', error)
      alert('퀴즈 수정 중 오류가 발생했습니다.')
    }
  }

  // 퀴즈 삭제
  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/quiz/${quizToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setIsDeleteModalOpen(false)
        setQuizToDelete(null)
        loadQuizzes()
        alert('퀴즈가 성공적으로 삭제되었습니다!')
      } else {
        alert('퀴즈 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('퀴즈 삭제 중 오류가 발생했습니다.')
    }
  }

  // 수정 시작
  const startEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setFormData({
      topic: quiz.topic,
      question: quiz.question,
      option1: quiz.option1,
      option2: quiz.option2,
      option3: quiz.option3,
      option4: quiz.option4,
      correct: quiz.correct,
      explanation: quiz.explanation
    })
    setIsEditModalOpen(true)
  }

  const QuizModal = ({ isOpen, onClose, onSave, title }: {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    title: string
  }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-xl">{title}</h3>
              <button onClick={onClose} className="text-white/70 hover:text-white">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">토픽</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="퀴즈 토픽을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">질문</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows={3}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="퀴즈 질문을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num}>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      옵션 {num} {formData.correct === num && <span className="text-green-400">(정답)</span>}
                    </label>
                    <input
                      type="text"
                      value={formData[`option${num}` as keyof typeof formData] as string}
                      onChange={(e) => setFormData({ ...formData, [`option${num}`]: e.target.value })}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder={`옵션 ${num}을 입력하세요`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">정답</label>
                <select
                  value={formData.correct}
                  onChange={(e) => setFormData({ ...formData, correct: parseInt(e.target.value) })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value={1} className="bg-gray-800">옵션 1</option>
                  <option value={2} className="bg-gray-800">옵션 2</option>
                  <option value={3} className="bg-gray-800">옵션 3</option>
                  <option value={4} className="bg-gray-800">옵션 4</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">설명</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows={3}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="정답에 대한 설명을 입력하세요"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onSave}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <FaSave className="w-4 h-4" />
                저장
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
                <FaClipboard className="text-indigo-400" />
                퀴즈 관리
              </h1>
              <p className="text-white/70 mt-1">퀴즈를 생성, 수정, 삭제할 수 있습니다</p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm()
              setIsAddModalOpen(true)
            }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            퀴즈 추가
          </button>
        </div>

        {/* 필터 및 검색 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="퀴즈 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all" className="bg-gray-800">모든 토픽</option>
            {topics.map(topic => (
              <option key={topic} value={topic} className="bg-gray-800">{topic}</option>
            ))}
          </select>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-white">{quizzes.length}</div>
            <div className="text-white/70 text-sm">총 퀴즈</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-indigo-400">{topics.length}</div>
            <div className="text-white/70 text-sm">토픽 수</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-purple-400">{filteredQuizzes.length}</div>
            <div className="text-white/70 text-sm">필터된 퀴즈</div>
          </div>
        </div>

        {/* 퀴즈 목록 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white/70">로딩 중...</div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="p-8 text-center text-white/70">
              {searchTerm || selectedTopic !== 'all' ? '검색 결과가 없습니다.' : '등록된 퀴즈가 없습니다.'}
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-6 hover:bg-white/5 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium">
                          {quiz.topic}
                        </span>
                        <span className="text-white/50 text-sm">#{quiz.id}</span>
                      </div>
                      <h3 className="text-white font-medium mb-3 leading-relaxed">{quiz.question}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {[quiz.option1, quiz.option2, quiz.option3, quiz.option4].map((option, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-lg text-sm ${
                              index + 1 === quiz.correct
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-white/5 text-white/70'
                            }`}
                          >
                            {index + 1}. {option}
                          </div>
                        ))}
                      </div>

                      {quiz.explanation && (
                        <p className="text-white/60 text-sm bg-white/5 p-3 rounded-lg">
                          <FaQuestionCircle className="inline mr-2" />
                          {quiz.explanation}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEdit(quiz)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                        title="수정"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setQuizToDelete(quiz)
                          setIsDeleteModalOpen(true)
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                        title="삭제"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 퀴즈 추가 모달 */}
      <QuizModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddQuiz}
        title="새 퀴즈 추가"
      />

      {/* 퀴즈 수정 모달 */}
      <QuizModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingQuiz(null)
          resetForm()
        }}
        onSave={handleEditQuiz}
        title="퀴즈 수정"
      />

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && quizToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4">
            <h3 className="text-white font-bold text-lg mb-4">퀴즈 삭제 확인</h3>
            <p className="text-white/70 mb-6">
              이 퀴즈를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteQuiz}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
              >
                삭제
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 