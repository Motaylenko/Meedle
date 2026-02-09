import { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminSchedule.css'

function AdminSchedule() {
    const [groups, setGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(true)
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
    const [isBellModalOpen, setIsBellModalOpen] = useState(false)
    const [bellSchedules, setBellSchedules] = useState([])
    const [newBell, setNewBell] = useState({ number: '', startTime: '', endTime: '' })
    const [groupSearchQuery, setGroupSearchQuery] = useState('')

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
        weekType: 'EVERY',
        bellScheduleId: '',
        date: ''
    })

    const days = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота']

    useEffect(() => {
        loadGroups()
        loadBellSchedules()
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
            setGroups(data)
        } catch (err) {
            console.error('Failed to load groups:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadBellSchedules = async () => {
        try {
            const data = await api.getBellSchedules()
            setBellSchedules(data)
        } catch (err) {
            console.error('Failed to load bell schedules:', err)
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



    const handleDeleteGroup = async (e, id) => {
        e.stopPropagation()
        if (!window.confirm('Ви впевнені, що хочете видалити цю групу? Це також змінить прив’язку курсів та студентів.')) return
        try {
            await api.deleteGroup(id)
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
                weekType: lesson.weekType || 'EVERY',
                bellScheduleId: lesson.bellScheduleId || '',
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
                weekType: 'EVERY',
                bellScheduleId: '',
                date: ''
            })
        }
        setIsLessonModalOpen(true)
    }

    const handleBellSelect = (bellId) => {
        if (!bellId) {
            setLessonForm({ ...lessonForm, bellScheduleId: '' })
            return
        }
        const bell = bellSchedules.find(b => b.id === parseInt(bellId))
        if (bell) {
            setLessonForm({
                ...lessonForm,
                bellScheduleId: bellId,
                time: bell.startTime,
                endTime: bell.endTime
            })
        }
    }

    const handleSaveBell = async (e) => {
        e.preventDefault()
        try {
            await api.saveBellSchedule(newBell)
            setNewBell({ number: '', startTime: '', endTime: '' })
            loadBellSchedules()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteBell = async (id) => {
        if (!window.confirm('Видалити цей розклад дзвінків?')) return
        try {
            await api.deleteBellSchedule(id)
            loadBellSchedules()
        } catch (err) {
            alert(err.message)
        }
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
                            <div className="header-actions">
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="🔍 Пошук групи..."
                                        value={groupSearchQuery}
                                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                                        className="group-search-input"
                                    />
                                </div>
                                <button className="add-lesson-btn secondary" onClick={() => setIsBellModalOpen(true)}>
                                    🔔 Розклад дзвінків
                                </button>
                            </div>
                        </div>

                        <div className="groups-grid">
                            {groups.filter(g => g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).map(group => (
                                <div key={group.id} className="group-card" onClick={() => setSelectedGroup(group)}>
                                    <div className="group-icon">👥</div>
                                    <div className="group-info">
                                        <h3>{group.name}</h3>
                                        <p>Група студентів</p>
                                    </div>
                                    <button
                                        className="group-delete-btn"
                                        onClick={(e) => handleDeleteGroup(e, group.id)}
                                        title="Видалити групу"
                                    >
                                        🗑️
                                    </button>
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
                                                    <div className="lesson-time-container">
                                                        <div className="lesson-time-badge">{lesson.time} - {lesson.endTime}</div>
                                                        {lesson.weekType !== 'EVERY' && (
                                                            <div className={`week-type-badge ${lesson.weekType}`}>
                                                                {lesson.weekType === 'UPPER' ? 'Чисельник' : 'Знаменник'}
                                                            </div>
                                                        )}
                                                    </div>
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

                            <div className="form-group">
                                <label>Періодичність</label>
                                <select
                                    value={lessonForm.weekType}
                                    onChange={(e) => setLessonForm({ ...lessonForm, weekType: e.target.value })}
                                >
                                    <option value="EVERY">Щотижня</option>
                                    <option value="UPPER">Верхній тиждень (Чисельник)</option>
                                    <option value="LOWER">Нижній тиждень (Знаменник)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Номер пари (автозаповнення часу)</label>
                                <select
                                    value={lessonForm.bellScheduleId}
                                    onChange={(e) => handleBellSelect(e.target.value)}
                                >
                                    <option value="">Виберіть пару</option>
                                    {bellSchedules.map(bell => (
                                        <option key={bell.id} value={bell.id}>{bell.number} пара ({bell.startTime} - {bell.endTime})</option>
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
            {/* Bell Schedule Modal */}
            {isBellModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content bell-modal">
                        <div className="modal-header">
                            <h2>🔔 Управління розкладом дзвінків</h2>
                            <button className="close-btn" onClick={() => setIsBellModalOpen(false)}>&times;</button>
                        </div>
                        <div className="bell-manager">
                            <form onSubmit={handleSaveBell} className="bell-form">
                                <input
                                    type="number"
                                    placeholder="№"
                                    value={newBell.number}
                                    onChange={e => setNewBell({ ...newBell, number: e.target.value })}
                                    required
                                />
                                <input
                                    type="time"
                                    value={newBell.startTime}
                                    onChange={e => setNewBell({ ...newBell, startTime: e.target.value })}
                                    required
                                />
                                <input
                                    type="time"
                                    value={newBell.endTime}
                                    onChange={e => setNewBell({ ...newBell, endTime: e.target.value })}
                                    required
                                />
                                <button type="submit" className="save-btn small">Додати</button>
                            </form>

                            <div className="bell-list">
                                {bellSchedules.map(bell => (
                                    <div key={bell.id} className="bell-item">
                                        <span>{bell.number} пара</span>
                                        <span>{bell.startTime} - {bell.endTime}</span>
                                        <button onClick={() => handleDeleteBell(bell.id)} className="delete-btn small">🗑️</button>
                                    </div>
                                ))}
                                {bellSchedules.length === 0 && <p className="empty-text">Розклад дзвінків не налаштовано</p>}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="save-btn" onClick={() => setIsBellModalOpen(false)}>Закрити</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminSchedule
