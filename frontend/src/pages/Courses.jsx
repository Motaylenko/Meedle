import { useState, useEffect, useMemo } from 'react'
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

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all') // all, in-progress, completed
    const [sortKey, setSortKey] = useState('name') // name, teacher
    const [viewMode, setViewMode] = useState('grid')
    const [collapsedGroups, setCollapsedGroups] = useState({})

    useEffect(() => {
        loadCourses()
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
            setCourses([
                {
                    id: 1,
                    name: 'Веб-технології',
                    teacher: 'Іваненко І.І.',
                    progress: 75,
                    students: 42,
                    color: 'hsl(262, 83%, 58%)',
                    group: 'КІ-21-1',
                    assignments: 12,
                    materials: 8
                },
                {
                    id: 2,
                    name: 'Бази даних',
                    teacher: 'Петренко П.П.',
                    progress: 60,
                    students: 38,
                    color: 'hsl(200, 98%, 55%)',
                    group: 'КІ-21-1',
                    assignments: 10,
                    materials: 5
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    // Filtered and Sorted Courses
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch =
                course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (course.teacher && course.teacher.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (course.group && course.group.toLowerCase().includes(searchQuery.toLowerCase()));

            if (filterStatus === 'completed') return matchesSearch && course.progress === 100;
            if (filterStatus === 'in-progress') return matchesSearch && course.progress < 100 && course.progress > 0;
            return matchesSearch;
        }).sort((a, b) => {
            if (sortKey === 'name') return a.name.localeCompare(b.name);
            if (sortKey === 'teacher') return (a.teacher || '').localeCompare(b.teacher || '');
            return 0;
        });
    }, [courses, searchQuery, filterStatus, sortKey]);

    // Grouping
    const groupedCourses = useMemo(() => {
        return filteredCourses.reduce((acc, course) => {
            const groupName = course.group || 'Загальні'
            if (!acc[groupName]) acc[groupName] = []
            acc[groupName].push(course)
            return acc
        }, {})
    }, [filteredCourses]);

    const toggleGroup = (groupName) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

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
                        <button className="add-course-btn" onClick={() => setIsModalOpen(true)}>
                            <span>+</span> Додати курс
                        </button>
                    )}
                </div>

                {/* Search and Filters Bar */}
                <div className="courses-controls">
                    <div className="control-group filter-select">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">Усі (крім видалених)</option>
                            <option value="in-progress">У процесі</option>
                            <option value="completed">Завершені</option>
                        </select>
                    </div>

                    <div className="control-group search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Знайдіть за назвою або групою..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>

                    <div className="control-group sort-select">
                        <label>Сортувати за:</label>
                        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                            <option value="name">Назвою курсу</option>
                            <option value="teacher">Викладачем</option>
                        </select>
                    </div>

                    <div className="control-group view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            Картка
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            Список
                        </button>
                    </div>
                </div>

                <AdminCourseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCourseCreated={loadCourses}
                />

                <div className="courses-content">
                    {Object.entries(groupedCourses).length > 0 ? (
                        Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                            <div key={groupName} className={`course-group-section ${collapsedGroups[groupName] ? 'collapsed' : ''}`}>
                                <div className="group-folder-header" onClick={() => toggleGroup(groupName)}>
                                    <div className="folder-icon">{collapsedGroups[groupName] ? '📁' : '📂'}</div>
                                    <h2>Група: {groupName}</h2>
                                    <span className="course-count">{groupCourses.length} курсів</span>
                                    <button className="collapse-btn">
                                        {collapsedGroups[groupName] ? '▼' : '▲'}
                                    </button>
                                </div>

                                <div className={`courses-container ${viewMode}`}>
                                    {!collapsedGroups[groupName] && (
                                        <div className={viewMode === 'grid' ? 'courses-grid' : 'courses-list'}>
                                            {groupCourses.map(course => (
                                                <div
                                                    key={course.id}
                                                    className="course-card"
                                                    style={{ '--course-color': course.color }}
                                                    onClick={() => navigate(`/courses/${course.id}`)}
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
                                                            <span>{course.assignments || 0} завдань</span>
                                                        </div>
                                                        <div className="footer-item">
                                                            <span className="footer-icon">📚</span>
                                                            <span>{course.materials || 0} матеріалів</span>
                                                        </div>
                                                        <button className="enter-course-btn">
                                                            Ввійти ➜
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>Жодного курсу не знайдено за вашим запитом</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Courses
