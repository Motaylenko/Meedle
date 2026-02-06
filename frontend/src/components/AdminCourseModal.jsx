import { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminCourseModal.css'

function AdminCourseModal({ isOpen, onClose, onCourseCreated }) {
    const [teachers, setTeachers] = useState([])
    const [groups, setGroups] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        teacherId: '',
        teacherName: '',
        group: '',
        color: '#4F46E5',
        description: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            loadTeachersAndGroups()
        }
    }, [isOpen])

    const loadTeachersAndGroups = async () => {
        try {
            const [teachersData, groupsData] = await Promise.all([
                api.getTeachers(),
                api.getGroups()
            ])
            setTeachers(teachersData)
            setGroups(groupsData)
        } catch (err) {
            console.error('Failed to load data:', err)
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await api.createCourse({
                name: formData.name,
                teacherId: formData.teacherId,
                teacherName: formData.teacherName,
                group: formData.group,
                color: formData.color,
                description: formData.description
            })

            onCourseCreated()
            onClose()
            setFormData({
                name: '',
                teacherId: '',
                teacherName: '',
                group: '',
                color: '#4F46E5',
                description: ''
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
                        <label>Група студентів</label>
                        <select
                            name="group"
                            value={formData.group}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Оберіть групу</option>
                            {groups.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                        {groups.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '5px' }}>Груп не знайдено. Переконайтеся, що у студентів вказано групу.</p>}
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
