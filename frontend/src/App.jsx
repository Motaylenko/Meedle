import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Courses from './pages/Courses'
import CoursePage from './pages/CoursePage'
import Grades from './pages/Grades'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

// Компонент для захищених маршрутів
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light'
    })

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
    }

    // Перевіряємо чи це сторінка авторизації, щоб не показувати Header
    const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

    return (
        <Router>
            <Routes>
                {/* Публічні маршрути */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Захищені маршрути */}
                <Route path="/*" element={
                    <ProtectedRoute>
                        <div className="app">
                            <Header theme={theme} toggleTheme={toggleTheme} />
                            <main className="main-content">
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/schedule" element={<Schedule />} />
                                    <Route path="/courses" element={<Courses />} />
                                    <Route path="/courses/:courseId" element={<CoursePage />} />
                                    <Route path="/grades" element={<Grades />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </main>
                        </div>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    )
}

export default App
