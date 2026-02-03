import './Grades.css'

function Grades() {
    const grades = [
        { course: 'Веб-технології', grade: 95, max: 100, color: 'hsl(262, 83%, 58%)' },
        { course: 'Бази даних', grade: 88, max: 100, color: 'hsl(200, 98%, 55%)' },
        { course: 'Алгоритми', grade: 92, max: 100, color: 'hsl(142, 71%, 45%)' },
        { course: 'Математика', grade: 85, max: 100, color: 'hsl(330, 85%, 60%)' }
    ]

    const leaderboard = [
        { rank: 1, name: 'Олександр Коваленко', points: 1450, avatar: '👨' },
        { rank: 2, name: 'Марія Петренко', points: 1380, avatar: '👩' },
        { rank: 3, name: 'Іван Сидоренко', points: 1320, avatar: '👨' },
        { rank: 12, name: 'Ви', points: 1247, avatar: '🎓', isCurrentUser: true }
    ]

    const averageGrade = (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(1)

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
