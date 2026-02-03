import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header({ theme, toggleTheme }) {
    const location = useLocation()

    const navItems = [
        { path: '/', label: 'Головна', icon: '🏠' },
        { path: '/schedule', label: 'Розклад', icon: '📅' },
        { path: '/courses', label: 'Курси', icon: '📚' },
        { path: '/grades', label: 'Оцінки', icon: '📊' },
        { path: '/profile', label: 'Профіль', icon: '👤' }
    ]

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <span className="logo-icon">🎓</span>
                        <span className="logo-text">Meedle</span>
                    </div>

                    <nav className="nav">
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        <span className="theme-icon">
                            {theme === 'light' ? '🌙' : '☀️'}
                        </span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
