require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('./prisma');

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'meedle_secret_key_2025';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Логування запитів для діагностики
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Підключення до бази даних та ініціалізація
async function initialize() {
    try {
        await prisma.$connect();
        console.log('✅ База даних PostgreSQL підключена успішно');

        // Створення адміна, якщо його немає
        const adminEmail = 'zubenkom815@gmail.com';
        const adminLogin = 'admin';
        const adminPassword = '88888888';

        const existingAdmin = await prisma.user.findFirst({
            where: {
                OR: [{ email: adminEmail }, { login: adminLogin }]
            }
        });

        if (!existingAdmin) {
            const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    login: adminLogin,
                    password: hashedAdminPassword,
                    fullName: 'Адміністратор Meedle',
                    role: 'ADMIN',
                    isActive: true
                }
            });
            console.log('👑 Адміністратор створений успішно');
        } else {
            console.log('ℹ️ Адміністратор вже існує');
        }
    } catch (error) {
        console.error('❌ Помилка підключення або ініціалізації БД:', error.message);
    }
}
initialize();

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Meedle API is running' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// 1. Реєстрація (пряма, без підтвердження)
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

        // Створення користувача (одразу активного)
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
                role: req.body.role || 'STUDENT',
                isActive: true // Одразу активний
            }
        });

        console.log(`👤 Новий користувач зареєстрований: ${login}`);

        res.status(201).json({
            message: 'Реєстрація успішна! Тепер ви можете увійти до свого акаунту.',
            user: {
                id: user.id,
                fullName: user.fullName,
                login: user.login
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Помилка при реєстрації' });
    }
});

