const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Courses
    async getCourses() {
        return this.request('/courses');
    }

    async getCourse(id) {
        return this.request(`/courses/${id}`);
    }

    async getCourseDetails(id) {
        return this.request(`/courses/${id}/details`);
    }

    // Schedule
    async getSchedule() {
        return this.request('/schedule');
    }

    async getTodaySchedule() {
        return this.request('/schedule/today');
    }

    // Grades
    async getGrades() {
        return this.request('/grades');
    }

    // Leaderboard
    async getLeaderboard() {
        return this.request('/leaderboard');
    }

    async getTopLeaders(count = 10) {
        return this.request(`/leaderboard/top/${count}`);
    }

    // Tasks
    async getTasks() {
        return this.request('/tasks');
    }

    async getActiveTasks() {
        return this.request('/tasks/active');
    }

    async updateTaskStatus(taskId, status) {
        return this.request(`/tasks/${taskId}/status`, {
            method: 'POST',
            body: JSON.stringify({ status }),
        });
    }

    // User
    async getUser() {
        return this.request('/user');
    }

    async updateUserSettings(settings) {
        return this.request('/user/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    }

    // Dashboard
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }

    // Notifications
    async subscribeToNotifications(subscription) {
        return this.request('/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify({ subscription }),
        });
    }
}

export default new ApiService();
