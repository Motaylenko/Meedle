import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
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
        document: '', // Буде заповнено після Дії
        department: '',
        specialty: '',
        group: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Diia specific states
    const [showDiiaQR, setShowDiiaQR] = useState(false);
    const [diiaVerified, setDiiaVerified] = useState(false);
    const [diiaSessionToken, setDiiaSessionToken] = useState('');
    const [qrTimer, setQrTimer] = useState(120);

    // Симуляція генерації токена сесії Дії
    const handleStartDiia = () => {
        const mockToken = 'diia_' + Math.random().toString(36).substr(2, 9);
        setDiiaSessionToken(mockToken);
        setShowDiiaQR(true);
        setQrTimer(120);
    };

    // Таймер для QR-коду
    useEffect(() => {
        let interval;
        if (showDiiaQR && qrTimer > 0) {
            interval = setInterval(() => setQrTimer(t => t - 1), 1000);
        } else if (qrTimer === 0) {
            setShowDiiaQR(false);
        }
        return () => clearInterval(interval);
    }, [showDiiaQR, qrTimer]);

    // Симуляція успішного сканування через 5 секунд
    useEffect(() => {
        if (showDiiaQR && !diiaVerified) {
            const timeout = setTimeout(() => {
                setDiiaVerified(true);
                setShowDiiaQR(false);
                setFormData(prev => ({
                    ...prev,
                    document: 'VERIFIED_VIA_DIIA_' + diiaSessionToken.toUpperCase(),
                    fullName: 'Іванов Іван Іванович', // Автозаповнення з Дії
                }));
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [showDiiaQR]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!diiaVerified) {
            return setError('Будь ласка, підтвердіть особу через Дію');
        }

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
                    {/* Секція Дії */}
                    <div className={styles.diiaSection}>
                        <div className={diiaVerified ? styles.diiaStatusVerified : styles.diiaStatusPending}>
                            {diiaVerified ? (
                                <span>✅ Особу підтверджено через Дію</span>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.diiaBtn}
                                    onClick={handleStartDiia}
                                >
                                    <img src="https://diia.gov.ua/favicon.ico" alt="Diia" width="20" />
                                    Використати Дія.Підпис
                                </button>
                            )}
                        </div>
                        <p className={styles.diiaHint}>
                            {diiaVerified
                                ? 'Дані паспорта та ПІБ завантажено автоматично'
                                : 'Для реєстрації необхідно надати електронний підпис'}
                        </p>
                    </div>

                    <div className={styles.inputGroupFull}>
                        <label>Прізвище, Ім'я, По-батькові</label>
                        <input
                            name="fullName"
                            value={formData.fullName}
                            placeholder="Автозаповнення після Дії"
                            onChange={handleChange}
                            required
                            readOnly={diiaVerified}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Логін</label>
                        <input name="login" placeholder="ivan_s" onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Дата народження</label>
                        <input type="date" name="birthDate" onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input type="email" name="email" placeholder="ivan@email.com" onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Кафедра</label>
                        <input name="department" placeholder="Програмна інженерія" onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Спеціальність</label>
                        <input name="specialty" placeholder="121 Інженерія ПЗ" onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Група</label>
                        <input name="group" placeholder="ІПЗ-21" onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Пароль</label>
                        <input type="password" name="password" onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Повторіть пароль</label>
                        <input type="password" name="confirmPassword" onChange={handleChange} required />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading || !diiaVerified}>
                        {loading ? 'Надсилання...' : 'Зареєструватися'}
                    </button>
                </form>

                <p className={styles.footerText}>
                    Вже маєте акаунт? <Link to="/login">Увійти</Link>
                </p>
            </div>

            {/* Модальне вікно Дії */}
            {showDiiaQR && (
                <div className={styles.modalOverlay}>
                    <div className={styles.diiaModal}>
                        <div className={styles.diiaHeader}>
                            <img src="https://diia.gov.ua/favicon.ico" alt="Diia" width="30" />
                            <h3>Дія.Підпис</h3>
                            <button onClick={() => setShowDiiaQR(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <div className={styles.qrContent}>
                            <p>Відскануйте QR-код застосунком Дія для надання електронного підпису</p>
                            <div className={styles.qrWrapper}>
                                <QRCodeSVG
                                    value={`https://diia.app/sign/${diiaSessionToken}`}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <div className={styles.timer}>
                                Код дійсний ще {qrTimer} сек.
                            </div>
                        </div>
                        <div className={styles.diiaFooter}>
                            <p>Версія 2.0.1 • Міністерство цифрової трансформації</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
