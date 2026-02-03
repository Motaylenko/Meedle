import { useState } from 'react'
import './Profile.css'

function Profile() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        schedule: true
    })

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        localStorage.setItem('theme', newTheme)
    }

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
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
                        <div className="profile-avatar">🎓</div>
                        <h2>Студент Meedle</h2>
                        <p className="profile-email">student@meedle.edu</p>
                        <div className="profile-stats">
                            <div className="profile-stat">
                                <div className="stat-number">4</div>
                                <div className="stat-text">Курси</div>
                            </div>
                            <div className="profile-stat">
                                <div className="stat-number">1247</div>
                                <div className="stat-text">Рейтинг</div>
                            </div>
                        </div>
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
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
