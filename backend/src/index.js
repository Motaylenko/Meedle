const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (optional - can work without DB for now)
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  pool.connect()
    .then(() => console.log('✅ Connected to PostgreSQL database'))
    .catch(err => console.log('⚠️  Database not available, using mock data'));
}

// Mock data
const mockData = {
  courses: [
    {
      id: 1,
      name: 'Веб-технології',
      teacher: 'Іваненко І.І.',
      progress: 75,
      students: 42,
      color: 'hsl(262, 83%, 58%)',
      materials: 24,
      assignments: 8
    },
    {
      id: 2,
      name: 'Бази даних',
      teacher: 'Петренко П.П.',
      progress: 60,
      students: 38,
      color: 'hsl(200, 98%, 55%)',
      materials: 18,
      assignments: 6
    },
    {
      id: 3,
      name: 'Алгоритми',
      teacher: 'Сидоренко С.С.',
      progress: 45,
      students: 45,
      color: 'hsl(142, 71%, 45%)',
      materials: 32,
      assignments: 10
    },
    {
      id: 4,
      name: 'Математика',
      teacher: 'Коваленко К.К.',
      progress: 80,
      students: 50,
      color: 'hsl(330, 85%, 60%)',
      materials: 28,
      assignments: 7
    }
  ],

  schedule: [
    {
      day: 'Понеділок',
      date: '2026-02-03',
      lessons: [
        {
          id: 1,
          time: '09:00',
          endTime: '10:30',
          name: 'Веб-технології',
          teacher: 'Іваненко І.І.',
          room: 'Ауд. 301',
          type: 'lecture',
          courseId: 1
        },
        {
          id: 2,
          time: '10:45',
          endTime: '12:15',
          name: 'Бази даних',
          teacher: 'Петренко П.П.',
          room: 'Ауд. 205',
          type: 'practice',
          courseId: 2
        }
      ]
    },
    {
      day: 'Вівторок',
      date: '2026-02-04',
      lessons: [
        {
          id: 3,
          time: '09:00',
          endTime: '10:30',
          name: 'Алгоритми',
          teacher: 'Сидоренко С.С.',
          room: 'Ауд. 412',
          type: 'lecture',
          courseId: 3
        },
        {
          id: 4,
          time: '13:00',
          endTime: '14:30',
          name: 'Математика',
          teacher: 'Коваленко К.К.',
          room: 'Ауд. 108',
          type: 'lecture',
          courseId: 4
        }
      ]
    },
    {
      day: 'Середа',
      date: '2026-02-05',
      lessons: [
        {
          id: 5,
          time: '10:45',
          endTime: '12:15',
          name: 'Веб-технології',
          teacher: 'Іваненко І.І.',
          room: 'Ауд. 301',
          type: 'practice',
          courseId: 1
        },
        {
          id: 6,
          time: '13:00',
          endTime: '14:30',
          name: 'Бази даних',
          teacher: 'Петренко П.П.',
          room: 'Ауд. 205',
          type: 'lecture',
          courseId: 2
        }
      ]
    }
  ],

  grades: [
    { courseId: 1, course: 'Веб-технології', grade: 95, max: 100, color: 'hsl(262, 83%, 58%)' },
    { courseId: 2, course: 'Бази даних', grade: 88, max: 100, color: 'hsl(200, 98%, 55%)' },
    { courseId: 3, course: 'Алгоритми', grade: 92, max: 100, color: 'hsl(142, 71%, 45%)' },
    { courseId: 4, course: 'Математика', grade: 85, max: 100, color: 'hsl(330, 85%, 60%)' }
  ],

  leaderboard: [
    { rank: 1, name: 'Олександр Коваленко', points: 1450, avatar: '👨', trend: 'up' },
    { rank: 2, name: 'Марія Петренко', points: 1380, avatar: '👩', trend: 'same' },
    { rank: 3, name: 'Іван Сидоренко', points: 1320, avatar: '👨', trend: 'down' },
    { rank: 4, name: 'Анна Шевченко', points: 1290, avatar: '👩', trend: 'up' },
    { rank: 5, name: 'Петро Бондаренко', points: 1275, avatar: '👨', trend: 'up' },
    { rank: 12, name: 'Студент Meedle', points: 1247, avatar: '🎓', isCurrentUser: true, trend: 'up' }
  ],

  tasks: [
    {
      id: 1,
      courseId: 1,
      course: 'Веб-технології',
      task: 'Лабораторна робота #3',
      description: 'Створити адаптивний веб-сайт з використанням HTML, CSS та JavaScript',
      deadline: '2026-02-05',
      status: 'pending',
      points: 100
    },
    {
      id: 2,
      courseId: 2,
      course: 'Бази даних',
      task: 'Проєктування схеми БД',
      description: 'Розробити ER-діаграму для системи управління бібліотекою',
      deadline: '2026-02-07',
      status: 'in-progress',
      points: 80
    },
    {
      id: 3,
      courseId: 3,
      course: 'Алгоритми',
      task: 'Домашнє завдання #5',
      description: 'Реалізувати алгоритми сортування та порівняти їх ефективність',
      deadline: '2026-02-10',
      status: 'pending',
      points: 60
    }
  ],

  user: {
    id: 1,
    name: 'Студент Meedle',
    email: 'student@meedle.edu',
    avatar: '🎓',
    rating: 1247,
    rank: 12,
    coursesCount: 4,
    completedTasks: 23,
    settings: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        schedule: true
      }
    }
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Meedle API',
    version: '1.0.0',
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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: pool ? 'connected' : 'mock-data'
  });
});

