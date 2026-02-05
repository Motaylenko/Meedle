const express = require('express');
const cors = require('cors');
require('dotenv').config();
const prisma = require('./prisma');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
async function testConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to PostgreSQL database via Prisma');
    } catch (error) {
        console.error('❌ Failed to connect to database:', error.message);
        console.log('⚠️  Make sure to run: npm run db:push && npm run db:seed');
    }
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

app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: 'ok',
            timestamp: new Date(),
            database: 'connected'
        });
    } catch (error) {
        res.json({
            status: 'error',
            timestamp: new Date(),
            database: 'disconnected',
            error: error.message
        });
    }
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
