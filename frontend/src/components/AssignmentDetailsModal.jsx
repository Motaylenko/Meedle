import { useState, useEffect } from 'react'
import api from '../services/api'
import './AssignmentDetailsModal.css'

function AssignmentDetailsModal({ isOpen, onClose, assignmentId, userRole }) {
    const [assignment, setAssignment] = useState(null)
    const [submissions, setSubmissions] = useState([])
    const [submissionData, setSubmissionData] = useState({ content: '', fileUrl: '' })
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [activeView, setActiveView] = useState('detail') // 'detail' or 'submissions'
    const [gradingData, setGradingData] = useState({ submissionId: null, grade: '', feedback: '' })

    useEffect(() => {
        if (isOpen && assignmentId) {
            loadAssignmentData()
        }
    }, [isOpen, assignmentId])

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

    const loadAssignmentData = async () => {
        try {
            setLoading(true)
            const data = await api.getAssignment(assignmentId)
            setAssignment(data)

            // If user has submission, fill the form
            if (data.submissions && data.submissions.length > 0) {
                setSubmissionData({
                    content: data.submissions[0].content || '',
                    fileUrl: data.submissions[0].fileUrl || ''
                })
            }

            // If teacher/admin, load all submissions
            if (userRole === 'ADMIN' || userRole === 'TEACHER') {
                const subs = await api.getAssignmentSubmissions(assignmentId)
                setSubmissions(subs)
            }
        } catch (err) {
            console.error('Failed to load assignment:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitWork = async (e) => {
        e.preventDefault()
        try {
            setSubmitting(true)
            await api.submitAssignment(assignmentId, submissionData)
            alert('Завдання успішно надіслано!')
            loadAssignmentData()
        } catch (err) {
            console.error('Failed to submit:', err)
            alert('Помилка при надсиланні')
        } finally {
            setSubmitting(false)
        }
    }

    const handleGradeSubmission = async (e) => {
        e.preventDefault()
        try {
            await api.gradeSubmission(gradingData.submissionId, {
                grade: gradingData.grade,
                feedback: gradingData.feedback
            })
            alert('Оцінку виставлено!')
            setGradingData({ submissionId: null, grade: '', feedback: '' })
            loadAssignmentData()
        } catch (err) {
            console.error('Failed to grade:', err)
            alert('Помилка при виставленні оцінки')
        }
    }

    if (!isOpen) return null

    const isTeacher = userRole === 'ADMIN' || userRole === 'TEACHER'
    const mySubmission = assignment?.submissions?.[0]

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content assignment-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <span className="modal-icon">📝</span>
                        <h2>{assignment?.title || 'Завантаження...'}</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="modal-loading">
                            <div className="spinner"></div>
                            <p>Завантаження деталей...</p>
                        </div>
                    ) : (
                        <>
                            {isTeacher && (
                                <div className="admin-tabs">
                                    <button
                                        className={`admin-tab ${activeView === 'detail' ? 'active' : ''}`}
                                        onClick={() => setActiveView('detail')}
                                    >
                                        Опис та відповідь
                                    </button>
                                    <button
                                        className={`admin-tab ${activeView === 'submissions' ? 'active' : ''}`}
                                        onClick={() => setActiveView('submissions')}
                                    >
                                        Переглянути всі відповіді ({submissions.length})
                                    </button>
                                </div>
                            )}

                            {activeView === 'detail' ? (
                                <div className="assignment-view">
                                    <div className="assignment-info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Статус:</span>
                                            <span className={`status-badge ${mySubmission ? (mySubmission.status === 'graded' ? 'success' : 'warning') : 'default'}`}>
                                                {mySubmission ? (mySubmission.status === 'graded' ? 'Оцінено' : 'Здано на перевірку') : 'Не здано'}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Дедлайн:</span>
                                            <span className="info-value">{new Date(assignment?.deadline).toLocaleString('uk-UA')}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Макс. балів:</span>
                                            <span className="info-value">{assignment?.points}</span>
                                        </div>
                                        {mySubmission?.grade !== null && (
                                            <div className="info-item grade-item">
                                                <span className="info-label">Ваша оцінка:</span>
                                                <span className="info-value highlight">{mySubmission?.grade} / {assignment?.points}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="assignment-description">
                                        <h3>Опис завдання</h3>
                                        <p>{assignment?.description || 'Опис відсутній'}</p>
                                    </div>

                                    {mySubmission?.feedback && (
                                        <div className="teacher-feedback">
                                            <h3>Відгук викладача</h3>
                                            <div className="feedback-content">
                                                {mySubmission.feedback}
                                            </div>
                                        </div>
                                    )}

                                    <div className="submission-section">
                                        <h3>Ваша відповідь</h3>
                                        <form onSubmit={handleSubmitWork}>
                                            <div className="form-group">
                                                <label>Текст відповіді / Посилання на роботу</label>
                                                <textarea
                                                    value={submissionData.content}
                                                    onChange={(e) => setSubmissionData({ ...submissionData, content: e.target.value })}
                                                    placeholder="Введіть текст або посилання на Google Drive/GitHub..."
                                                    rows="5"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Додаткове посилання (якщо потрібно)</label>
                                                <input
                                                    type="url"
                                                    value={submissionData.fileUrl}
                                                    onChange={(e) => setSubmissionData({ ...submissionData, fileUrl: e.target.value })}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn-primary submit-btn"
                                                disabled={submitting}
                                            >
                                                {submitting ? 'Надсилання...' : (mySubmission ? 'Оновити відповідь' : 'Здати завдання')}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div className="submissions-view">
                                    <div className="submissions-list">
                                        {submissions.length === 0 ? (
                                            <div className="empty-state">Відповідей поки немає</div>
                                        ) : (
                                            submissions.map(sub => (
                                                <div key={sub.id} className="submission-row-card">
                                                    <div className="sub-user-info">
                                                        <div className="user-avatar-mini">
                                                            {sub.user.avatar ? <img src={sub.user.avatar} alt="" /> : '👤'}
                                                        </div>
                                                        <div className="user-details-mini">
                                                            <span className="user-name">{sub.user.fullName}</span>
                                                            <span className="user-group">{sub.user.group || 'Без групи'}</span>
                                                        </div>
                                                        <span className={`status-badge-mini ${sub.status}`}>
                                                            {sub.status === 'graded' ? `Оцінено: ${sub.grade}` : 'Потребує оцінки'}
                                                        </span>
                                                    </div>

                                                    <div className="sub-content">
                                                        {sub.content && <p className="sub-text">{sub.content}</p>}
                                                        {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="sub-link">📎 Відкрити файл/посилання</a>}
                                                    </div>

                                                    <div className="sub-grading-actions">
                                                        {gradingData.submissionId === sub.id ? (
                                                            <form className="inline-grading-form" onSubmit={handleGradeSubmission}>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Бал"
                                                                    max={assignment.points}
                                                                    value={gradingData.grade}
                                                                    onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                                                                    required
                                                                />
                                                                <textarea
                                                                    placeholder="Фідбек (необов'язково)"
                                                                    value={gradingData.feedback}
                                                                    onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                                                                />
                                                                <div className="grading-btns">
                                                                    <button type="button" className="btn-text" onClick={() => setGradingData({ submissionId: null })}>Скасувати</button>
                                                                    <button type="submit" className="btn-primary-sm">Зберегти</button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <button
                                                                className="btn-secondary-sm"
                                                                onClick={() => setGradingData({ submissionId: sub.id, grade: sub.grade || '', feedback: sub.feedback || '' })}
                                                            >
                                                                {sub.status === 'graded' ? 'Змінити оцінку' : 'Оцінити'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AssignmentDetailsModal
