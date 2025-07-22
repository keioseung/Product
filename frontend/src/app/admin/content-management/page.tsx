"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaBookOpen, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSearch, FaSave, FaTimes, FaTag, FaCalendar } from 'react-icons/fa'

interface BaseContent {
  id: number
  title: string
  content: string
  category: string
  created_at: string
}

export default function ContentManagementPage() {
  const router = useRouter()
  const [contents, setContents] = useState<BaseContent[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<BaseContent | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [contentToDelete, setContentToDelete] = useState<BaseContent | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  })

  // 컨텐츠 목록 로드
  const loadContents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/base-content/`)
      if (response.ok) {
        const data = await response.json()
        setContents(data)
        
        // 카테고리 추출
        const uniqueCategories = [...new Set(data.map((item: BaseContent) => item.category).filter(Boolean))] as string[]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Failed to load contents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContents()
  }, [])

  // 필터링된 컨텐츠 목록
  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: ''
    })
  }

  // 컨텐츠 추가
  const handleAddContent = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/base-content/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsAddModalOpen(false)
        resetForm()
        loadContents()
        alert('컨텐츠가 성공적으로 추가되었습니다!')
      } else {
        alert('컨텐츠 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error adding content:', error)
      alert('컨텐츠 추가 중 오류가 발생했습니다.')
    }
  }

  // 컨텐츠 수정
  const handleEditContent = async () => {
    if (!editingContent || !formData.title || !formData.content || !formData.category) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/base-content/${editingContent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsEditModalOpen(false)
        setEditingContent(null)
        resetForm()
        loadContents()
        alert('컨텐츠가 성공적으로 수정되었습니다!')
      } else {
        alert('컨텐츠 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error updating content:', error)
      alert('컨텐츠 수정 중 오류가 발생했습니다.')
    }
  }

  // 컨텐츠 삭제
  const confirmDeleteContent = async () => {
    if (!contentToDelete) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/base-content/${contentToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setIsDeleteModalOpen(false)
        setContentToDelete(null)
        loadContents()
        alert('컨텐츠가 성공적으로 삭제되었습니다!')
      } else {
        alert('컨텐츠 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting content:', error)
      alert('컨텐츠 삭제 중 오류가 발생했습니다.')
    }
  }

  // 수정 시작
  const startEdit = (content: BaseContent) => {
    setEditingContent(content)
    setFormData({
      title: content.title,
      content: content.content,
      category: content.category
    })
    setIsEditModalOpen(true)
  }

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const ContentModal = ({ isOpen, onClose, onSave, title }: {
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
                <label className="block text-white/80 text-sm font-medium mb-2">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  placeholder="컨텐츠 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">카테고리</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  placeholder="카테고리를 입력하세요 (예: AI기초, 머신러닝, 딥러닝)"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">내용</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                  placeholder="컨텐츠 내용을 입력하세요..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onSave}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
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
                <FaBookOpen className="text-green-400" />
                컨텐츠 관리
              </h1>
              <p className="text-white/70 mt-1">학습 자료 및 기반 컨텐츠를 관리할 수 있습니다</p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm()
              setIsAddModalOpen(true)
            }}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            컨텐츠 추가
          </button>
        </div>

        {/* 필터 및 검색 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="컨텐츠 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <option value="all" className="bg-gray-800">모든 카테고리</option>
            {categories.map(category => (
              <option key={category} value={category} className="bg-gray-800">{category}</option>
            ))}
          </select>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-white">{contents.length}</div>
            <div className="text-white/70 text-sm">총 컨텐츠</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-green-400">{categories.length}</div>
            <div className="text-white/70 text-sm">카테고리 수</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-emerald-400">{filteredContents.length}</div>
            <div className="text-white/70 text-sm">필터된 컨텐츠</div>
          </div>
        </div>

        {/* 컨텐츠 목록 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white/70">로딩 중...</div>
          ) : filteredContents.length === 0 ? (
            <div className="p-8 text-center text-white/70">
              {searchTerm || selectedCategory !== 'all' ? '검색 결과가 없습니다.' : '등록된 컨텐츠가 없습니다.'}
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredContents.map((content) => (
                <div key={content.id} className="p-6 hover:bg-white/5 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium flex items-center gap-1">
                          <FaTag className="w-3 h-3" />
                          {content.category}
                        </span>
                        <span className="text-white/50 text-sm flex items-center gap-1">
                          <FaCalendar className="w-3 h-3" />
                          {formatDate(content.created_at)}
                        </span>
                      </div>
                      
                      <h3 className="text-white font-bold text-lg mb-3">{content.title}</h3>
                      
                      <div className="text-white/70 text-sm leading-relaxed bg-white/5 p-4 rounded-lg">
                        {content.content.length > 200 
                          ? `${content.content.substring(0, 200)}...`
                          : content.content
                        }
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEdit(content)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                        title="수정"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setContentToDelete(content)
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

      {/* 컨텐츠 추가 모달 */}
      <ContentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddContent}
        title="새 컨텐츠 추가"
      />

      {/* 컨텐츠 수정 모달 */}
      <ContentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingContent(null)
          resetForm()
        }}
        onSave={handleEditContent}
        title="컨텐츠 수정"
      />

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && contentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4">
            <h3 className="text-white font-bold text-lg mb-4">컨텐츠 삭제 확인</h3>
            <p className="text-white/70 mb-6">
              "<strong>{contentToDelete.title}</strong>" 컨텐츠를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteContent}
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