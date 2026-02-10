import { useState, useEffect } from 'react'
import api from '../services/api'
import './Grades.css'
import './GradesAdmin.css'

function Grades() {
    const [grades, setGrades] = useState([])
    const [leaderboard, setLeaderboard] = useState([])
    const [averageGrade, setAverageGrade] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    // Admin-specific state
    const [groups, setGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState('all')
    const [groupLeaderboard, setGroupLeaderboard] = useState([])
    const [studentSearch, setStudentSearch] = useState('')
    const [groupSearch, setGroupSearch] = useState('')
    const [filteredLeaderboard, setFilteredLeaderboard] = useState([])
    const [filteredGroupLeaderboard, setFilteredGroupLeaderboard] = useState([])
    const [filteredGroups, setFilteredGroups] = useState([])

    useEffect(() => {
        // Check if user is admin
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        setIsAdmin(user.role === 'ADMIN')
        loadGradesData()
    }, [])

    // Load groups for admin
    useEffect(() => {
        if (isAdmin) {
            const loadGroups = async () => {
                try {
                    const groupsData = await api.getGroups()
                    setGroups(groupsData)
                    setFilteredGroups(groupsData)
                } catch (err) {
                    console.error('Failed to load groups:', err)
                }
            }
            loadGroups()
        }
    }, [isAdmin])

    // Filter leaderboard by selected group
    useEffect(() => {
        if (selectedGroup !== 'all') {
            const filtered = leaderboard.filter(user => user.group === selectedGroup)
            setGroupLeaderboard(filtered)
            setFilteredGroupLeaderboard(filtered)
        } else {
            setGroupLeaderboard([])
            setFilteredGroupLeaderboard([])
        }
    }, [selectedGroup, leaderboard])

    // Filter overall leaderboard by student search
    useEffect(() => {
        if (studentSearch.trim()) {
            const filtered = leaderboard.filter(user =>
                user.name.toLowerCase().includes(studentSearch.toLowerCase())
            )
            setFilteredLeaderboard(filtered)
        } else {
            setFilteredLeaderboard(leaderboard)
        }
    }, [studentSearch, leaderboard])

    // Filter group leaderboard by student search
    useEffect(() => {
        if (studentSearch.trim() && selectedGroup !== 'all') {
            const filtered = groupLeaderboard.filter(user =>
                user.name.toLowerCase().includes(studentSearch.toLowerCase())
            )
            setFilteredGroupLeaderboard(filtered)
        } else {
            setFilteredGroupLeaderboard(groupLeaderboard)
        }
    }, [studentSearch, groupLeaderboard, selectedGroup])

    // Filter groups by search
    useEffect(() => {
        if (groupSearch.trim()) {
            const filtered = groups.filter(group =>
                group.name.toLowerCase().includes(groupSearch.toLowerCase())
            )
            setFilteredGroups(filtered)
        } else {
            setFilteredGroups(groups)
        }
    }, [groupSearch, groups])

    const handleGroupSelect = (groupName) => {
        setSelectedGroup(groupName)
        setGroupSearch('')
    }

    const loadGradesData = async () => {
        try {
            setLoading(true)
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            const isAdminUser = user.role === 'ADMIN'

            if (isAdminUser) {
                // For admin, only load leaderboard
                const leaderboardData = await api.getLeaderboard()
                setLeaderboard(leaderboardData)
                setFilteredLeaderboard(leaderboardData)
            } else {
                // For regular users, load both grades and leaderboard
                const [gradesData, leaderboardData] = await Promise.all([
                    api.getGrades(),
                    api.getLeaderboard()
                ])

                setGrades(gradesData.grades)
                setAverageGrade(gradesData.average)
                setLeaderboard(leaderboardData)
                setFilteredLeaderboard(leaderboardData)
            }
        } catch (err) {
            console.error('Failed to load grades data:', err)
            // Fallback data
            if (!isAdmin) {
                setGrades([
                    { course: 'Веб-технології', grade: 95, max: 100, color: 'hsl(262, 83%, 58%)' },
                    { course: 'Бази даних', grade: 88, max: 100, color: 'hsl(200, 98%, 55%)' },
                    { course: 'Алгоритми', grade: 92, max: 100, color: 'hsl(142, 71%, 45%)' },
                    { course: 'Математика', grade: 85, max: 100, color: 'hsl(330, 85%, 60%)' }
                ])
                setAverageGrade(90.0)
            }
            const fallbackLeaderboard = [
                { rank: 1, name: 'Олександр Коваленко', points: 1450, avatar: '👨', group: 'КІ-21-1' },
                { rank: 2, name: 'Марія Петренко', points: 1380, avatar: '👩', group: 'КІ-21-2' },
                { rank: 3, name: 'Іван Сидоренко', points: 1320, avatar: '👨', group: 'КІ-21-1' },
                { rank: 12, name: 'Ви', points: 1247, avatar: '🎓', isCurrentUser: true, group: 'КІ-21-3' }
            ]
            setLeaderboard(fallbackLeaderboard)
            setFilteredLeaderboard(fallbackLeaderboard)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="grades-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Завантаження {isAdmin ? 'рейтингу' : 'оцінок'}...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (isAdmin) {
        // Admin view - two leaderboards: overall and by group
        return (
            <div className="grades-page">
                <div className="container">
                    <div className="page-header">
                        <h1>🏆 Рейтинг студентів</h1>
                        <p>Загальний рейтинг та рейтинг по групам</p>
                    </div>

                    {/* Global Student Search */}
                    <div className="global-search">
                        <div className="search-input-wrapper">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Пошук студента..."
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                className="search-input"
                            />
                            {studentSearch && (
                                <button
                                    className="clear-search"
                                    onClick={() => setStudentSearch('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="leaderboard-sections">
                        {/* Overall Leaderboard */}
                        <div className="leaderboard-section-card">
                            <div className="section-header">
                                <h2>📊 Загальний рейтинг</h2>
                                <p>Топ студентів всіх груп</p>
                            </div>
                            <div className="leaderboard-list">
                                {filteredLeaderboard.length > 0 ? (
                                    filteredLeaderboard.slice(0, studentSearch ? undefined : 10).map((user, index) => (
                                        <div
                                            key={index}
                                            className={`leaderboard-item ${studentSearch && user.name.toLowerCase().includes(studentSearch.toLowerCase()) ? 'highlighted' : ''}`}
                                        >
                                            <div className="rank-badge">#{user.rank}</div>
                                            <div className="user-info">
                                                <div className="user-name">{user.name}</div>
                                                <div className="user-points">{user.points} балів • {user.group || 'Без групи'}</div>
                                            </div>
                                            {user.rank <= 3 && !studentSearch && (
                                                <div className="trophy">
                                                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>Студентів не знайдено</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Group-based Leaderboard */}
                        <div className="leaderboard-section-card">
                            <div className="section-header">
                                <h2>👥 Рейтинг по групах</h2>
                                <p>Виберіть групу для перегляду</p>
                            </div>

                            <div className="group-selector">
                                <div className="group-selector-buttons">
                                    {/* Search Group Button */}
                                    <div className="group-search-container">
                                        <div className="search-input-wrapper">
                                            <span className="search-icon">🔍</span>
                                            <input
                                                type="text"
                                                placeholder="Пошук групи..."
                                                value={groupSearch}
                                                onChange={(e) => setGroupSearch(e.target.value)}
                                                className="search-input group-search-input"
                                            />
                                            {groupSearch && (
                                                <button
                                                    className="clear-search"
                                                    onClick={() => setGroupSearch('')}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        {groupSearch.trim() && (
                                            <div className="group-search-dropdown">
                                                <div className="group-results">
                                                    {filteredGroups.length > 0 ? (
                                                        filteredGroups.map((group) => (
                                                            <div
                                                                key={group.id}
                                                                className="group-dropdown-item"
                                                                onClick={() => handleGroupSelect(group.name)}
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

                                    {/* Select Group Dropdown */}
                                    <div className="group-select-container">
                                        <select
                                            value={selectedGroup}
                                            onChange={(e) => setSelectedGroup(e.target.value)}
                                            className="group-select-dropdown"
                                        >
                                            <option value="all">Оберіть групу</option>
                                            {groups.map((group) => (
                                                <option key={group.id} value={group.name}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {selectedGroup !== 'all' && (
                                    <div className="selected-group">
                                        <span>Обрана група: <strong>{selectedGroup}</strong></span>
                                        <button
                                            className="clear-group"
                                            onClick={() => setSelectedGroup('all')}
                                        >
                                            Скинути
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="leaderboard-list">
                                {selectedGroup === 'all' && !groupSearch ? (
                                    <div className="empty-state">
                                        <p>Оберіть групу для перегляду рейтингу</p>
                                    </div>
                                ) : filteredGroupLeaderboard.length > 0 ? (
                                    filteredGroupLeaderboard.map((user, index) => (
                                        <div
                                            key={index}
                                            className={`leaderboard-item ${studentSearch && user.name.toLowerCase().includes(studentSearch.toLowerCase()) ? 'highlighted' : ''}`}
                                        >
                                            <div className="rank-badge">#{index + 1}</div>
                                            <div className="user-info">
                                                <div className="user-name">{user.name}</div>
                                                <div className="user-points">{user.points} балів</div>
                                            </div>
                                            {index < 3 && !studentSearch && (
                                                <div className="trophy">
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : selectedGroup !== 'all' ? (
                                    <div className="empty-state">
                                        <p>{studentSearch ? 'Студентів не знайдено' : 'Немає студентів у цій групі'}</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Regular user view - grades and leaderboard
    return (
        <div className="grades-page">
            <div className="container">
                <div className="page-header">
                    <h1>📊 Оцінки та Рейтинг</h1>
                    <p>Ваша успішність та позиція в рейтингу</p>
                </div>

                <div className="grades-overview">
                    <div className="overview-card">
                        <div className="overview-icon">📈</div>
                        <div className="overview-content">
                            <div className="overview-value">{averageGrade}</div>
                            <div className="overview-label">Середній бал</div>
                        </div>
                    </div>

                    <div className="overview-card highlight">
                        <div className="overview-icon">🏆</div>
                        <div className="overview-content">
                            <div className="overview-value">1247</div>
                            <div className="overview-label">Рейтинг</div>
                        </div>
                    </div>

                    <div className="overview-card">
                        <div className="overview-icon">📍</div>
                        <div className="overview-content">
                            <div className="overview-value">#12</div>
                            <div className="overview-label">Позиція</div>
                        </div>
                    </div>
                </div>

                <div className="content-layout">
                    <div className="grades-section">
                        <h2>Оцінки по курсам</h2>
                        <div className="grades-list">
                            {grades.map((item, index) => (
                                <div key={index} className="grade-item">
                                    <div className="grade-course">{item.course}</div>
                                    <div className="grade-bar-container">
                                        <div className="grade-bar">
                                            <div
                                                className="grade-fill"
                                                style={{ width: `${(item.grade / item.max) * 100}%`, background: item.color }}
                                            ></div>
                                        </div>
                                        <div className="grade-value">{item.grade}/{item.max}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="leaderboard-section">
                        <h2>Таблиця лідерів</h2>
                        <div className="leaderboard-list">
                            {leaderboard.map((user, index) => (
                                <div
                                    key={index}
                                    className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}
                                >
                                    <div className="rank-badge">#{user.rank}</div>
                                    <div className="user-avatar">{user.avatar}</div>
                                    <div className="user-info">
                                        <div className="user-name">{user.name}</div>
                                        <div className="user-points">{user.points} балів</div>
                                    </div>
                                    {user.rank <= 3 && (
                                        <div className="trophy">
                                            {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Grades
