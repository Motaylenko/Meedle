import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        middleName: '',
        login: '',
        birthDate: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Паролі не співпадають');
        }

        setLoading(true);
        try {
            // Combine names for the server if needed, or send as is
            // For now, let's assume the API handles these fields
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message || 'Реєстрація успішна!');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.error || 'Помилка реєстрації');
            }
        } catch (err) {
            console.error('Registration Fetch Error:', err);
            setError('Не вдалося з’єднатися з сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.logo}>
                    <span className={styles.logoText}>Meedle</span>
                </div>
                <h2>Реєстрація</h2>
                <p className={styles.subtitle}>Створіть свій навчальний акаунт</p>

                {error && <div className={styles.errorBanner}>{error}</div>}
                {success && <div className={styles.successBanner}>{success}</div>}

                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.inputGroupFull}>
                        <label>Хто ви?</label>
                        <div className={styles.roleSelection}>
                            <label className={formData.role === 'STUDENT' ? styles.roleActive : ''}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="STUDENT"
                                    checked={formData.role === 'STUDENT'}
                                    onChange={handleChange}
                                />
                                👨‍🎓 Студент
                            </label>
                            <label className={formData.role === 'TEACHER' ? styles.roleActive : ''}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="TEACHER"
                                    checked={formData.role === 'TEACHER'}
                                    onChange={handleChange}
                                />
                                👨‍🏫 Викладач
                            </label>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Прізвище</label>
                        <input name="lastName" placeholder="Іванов" value={formData.lastName} onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Ім'я</label>
                        <input name="firstName" placeholder="Іван" value={formData.firstName} onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>По-батькові</label>
                        <input name="middleName" placeholder="Іванович" value={formData.middleName} onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Логін</label>
                        <input name="login" placeholder="ivan_s" value={formData.login} onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Дата народження</label>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input type="email" name="email" placeholder="ivan@email.com" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Пароль</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Повторіть пароль</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Надсилання...' : 'Зареєструватися'}
                    </button>
                </form>

                <p className={styles.footerText}>
                    Вже маєте акаунт? <Link to="/login">Увійти</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
