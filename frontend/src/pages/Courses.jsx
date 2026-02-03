import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Courses.css'

function Courses() {
    const navigate = useNavigate()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadCourses()
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
                    color: 'hsl(262, 83%, 58%)'
                },
                {
                    id: 2,
                    name: 'Бази даних',
                    teacher: 'Петренко П.П.',
                    progress: 60,
                    students: 38,
                    color: 'hsl(200, 98%, 55%)'
                },
                {
                    id: 3,
                    name: 'Алгоритми',
                    teacher: 'Сидоренко С.С.',
                    progress: 45,
                    students: 45,
                    color: 'hsl(142, 71%, 45%)'
                },
                {
                    id: 4,
                    name: 'Математика',
                    teacher: 'Коваленко К.К.',
                    progress: 80,
                    students: 50,
                    color: 'hsl(330, 85%, 60%)'
                }
            ])
        } finally {
            setLoading(false)
        }
    }

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
                    <h1>📚 Мої курси</h1>
                    <p>Всі ваші навчальні дисципліни</p>
                </div>

                <div className="courses-grid">
                    {courses.map(course => (
                        <div key={course.id} className="course-card" style={{ '--course-color': course.color }}>
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
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${course.progress}%`, background: course.color }}
                                    ></div>
                                </div>
                            </div>

                            <button
                                className="course-button"
                                onClick={() => navigate(`/courses/${course.id}`)}
                            >
                                Перейти до курсу →
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Courses
