import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import AdminCourseModal from '../components/AdminCourseModal'
import './Courses.css'

function Courses() {
    const navigate = useNavigate()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        loadCourses()
        // Перевірка ролі адміністратора
        const userJson = localStorage.getItem('user')
        if (userJson) {
            const user = JSON.parse(userJson)
            setIsAdmin(user.role === 'ADMIN')
        }
    }, [])

    const loadCourses = async () => {
        try {
            setLoading(true)
            const data = await api.getCourses()
            setCourses(data)
        } catch (err) {
            console.error('Failed to load courses:', err)
            // Fallback data
            setCourses([
                {
                    id: 1,
                    name: 'Веб-технології',
                    teacher: 'Іваненко І.І.',
                    progress: 75,
                    students: 42,
                    color: 'hsl(262, 83%, 58%)',
                    group: 'КІ-21-1'
                },
                {
                    id: 2,
                    name: 'Бази даних',
                    teacher: 'Петренко П.П.',
                    progress: 60,
                    students: 38,
                    color: 'hsl(200, 98%, 55%)',
                    group: 'КІ-21-1'
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    // Групування курсів за групою
    const groupedCourses = courses.reduce((acc, course) => {
        const groupName = course.group || 'Загальні'
        if (!acc[groupName]) {
            acc[groupName] = []
        }
        acc[groupName].push(course)
        return acc
    }, {})

    if (loading) {
        return (
            <div className="courses-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Завантаження курсів...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="courses-page">
            <div className="container">
                <div className="page-header">
                    <div className="header-text">
                        <h1>📚 Мої курси</h1>
                        <p>Всі ваші навчальні дисципліни</p>
                    </div>
                    {isAdmin && (
                        <button
                            className="add-course-btn"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <span>+</span> Додати курс
                        </button>
                    )}
                </div>

                <AdminCourseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCourseCreated={loadCourses}
                />

                {Object.entries(groupedCourses).length > 0 ? (
                    Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                        <div key={groupName} className="course-group-section">
                            <div className="group-folder-header">
                                <div className="folder-icon">📂</div>
                                <h2>Група: {groupName}</h2>
                                <span className="course-count">{groupCourses.length} курсів</span>
                            </div>

                            <div className="courses-grid">
                                {groupCourses.map(course => (
                                    <div
                                        key={course.id}
                                        className="course-card"
                                        style={{ '--course-color': course.color }}
                                        onClick={() => navigate(`/course/${course.id}`)}
                                    >
                                        <div className="course-header">
                                            <div className="course-icon" style={{ background: course.color }}>
                                                📖
                                            </div>
                                            <div className="course-info">
                                                <h3>{course.name}</h3>
                                                <p>👨‍🏫 {course.teacher}</p>
                                            </div>
                                        </div>

                                        <div className="course-stats">
                                            <div className="stat-item">
                                                <span className="stat-icon">👥</span>
                                                <span className="stat-value">{course.students} студентів</span>
                                            </div>
                                        </div>

                                        <div className="progress-section">
                                            <div className="progress-header">
                                                <span>Прогрес</span>
                                                <span className="progress-value">{course.progress}%</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div
                                                    className="progress-bar"
                                                    style={{ width: `${course.progress}%`, background: course.color }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="course-footer">
                                            <div className="footer-item">
                                                <span className="footer-icon">📝</span>
                                                <span>{course.assignments} завдань</span>
                                            </div>
                                            <div className="footer-item">
                                                <span className="footer-icon">📚</span>
                                                <span>{course.materials} матеріалів</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>📭 Ви ще не записані на жоден курс</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Courses
