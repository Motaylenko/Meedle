import { useState, useEffect } from 'react'
import api from '../services/api'
import './Profile.css'

function Profile() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        schedule: true
    })

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            const userData = await api.getUser()
            setUser(userData)
            setTheme(userData.settings.theme)
            setNotifications(userData.settings.notifications)
            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch user data:', error)
            setLoading(false)
        }
    }

    const handleThemeChange = async (newTheme) => {
        try {
            setTheme(newTheme)
            document.documentElement.setAttribute('data-theme', newTheme)
            localStorage.setItem('theme', newTheme)
            await api.updateUserSettings({ theme: newTheme, notifications })
        } catch (error) {
            console.error('Failed to update theme:', error)
        }
    }

    const handleNotificationChange = async (key) => {
        try {
            const newNotifications = {
                ...notifications,
                [key]: !notifications[key]
            }
            setNotifications(newNotifications)
            await api.updateUserSettings({ theme, notifications: newNotifications })
        } catch (error) {
            console.error('Failed to update notifications:', error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        window.location.href = '/login'
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = async () => {
            try {
                const base64Avatar = reader.result
                await api.updateAvatar(base64Avatar)
                setUser(prev => ({ ...prev, avatar: base64Avatar }))
            } catch (error) {
                console.error('Failed to update avatar:', error)
                alert('Помилка при оновленні аватарки')
            }
        }
        reader.readAsDataURL(file)
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Ніколи'
        const date = new Date(dateStr)
        const now = new Date()

        const days = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п’ятниця', 'субота']
        const months = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня']

        const dayName = days[date.getDay()]
        const day = date.getDate()
        const monthName = months[date.getMonth()]
        const year = date.getFullYear()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')

        // Calculate difference
        const diffMs = now - date
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const diffYears = Math.floor(diffDays / 365)
        const remainingDays = diffDays % 365

        let timeLabel = ''
        if (diffMs < 60000) {
            timeLabel = '(зараз)'
        } else {
            timeLabel = `(${diffYears > 0 ? `${diffYears} роки ` : ''}${remainingDays} днів)`
        }

        return `${dayName} ${day} ${monthName} ${year} ${hours}:${minutes}  ${timeLabel}`
    }

    if (loading) {
        return <div className="profile-loading">Завантаження...</div>
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="page-header">
                    <h1>👤 Профіль</h1>
                    <p>Налаштування вашого акаунту</p>
                </div>

                <div className="profile-layout">
                    <div className="profile-card">
                        <div className="profile-avatar-container">
                            <div className="profile-avatar">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="avatar-image" />
                                ) : (
                                    '🎓'
                                )}
                            </div>
                            <label className="avatar-edit-overlay">
                                📷
                                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        <h2>{user?.fullName || 'Студент Meedle'}</h2>
                        <p className="profile-email">{user?.email || 'student@meedle.edu'}</p>

                        <div className="profile-stats">
                            <div className="profile-stat">
                                <div className="stat-number">{user?.coursesCount || 0}</div>
                                <div className="stat-text">Курси</div>
                            </div>
                            <div className="profile-stat">
                                <div className="stat-number">{user?.rating || 0}</div>
                                <div className="stat-text">Рейтинг</div>
                            </div>
                        </div>

                        <button className="logout-btn" onClick={handleLogout}>
                            🚪 Вийти з акаунту
                        </button>
                    </div>

                    <div className="settings-section">
                        <div className="settings-card">
                            <h3>🎨 Тема інтерфейсу</h3>
                            <div className="theme-options">
                                <button
                                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('light')}
                                >
                                    <span className="theme-icon">☀️</span>
                                    <span>Світла</span>
                                </button>
                                <button
                                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('dark')}
                                >
                                    <span className="theme-icon">🌙</span>
                                    <span>Темна</span>
                                </button>
                            </div>
                        </div>

                        <div className="settings-card">
                            <h3>🔔 Сповіщення</h3>
                            <div className="notification-options">
                                <label className="notification-item">
                                    <div className="notification-info">
                                        <div className="notification-title">Email сповіщення</div>
                                        <div className="notification-desc">Отримувати листи про нові завдання</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.email}
                                        onChange={() => handleNotificationChange('email')}
                                        className="toggle-checkbox"
                                    />
                                </label>

                                <label className="notification-item">
                                    <div className="notification-info">
                                        <div className="notification-title">Push-сповіщення</div>
                                        <div className="notification-desc">Миттєві сповіщення в браузері</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.push}
                                        onChange={() => handleNotificationChange('push')}
                                        className="toggle-checkbox"
                                    />
                                </label>

                                <label className="notification-item">
                                    <div className="notification-info">
                                        <div className="notification-title">Зміни розкладу</div>
                                        <div className="notification-desc">Сповіщення про зміни в розкладі</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.schedule}
                                        onChange={() => handleNotificationChange('schedule')}
                                        className="toggle-checkbox"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="settings-card">
                            <h3>📊 Звіти</h3>
                            <div className="reports-list">
                                <a href="#" className="report-link">Переглянути сеанси</a>
                                <a href="#" className="report-link">Обзор оцінок</a>
                            </div>
                        </div>

                        <div className="settings-card">
                            <h3>🕒 Діяльність входу</h3>
                            <div className="activity-list">
                                <div className="activity-item">
                                    <div className="activity-label">Перший вхід на сайт</div>
                                    <div className="activity-value">{formatDate(user?.firstLogin)}</div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-label">Останній вхід на сайт</div>
                                    <div className="activity-value">{formatDate(user?.lastLogin)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
