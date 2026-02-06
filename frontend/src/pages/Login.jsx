import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        login: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
            } else {
                setError(data.error || 'Помилка входу');
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
                <h2>Вхід у систему</h2>
                <p className={styles.subtitle}>Раді бачити вас знову!</p>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroupFull}>
                        <label>Логін</label>
                        <input
                            name="login"
                            placeholder="Ваш логін"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroupFull}>
                        <label>Пароль</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Вхід...' : 'Увійти'}
                    </button>
                </form>

                <p className={styles.footerText}>
                    Немає акаунту? <Link to="/register">Зареєструватися</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
