"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaUsers, FaEdit, FaTrash, FaArrowLeft, FaUserShield, FaUser, FaSearch, FaPlus, FaExclamationTriangle } from 'react-icons/fa'
import { User } from '@/types'

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ username: '', role: 'user' as 'admin' | 'user' })

  // 사용자 목록 로드
  useEffect(() => {
    const loadUsers = () => {
      const storedUsers = localStorage.getItem('users')
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers))
      }
    }
    loadUsers()
  }, [])

  // 검색 필터링
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 사용자 삭제
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      const updatedUsers = users.filter(u => u.username !== userToDelete.username)
      setUsers(updatedUsers)
      localStorage.setItem('users', JSON.stringify(updatedUsers))
      
      // 현재 로그인한 사용자가 삭제된 경우 로그아웃 처리
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const currentUserObj = JSON.parse(currentUser)
        if (currentUserObj.username === userToDelete.username) {
          localStorage.removeItem('currentUser')
          localStorage.removeItem('sessionId')
          localStorage.removeItem('isAdminLoggedIn')
          router.push('/auth')
        }
      }
    }
    setIsDeleteModalOpen(false)
    setUserToDelete(null)
  }

  // 사용자 역할 변경
  const handleRoleChange = (username: string, newRole: 'admin' | 'user') => {
    const updatedUsers = users.map(user =>
      user.username === username ? { ...user, role: newRole } : user
    )
    setUsers(updatedUsers)
    localStorage.setItem('users', JSON.stringify(updatedUsers))

    // 현재 로그인한 사용자의 역할이 변경된 경우 localStorage 업데이트
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      const currentUserObj = JSON.parse(currentUser)
      if (currentUserObj.username === username) {
        const updatedCurrentUser = { ...currentUserObj, role: newRole }
        localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser))
        localStorage.setItem('isAdminLoggedIn', newRole === 'admin' ? 'true' : 'false')
      }
    }
  }

  // 사용자 수정 시작
  const startEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({ username: user.username, role: user.role })
    setIsEditing(true)
  }

  // 사용자 정보 저장
  const saveUserEdit = () => {
    if (selectedUser && editForm.username.trim()) {
      const updatedUsers = users.map(user =>
        user.username === selectedUser.username 
          ? { ...user, username: editForm.username, role: editForm.role }
          : user
      )
      setUsers(updatedUsers)
      localStorage.setItem('users', JSON.stringify(updatedUsers))

      // 현재 로그인한 사용자 정보 업데이트
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const currentUserObj = JSON.parse(currentUser)
        if (currentUserObj.username === selectedUser.username) {
          const updatedCurrentUser = { ...currentUserObj, username: editForm.username, role: editForm.role }
          localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser))
          localStorage.setItem('sessionId', editForm.username)
          localStorage.setItem('isAdminLoggedIn', editForm.role === 'admin' ? 'true' : 'false')
        }
      }

      setIsEditing(false)
      setSelectedUser(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent_50%)]" />

      {/* 메인 컨텐츠 */}
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
                <FaUsers className="text-purple-400" />
                회원 관리
              </h1>
              <p className="text-white/70 mt-1">등록된 회원을 관리할 수 있습니다</p>
            </div>
          </div>
          
          {/* 통계 */}
          <div className="hidden md:flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <div className="text-white/70 text-sm">총 회원</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-white/70 text-sm">관리자</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {users.filter(u => u.role === 'user').length}
              </div>
              <div className="text-white/70 text-sm">일반 회원</div>
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="회원 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>

        {/* 회원 목록 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-white/70">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">사용자명</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">역할</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.username} className={`border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                            {user.role === 'admin' ? (
                              <FaUserShield className="text-white text-sm" />
                            ) : (
                              <FaUser className="text-white text-sm" />
                            )}
                          </div>
                          <span className="text-white font-medium">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.username, e.target.value as 'admin' | 'user')}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                          <option value="user" className="bg-gray-800">일반 사용자</option>
                          <option value="admin" className="bg-gray-800">관리자</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEditUser(user)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="수정"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                            title="삭제"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-red-400 text-xl" />
              <h3 className="text-white font-bold text-lg">회원 삭제 확인</h3>
            </div>
            <p className="text-white/70 mb-6">
              <span className="text-white font-semibold">{userToDelete.username}</span> 회원을 정말 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteUser}
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

      {/* 수정 모달 */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-6">
              <FaEdit className="text-blue-400 text-xl" />
              <h3 className="text-white font-bold text-lg">회원 정보 수정</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">사용자명</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">역할</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'user' })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="user" className="bg-gray-800">일반 사용자</option>
                  <option value="admin" className="bg-gray-800">관리자</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveUserEdit}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
              >
                저장
              </button>
              <button
                onClick={() => setIsEditing(false)}
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