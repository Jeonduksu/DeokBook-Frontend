import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { userService } from '../../services/userService';
import LoadingSpinner from '../common/LoadingSpinner';
import Model from '../common/Model';
import Table from '../common/Table';

const UserManagement = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        userMemo: '',
        rule: 'U'
    });

    // API 호출 - 사용자 목록 로드
    const { data: users, loading, error, refetch } = useApi(
        () => userService.getUsers(),
        []
    );

    // 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userService.updateUser(editingUser.id, formData);
            } else {
                await userService.createUser(formData);
            }
            await refetch();
            resetForm();
        } catch (err) {
            console.error('사용자 저장 실패:', err);
            alert('사용자 저장에 실패했습니다: ' + err.message);
        }
    };

    // 사용자 수정
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            password: '', // 보안상 비밀번호는 비움
            name: user.name,
            phone: user.phone,
            userMemo: user.userMemo || '',
            rule: user.rule
        });
        setShowForm(true);
    };

    // 사용자 삭제
    const handleDelete = async (user) => {
        if (window.confirm(`정말 "${user.name}" 사용자를 삭제하시겠습니까?`)) {
            try {
                await userService.deleteUser(user.id);
                await refetch();
            } catch (err) {
                console.error('사용자 삭제 실패:', err);
                alert('사용자 삭제에 실패했습니다: ' + err.message);
            }
        }
    };

    // 폼 초기화
    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            name: '',
            phone: '',
            userMemo: '',
            rule: 'U'
        });
        setEditingUser(null);
        setShowForm(false);
    };

    // 폼 입력 변경 처리
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 테이블 컬럼 정의
    const columns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: '이름' },
        { key: 'email', header: '이메일' },
        { key: 'phone', header: '전화번호' },
        {
            key: 'rule',
            header: '권한',
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    value === 'A' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
          {value === 'A' ? '관리자' : '일반사용자'}
        </span>
            )
        },
        { key: 'userMemo', header: '메모' }
    ];

    // 테이블 액션 정의
    const actions = [
        {
            icon: <Edit2 size={16} />,
            onClick: handleEdit,
            className: 'text-blue-600 hover:text-blue-800',
            title: '수정'
        },
        {
            icon: <Trash2 size={16} />,
            onClick: handleDelete,
            className: 'text-red-600 hover:text-red-800',
            title: '삭제'
        }
    ];

    if (loading) return <LoadingSpinner text="사용자 목록을 불러오는 중..." />;
    if (error) return <div className="text-red-600">오류: {error}</div>;

    return (
        <div>
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">사용자 관리</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                    <Plus size={16} />
                    사용자 등록
                </button>
            </div>

            {/* 사용자 등록/수정 모달 */}
            <Model
                isOpen={showForm}
                onClose={resetForm}
                title={editingUser ? '사용자 수정' : '사용자 등록'}
                size="medium"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                이메일 *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={!!editingUser} // 수정 시 이메일 변경 불가
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                비밀번호 {!editingUser && '*'}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required={!editingUser}
                                placeholder={editingUser ? '변경하지 않으려면 비워두세요' : ''}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                이름 *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                전화번호 *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                placeholder="010-1234-5678"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                권한
                            </label>
                            <select
                                name="rule"
                                value={formData.rule}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="U">일반사용자</option>
                                <option value="A">관리자</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                메모
                            </label>
                            <input
                                type="text"
                                name="userMemo"
                                value={formData.userMemo}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="부서나 기타 정보"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            {editingUser ? '수정' : '등록'}
                        </button>
                    </div>
                </form>
            </Model>

            {/* 사용자 목록 테이블 */}
            <Table
                columns={columns}
                data={users || []}
                actions={actions}
            />

            {/* 통계 정보 */}
            {users && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-blue-600 text-sm font-medium">총 사용자</div>
                        <div className="text-2xl font-bold text-blue-900">{users.length}명</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-green-600 text-sm font-medium">일반사용자</div>
                        <div className="text-2xl font-bold text-green-900">
                            {users.filter(user => user.rule === 'U').length}명
                        </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-red-600 text-sm font-medium">관리자</div>
                        <div className="text-2xl font-bold text-red-900">
                            {users.filter(user => user.rule === 'A').length}명
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;