// Middleware for authentication
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Необхідна авторизація' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(401).json({ error: 'Користувача не знайдено' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Невійний токен' });
    }
};

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
            return res.status(403).json({ error: 'Ваш обліковий запис тимчасово заблоковано. Якщо ви не згодні з цим рішенням, зверніться до адміністратора.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Невірний логін або пароль' });
        }

        // Оновлення часу останнього входу
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

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
                avatar: user.avatar,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
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
app.get('/api/courses', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const courses = await prisma.course.findMany({
            include: {
                enrollments: {
                    where: { userId },
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
            group: course.group,
            teacher: course.teacherName || (course.teacher ? course.teacher.fullName : 'Не призначено'),
            teacherId: course.teacherId,
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
app.get('/api/courses/:id', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = parseInt(req.params.id);
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                enrollments: {
                    where: { userId },
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
            teacher: course.teacherName || (course.teacher ? course.teacher.fullName : 'Не призначено'),
            teacherId: course.teacherId,
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

// Get full schedule (optionally filtered by group)
app.get('/api/schedule', authenticate, async (req, res) => {
    try {
        const { groupName, groupId } = req.query;

        const where = {};
        if (groupId) {
            where.groupId = parseInt(groupId);
        } else if (groupName) {
            where.group = { name: groupName };
        } else if (req.user.role === 'STUDENT' && req.user.group) {
            // Default for students: their own group
            where.group = { name: req.user.group };
        }

        const schedules = await prisma.schedule.findMany({
            where,
            include: {
                course: true,
                group: true,
            },
            orderBy: [
                { time: 'asc' },
            ],
        });

        // Group by day
        const dayOrder = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота', 'Неділя'];

        const groupedSchedule = dayOrder.map(day => {
            const dayLessons = schedules.filter(s => s.day === day);
            return {
                day,
                lessons: dayLessons.map(schedule => ({
                    id: schedule.id,
                    time: schedule.time,
                    endTime: schedule.endTime,
                    name: schedule.course.name,
                    teacher: schedule.course.teacherName || (schedule.course.teacher ? schedule.course.teacher.fullName : 'Не призначено'),
                    room: schedule.room,
                    type: schedule.type,
                    courseId: schedule.courseId,
                    isTemporary: schedule.isTemporary,
                    weekType: schedule.weekType,
                    bellScheduleId: schedule.bellScheduleId,
                    date: schedule.date ? schedule.date.toISOString().split('T')[0] : null,
                }))
            };
        }).filter(d => d.lessons.length > 0);

        res.json(groupedSchedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// Get today's schedule
app.get('/api/schedule/today', authenticate, async (req, res) => {
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
app.get('/api/grades', authenticate, async (req, res) => {
    try {
        const user = req.user;

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
app.get('/api/tasks', authenticate, async (req, res) => {
    try {
        const user = req.user;

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
app.get('/api/tasks/active', authenticate, async (req, res) => {
    try {
        const user = req.user;

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
app.get('/api/user', authenticate, async (req, res) => {
    try {
        const user = req.user;
        const settings = await prisma.userSettings.findUnique({
            where: { userId: user.id }
        });

        const formattedUser = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar,
            rating: user.rating,
            rank: user.rank,
            coursesCount: user.coursesCount,
            completedTasks: user.completedTasks,
            firstLogin: user.createdAt,
            lastLogin: user.lastLogin,
            settings: {
                theme: settings?.theme || 'light',
                notifications: {
                    email: settings?.emailNotifications ?? true,
                    push: settings?.pushNotifications ?? true,
                    schedule: settings?.scheduleNotifications ?? true,
                },
            },
        };

        res.json(formattedUser);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user avatar
app.put('/api/user/avatar', authenticate, async (req, res) => {
    try {
        const { avatar } = req.body; // Can be a URL or base64 string

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatar }
        });

        res.json({
            success: true,
            avatar: updatedUser.avatar
        });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ error: 'Failed to update avatar' });
    }
});

// Update user settings
app.put('/api/user/settings', authenticate, async (req, res) => {
    try {
        const user = req.user;
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
app.get('/api/dashboard/stats', authenticate, async (req, res) => {
    try {
        const user = req.user;

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

// Middleware for admin check
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: 'Доступ заборонено. Потрібні права адміністратора.' });
    }
};

// Get admin dashboard stats
app.get('/api/admin/dashboard/stats', authenticate, isAdmin, async (req, res) => {
    try {
        const [studentCount, teacherCount, groupCount, courseCount] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'TEACHER' } }),
            prisma.group.count(),
            prisma.course.count()
        ]);

        res.json({
            studentCount,
            teacherCount,
            groupCount,
            courseCount
        });
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch admin dashboard stats' });
    }
});

// Get all teachers
app.get('/api/admin/teachers', authenticate, isAdmin, async (req, res) => {
    try {
        const teachers = await prisma.user.findMany({
            where: { role: 'TEACHER' },
            select: { id: true, fullName: true, email: true }
        });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teachers' });
    }
});

// Get all students
app.get('/api/admin/students', authenticate, isAdmin, async (req, res) => {
    try {
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            select: { id: true, fullName: true, email: true, group: true }
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Get all unique groups
app.get('/api/admin/groups', authenticate, isAdmin, async (req, res) => {
    try {
        const groups = await prisma.group.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

// Create a new group
app.post('/api/admin/groups', authenticate, isAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Назва групи обов’язкова' });

        const group = await prisma.group.create({
            data: { name }
        });
        res.status(201).json(group);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Група з такою назвою вже існує' });
        }
        res.status(500).json({ error: 'Failed to create group' });
    }
});

// Delete a group
app.delete('/api/admin/groups/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // Fetch group to get name for cleanup of legacy fields
        const group = await prisma.group.findUnique({ where: { id } });
        if (!group) return res.status(404).json({ error: 'Групу не знайдено' });

        // Atomic transaction to cleanup and delete
        await prisma.$transaction([
            // Update users who have this group set as a string (legacy/sync field)
            prisma.user.updateMany({
                where: { group: group.name },
                data: { group: null }
            }),
            // Update courses which have this group set as a string
            prisma.course.updateMany({
                where: { OR: [{ group: group.name }, { groupId: id }] },
                data: { group: null, groupId: null }
            }),
            // Finally delete the group
            prisma.group.delete({ where: { id } })
        ]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Failed to delete group' });
    }
});

// Get courses for a specific group
app.get('/api/admin/groups/:id/courses', authenticate, isAdmin, async (req, res) => {
    try {
        const groupId = parseInt(req.params.id);
        const courses = await prisma.course.findMany({
            where: {
                OR: [
                    { groupId },
                    { groupRef: { id: groupId } }
                ]
            }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch group courses' });
    }
});

// Get students for a specific group
app.get('/api/admin/groups/:id/students', authenticate, isAdmin, async (req, res) => {
    try {
        const groupId = parseInt(req.params.id);
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const students = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
                group: group.name
            },
            select: { id: true, fullName: true, email: true, login: true, group: true }
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch group students' });
    }
});

// Add/Remove students from a group
app.post('/api/admin/groups/:id/students', authenticate, isAdmin, async (req, res) => {
    try {
        const groupId = parseInt(req.params.id);
        const { studentIds, action } = req.body; // action: 'add' or 'remove'

        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        if (action === 'add') {
            await prisma.user.updateMany({
                where: { id: { in: studentIds } },
                data: { group: group.name }
            });
        } else {
            await prisma.user.updateMany({
                where: { id: { in: studentIds } },
                data: { group: null }
            });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update group students' });
    }
});

// ==================== BELL SCHEDULE ENDPOINTS ====================

// Get all bell schedules
app.get('/api/admin/bell-schedules', authenticate, isAdmin, async (req, res) => {
    try {
        const bellSchedules = await prisma.bellSchedule.findMany({
            orderBy: { number: 'asc' }
        });
        res.json(bellSchedules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bell schedules' });
    }
});

// Create/Update bell schedule
app.post('/api/admin/bell-schedules', authenticate, isAdmin, async (req, res) => {
    try {
        const { id, number, startTime, endTime } = req.body;
        const data = {
            number: parseInt(number),
            startTime,
            endTime
        };

        let bellSchedule;
        if (id) {
            bellSchedule = await prisma.bellSchedule.update({
                where: { id: parseInt(id) },
                data
            });
        } else {
            bellSchedule = await prisma.bellSchedule.create({
                data
            });
        }
        res.json(bellSchedule);
    } catch (error) {
        console.error('Error saving bell schedule:', error);
        res.status(500).json({ error: 'Failed to save bell schedule' });
    }
});

// Delete bell schedule
app.delete('/api/admin/bell-schedules/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.bellSchedule.delete({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete bell schedule' });
    }
});

// Add/Update schedule entry for a group
app.post('/api/admin/groups/:id/schedule', authenticate, isAdmin, async (req, res) => {
    try {
        const groupId = parseInt(req.params.id);
        const { id, courseId, day, time, endTime, room, type, date, isTemporary, weekType, bellScheduleId } = req.body;

        const data = {
            courseId: parseInt(courseId),
            groupId,
            day,
            time,
            endTime,
            room,
            type,
            isTemporary: !!isTemporary,
            weekType: weekType || 'EVERY',
            bellScheduleId: bellScheduleId ? parseInt(bellScheduleId) : null,
            date: date ? new Date(date) : null
        };

        let schedule;
        if (id) {
            schedule = await prisma.schedule.update({
                where: { id: parseInt(id) },
                data
            });
        } else {
            schedule = await prisma.schedule.create({
                data
            });
        }

        res.json(schedule);
    } catch (error) {
        console.error('Error saving schedule:', error);
        res.status(500).json({ error: 'Failed to save schedule' });
    }
});

// Delete schedule entry
app.delete('/api/admin/schedule/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.schedule.delete({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

// Create new course with group enrollment
app.post('/api/admin/courses', authenticate, isAdmin, async (req, res) => {
    try {
        const { name, teacherId, teacherName, color, description, group } = req.body;

        // 1. Create the course
        const course = await prisma.course.create({
            data: {
                name,
                group,
                teacherId: teacherId ? parseInt(teacherId) : null,
                teacherName,
                color: color || '#4F46E5',
                description
            }
        });

        // 2. Automatically enroll students from the specified group
        if (group) {
            const studentsInGroup = await prisma.user.findMany({
                where: { group, role: 'STUDENT' },
                select: { id: true }
            });

            if (studentsInGroup.length > 0) {
                await prisma.enrollment.createMany({
                    data: studentsInGroup.map(student => ({
                        userId: student.id,
                        courseId: course.id,
                        progress: 0
                    })),
                    skipDuplicates: true
                });
            }
        }

        res.status(201).json(course);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
});

// Enroll students to course
app.post('/api/admin/courses/:id/enroll', authenticate, isAdmin, async (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const { studentIds } = req.body; // Array of IDs

        const enrollments = await Promise.all(
            studentIds.map(userId =>
                prisma.enrollment.upsert({
                    where: { userId_courseId: { userId, courseId } },
                    update: {},
                    create: { userId, courseId }
                })
            )
        );

        res.json({ success: true, count: enrollments.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to enroll students' });
    }
});

// ==================== ADMIN USER MANAGEMENT ====================

// Get all users with filtering and sorting
app.get('/api/admin/users', authenticate, isAdmin, async (req, res) => {
    try {
        const { role, sortBy } = req.query;

        const where = {};
        if (role && role !== 'all') {
            where.role = role.toUpperCase();
        }

        const orderBy = {};
        if (sortBy === 'newest') {
            orderBy.createdAt = 'desc';
        } else if (sortBy === 'oldest') {
            orderBy.createdAt = 'asc';
        } else if (sortBy === 'name') {
            orderBy.fullName = 'asc';
        } else {
            orderBy.createdAt = 'desc';
        }

        const users = await prisma.user.findMany({
            where,
            orderBy,
            select: {
                id: true,
                fullName: true,
                email: true,
                login: true,
                role: true,
                isActive: true,
                createdAt: true,
                lastLogin: true,
                group: true,
                avatar: true
            }
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Toggle user active status (block/unblock)
app.patch('/api/admin/users/:id/toggle-active', authenticate, isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // Don't allow blocking yourself
        if (id === req.user.id) {
            return res.status(400).json({ error: 'Ви не можете заблокувати себе' });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { isActive: !user.isActive },
            select: { id: true, isActive: true }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ error: 'Failed to toggle user status' });
    }
});

// Delete user
app.delete('/api/admin/users/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // Don't allow deleting yourself
        if (id === req.user.id) {
            return res.status(400).json({ error: 'Ви не можете видалити себе' });
        }

        await prisma.user.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ==================== NOTIFICATIONS ENDPOINT ====================

app.post('/api/notifications/subscribe', (req, res) => {
    const { subscription } = req.body;
    // Here you would save the subscription to database
    res.json({ success: true, message: 'Subscribed to notifications' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// ==================== SERVER START ====================

// Слухаємо на 0.0.0.0 для коректної роботи в Docker
app.listen(port, '0.0.0.0', () => {
    console.log('========================================');
    console.log(`🚀 Meedle API Server is LIVE!`);
    console.log(`📍 URL: http://0.0.0.0:${port}`);
    console.log(`🌍 External: http://localhost:${port}`);
    console.log(`💾 Database: Prisma + PostgreSQL`);
    console.log('========================================');
});
