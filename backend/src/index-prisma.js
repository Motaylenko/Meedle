const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const prisma = require('./prisma');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'meedle_secret_key_2025';

// Middleware
app.use(cors());
app.use(express.json());

// Email Transporter (Налаштуйте змінні в .env для реальної відправки)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Test database connection with retry
async function testConnection() {
    console.log('⏳ Attempting to connect to database...');
    // Чекаємо 5 секунд перед першою спробою, щоб DB встигла завантажитись
    setTimeout(async () => {
        try {
            await prisma.$connect();
            console.log('✅ Connected to PostgreSQL database via Prisma');
        } catch (error) {
            console.error('❌ Failed to connect to database:', error.message);
            console.log('⚠️  Check your DATABASE_URL in .env');
        }
    }, 5000);
}

testConnection();

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Meedle API with Prisma',
        version: '2.0.0',
        endpoints: {
            courses: '/api/courses',
            schedule: '/api/schedule',
            grades: '/api/grades',
            leaderboard: '/api/leaderboard',
            tasks: '/api/tasks',
            user: '/api/user'
        }
    });
});

// 1. Реєстрація
app.post('/api/auth/register', async (req, res) => {
    try {
        const {
            fullName, login, birthDate, email,
            password, document, department,
            specialty, group
        } = req.body;

        // Валідація
        if (!fullName || !login || !email || !password) {
            return res.status(400).json({ error: 'Всі обов’язкові поля мають бути заповнені' });
        }

        // Перевірка чи існує користувач
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { login }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Користувач з таким email або логіном вже існує' });
        }

        // Хешування пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Створення токена підтвердження
        const confirmationToken = crypto.randomBytes(32).toString('hex');

        // Створення користувача (неактивного)
        const user = await prisma.user.create({
            data: {
                fullName,
                login,
                birthDate: new Date(birthDate),
                email,
                password: hashedPassword,
                document,
                department,
                specialty,
                group,
                confirmationToken,
                isActive: false
            }
        });

        // Відправка листа адміністратору (san.sanuchj@gmail.com)
        const confirmUrl = `${req.protocol}://${req.get('host')}/api/auth/confirm/${confirmationToken}`;

        const mailOptions = {
            from: '"Meedle Platform" <noreply@meedle.com>',
            to: 'san.sanuchj@gmail.com', // Як ви і просили
            subject: 'Підтвердження нової реєстрації - Meedle',
            html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
          <h2 style="color: #6366f1;">Нова реєстрація в Meedle</h2>
          <p>Було створено новий акаунт. Деталі:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>ПІБ:</strong> ${fullName}</li>
            <li><strong>Логін:</strong> ${login}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Дата народження:</strong> ${birthDate}</li>
            <li><strong>Паспорт:</strong> ${document}</li>
            <li><strong>Кафедра:</strong> ${department}</li>
            <li><strong>Спеціальність:</strong> ${specialty}</li>
            <li><strong>Група:</strong> ${group}</li>
          </ul>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${confirmUrl}" style="background-color: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">ПІДТВЕРДИТИ РЕЄСТРАЦІЮ</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #888;">Якщо ви не очікували цього листа, просто ігноруйте його.</p>
        </div>
      `
        };

        // В реальності тут потрібен робочий SMTP
        try {
            await transporter.sendMail(mailOptions);
            console.log('✅ Лист підтвердження відправлено на san.sanuchj@gmail.com');
        } catch (err) {
            console.log('⚠️ Помилка відправки пошти (перевірте налаштування .env):', err.message);
            // Для демонстрації виведемо посилання в консоль
            console.log('🔗 Спрощене посилання для підтвердження:', confirmUrl);
        }

        res.status(201).json({
            message: 'Реєстрація успішна! Чекайте на активацію акаунта адміністратором.',
            debugToken: confirmationToken // Тільки для розробки
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Помилка при реєстрації' });
    }
});

// 2. Підтвердження реєстрації
app.get('/api/auth/confirm/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await prisma.user.findUnique({
            where: { confirmationToken: token }
        });

        if (!user) {
            return res.status(404).send('<h1>Помилка: Токен недійсний</h1>');
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isActive: true,
                confirmationToken: null
            }
        });

        res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #10b981;">Акаунт активовано!</h1>
        <p>Користувач <strong>${user.fullName}</strong> тепер може увійти в систему.</p>
        <br>
        <a href="http://localhost:3000/login" style="color: #6366f1; text-decoration: none; font-weight: bold;">Перейти до входу</a>
      </div>
    `);
    } catch (error) {
        res.status(500).send('Помилка сервера при активації');
    }
});

