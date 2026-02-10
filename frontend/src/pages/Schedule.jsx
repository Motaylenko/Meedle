import { useState, useEffect } from 'react'
import api from '../services/api'
import './Schedule.css'
import './GradesAdmin.css' // Reuse some search/dropdown styles

function Schedule() {
    const userJson = localStorage.getItem('user')
    const user = userJson ? JSON.parse(userJson) : null
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(true)
    const [groups, setGroups] = useState([])
    const [groupSearch, setGroupSearch] = useState('')
    const [filteredGroups, setFilteredGroups] = useState([])
    const [selectedGroupId, setSelectedGroupId] = useState(null)
    const [viewingGroup, setViewingGroup] = useState(null)
    const [followedGroupId, setFollowedGroupId] = useState(localStorage.getItem('followedGroupId'))

    useEffect(() => {
        loadGroups()
        // If we have a followed group, load its schedule by default
        if (followedGroupId) {
            loadGroupSchedule(followedGroupId)
        } else {
            loadPersonalSchedule()
        }
    }, [])

    // Filter groups by search
    useEffect(() => {
        if (groupSearch.trim()) {
            const filtered = groups.filter(group =>
                group.name.toLowerCase().includes(groupSearch.toLowerCase())
            )
            setFilteredGroups(filtered)
        } else {
            setFilteredGroups([])
        }
    }, [groupSearch, groups])

    const loadGroups = async () => {
        try {
            const groupsData = await api.getGroups()
            setGroups(groupsData)
        } catch (err) {
            console.error('Failed to load groups:', err)
        }
    }

    const loadPersonalSchedule = async () => {
        try {
            setLoading(true)
            setViewingGroup(null)
            setSelectedGroupId(null)
            const data = await api.getSchedule()
            setSchedule(data)
        } catch (err) {
            console.error('Failed to load personal schedule:', err)
            setSchedule([])
        } finally {
            setLoading(false)
        }
    }

    const loadGroupSchedule = async (groupId) => {
        try {
            setLoading(true)
            const group = groups.find(g => g.id === groupId) || { id: groupId, name: 'Обрана група' }
            setViewingGroup(group)
            setSelectedGroupId(groupId)
            const data = await api.getGroupSchedule(groupId)
            setSchedule(data)
        } catch (err) {
            console.error('Failed to load group schedule:', err)
            setSchedule([])
        } finally {
            setLoading(false)
        }
    }

    const handleGroupSelect = (group) => {
        setGroupSearch('')
        loadGroupSchedule(group.id)
    }

    const handleFollowGroup = () => {
        if (viewingGroup) {
            localStorage.setItem('followedGroupId', viewingGroup.id)
            setFollowedGroupId(viewingGroup.id)
        }
    }

    const handleUnfollowGroup = () => {
        localStorage.removeItem('followedGroupId')
        setFollowedGroupId(null)
    }

    return (
        <div className="schedule-page">
            <div className="container">
                <div className="page-header">
                    <h1>📅 Розклад занять</h1>
                    <p>
                        {viewingGroup
                            ? `Розклад групи ${viewingGroup.name}`
                            : 'Ваш тижневий графік навчання'}
                    </p>
                </div>

                {/* Group Search Selector */}
                <div className="schedule-controls" style={{ marginBottom: 'var(--spacing-2xl)', display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div className="group-search-container" style={{ flex: 1, minWidth: '300px' }}>
                        <div className="search-input-wrapper">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Знайти розклад групи..."
                                value={groupSearch}
                                onChange={(e) => setGroupSearch(e.target.value)}
                                className="search-input"
                                style={{ width: '100%' }}
                            />
                            {groupSearch && (
                                <button className="clear-search" onClick={() => setGroupSearch('')}>✕</button>
                            )}
                        </div>

                        {groupSearch.trim() && (
                            <div className="group-search-dropdown" style={{ width: '100%' }}>
                                <div className="group-results">
                                    {filteredGroups.length > 0 ? (
                                        filteredGroups.map((group) => (
                                            <div
                                                key={group.id}
                                                className="group-dropdown-item"
                                                onClick={() => handleGroupSelect(group)}
                                            >
                                                <span className="group-name">{group.name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-results">
                                            <p>Групи не знайдено</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="schedule-actions" style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        {viewingGroup ? (
                            <>
                                {followedGroupId !== viewingGroup.id.toString() ? (
                                    <button className="follow-btn" onClick={handleFollowGroup}>
                                        📌 Слідкувати за групою
                                    </button>
                                ) : (
                                    <button className="unfollow-btn" onClick={handleUnfollowGroup}>
                                        📍 Перестати слідкувати
                                    </button>
                                )}
                                <button className="personal-btn" onClick={loadPersonalSchedule}>
                                    👤 Мій розклад
                                </button>
                            </>
                        ) : (
                            followedGroupId && (
                                <button className="follow-view-btn" onClick={() => loadGroupSchedule(followedGroupId)}>
                                    📎 Перейти до розкладу групи
                                </button>
                            )
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Завантаження розкладу...</p>
                    </div>
                ) : (
                    <div className="schedule-grid">
                        {schedule.length > 0 ? (
                            schedule.map((day, index) => (
                                <div key={index} className="day-card">
                                    <div className="day-header">
                                        <h2>{day.day}</h2>
                                        <span className="lessons-count">{day.lessons.length} пари</span>
                                    </div>
                                    <div className="day-lessons">
                                        {day.lessons.map((lesson, lessonIndex) => (
                                            <div key={lessonIndex} className="schedule-lesson">
                                                <div className="lesson-time-container">
                                                    <div className="lesson-time-badge">{lesson.time}</div>
                                                    {lesson.weekType && lesson.weekType !== 'EVERY' && (
                                                        <div className={`week-type-badge ${lesson.weekType}`}>
                                                            {lesson.weekType === 'UPPER' ? 'Чисельник' : 'Знаменник'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="lesson-info">
                                                    <div className="lesson-title">{lesson.name}</div>
                                                    <div className="lesson-meta">
                                                        <span>👨‍🏫 {lesson.teacher}</span>
                                                        <span>🚪 {lesson.room}</span>
                                                    </div>
                                                </div>
                                                <div className={`lesson-badge ${lesson.type}`}>
                                                    {lesson.type === 'lecture' ? 'Лекція' : 'Практика'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>📅 Розклад відсутній або не знайдено</p>
                                {viewingGroup && (
                                    <button className="personal-btn" onClick={loadPersonalSchedule} style={{ marginTop: 'var(--spacing-md)' }}>
                                        Повернутися до мого розкладу
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Schedule
