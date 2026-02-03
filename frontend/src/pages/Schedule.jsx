import { useState, useEffect } from 'react'
import api from '../services/api'
import './Schedule.css'

function Schedule() {
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSchedule()
    }, [])

    const loadSchedule = async () => {
        try {
            setLoading(true)
            const data = await api.getSchedule()
            setSchedule(data)
        } catch (err) {
            console.error('Failed to load schedule:', err)
            // Fallback data
            setSchedule([
                {
                    day: 'Понеділок',
                    lessons: [
                        { time: '09:00', name: 'Веб-технології', teacher: 'Іваненко І.І.', room: 'Ауд. 301', type: 'lecture' },
                        { time: '10:45', name: 'Бази даних', teacher: 'Петренко П.П.', room: 'Ауд. 205', type: 'practice' }
                    ]
                },
                {
                    day: 'Вівторок',
                    lessons: [
                        { time: '09:00', name: 'Алгоритми', teacher: 'Сидоренко С.С.', room: 'Ауд. 412', type: 'lecture' },
                        { time: '13:00', name: 'Математика', teacher: 'Коваленко К.К.', room: 'Ауд. 108', type: 'lecture' }
                    ]
                },
                {
                    day: 'Середа',
                    lessons: [
                        { time: '10:45', name: 'Веб-технології', teacher: 'Іваненко І.І.', room: 'Ауд. 301', type: 'practice' },
                        { time: '13:00', name: 'Бази даних', teacher: 'Петренко П.П.', room: 'Ауд. 205', type: 'lecture' }
                    ]
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="schedule-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Завантаження розкладу...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="schedule-page">
            <div className="container">
                <div className="page-header">
                    <h1>📅 Розклад занять</h1>
                    <p>Ваш тижневий графік навчання</p>
                </div>

                <div className="schedule-grid">
                    {schedule.map((day, index) => (
                        <div key={index} className="day-card">
                            <div className="day-header">
                                <h2>{day.day}</h2>
                                <span className="lessons-count">{day.lessons.length} пари</span>
                            </div>
                            <div className="day-lessons">
                                {day.lessons.map((lesson, lessonIndex) => (
                                    <div key={lessonIndex} className="schedule-lesson">
                                        <div className="lesson-time-badge">{lesson.time}</div>
                                        <div className="lesson-info">
                                            <div className="lesson-title">{lesson.name}</div>
                                            <div className="lesson-meta">
                                                <span>👨‍🏫 {lesson.teacher}</span>
                                                <span>🚪 {lesson.room}</span>
                                            </div>
                                        </div>
                                        <div className={`lesson-badge ${lesson.type}`}>
                                            {lesson.type === 'lecture' ? 'Лекція' : 'Практика'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Schedule