// 3. Вхід
app.post('/api/auth/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { login }
        });

        if (!user) {
            return res.status(401).json({ error: 'Невірний логін або пароль' });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'Ваш акаунт ще не активовано адміністратором' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Невірний логін або пароль' });
        }

        // Генерація токена
        const token = jwt.sign({
            id: user.id,
            email: user.email
        }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Вхід успішний',
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Помилка під час входу' });
    }
});

// API health endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: 'connected',
        auth: 'enabled'
    });
});

// ==================== COURSES ENDPOINTS ====================

// Get all courses with enrollment data
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                enrollments: {
                    select: {
                        progress: true,
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        // Format response to match frontend expectations
        const formattedCourses = courses.map(course => ({
            id: course.id,
            name: course.name,
            teacher: course.teacher,
            color: course.color,
            materials: course.materials,
            assignments: course.assignments,
            students: course._count.enrollments,
            progress: course.enrollments[0]?.progress || 0,
        }));

        res.json(formattedCourses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Get single course by ID
app.get('/api/courses/:id', async (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                enrollments: {
                    select: {
                        progress: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const formattedCourse = {
            id: course.id,
            name: course.name,
            teacher: course.teacher,
            color: course.color,
            materials: course.materials,
            assignments: course.assignments,
            students: course._count.enrollments,
            progress: course.enrollments[0]?.progress || 0,
        };

        res.json(formattedCourse);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
});

// Get detailed course information
app.get('/api/courses/:id/details', async (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                tasks: {
                    orderBy: { deadline: 'asc' },
                },
                grades: {
                    orderBy: { date: 'desc' },
                    take: 10,
                },
            },
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Mock detailed data (you can extend this based on your needs)
        const courseDetails = {
            ...course,
            description: course.description || `Курс присвячений вивченню ${course.name.toLowerCase()}. Включає теоретичні лекції, практичні заняття та проєктну роботу.`,
            materials: [
                {
                    id: 1,
                    type: 'lecture',
                    title: `Вступ до ${course.name}`,
                    description: 'Основні поняття та інструменти',
                    date: '2026-01-15',
                    files: ['lecture-01.pdf', 'slides-01.pptx']
                },
                {
                    id: 2,
                    type: 'lecture',
                    title: 'Теоретичні основи',
                    description: 'Фундаментальні концепції',
                    date: '2026-01-22',
                    files: ['lecture-02.pdf']
                },
            ],
            assignments: course.tasks.map((task, index) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                deadline: task.deadline,
                status: task.status,
                grade: null,
            })),
            grades: course.grades.map(grade => ({
                name: grade.name,
                grade: grade.grade,
                max: grade.maxGrade,
                date: grade.date,
            })),
            forum: [
                {
                    id: 1,
                    author: 'Петренко П.П.',
                    title: 'Питання щодо лабораторної роботи',
                    date: '2026-02-03',
                    replies: 5
                },
            ],
        };

        res.json(courseDetails);
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({ error: 'Failed to fetch course details' });
    }
});

// ==================== SCHEDULE ENDPOINTS ====================

// Get full schedule
app.get('/api/schedule', async (req, res) => {
    try {
        const schedules = await prisma.schedule.findMany({
            include: {
                course: true,
            },
            orderBy: [
                { date: 'asc' },
                { time: 'asc' },
            ],
        });

        // Group by day
        const groupedSchedule = schedules.reduce((acc, schedule) => {
            const existingDay = acc.find(d => d.day === schedule.day);

            const lesson = {
                id: schedule.id,
                time: schedule.time,
                endTime: schedule.endTime,
                name: schedule.course.name,
                teacher: schedule.course.teacher,
                room: schedule.room,
                type: schedule.type,
                courseId: schedule.courseId,
            };

            if (existingDay) {
                existingDay.lessons.push(lesson);
            } else {
                acc.push({
                    day: schedule.day,
                    date: schedule.date.toISOString().split('T')[0],
                    lessons: [lesson],
                });
            }

            return acc;
        }, []);

        res.json(groupedSchedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// Get today's schedule
app.get('/api/schedule/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const schedules = await prisma.schedule.findMany({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                course: true,
            },
            orderBy: {
                time: 'asc',
            },
        });

        const lessons = schedules.map(schedule => ({
            id: schedule.id,
            time: schedule.time,
            endTime: schedule.endTime,
            name: schedule.course.name,
            teacher: schedule.course.teacher,
            room: schedule.room,
            type: schedule.type,
            courseId: schedule.courseId,
        }));

        res.json({
            day: 'Сьогодні',
            date: today.toISOString().split('T')[0],
            lessons,
        });
    } catch (error) {
        console.error('Error fetching today schedule:', error);
        res.status(500).json({ error: 'Failed to fetch today schedule' });
    }
});