// Courses endpoints
app.get('/api/courses', (req, res) => {
  res.json(mockData.courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = mockData.courses.find(c => c.id === parseInt(req.params.id));
  if (course) {
    res.json(course);
  } else {
    res.status(404).json({ error: 'Course not found' });
  }
});

// Schedule endpoints
app.get('/api/schedule', (req, res) => {
  res.json(mockData.schedule);
});

app.get('/api/schedule/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todaySchedule = mockData.schedule.find(s => s.date === today);
  res.json(todaySchedule || { day: 'Сьогодні', lessons: [] });
});

// Grades endpoints
app.get('/api/grades', (req, res) => {
  const averageGrade = mockData.grades.reduce((sum, g) => sum + g.grade, 0) / mockData.grades.length;
  res.json({
    grades: mockData.grades,
    average: parseFloat(averageGrade.toFixed(1))
  });
});

// Leaderboard endpoints
app.get('/api/leaderboard', (req, res) => {
  res.json(mockData.leaderboard);
});

app.get('/api/leaderboard/top/:count', (req, res) => {
  const count = parseInt(req.params.count) || 10;
  res.json(mockData.leaderboard.slice(0, count));
});

// Tasks endpoints
app.get('/api/tasks', (req, res) => {
  res.json(mockData.tasks);
});

app.get('/api/tasks/active', (req, res) => {
  const activeTasks = mockData.tasks.filter(t => t.status !== 'completed');
  res.json(activeTasks);
});

app.post('/api/tasks/:id/status', (req, res) => {
  const { status } = req.body;
  const task = mockData.tasks.find(t => t.id === parseInt(req.params.id));

  if (task) {
    task.status = status;
    res.json({ success: true, task });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// User endpoints
app.get('/api/user', (req, res) => {
  res.json(mockData.user);
});

app.put('/api/user/settings', (req, res) => {
  mockData.user.settings = { ...mockData.user.settings, ...req.body };
  res.json({ success: true, settings: mockData.user.settings });
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todaySchedule = mockData.schedule.find(s => s.date === today);
  const activeTasks = mockData.tasks.filter(t => t.status !== 'completed');

  res.json({
    upcomingClasses: todaySchedule ? todaySchedule.lessons.length : 0,
    activeTasks: activeTasks.length,
    currentRating: mockData.user.rating,
    ratingPosition: mockData.user.rank
  });
});

// Notifications endpoint (for push notifications)
app.post('/api/notifications/subscribe', (req, res) => {
  const { subscription } = req.body;
  // Here you would save the subscription to database
  res.json({ success: true, message: 'Subscribed to notifications' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`🚀 Meedle API Server running on port ${port}`);
  console.log(`📍 http://localhost:${port}`);
  console.log(`💾 Database: ${pool ? 'PostgreSQL' : 'Mock Data'}`);
});
