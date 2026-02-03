import { useState, useEffect } from 'react'
import './Dashboard.css'

function Dashboard() {
    const [stats, setStats] = useState({
        upcomingClasses: 3,
        activeTasks: 7,
        currentRating: 1247,
        ratingPosition: 12
    })

    const upcomingLessons = [
        { id: 1, name: 'Веб-технології', time: '09:00', room: 'Ауд. 301', type: 'lecture' },
        { id: 2, name: 'Бази даних', time: '10:45', room: 'Ауд. 205', type: 'practice' },
        { id: 3, name: 'Алгоритми', time: '13:00', room: 'Ауд. 412', type: 'lecture' }
    ]

    const recentTasks = [
        { id: 1, course: 'Веб-технології', task: 'Лабораторна робота #3', deadline: '2026-02-05', status: 'pending' },
        { id: 2, course: 'Бази даних', task: 'Проєктування схеми БД', deadline: '2026-02-07', status: 'in-progress' },
        { id: 3, course: 'Алгоритми', task: 'Домашнє завдання #5', deadline: '2026-02-10', status: 'pending' }
    ]

    return (
        <div className="dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1>Вітаємо в Meedle! 👋</h1>
                    <p>Ось що відбувається сьогодні</p>
                </div>

                {/* Stats Grid */}
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
                            {upcomingLessons.map(lesson => (
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
                            ))}
                        </div>
                    </div>

                    {/* Recent Tasks */}
                    <div className="card">
                        <div className="card-header">
                            <h2>Активні завдання</h2>
                            <span className="badge">{recentTasks.length}</span>
                        </div>
                        <div className="tasks-list">
                            {recentTasks.map(task => (
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
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
