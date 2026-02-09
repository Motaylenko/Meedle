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
        ratingPosition: 0
    })
    const [adminStats, setAdminStats] = useState({
        totalStudents: 0,
        totalGroups: 0,
        totalCourses: 0,
        totalTeachers: 0
    })
    const [upcomingLessons, setUpcomingLessons] = useState([])
    const [recentTasks, setRecentTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadDashboardData()

        // Request notification permission on mount (only for students)
        if (!isAdmin) {
            notificationService.requestPermission()
        }

        // Refresh data every 5 minutes
        const interval = setInterval(loadDashboardData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)

            if (isAdmin) {
                // Load admin-specific data
                const [students, groups, courses, teachers] = await Promise.all([
                    api.getStudents(),
                    api.getGroups(),
                    api.getCourses(),
                    api.getTeachers()
                ])

                setAdminStats({
                    totalStudents: students.length,
                    totalGroups: groups.length,
                    totalCourses: courses.length,
                    totalTeachers: teachers.length
                })
            } else {
                // Fetch all dashboard data in parallel for students
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
            setError('Не вдалося завантажити дані. Використовуються демо-дані.')

            if (isAdmin) {
                setAdminStats({
                    totalStudents: 0,
                    totalGroups: 0,
                    totalCourses: 0,
                    totalTeachers: 0
                })
            } else {
                // Use fallback data
                setStats({
                    upcomingClasses: 3,
                    activeTasks: 7,
                    currentRating: 1247,
                    ratingPosition: 12
                })
                setUpcomingLessons([
                    { id: 1, name: 'Веб-технології', time: '09:00', room: 'Ауд. 301', type: 'lecture' },
                    { id: 2, name: 'Бази даних', time: '10:45', room: 'Ауд. 205', type: 'practice' },
                    { id: 3, name: 'Алгоритми', time: '13:00', room: 'Ауд. 412', type: 'lecture' }
                ])
                setRecentTasks([
                    { id: 1, course: 'Веб-технології', task: 'Лабораторна робота #3', deadline: '2026-02-05', status: 'pending' },
                    { id: 2, course: 'Бази даних', task: 'Проєктування схеми БД', deadline: '2026-02-07', status: 'in-progress' },
                    { id: 3, course: 'Алгоритми', task: 'Домашнє завдання #5', deadline: '2026-02-10', status: 'pending' }
                ])
            }
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
                    <h1>Вітаємо в Meedle! 👋</h1>
                    <p>{isAdmin ? 'Панель адміністратора' : 'Ось що відбувається сьогодні'}</p>
                </div>

                {isAdmin ? (
                    <>
                        {/* Admin Stats Grid */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-content">
                                    <div className="stat-value">{adminStats.totalStudents}</div>
                                    <div className="stat-label">Студентів</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">📚</div>
                                <div className="stat-content">
                                    <div className="stat-value">{adminStats.totalGroups}</div>
                                    <div className="stat-label">Груп</div>
                                </div>
                            </div>

                            <div className="stat-card highlight">
                                <div className="stat-icon">📖</div>
                                <div className="stat-content">
                                    <div className="stat-value">{adminStats.totalCourses}</div>
                                    <div className="stat-label">Курсів</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">👨‍🏫</div>
                                <div className="stat-content">
                                    <div className="stat-value">{adminStats.totalTeachers}</div>
                                    <div className="stat-label">Викладачів</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="content-grid">
                            <div className="card">
                                <div className="card-header">
                                    <h2>Швидкі дії</h2>
                                </div>
                                <div className="quick-actions">
                                    <a href="/admin/groups" className="action-btn">
                                        <div className="action-icon">👥</div>
                                        <div className="action-text">
                                            <h3>Управління групами</h3>
                                            <p>Створюйте групи та додавайте студентів</p>
                                        </div>
                                    </a>
                                    <a href="/admin/schedule" className="action-btn">
                                        <div className="action-icon">📅</div>
                                        <div className="action-text">
                                            <h3>Розклад</h3>
                                            <p>Керуйте розкладом груп</p>
                                        </div>
                                    </a>
                                    <a href="/courses" className="action-btn">
                                        <div className="action-icon">📚</div>
                                        <div className="action-text">
                                            <h3>Курси</h3>
                                            <p>Створюйте та редагуйте курси</p>
                                        </div>
                                    </a>
                                    <a href="/grades" className="action-btn">
                                        <div className="action-icon">📊</div>
                                        <div className="action-text">
                                            <h3>Оцінки та рейтинг</h3>
                                            <p>Переглядайте успішність студентів</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Student Stats Grid */}
                        <div className="stats-grid">
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
                        </div>

                        {/* Main Content Grid */}
                        <div className="content-grid">
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
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Dashboard