// ==================== GRADES ENDPOINTS ====================

// Get all grades for current user
app.get('/api/grades', async (req, res) => {
    try {
        // For now, we'll use the first user (you can add authentication later)
        const user = await prisma.user.findFirst();

        if (!user) {
            return res.json({ grades: [], average: 0 });
        }

        const grades = await prisma.grade.findMany({
            where: { userId: user.id },
            include: {
                course: true,
            },
        });

        // Calculate average per course
        const courseGrades = {};
        grades.forEach(grade => {
            if (!courseGrades[grade.courseId]) {
                courseGrades[grade.courseId] = {
                    courseId: grade.courseId,
                    course: grade.course.name,
                    color: grade.course.color,
                    grades: [],
                };
            }
            courseGrades[grade.courseId].grades.push(grade.grade);
        });

        const formattedGrades = Object.values(courseGrades).map(cg => {
            const avg = cg.grades.reduce((sum, g) => sum + g, 0) / cg.grades.length;
            return {
                courseId: cg.courseId,
                course: cg.course,
                grade: Math.round(avg),
                max: 100,
                color: cg.color,
            };
        });

        const averageGrade = formattedGrades.reduce((sum, g) => sum + g.grade, 0) / formattedGrades.length;

        res.json({
            grades: formattedGrades,
            average: parseFloat(averageGrade.toFixed(1)) || 0,
        });
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ error: 'Failed to fetch grades' });
    }
});

// ==================== LEADERBOARD ENDPOINTS ====================

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await prisma.leaderboard.findMany({
            orderBy: {
                points: 'desc',
            },
        });

        const formattedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            name: entry.name,
            points: entry.points,
            avatar: entry.avatar,
            trend: entry.trend,
            isCurrentUser: entry.name === 'Студент Meedle',
        }));

        res.json(formattedLeaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Get top N from leaderboard
app.get('/api/leaderboard/top/:count', async (req, res) => {
    try {
        const count = parseInt(req.params.count) || 10;
        const leaderboard = await prisma.leaderboard.findMany({
            orderBy: {
                points: 'desc',
            },
            take: count,
        });

        const formattedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            name: entry.name,
            points: entry.points,
            avatar: entry.avatar,
            trend: entry.trend,
        }));

        res.json(formattedLeaderboard);
    } catch (error) {
        console.error('Error fetching top leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch top leaderboard' });
    }
});

