import { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminUsers.css'

function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, teachers: 0, students: 0 })
    const [filters, setFilters] = useState({
        role: 'all',
        sortBy: 'newest',
        searchQuery: ''
    })

    // Block Modal state
    const [blockModal, setBlockModal] = useState({
        isOpen: false,
        userId: null,
        userName: '',
        reason: '',
        duration: 'indefinite', // 'indefinite', 'hour', 'day', 'week', 'custom'
        customDate: ''
    })

    const loadUsers = async () => {
        try {
            setLoading(true)
            const data = await api.getAdminUsers({
                role: filters.role === 'all' ? '' : filters.role,
                sortBy: filters.sortBy
            })
            setUsers(data)

            // Basic stats calculation
            const newStats = {
                total: data.length,
                teachers: data.filter(u => u.role === 'TEACHER').length,
                students: data.filter(u => u.role === 'STUDENT').length
            }
            setStats(newStats)
        } catch (err) {
            console.error('Failed to load users:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [filters.role, filters.sortBy])

    const handleToggleActive = async (user) => {
        // If unblocking, just do it
        if (!user.isActive) {
            try {
                await api.toggleUserActive(user.id)
                loadUsers()
            } catch (err) {
                alert(err.message)
            }
            return
        }

        // If blocking, show modal
        setBlockModal({
            isOpen: true,
            userId: user.id,
            userName: user.fullName,
            reason: '',
            duration: 'indefinite',
            customDate: ''
        })
    }

    const handleConfirmBlock = async () => {
        const { userId, reason, duration, customDate } = blockModal

        let blockedUntil = null
        if (duration !== 'indefinite') {
            const now = new Date()
            if (duration === 'hour') blockedUntil = new Date(now.getTime() + 60 * 60 * 1000)
            else if (duration === 'day') blockedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            else if (duration === 'week') blockedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            else if (duration === 'custom' && customDate) blockedUntil = new Date(customDate)
        }

        try {
            await api.toggleUserActive(userId, { reason, blockedUntil })
            setBlockModal(prev => ({ ...prev, isOpen: false }))
            loadUsers()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цього користувача? Цю дію неможливо скасувати.')) return
        try {
            await api.deleteUser(userId)
            loadUsers()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        user.login.toLowerCase().includes(filters.searchQuery.toLowerCase())
    )

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'ADMIN': return 'badge badge-role-admin'
            case 'TEACHER': return 'badge badge-role-teacher'
            case 'STUDENT': return 'badge badge-role-student'
            default: return 'badge'
        }
    }

    return (
        <div className="admin-users-page animate-fade-in">
            <div className="container">
                <div className="page-header">
                    <div className="header-text">
                        <h1>👥 Управління користувачами</h1>
                        <p>Перегляд, блокування та видалення користувачів платформи</p>
                    </div>
                </div>

                <div className="courses-controls">
                    <div className="control-group filter-select">
                        <select name="role" value={filters.role} onChange={handleFilterChange}>
                            <option value="all">Усі ролі (крім адмінів)</option>
                            <option value="teacher">Викладачі</option>
                            <option value="student">Студенти</option>
                            <option value="admin">Адміністратори</option>
                        </select>
                    </div>

                    <div className="control-group search-input-wrapper">
                        <input
                            type="text"
                            name="searchQuery"
                            placeholder="Знайдіть за ім'ям, email або логіном..."
                            value={filters.searchQuery}
                            onChange={handleFilterChange}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>

                    <div className="control-group sort-select">
                        <label>Сортувати за:</label>
                        <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                            <option value="newest">Нові спочатку</option>
                            <option value="oldest">Старі спочатку</option>
                            <option value="name">Ім'ям (А-Я)</option>
                        </select>
                    </div>
                </div>

                <div className="users-table-container">
                    <div className={`loading-overlay ${loading ? 'active' : ''}`}>
                        <div className="loader"></div>
                        <p>Оновлення списку...</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Користувач</th>
                                <th>Роль</th>
                                <th>Статус</th>
                                <th>Група</th>
                                <th>Реєстрація</th>
                                <th>Дії</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? 'content-loading' : ''}>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="user-row-animate">
                                        <td>
                                            <div className="user-identity">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt="" className="user-avatar-mini" />
                                                ) : (
                                                    <div className="user-avatar-mini">
                                                        {user.fullName.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="user-info-text">
                                                    <span className="user-full-name">{user.fullName}</span>
                                                    <span className="user-email">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={getRoleBadgeClass(user.role)}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.isActive ? 'badge-status-active' : 'badge-status-blocked'}`}>
                                                {user.isActive ? 'Активний' : 'Заблокований'}
                                            </span>
                                        </td>
                                        <td>{user.group || '—'}</td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className={`action-btn ${user.isActive ? 'btn-block' : 'btn-unblock'}`}
                                                    onClick={() => handleToggleActive(user)}
                                                    title={user.isActive ? 'Заблокувати' : 'Розблокувати'}
                                                >
                                                    {user.isActive ? '🚫' : '✅'}
                                                </button>
                                                <button
                                                    className="action-btn btn-delete"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    title="Видалити"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : !loading && (
                                <tr>
                                    <td colSpan="6">
                                        <div className="empty-state">
                                            <p>Жодного користувача не знайдено за вашим запитом</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Block Modal */}
            {blockModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-slide-up">
                        <div className="modal-header">
                            <h3>Блокування користувача</h3>
                            <button className="close-btn" onClick={() => setBlockModal(prev => ({ ...prev, isOpen: false }))}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Ви заблоковуєте: <strong>{blockModal.userName}</strong></p>

                            <div className="form-group">
                                <label>Причина блокування:</label>
                                <textarea
                                    placeholder="Введіть причину (наприклад: Порушення правил платформи)"
                                    value={blockModal.reason}
                                    onChange={(e) => setBlockModal(prev => ({ ...prev, reason: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>Термін блокування:</label>
                                <select
                                    value={blockModal.duration}
                                    onChange={(e) => setBlockModal(prev => ({ ...prev, duration: e.target.value }))}
                                >
                                    <option value="indefinite">На невизначений термін</option>
                                    <option value="hour">На 1 годину</option>
                                    <option value="day">На 1 добу</option>
                                    <option value="week">На 1 тиждень</option>
                                    <option value="custom">Інша дата</option>
                                </select>
                            </div>

                            {blockModal.duration === 'custom' && (
                                <div className="form-group">
                                    <label>Оберіть дату та час:</label>
                                    <input
                                        type="datetime-local"
                                        value={blockModal.customDate}
                                        onChange={(e) => setBlockModal(prev => ({ ...prev, customDate: e.target.value }))}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setBlockModal(prev => ({ ...prev, isOpen: false }))}>
                                Скасувати
                            </button>
                            <button className="btn-confirm-block" onClick={handleConfirmBlock}>
                                Заблокувати
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminUsers
