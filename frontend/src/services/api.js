const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    ...options.headers,
                },
                ...options,
            });

            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `API Error: ${response.statusText}`);
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

    async updateAvatar(avatar) {
        return this.request('/user/avatar', {
            method: 'PUT',
            body: JSON.stringify({ avatar }),
        });
    }

    // Dashboard
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }

    async getAdminDashboardStats() {
        return this.request('/admin/dashboard/stats');
    }

    // Notifications
    async subscribeToNotifications(subscription) {
        return this.request('/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify({ subscription }),
        });
    }

    // Admin
    async getTeachers() {
        return this.request('/admin/teachers');
    }

    async getGroups() {
        return this.request('/admin/groups');
    }

    async getStudents() {
        return this.request('/admin/students');
    }

    async createCourse(courseData) {
        return this.request('/admin/courses', {
            method: 'POST',
            body: JSON.stringify(courseData),
        });
    }

    async enrollStudents(courseId, studentIds) {
        return this.request(`/admin/courses/${courseId}/enroll`, {
            method: 'POST',
            body: JSON.stringify({ studentIds }),
        });
    }

    async createGroup(name) {
        return this.request('/admin/groups', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    }

    async deleteGroup(id) {
        return this.request(`/admin/groups/${id}`, {
            method: 'DELETE',
        });
    }

    async getGroupCourses(groupId) {
        return this.request(`/admin/groups/${groupId}/courses`);
    }

    async getGroupStudents(groupId) {
        return this.request(`/admin/groups/${groupId}/students`);
    }

    async updateGroupStudents(groupId, studentIds, action) {
        return this.request(`/admin/groups/${groupId}/students`, {
            method: 'POST',
            body: JSON.stringify({ studentIds, action }),
        });
    }

    async saveSchedule(groupId, scheduleData) {
        return this.request(`/admin/groups/${groupId}/schedule`, {
            method: 'POST',
            body: JSON.stringify(scheduleData),
        });
    }

    async deleteSchedule(id) {
        return this.request(`/admin/schedule/${id}`, {
            method: 'DELETE',
        });
    }

    async getGroupSchedule(groupId) {
        return this.request(`/schedule?groupId=${groupId}`);
    }

    // Bell Schedules
    async getBellSchedules() {
        return this.request('/admin/bell-schedules');
    }

    async saveBellSchedule(bellScheduleData) {
        return this.request('/admin/bell-schedules', {
            method: 'POST',
            body: JSON.stringify(bellScheduleData),
        });
    }

    async deleteBellSchedule(id) {
        return this.request(`/admin/bell-schedules/${id}`, {
            method: 'DELETE',
        });
    }
}

export default new ApiService();