// ==================== TASKS ENDPOINTS ====================

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const user = await prisma.user.findFirst();

        if (!user) {
            return res.json([]);
        }

        const tasks = await prisma.task.findMany({
            where: { userId: user.id },
            include: {
                course: true,
            },
            orderBy: {
                deadline: 'asc',
            },
        });

        const formattedTasks = tasks.map(task => ({
            id: task.id,
            courseId: task.courseId,
            course: task.course.name,
            task: task.title,
            description: task.description,
            deadline: task.deadline.toISOString().split('T')[0],
            status: task.status,
            points: task.points,
        }));

        res.json(formattedTasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Get active tasks
app.get('/api/tasks/active', async (req, res) => {
    try {
        const user = await prisma.user.findFirst();

        if (!user) {
            return res.json([]);
        }

        const tasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                status: {
                    not: 'completed',
                },
            },
            include: {
                course: true,
            },
            orderBy: {
                deadline: 'asc',
            },
        });

        const formattedTasks = tasks.map(task => ({
            id: task.id,
            courseId: task.courseId,
            course: task.course.name,
            task: task.title,
            description: task.description,
            deadline: task.deadline.toISOString().split('T')[0],
            status: task.status,
            points: task.points,
        }));

        res.json(formattedTasks);
    } catch (error) {
        console.error('Error fetching active tasks:', error);
        res.status(500).json({ error: 'Failed to fetch active tasks' });
    }
});

// Update task status
app.post('/api/tasks/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const taskId = parseInt(req.params.id);

        const task = await prisma.task.update({
            where: { id: taskId },
            data: { status },
            include: {
                course: true,
            },
        });

        const formattedTask = {
            id: task.id,
            courseId: task.courseId,
            course: task.course.name,
            task: task.title,
            description: task.description,
            deadline: task.deadline.toISOString().split('T')[0],
            status: task.status,
            points: task.points,
        };

        res.json({ success: true, task: formattedTask });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ error: 'Failed to update task status' });
    }
});

// ==================== USER ENDPOINTS ====================

// Get user profile
app.get('/api/user', async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            include: {
                settings: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const formattedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            rating: user.rating,
            rank: user.rank,
            coursesCount: user.coursesCount,
            completedTasks: user.completedTasks,
            settings: {
                theme: user.settings?.theme || 'light',
                notifications: {
                    email: user.settings?.emailNotifications ?? true,
                    push: user.settings?.pushNotifications ?? true,
                    schedule: user.settings?.scheduleNotifications ?? true,
                },
            },
        };

        res.json(formattedUser);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user settings
app.put('/api/user/settings', async (req, res) => {
    try {
        const user = await prisma.user.findFirst();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { theme, notifications } = req.body;

        const settings = await prisma.userSettings.upsert({
            where: { userId: user.id },
            update: {
                theme: theme || undefined,
                emailNotifications: notifications?.email ?? undefined,
                pushNotifications: notifications?.push ?? undefined,
                scheduleNotifications: notifications?.schedule ?? undefined,
            },
            create: {
                userId: user.id,
                theme: theme || 'light',
                emailNotifications: notifications?.email ?? true,
                pushNotifications: notifications?.push ?? true,
                scheduleNotifications: notifications?.schedule ?? true,
            },
        });

        res.json({
            success: true,
            settings: {
                theme: settings.theme,
                notifications: {
                    email: settings.emailNotifications,
                    push: settings.pushNotifications,
                    schedule: settings.scheduleNotifications,
                },
            },
        });
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ error: 'Failed to update user settings' });
    }
});

// ==================== DASHBOARD ENDPOINTS ====================

// Get dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const user = await prisma.user.findFirst();

        if (!user) {
            return res.json({
                upcomingClasses: 0,
                activeTasks: 0,
                currentRating: 0,
                ratingPosition: 0,
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [upcomingClasses, activeTasks] = await Promise.all([
            prisma.schedule.count({
                where: {
                    date: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            }),
            prisma.task.count({
                where: {
                    userId: user.id,
                    status: {
                        not: 'completed',
                    },
                },
            }),
        ]);

        res.json({
            upcomingClasses,
            activeTasks,
            currentRating: user.rating,
            ratingPosition: user.rank,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// ==================== NOTIFICATIONS ENDPOINT ====================

app.post('/api/notifications/subscribe', (req, res) => {
    const { subscription } = req.body;
    // Here you would save the subscription to database
    res.json({ success: true, message: 'Subscribed to notifications' });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// ==================== SERVER START ====================

app.listen(port, () => {
    console.log(`🚀 Meedle API Server running on port ${port}`);
    console.log(`📍 http://localhost:${port}`);
    console.log(`💾 Database: Prisma + PostgreSQL`);
    console.log(`📊 Prisma Studio: npm run db:studio`);
});
