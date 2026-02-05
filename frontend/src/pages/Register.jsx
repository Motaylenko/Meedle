import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        login: '',
        birthDate: '',
        email: '',
        password: '',
        confirmPassword: '',
        document: '',
        department: '',
        specialty: '',
        group: '',
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
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message);
                // Через 5 секунд перенаправити на логін
                setTimeout(() => navigate('/login'), 5000);
            } else {
                setError(data.error || 'Помилка реєстрації');
            }
        } catch (err) {
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
                        <label>Прізвище, Ім'я, По-батькові</label>
                        <input
                            name="fullName"
                            placeholder="Сидоренко Іван Петрович"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Логін</label>
                        <input
                            name="login"
                            placeholder="ivan_s"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Дата народження</label>
                        <input
                            type="date"
                            name="birthDate"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="ivan@email.com"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Документ (паспорт)</label>
                        <input
                            name="document"
                            placeholder="АМ 000000"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Кафедра</label>
                        <input
                            name="department"
                            placeholder="Програмна інженерія"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Спеціальність</label>
                        <input
                            name="specialty"
                            placeholder="121 Інженерія ПЗ"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Група</label>
                        <input
                            name="group"
                            placeholder="ІПЗ-21"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Пароль</label>
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Повторіть пароль</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            onChange={handleChange}
                            required
                        />
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
