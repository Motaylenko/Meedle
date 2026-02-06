const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create a test user
    const user = await prisma.user.upsert({
        where: { email: 'student@meedle.edu' },
        update: {},
        create: {
            email: 'student@meedle.edu',
            login: 'student',
            password: '$2b$10$YourHashedPasswordHere', // student123 (симуляція хешу)
            fullName: 'Студент Meedle',
            avatar: '🎓',
            rating: 1247,
            rank: 12,
            coursesCount: 4,
            completedTasks: 23,
            settings: {
                create: {
                    theme: 'light',
                    emailNotifications: true,
                    pushNotifications: true,
                    scheduleNotifications: true,
                },
            },
        },
    });

    console.log('✅ Created user:', user.email);

    // Create courses
    const courses = await Promise.all([
        prisma.course.create({
            data: {
                name: 'Веб-технології',
                teacher: 'Іваненко І.І.',
                color: 'hsl(262, 83%, 58%)',
                materials: 24,
                assignments: 8,
                description: 'Курс присвячений вивченню веб-технологій. Включає теоретичні лекції, практичні заняття та проєктну роботу.',
            },
        }),
        prisma.course.create({
            data: {
                name: 'Бази даних',
                teacher: 'Петренко П.П.',
                color: 'hsl(200, 98%, 55%)',
                materials: 18,
                assignments: 6,
                description: 'Курс присвячений вивченню баз даних. Включає теоретичні лекції, практичні заняття та проєктну роботу.',
            },
        }),
        prisma.course.create({
            data: {
                name: 'Алгоритми',
                teacher: 'Сидоренко С.С.',
                color: 'hsl(142, 71%, 45%)',
                materials: 32,
                assignments: 10,
                description: 'Курс присвячений вивченню алгоритмів. Включає теоретичні лекції, практичні заняття та проєктну роботу.',
            },
        }),
        prisma.course.create({
            data: {
                name: 'Математика',
                teacher: 'Коваленко К.К.',
                color: 'hsl(330, 85%, 60%)',
                materials: 28,
                assignments: 7,
                description: 'Курс присвячений вивченню математики. Включає теоретичні лекції, практичні заняття та проєктну роботу.',
            },
        }),
    ]);

    console.log('✅ Created courses:', courses.length);

    // Create enrollments
    const enrollments = await Promise.all([
        prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId: courses[0].id,
                progress: 75,
            },
        }),
        prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId: courses[1].id,
                progress: 60,
            },
        }),
        prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId: courses[2].id,
                progress: 45,
            },
        }),
        prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId: courses[3].id,
                progress: 80,
            },
        }),
    ]);

    console.log('✅ Created enrollments:', enrollments.length);

    // Create schedules
    const schedules = await Promise.all([
        // Monday
        prisma.schedule.create({
            data: {
                courseId: courses[0].id,
                day: 'Понеділок',
                date: new Date('2026-02-03'),
                time: '09:00',
                endTime: '10:30',
                room: 'Ауд. 301',
                type: 'lecture',
            },
        }),
        prisma.schedule.create({
            data: {
                courseId: courses[1].id,
                day: 'Понеділок',
                date: new Date('2026-02-03'),
                time: '10:45',
                endTime: '12:15',
                room: 'Ауд. 205',
                type: 'practice',
            },
        }),
        // Tuesday
        prisma.schedule.create({
            data: {
                courseId: courses[2].id,
                day: 'Вівторок',
                date: new Date('2026-02-04'),
                time: '09:00',
                endTime: '10:30',
                room: 'Ауд. 412',
                type: 'lecture',
            },
        }),
        prisma.schedule.create({
            data: {
                courseId: courses[3].id,
                day: 'Вівторок',
                date: new Date('2026-02-04'),
                time: '13:00',
                endTime: '14:30',
                room: 'Ауд. 108',
                type: 'lecture',
            },
        }),
        // Wednesday
        prisma.schedule.create({
            data: {
                courseId: courses[0].id,
                day: 'Середа',
                date: new Date('2026-02-05'),
                time: '10:45',
                endTime: '12:15',
                room: 'Ауд. 301',
                type: 'practice',
            },
        }),
        prisma.schedule.create({
            data: {
                courseId: courses[1].id,
                day: 'Середа',
                date: new Date('2026-02-05'),
                time: '13:00',
                endTime: '14:30',
                room: 'Ауд. 205',
                type: 'lecture',
            },
        }),
    ]);

    console.log('✅ Created schedules:', schedules.length);

    // Create grades
    const grades = await Promise.all([
        prisma.grade.create({
            data: {
                userId: user.id,
                courseId: courses[0].id,
                name: 'Лабораторна #1',
                grade: 95,
                maxGrade: 100,
            },
        }),
        prisma.grade.create({
            data: {
                userId: user.id,
                courseId: courses[1].id,
                name: 'Тест #1',
                grade: 88,
                maxGrade: 100,
            },
        }),
        prisma.grade.create({
            data: {
                userId: user.id,
                courseId: courses[2].id,
                name: 'Практична #1',
                grade: 92,
                maxGrade: 100,
            },
        }),
        prisma.grade.create({
            data: {
                userId: user.id,
                courseId: courses[3].id,
                name: 'Домашнє завдання #1',
                grade: 85,
                maxGrade: 100,
            },
        }),
    ]);

    console.log('✅ Created grades:', grades.length);

    // Create tasks
    const tasks = await Promise.all([
        prisma.task.create({
            data: {
                userId: user.id,
                courseId: courses[0].id,
                title: 'Лабораторна робота #3',
                description: 'Створити адаптивний веб-сайт з використанням HTML, CSS та JavaScript',
                deadline: new Date('2026-02-05'),
                status: 'pending',
                points: 100,
            },
        }),
        prisma.task.create({
            data: {
                userId: user.id,
                courseId: courses[1].id,
                title: 'Проєктування схеми БД',
                description: 'Розробити ER-діаграму для системи управління бібліотекою',
                deadline: new Date('2026-02-07'),
                status: 'in-progress',
                points: 80,
            },
        }),
        prisma.task.create({
            data: {
                userId: user.id,
                courseId: courses[2].id,
                title: 'Домашнє завдання #5',
                description: 'Реалізувати алгоритми сортування та порівняти їх ефективність',
                deadline: new Date('2026-02-10'),
                status: 'pending',
                points: 60,
            },
        }),
    ]);

    console.log('✅ Created tasks:', tasks.length);

    // Create leaderboard entries
    const leaderboard = await Promise.all([
        prisma.leaderboard.create({
            data: { name: 'Олександр Коваленко', points: 1450, avatar: '👨', trend: 'up' },
        }),
        prisma.leaderboard.create({
            data: { name: 'Марія Петренко', points: 1380, avatar: '👩', trend: 'same' },
        }),
        prisma.leaderboard.create({
            data: { name: 'Іван Сидоренко', points: 1320, avatar: '👨', trend: 'down' },
        }),
        prisma.leaderboard.create({
            data: { name: 'Анна Шевченко', points: 1290, avatar: '👩', trend: 'up' },
        }),
        prisma.leaderboard.create({
            data: { name: 'Петро Бондаренко', points: 1275, avatar: '👨', trend: 'up' },
        }),
        prisma.leaderboard.create({
            data: { name: 'Студент Meedle', points: 1247, avatar: '🎓', trend: 'up' },
        }),
    ]);

    console.log('✅ Created leaderboard entries:', leaderboard.length);

    console.log('🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
