import { useState, useEffect } from 'react'
import api from '../services/api'
import notificationService from '../services/notifications'
import './Dashboard.css'

function Dashboard() {
    const userJson = localStorage.getItem('user')
    const user = userJson ? JSON.parse(userJson) : null
    const isAdmin = user?.role === 'ADMIN'

    const [stats, setStats] = useState({
        upcomingClasses: 0,
        activeTasks: 0,
        currentRating: 0,
        ratingPosition: 0,
        studentCount: 0,
        teacherCount: 0,
        groupCount: 0,
        courseCount: 0
    })
    const [upcomingLessons, setUpcomingLessons] = useState([])
    const [recentTasks, setRecentTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadDashboardData()

        // Request notification permission on mount
        notificationService.requestPermission()

        // Refresh data every 5 minutes
        const interval = setInterval(loadDashboardData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)

            if (isAdmin) {
                const adminStats = await api.getAdminDashboardStats()
                setStats(adminStats)
            } else {
                // Fetch all dashboard data in parallel
                const [statsData, scheduleData, tasksData] = await Promise.all([
                    api.getDashboardStats(),
                    api.getTodaySchedule(),
                    api.getActiveTasks()
                ])

                setStats(statsData)
                setUpcomingLessons(scheduleData.lessons || [])
                setRecentTasks(tasksData.slice(0, 3))
            }
        } catch (err) {
            console.error('Failed to load dashboard data:', err)
            setError(`Не вдалося завантажити дані: ${err.message}`)

            // Revert stats to 0s on error to avoid showing stale or mock data
            setStats({
                upcomingClasses: 0,
                activeTasks: 0,
                currentRating: 0,
                ratingPosition: 0,
                studentCount: 0,
                teacherCount: 0,
                groupCount: 0,
                courseCount: 0
            })
        } finally {
            setLoading(false)
        }
    }

    const handleTaskStatusChange = async (taskId, newStatus) => {
        try {
            await api.updateTaskStatus(taskId, newStatus)
            // Reload tasks
            const tasksData = await api.getActiveTasks()
            setRecentTasks(tasksData.slice(0, 3))

            // Show notification
            notificationService.showNotification('✅ Статус оновлено', {
                body: 'Статус завдання успішно змінено'
            })
        } catch (err) {
            console.error('Failed to update task status:', err)
        }
    }

    if (loading && upcomingLessons.length === 0) {
        return (
            <div className="dashboard">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Завантаження даних...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard">
            <div className="container">
                {error && (
                    <div className="error-banner">
                        ⚠️ {error}
                    </div>
                )}

                <div className="dashboard-header">
                    <h1>{isAdmin ? 'Панель адміністратора 🛠️' : 'Вітаємо в Meedle! 👋'}</h1>
                    <p>{isAdmin ? 'Огляд системи та управління ресурсами' : 'Ось що відбувається сьогодні'}</p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {isAdmin ? (
                        <>
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats.studentCount}</div>
                                    <div className="stat-label">Студентів</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">👨‍🏫</div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats.teacherCount}</div>
                                    <div className="stat-label">Викладачів</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">🏢</div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats.groupCount}</div>
                                    <div className="stat-label">Групи</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">📚</div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats.courseCount}</div>
                                    <div className="stat-label">Курсів</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats.upcomingClasses}</div>
                                    <div className="stat-label">Пари сьогодні</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">📝</div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats.activeTasks}</div>
                                    <div className="stat-label">Активні завдання</div>
                                </div>
                            </div>

                            <div className="stat-card highlight">
                                <div className="stat-icon">🏆</div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats.currentRating}</div>
                                    <div className="stat-label">Рейтинг</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">📊</div>
                                <div className="stat-content">
                                    <div className="stat-value">#{stats.ratingPosition}</div>
                                    <div className="stat-label">Позиція</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="content-grid">
                    {isAdmin ? (
                        <>

                            <div className="card">
                                <div className="card-header">
                                    <h2>Системна інформація</h2>
                                </div>
                                <div className="system-info">
                                    <div className="info-item">
                                        <span>Статус бази даних</span>
                                        <span className="status-badge online">В мережі</span>
                                    </div>
                                    <div className="info-item">
                                        <span>Версія системи</span>
                                        <span>v2.1.0-stable</span>
                                    </div>
                                    <div className="info-item">
                                        <span>Останнє бекапування</span>
                                        <span>Сьогодні, 03:00</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Upcoming Lessons */}
                            <div className="card">
                                <div className="card-header">
                                    <h2>Найближчі заняття</h2>
                                    <span className="badge">{upcomingLessons.length}</span>
                                </div>
                                <div className="lessons-list">
                                    {upcomingLessons.length > 0 ? (
                                        upcomingLessons.map(lesson => (
                                            <div key={lesson.id} className="lesson-item">
                                                <div className="lesson-time">{lesson.time}</div>
                                                <div className="lesson-details">
                                                    <div className="lesson-name">{lesson.name}</div>
                                                    <div className="lesson-room">{lesson.room}</div>
                                                </div>
                                                <div className={`lesson-type ${lesson.type}`}>
                                                    {lesson.type === 'lecture' ? 'Лекція' : 'Практика'}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <p>📅 Сьогодні немає занять</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Tasks */}
                            <div className="card">
                                <div className="card-header">
                                    <h2>Активні завдання</h2>
                                    <span className="badge">{recentTasks.length}</span>
                                </div>
                                <div className="tasks-list">
                                    {recentTasks.length > 0 ? (
                                        recentTasks.map(task => (
                                            <div key={task.id} className="task-item">
                                                <div className="task-content">
                                                    <div className="task-course">{task.course}</div>
                                                    <div className="task-name">{task.task}</div>
                                                    <div className="task-deadline">
                                                        Дедлайн: {new Date(task.deadline).toLocaleDateString('uk-UA')}
                                                    </div>
                                                </div>
                                                <div className={`task-status ${task.status}`}>
                                                    {task.status === 'pending' ? 'Очікує' : 'В процесі'}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <p>✅ Всі завдання виконані!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
