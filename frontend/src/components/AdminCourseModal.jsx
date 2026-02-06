import { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminCourseModal.css'

function AdminCourseModal({ isOpen, onClose, onCourseCreated }) {
    const [teachers, setTeachers] = useState([])
    const [students, setStudents] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        teacherId: '',
        teacherName: '',
        color: '#4F46E5',
        description: '',
        selectedStudents: []
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            loadTeachersAndStudents()
        }
    }, [isOpen])

    const loadTeachersAndStudents = async () => {
        try {
            const [teachersData, studentsData] = await Promise.all([
                api.getTeachers(),
                api.getStudents()
            ])
            setTeachers(teachersData)
            setStudents(studentsData)
        } catch (err) {
            console.error('Failed to load users:', err)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === 'teacherId') {
            const selectedTeacher = teachers.find(t => t.id === parseInt(value))
            setFormData(prev => ({
                ...prev,
                teacherId: value,
                teacherName: selectedTeacher ? selectedTeacher.fullName : ''
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleStudentToggle = (studentId) => {
        setFormData(prev => {
            const current = prev.selectedStudents
            if (current.includes(studentId)) {
                return { ...prev, selectedStudents: current.filter(id => id !== studentId) }
            } else {
                return { ...prev, selectedStudents: [...current, studentId] }
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // 1. Create course
            const course = await api.createCourse({
                name: formData.name,
                teacherId: formData.teacherId,
                teacherName: formData.teacherName,
                color: formData.color,
                description: formData.description
            })

            // 2. Enroll students if any selected
            if (formData.selectedStudents.length > 0) {
                await api.enrollStudents(course.id, formData.selectedStudents)
            }

            onCourseCreated()
            onClose()
            // Reset form
            setFormData({
                name: '',
                teacherId: '',
                teacherName: '',
                color: '#4F46E5',
                description: '',
                selectedStudents: []
            })
        } catch (err) {
            setError(err.message || 'Не вдалося створити курс')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>📚 Додати новий курс</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Назва курсу</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Наприклад: Вища математика"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Викладач</label>
                        <select
                            name="teacherId"
                            value={formData.teacherId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Оберіть викладача</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.fullName} ({teacher.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Колір курсу</label>
                        <input
                            type="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Опис курсу</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Короткий опис дисципліни..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Призначити студентів ({formData.selectedStudents.length})</label>
                        <div className="multi-select-container">
                            {students.map(student => (
                                <label key={student.id} className="student-option">
                                    <input
                                        type="checkbox"
                                        checked={formData.selectedStudents.includes(student.id)}
                                        onChange={() => handleStudentToggle(student.id)}
                                    />
                                    <span>{student.fullName} {student.group ? `(${student.group})` : ''}</span>
                                </label>
                            ))}
                            {students.length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Студентів не знайдено</p>}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
                            Скасувати
                        </button>
                        <button type="submit" className="confirm-btn" disabled={loading}>
                            {loading ? 'Збереження...' : 'Створити курс'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AdminCourseModal
