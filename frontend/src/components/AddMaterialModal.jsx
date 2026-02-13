import { useState, useEffect } from 'react'
import './AddMaterialModal.css'

function AddMaterialModal({ isOpen, onClose, onSubmit, courseId }) {
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
        type: 'file',
        content: '',
        fileUrl: '',
        fileName: ''
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
            type: 'file',
            content: '',
            fileUrl: '',
            fileName: ''
        })
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content add-material-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <span className="modal-icon">📚</span>
                        <h2>Додати навчальний матеріал</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="material-form">
                    <div className="form-group">
                        <label htmlFor="title">Назва матеріалу *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Наприклад: Лекція 1 - Вступ"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Тип матеріалу *</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        >
                            <option value="file">📄 Файл (PDF, DOCX, тощо)</option>
                            <option value="video">🎥 Відео</option>
                            <option value="link">🔗 Посилання</option>
                            <option value="text">📝 Текстовий матеріал</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Опис</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Короткий опис матеріалу..."
                            rows="3"
                        />
                    </div>

                    {formData.type === 'link' && (
                        <div className="form-group">
                            <label htmlFor="content">URL посилання *</label>
                            <input
                                type="url"
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="https://example.com"
                                required
                            />
                        </div>
                    )}

                    {formData.type === 'video' && (
                        <div className="form-group">
                            <label htmlFor="content">URL відео (YouTube, Vimeo) *</label>
                            <input
                                type="url"
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="https://youtube.com/watch?v=..."
                                required
                            />
                        </div>
                    )}

                    {formData.type === 'text' && (
                        <div className="form-group">
                            <label htmlFor="content">Текст матеріалу *</label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Введіть текст матеріалу..."
                                rows="8"
                                required
                            />
                        </div>
                    )}

                    {formData.type === 'file' && (
                        <div className="form-group">
                            <label htmlFor="fileUrl">URL файлу *</label>
                            <input
                                type="url"
                                id="fileUrl"
                                name="fileUrl"
                                value={formData.fileUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/file.pdf"
                                required
                            />
                            <small className="form-hint">
                                💡 Завантажте файл на Google Drive, Dropbox або інший хостинг і вставте посилання
                            </small>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Скасувати
                        </button>
                        <button type="submit" className="btn-primary">
                            Додати матеріал
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddMaterialModal
