import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import AddMaterialModal from '../components/AddMaterialModal'
import './CoursePage.css'

function CoursePage() {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const [course, setCourse] = useState(null)
    const [materials, setMaterials] = useState([])
    const [activeTab, setActiveTab] = useState('materials')
    const [loading, setLoading] = useState(true)
    const [materialsLoading, setMaterialsLoading] = useState(false)
    const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false)
    const [userRole, setUserRole] = useState(null)

    useEffect(() => {
        loadCourseData()
        loadUserRole()
    }, [courseId])

    useEffect(() => {
        if (activeTab === 'materials' && course) {
            loadMaterials()
        }
    }, [activeTab, course])

    const loadUserRole = async () => {
        try {
            const user = await api.getUser()
            setUserRole(user.role)
        } catch (err) {
            console.error('Failed to load user:', err)
        }
    }

    const loadMaterials = async () => {
        try {
            setMaterialsLoading(true)
            const data = await api.getCourseMaterials(courseId)
            setMaterials(data)
        } catch (err) {
            console.error('Failed to load materials:', err)
            setMaterials([])
        } finally {
            setMaterialsLoading(false)
        }
    }

    const handleAddMaterial = async (materialData) => {
        try {
            await api.createMaterial(courseId, materialData)
            setIsAddMaterialModalOpen(false)
            await loadMaterials()
        } catch (err) {
            console.error('Failed to create material:', err)
            alert('Помилка при створенні матеріалу')
        }
    }

    const handleDeleteMaterial = async (materialId) => {
        if (!confirm('Ви впевнені, що хочете видалити цей матеріал?')) return

        try {
            await api.deleteMaterial(materialId)
            await loadMaterials()
        } catch (err) {
            console.error('Failed to delete material:', err)
            alert('Помилка при видаленні матеріалу')
        }
    }

    const loadCourseData = async () => {
        try {
            setLoading(true)
            const data = await api.getCourseDetails(courseId)
            console.log('Course data received:', data)
            setCourse(data)
        } catch (err) {
            console.error('Failed to load course:', err)
            // Fallback data
            setCourse({
                id: courseId,
                name: 'Веб-технології',
                teacher: 'Іваненко Іван Іванович',
                description: 'Курс присвячений вивченню сучасних веб-технологій, включаючи HTML5, CSS3, JavaScript, React та Node.js',
                color: 'hsl(262, 83%, 58%)',
                progress: 75,
                students: 42,
                materials: [
                    {
                        id: 1,
                        type: 'lecture',
                        title: 'Вступ до веб-розробки',
                        description: 'Основні поняття та інструменти',
                        date: '2026-01-15',
                        files: ['lecture-01.pdf', 'slides-01.pptx']
                    },
                    {
                        id: 2,
                        type: 'lecture',
                        title: 'HTML5 та семантична розмітка',
                        description: 'Структура веб-сторінки',
                        date: '2026-01-22',
                        files: ['lecture-02.pdf']
                    },
                    {
                        id: 3,
                        type: 'video',
                        title: 'CSS Grid та Flexbox',
                        description: 'Сучасні методи верстки',
                        date: '2026-01-29',
                        duration: '45 хв'
                    }
                ],
                assignments: [
                    {
                        id: 1,
                        title: 'Лабораторна робота #1',
                        description: 'Створення статичної веб-сторінки',
                        deadline: '2026-02-10',
                        status: 'submitted',
                        grade: 95
                    },
                    {
                        id: 2,
                        title: 'Лабораторна робота #2',
                        description: 'Адаптивна верстка з використанням CSS Grid',
                        deadline: '2026-02-20',
                        status: 'in_progress',
                        grade: null
                    },
                    {
                        id: 3,
                        title: 'Проєктна робота',
                        description: 'Розробка повноцінного веб-додатку',
                        deadline: '2026-03-15',
                        status: 'not_started',
                        grade: null
                    }
                ],
                grades: [
                    { name: 'Лабораторна #1', grade: 95, max: 100, date: '2026-02-08' },
                    { name: 'Тест #1', grade: 88, max: 100, date: '2026-02-01' },
                    { name: 'Практична #1', grade: 92, max: 100, date: '2026-01-25' }
                ],
                forum: [
                    {
                        id: 1,
                        author: 'Петренко П.П.',
                        title: 'Питання щодо лабораторної роботи #2',
                        date: '2026-02-03',
                        replies: 5
                    },
                    {
                        id: 2,
                        author: 'Сидоренко С.С.',
                        title: 'Корисні ресурси для вивчення React',
                        date: '2026-02-02',
                        replies: 12
                    }
                ]
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="course-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Завантаження курсу...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="course-page">
                <div className="container">
                    <div className="error-state">
                        <h2>Курс не знайдено</h2>
                        <button onClick={() => navigate('/courses')}>Повернутися до курсів</button>
                    </div>
                </div>
            </div>
        )
    }

    const getStatusBadge = (status) => {
        const badges = {
            submitted: { text: 'Здано', class: 'success' },
            in_progress: { text: 'В процесі', class: 'warning' },
            not_started: { text: 'Не розпочато', class: 'default' }
        }
        return badges[status] || badges.not_started
    }

    return (
        <div className="course-page">
            <div className="container">
                {/* Course Header */}
                <div className="course-header" style={{ '--course-color': course.color }}>
                    <button className="back-button" onClick={() => navigate('/courses')}>
                        ← Назад до курсів
                    </button>
                    <div className="course-header-content">
                        <div className="course-icon" style={{ background: course.color }}>
                            📚
                        </div>
                        <div className="course-info">
                            <h1>{course.name}</h1>
                            <div className="teacher-info">
                                <span className="teacher-role">Викладач</span>
                                <div className="teacher-details">
                                    <span className="teacher-icon-label">👨‍🏫</span>
                                    <span className="teacher-name">{course.teacher || course.teacherName || 'Не призначено'}</span>
                                </div>
                            </div>
                            <p className="description">{course.description}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="course-tabs">
                    <button
                        className={`tab ${activeTab === 'materials' ? 'active' : ''}`}
                        onClick={() => setActiveTab('materials')}
                    >
                        📖 Матеріали
                    </button>
                    <button
                        className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('assignments')}
                    >
                        📝 Завдання
                    </button>
                    <button
                        className={`tab ${activeTab === 'grades' ? 'active' : ''}`}
                        onClick={() => setActiveTab('grades')}
                    >
                        📊 Оцінки
                    </button>
                    <button
                        className={`tab ${activeTab === 'forum' ? 'active' : ''}`}
                        onClick={() => setActiveTab('forum')}
                    >
                        💬 Форум
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'materials' && (
                        <div className="materials-section">
                            <div className="materials-header">
                                <h2>Навчальні матеріали</h2>
                                {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
                                    <button
                                        className="add-material-btn"
                                        onClick={() => setIsAddMaterialModalOpen(true)}
                                    >
                                        <span>+</span> Додати матеріал
                                    </button>
                                )}
                            </div>

                            {materialsLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Завантаження матеріалів...</p>
                                </div>
                            ) : materials.length === 0 ? (
                                <div className="empty-state">
                                    <p>📚 Матеріалів поки немає</p>
                                    {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
                                        <p className="empty-hint">Натисніть "Додати матеріал" щоб створити перший</p>
                                    )}
                                </div>
                            ) : (
                                <div className="materials-list">
                                    {materials.map(material => {
                                        const getIcon = (type) => {
                                            switch (type) {
                                                case 'video': return '🎥'
                                                case 'link': return '🔗'
                                                case 'text': return '📝'
                                                default: return '📄'
                                            }
                                        }

                                        return (
                                            <div key={material.id} className="material-card">
                                                <div className="material-icon">
                                                    {getIcon(material.type)}
                                                </div>
                                                <div className="material-content">
                                                    <div className="material-header-row">
                                                        <h3>{material.title}</h3>
                                                        {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
                                                            <button
                                                                className="delete-material-btn"
                                                                onClick={() => handleDeleteMaterial(material.id)}
                                                                title="Видалити матеріал"
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                    </div>
                                                    {material.description && <p>{material.description}</p>}
                                                    <div className="material-meta">
                                                        <span>📅 {new Date(material.createdAt).toLocaleDateString('uk-UA')}</span>
                                                        {material.creator && <span>👤 {material.creator.fullName}</span>}
                                                    </div>
                                                    {(material.fileUrl || material.content) && (
                                                        <div className="material-actions">
                                                            {material.type === 'text' ? (
                                                                <div className="material-text-content">
                                                                    {material.content}
                                                                </div>
                                                            ) : (
                                                                <a
                                                                    href={material.fileUrl || material.content}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="material-link-btn"
                                                                >
                                                                    {material.type === 'video' ? '▶️ Переглянути відео' : '📥 Відкрити'}
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div className="assignments-section">
                            <h2>Завдання</h2>
                            <div className="assignments-list">
                                {course.assignments.map(assignment => {
                                    const badge = getStatusBadge(assignment.status)
                                    return (
                                        <div key={assignment.id} className="assignment-card">
                                            <div className="assignment-header">
                                                <h3>{assignment.title}</h3>
                                                <span className={`status-badge ${badge.class}`}>
                                                    {badge.text}
                                                </span>
                                            </div>
                                            <p>{assignment.description}</p>
                                            <div className="assignment-footer">
                                                <span className="deadline">
                                                    ⏰ Дедлайн: {assignment.deadline}
                                                </span>
                                                {assignment.grade !== null && (
                                                    <span className="grade">
                                                        ✅ Оцінка: {assignment.grade}/100
                                                    </span>
                                                )}
                                            </div>
                                            <button className="assignment-button">
                                                {assignment.status === 'submitted' ? 'Переглянути' : 'Відкрити'}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'grades' && (
                        <div className="grades-section">
                            <h2>Мої оцінки</h2>
                            <div className="grades-table">
                                <div className="table-header">
                                    <div>Назва</div>
                                    <div>Дата</div>
                                    <div>Оцінка</div>
                                </div>
                                {course.grades.map((grade, idx) => (
                                    <div key={idx} className="table-row">
                                        <div>{grade.name}</div>
                                        <div>{grade.date}</div>
                                        <div className="grade-value">
                                            {grade.grade}/{grade.max}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="average-grade">
                                <span>Середній бал:</span>
                                <span className="value">
                                    {(course.grades.reduce((sum, g) => sum + g.grade, 0) / course.grades.length).toFixed(1)}
                                </span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'forum' && (
                        <div className="forum-section">
                            <h2>Форум курсу</h2>
                            <button className="new-topic-button">+ Нова тема</button>
                            <div className="forum-list">
                                {course.forum.map(topic => (
                                    <div key={topic.id} className="forum-topic">
                                        <div className="topic-icon">💬</div>
                                        <div className="topic-content">
                                            <h3>{topic.title}</h3>
                                            <div className="topic-meta">
                                                <span>👤 {topic.author}</span>
                                                <span>📅 {topic.date}</span>
                                                <span>💬 {topic.replies} відповідей</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AddMaterialModal
                isOpen={isAddMaterialModalOpen}
                onClose={() => setIsAddMaterialModalOpen(false)}
                onSubmit={handleAddMaterial}
                courseId={courseId}
            />
        </div>
    )
}

export default CoursePage
