import { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminGroups.css'

function AdminGroups() {
    const [groups, setGroups] = useState([])
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [groupStudents, setGroupStudents] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [groupsData, studentsData] = await Promise.all([
                api.getGroups(),
                api.getUsers()
            ])
            setGroups(groupsData)
            setStudents(studentsData.filter(u => u.role === 'STUDENT'))
        } catch (err) {
            console.error('Failed to load data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateGroup = async (e) => {
        e.preventDefault()
        if (!newGroupName.trim()) return

        try {
            await api.createGroup(newGroupName)
            setNewGroupName('')
            setIsGroupModalOpen(false)
            loadData()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteGroup = async (id) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цю групу?')) return

        try {
            await api.deleteGroup(id)
            if (selectedGroup?.id === id) {
                setSelectedGroup(null)
                setGroupStudents([])
            }
            loadData()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleSelectGroup = (group) => {
        setSelectedGroup(group)
        const studentsInGroup = students.filter(s => s.group === group.name)
        setGroupStudents(studentsInGroup)
    }

    const handleAddStudentToGroup = async (studentId) => {
        if (!selectedGroup) return

        try {
            await api.updateStudentGroup(studentId, selectedGroup.name)
            loadData()
            // Оновлюємо список студентів групи
            const updatedStudent = students.find(s => s.id === studentId)
            if (updatedStudent) {
                setGroupStudents([...groupStudents, { ...updatedStudent, group: selectedGroup.name }])
            }
        } catch (err) {
            alert(err.message)
        }
    }

    const handleRemoveStudentFromGroup = async (studentId) => {
        try {
            await api.updateStudentGroup(studentId, null)
            loadData()
            setGroupStudents(groupStudents.filter(s => s.id !== studentId))
        } catch (err) {
            alert(err.message)
        }
    }

    const filteredStudents = students.filter(s =>
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        s.group !== selectedGroup?.name
    )

    if (loading) {
        return (
            <div className="admin-groups-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Завантаження...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-groups-page">
            <div className="container">
                <div className="page-header">
                    <h1>👥 Управління групами</h1>
                    <p>Створюйте групи та додавайте до них студентів</p>
                </div>

                <div className="groups-layout">
                    {/* Список груп */}
                    <div className="groups-panel">
                        <div className="panel-header">
                            <h2>Групи</h2>
                            <button className="btn-primary" onClick={() => setIsGroupModalOpen(true)}>
                                + Створити групу
                            </button>
                        </div>

                        <div className="groups-list">
                            {groups.map(group => (
                                <div
                                    key={group.id}
                                    className={`group-card ${selectedGroup?.id === group.id ? 'active' : ''}`}
                                    onClick={() => handleSelectGroup(group)}
                                >
                                    <div className="group-info">
                                        <h3>{group.name}</h3>
                                        <p>{students.filter(s => s.group === group.name).length} студентів</p>
                                    </div>
                                    <button
                                        className="btn-delete"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteGroup(group.id)
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                            {groups.length === 0 && (
                                <div className="empty-state">
                                    <p>Немає груп. Створіть першу групу!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Студенти групи */}
                    <div className="students-panel">
                        {selectedGroup ? (
                            <>
                                <div className="panel-header">
                                    <h2>Студенти групи "{selectedGroup.name}"</h2>
                                    <button className="btn-primary" onClick={() => setIsStudentModalOpen(true)}>
                                        + Додати студента
                                    </button>
                                </div>

                                <div className="students-list">
                                    {groupStudents.map(student => (
                                        <div key={student.id} className="student-card">
                                            <div className="student-info">
                                                <div className="student-avatar">{student.avatar || '🎓'}</div>
                                                <div>
                                                    <h4>{student.fullName}</h4>
                                                    <p>{student.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                className="btn-remove"
                                                onClick={() => handleRemoveStudentFromGroup(student.id)}
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    ))}
                                    {groupStudents.length === 0 && (
                                        <div className="empty-state">
                                            <p>У цій групі ще немає студентів</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="empty-state-large">
                                <div className="empty-icon">👥</div>
                                <h3>Оберіть групу</h3>
                                <p>Виберіть групу зліва, щоб переглянути та керувати студентами</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Модальне вікно створення групи */}
            {isGroupModalOpen && (
                <div className="modal-overlay" onClick={() => setIsGroupModalOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Створити нову групу</h2>
                            <button className="modal-close" onClick={() => setIsGroupModalOpen(false)}>×</button>
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
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsGroupModalOpen(false)}>
                                    Скасувати
                                </button>
                                <button type="submit" className="btn-primary">
                                    Створити
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальне вікно додавання студента */}
            {isStudentModalOpen && (
                <div className="modal-overlay" onClick={() => setIsStudentModalOpen(false)}>
                    <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Додати студента до групи "{selectedGroup?.name}"</h2>
                            <button className="modal-close" onClick={() => setIsStudentModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Пошук студента..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="students-list-modal">
                                {filteredStudents.map(student => (
                                    <div key={student.id} className="student-card-modal">
                                        <div className="student-info">
                                            <div className="student-avatar">{student.avatar || '🎓'}</div>
                                            <div>
                                                <h4>{student.fullName}</h4>
                                                <p>{student.email}</p>
                                                {student.group && <span className="current-group">Група: {student.group}</span>}
                                            </div>
                                        </div>
                                        <button
                                            className="btn-add"
                                            onClick={() => {
                                                handleAddStudentToGroup(student.id)
                                                setIsStudentModalOpen(false)
                                                setSearchQuery('')
                                            }}
                                        >
                                            Додати
                                        </button>
                                    </div>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <div className="empty-state">
                                        <p>Немає доступних студентів</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminGroups
