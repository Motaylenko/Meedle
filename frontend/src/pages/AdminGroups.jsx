import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './AdminGroups.css'

function AdminGroups() {
    const navigate = useNavigate()
    const [groups, setGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [groupStudents, setGroupStudents] = useState([])
    const [allStudents, setAllStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [studentSearchQuery, setStudentSearchQuery] = useState('')

    useEffect(() => {
        loadInitialData()
    }, [])

    useEffect(() => {
        if (selectedGroup) {
            loadGroupStudents(selectedGroup.id)
        }
    }, [selectedGroup])

    const loadInitialData = async () => {
        try {
            setLoading(true)
            const [groupsData, studentsData] = await Promise.all([
                api.getGroups(),
                api.getStudents()
            ])
            setGroups(groupsData)
            setAllStudents(studentsData)
        } catch (err) {
            console.error('Failed to load initial data:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadGroupStudents = async (groupId) => {
        try {
            const students = await api.getGroupStudents(groupId)
            setGroupStudents(students)
        } catch (err) {
            console.error('Failed to load group students:', err)
        }
    }

    const handleCreateGroup = async (e) => {
        e.preventDefault()
        try {
            await api.createGroup(newGroupName)
            setNewGroupName('')
            setIsGroupModalOpen(false)
            loadInitialData()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteGroup = async (e, id) => {
        e.stopPropagation()
        if (!window.confirm('Ви впевнені, що хочете видалити цю групу?')) return
        try {
            await api.deleteGroup(id)
            if (selectedGroup?.id === id) setSelectedGroup(null)
            loadInitialData()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleAddStudent = async (studentId) => {
        try {
            await api.updateGroupStudents(selectedGroup.id, [studentId], 'add')
            loadGroupStudents(selectedGroup.id)
            loadInitialData() // To update students without groups
        } catch (err) {
            alert(err.message)
        }
    }

    const handleRemoveStudent = async (studentId) => {
        if (!window.confirm('Видалити студента з групи?')) return
        try {
            await api.updateGroupStudents(selectedGroup.id, [studentId], 'remove')
            loadGroupStudents(selectedGroup.id)
            loadInitialData()
        } catch (err) {
            alert(err.message)
        }
    }

    const studentsWithoutGroup = allStudents.filter(s => !s.group)

    if (loading && groups.length === 0) {
        return <div className="loading-state"><div className="spinner"></div></div>
    }

    return (
        <div className="admin-groups-page">
            <div className="container">
                <div className="page-header">
                    <div className="header-text">
                        <h1>👥 Управління групами та студентами</h1>
                        <p>Створюйте групи та призначайте до них студентів</p>
                    </div>
                    <button className="add-group-btn" onClick={() => setIsGroupModalOpen(true)}>
                        + Створити групу
                    </button>
                </div>

                <div className="groups-management-grid">
                    {/* Groups List */}
                    <div className="groups-sidebar">
                        <div className="sidebar-header">
                            <h3>Групи ({groups.length})</h3>
                            <input
                                type="text"
                                placeholder="Пошук групи..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="sidebar-search"
                            />
                        </div>
                        <div className="groups-list">
                            {groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(group => (
                                <div
                                    key={group.id}
                                    className={`group-item-card ${selectedGroup?.id === group.id ? 'active' : ''}`}
                                    onClick={() => setSelectedGroup(group)}
                                >
                                    <span className="group-name">{group.name}</span>
                                    <button
                                        className="delete-icon-btn"
                                        onClick={(e) => handleDeleteGroup(e, group.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Group Details / Student Management */}
                    <div className="management-main">
                        {selectedGroup ? (
                            <div className="group-details-view animate-fade-in">
                                <div className="details-header">
                                    <div className="title-area">
                                        <h2>Студенти групи: {selectedGroup.name}</h2>
                                        <button
                                            className="goto-schedule-btn"
                                            onClick={() => navigate('/admin/schedule')}
                                        >
                                            📅 Перейти до розкладу
                                        </button>
                                    </div>
                                    <div className="student-search">
                                        <input
                                            type="text"
                                            placeholder="Пошук студента..."
                                            value={studentSearchQuery}
                                            onChange={(e) => setStudentSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="students-tables-container">
                                    {/* Current Students */}
                                    <div className="students-section">
                                        <h3>У групі ({groupStudents.length})</h3>
                                        <div className="students-list">
                                            {groupStudents.filter(s => s.fullName.toLowerCase().includes(studentSearchQuery.toLowerCase())).map(student => (
                                                <div key={student.id} className="student-row">
                                                    <div className="student-info">
                                                        <span className="name">{student.fullName}</span>
                                                        <span className="email">{student.email}</span>
                                                    </div>
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => handleRemoveStudent(student.id)}
                                                    >
                                                        Видалити
                                                    </button>
                                                </div>
                                            ))}
                                            {groupStudents.length === 0 && <p className="empty-text">У цій групі ще немає студентів</p>}
                                        </div>
                                    </div>

                                    {/* Available Students */}
                                    <div className="students-section available">
                                        <h3>Студенти без групи ({studentsWithoutGroup.length})</h3>
                                        <div className="students-list">
                                            {studentsWithoutGroup.filter(s => s.fullName.toLowerCase().includes(studentSearchQuery.toLowerCase())).map(student => (
                                                <div key={student.id} className="student-row">
                                                    <div className="student-info">
                                                        <span className="name">{student.fullName}</span>
                                                        <span className="email">{student.email}</span>
                                                    </div>
                                                    <button
                                                        className="add-btn"
                                                        onClick={() => handleAddStudent(student.id)}
                                                    >
                                                        Додати
                                                    </button>
                                                </div>
                                            ))}
                                            {studentsWithoutGroup.length === 0 && <p className="empty-text">Немає вільних студентів</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-selection">
                                <div className="empty-icon">👥</div>
                                <h3>Виберіть групу зліва</h3>
                                <p>Щоб переглянути або змінити список студентів</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Group Modal */}
            {isGroupModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Створити нову групу</h2>
                            <button className="close-btn" onClick={() => setIsGroupModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateGroup}>
                            <div className="form-group">
                                <label>Назва групи</label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Наприклад: КІ-21-1"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setIsGroupModalOpen(false)}>Скасувати</button>
                                <button type="submit" className="save-btn">Створити</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminGroups
