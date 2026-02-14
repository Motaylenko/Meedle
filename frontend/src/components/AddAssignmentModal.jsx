import { useState, useEffect } from 'react'
import './AddMaterialModal.css'

function AddAssignmentModal({ isOpen, onClose, onSubmit, courseId }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            document.documentElement.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
    }, [isOpen])

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        points: 100
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await onSubmit(formData)
        setFormData({
            title: '',
            description: '',
            deadline: '',
            points: 100
        })
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content add-material-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <span className="modal-icon">📝</span>
                        <h2>Створити нове завдання</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="material-form">
                    <div className="form-group">
                        <label htmlFor="title">Назва завдання *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Наприклад: Лабораторна робота №1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Опис та інструкції</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Опишіть умови виконання завдання..."
                            rows="5"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="deadline">Кінцевий термін (Дедлайн) *</label>
                        <input
                            type="datetime-local"
                            id="deadline"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="points">Максимальна оцінка (балів) *</label>
                        <input
                            type="number"
                            id="points"
                            name="points"
                            value={formData.points}
                            onChange={handleChange}
                            min="1"
                            max="1000"
                            required
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Скасувати
                        </button>
                        <button type="submit" className="btn-primary">
                            Створити завдання
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddAssignmentModal
