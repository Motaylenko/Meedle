import { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminSchedule.css'

function AdminSchedule() {
    const [groups, setGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(true)
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')

    // Lesson Form State
    const [editingLesson, setEditingLesson] = useState(null)
    const [groupCourses, setGroupCourses] = useState([])
    const [lessonForm, setLessonForm] = useState({
        courseId: '',
        day: 'Понеділок',
        time: '09:00',
        endTime: '10:30',
        room: '',
        type: 'lecture',
        isTemporary: false,
        date: ''
    })

    const days = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота', 'Неділя']

    useEffect(() => {
        loadGroups()
    }, [])

    useEffect(() => {
        if (selectedGroup) {
            loadGroupData(selectedGroup.id)
        }
    }, [selectedGroup])

    const loadGroups = async () => {
        try {
            setLoading(true)
            const data = await api.getGroups()
            // Backend now returns object with id and name
            setGroups(data)
        } catch (err) {
            console.error('Failed to load groups:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadGroupData = async (groupId) => {
        try {
            setLoading(true)
            const [scheduleData, coursesData] = await Promise.all([
                api.getGroupSchedule(groupId),
                api.getGroupCourses(groupId)
            ])
            setSchedule(scheduleData)
            setGroupCourses(coursesData)
        } catch (err) {
            console.error('Failed to load group data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateGroup = async (e) => {
        e.preventDefault()
        try {
            await api.createGroup(newGroupName)
            setNewGroupName('')
            setIsGroupModalOpen(false)
            loadGroups()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleOpenEditLesson = (lesson = null) => {
        if (lesson) {
            setEditingLesson(lesson)
            setLessonForm({
                id: lesson.id,
                courseId: lesson.courseId,
                day: lesson.day,
                time: lesson.time,
                endTime: lesson.endTime,
                room: lesson.room,
                type: lesson.type,
                isTemporary: lesson.isTemporary || false,
                date: lesson.date || ''
            })
        } else {
            setEditingLesson(null)
            setLessonForm({
                courseId: groupCourses[0]?.id || '',
                day: 'Понеділок',
                time: '09:00',
                endTime: '10:30',
                room: '',
                type: 'lecture',
                isTemporary: false,
                date: ''
            })
        }
        setIsLessonModalOpen(true)
    }

    const handleSaveLesson = async (e) => {
        e.preventDefault()
        try {
            await api.saveSchedule(selectedGroup.id, lessonForm)
            setIsLessonModalOpen(false)
            loadGroupData(selectedGroup.id)
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteLesson = async (id) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей запис?')) return
        try {
            await api.deleteSchedule(id)
            loadGroupData(selectedGroup.id)
        } catch (err) {
            alert(err.message)
        }
    }

    if (loading && groups.length === 0) {
        return <div className="loading-state"><div className="spinner"></div></div>
    }

    return (
        <div className="admin-schedule-page">
            <div className="container">
                {!selectedGroup ? (
                    <div className="animate-fade-in">
                        <div className="page-header">
                            <div className="header-text">
                                <h1>🏢 Управління групами</h1>
                                <p>Виберіть групу для редагування розкладу</p>
                            </div>
                            <button className="add-lesson-btn" onClick={() => setIsGroupModalOpen(true)}>
                                + Додати групу
                            </button>
                        </div>

                        <div className="groups-grid">
                            {groups.map(group => (
                                <div key={group.id} className="group-card" onClick={() => setSelectedGroup(group)}>
                                    <div className="group-icon">👥</div>
                                    <div className="group-info">
                                        <h3>{group.name}</h3>
                                        <p>Група студентів</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="schedule-editor-section">
                        <button className="back-btn" onClick={() => setSelectedGroup(null)}>
                            ← Назад до списку груп
                        </button>

                        <div className="editor-header">
                            <div>
                                <h1>📅 Розклад: {selectedGroup.name}</h1>
                                <p>Редагування тижневого графіка та тимчасових змін</p>
                            </div>
                            <button className="add-lesson-btn" onClick={() => handleOpenEditLesson()}>
                                + Додати пару
                            </button>
                        </div>

                        <div className="admin-schedule-grid">
                            {days.map(day => {
                                const daySchedule = schedule.find(s => s.day === day)
                                return (
                                    <div key={day} className="admin-day-card">
                                        <div className="admin-day-header">
                                            <h2>{day}</h2>
                                        </div>
                                        <div className="admin-lessons-list">
                                            {daySchedule?.lessons.map(lesson => (
                                                <div key={lesson.id} className="admin-lesson-item">
                                                    <div className="lesson-time-badge">{lesson.time} - {lesson.endTime}</div>
                                                    <div className="lesson-info">
                                                        <div className="lesson-title">{lesson.name}</div>
                                                        <div className="lesson-meta">
                                                            <span>🚪 {lesson.room}</span>
                                                            <span className={`badge ${lesson.type}`}>{lesson.type === 'lecture' ? 'Лекція' : 'Практика'}</span>
                                                        </div>
                                                    </div>

                                                    {lesson.isTemporary && <span className="temporary-badge">Тимчасово {lesson.date}</span>}

                                                    <div className="lesson-actions">
                                                        <button className="action-btn edit-btn" onClick={() => handleOpenEditLesson(lesson)}>✏️</button>
                                                        <button className="action-btn delete-btn" onClick={() => handleDeleteLesson(lesson.id)}>🗑️</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!daySchedule || daySchedule.lessons.length === 0) && (
                                                <p className="empty-text">Немає занять</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Group Modal */}
            {isGroupModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Додати нову групу</h2>
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

            {/* Lesson Modal */}
            {isLessonModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingLesson ? 'Редагувати пару' : 'Додати пару'}</h2>
                            <button className="close-btn" onClick={() => setIsLessonModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveLesson}>
                            <div className="form-group">
                                <label>Курс / Дисципліна</label>
                                <select
                                    value={lessonForm.courseId}
                                    onChange={(e) => setLessonForm({ ...lessonForm, courseId: e.target.value })}
                                    required
                                >
                                    <option value="">Виберіть курс</option>
                                    {groupCourses.map(course => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>День тижня</label>
                                    <select
                                        value={lessonForm.day}
                                        onChange={(e) => setLessonForm({ ...lessonForm, day: e.target.value })}
                                    >
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Тип заняття</label>
                                    <select
                                        value={lessonForm.type}
                                        onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                                    >
                                        <option value="lecture">Лекція</option>
                                        <option value="practice">Практика</option>
                                        <option value="lab">Лабораторна</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Початок</label>
                                    <input
                                        type="time"
                                        value={lessonForm.time}
                                        onChange={(e) => setLessonForm({ ...lessonForm, time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Кінець</label>
                                    <input
                                        type="time"
                                        value={lessonForm.endTime}
                                        onChange={(e) => setLessonForm({ ...lessonForm, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Аудиторія</label>
                                <input
                                    type="text"
                                    value={lessonForm.room}
                                    onChange={(e) => setLessonForm({ ...lessonForm, room: e.target.value })}
                                    placeholder="Наприклад: Ауд. 301"
                                    required
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="isTemporary"
                                    checked={lessonForm.isTemporary}
                                    onChange={(e) => setLessonForm({ ...lessonForm, isTemporary: e.target.checked })}
                                />
                                <label htmlFor="isTemporary">Тимчасова заміна / Спеціальна дата</label>
                            </div>

                            {lessonForm.isTemporary && (
                                <div className="form-group">
                                    <label>Дата</label>
                                    <input
                                        type="date"
                                        value={lessonForm.date}
                                        onChange={(e) => setLessonForm({ ...lessonForm, date: e.target.value })}
                                        required={lessonForm.isTemporary}
                                    />
                                </div>
                            )}

                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setIsLessonModalOpen(false)}>Скасувати</button>
                                <button type="submit" className="save-btn">{editingLesson ? 'Зберегти зміни' : 'Додати'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminSchedule
