class NotificationService {
    constructor() {
        this.permission = Notification.permission;
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
    }

    async showNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            const granted = await this.requestPermission();
            if (!granted) return;
        }

        const defaultOptions = {
            icon: '/vite.svg',
            badge: '/vite.svg',
            vibrate: [200, 100, 200],
            ...options
        };

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, defaultOptions);
            });
        } else {
            new Notification(title, defaultOptions);
        }
    }

    // Specific notification types
    scheduleChange(lessonName, newTime) {
        this.showNotification('📅 Зміна розкладу', {
            body: `${lessonName} перенесено на ${newTime}`,
            tag: 'schedule-change',
            requireInteraction: true
        });
    }

    newTask(courseName, taskName, deadline) {
        this.showNotification('📝 Нове завдання', {
            body: `${courseName}: ${taskName}\nДедлайн: ${deadline}`,
            tag: 'new-task'
        });
    }

    gradeUpdate(courseName, grade) {
        this.showNotification('📊 Оновлення оцінки', {
            body: `${courseName}: ${grade} балів`,
            tag: 'grade-update'
        });
    }

    ratingChange(newRating, change) {
        const emoji = change > 0 ? '📈' : '📉';
        this.showNotification(`${emoji} Зміна рейтингу`, {
            body: `Ваш рейтинг: ${newRating} (${change > 0 ? '+' : ''}${change})`,
            tag: 'rating-change'
        });
    }

    upcomingLesson(lessonName, timeUntil) {
        this.showNotification('⏰ Нагадування', {
            body: `${lessonName} через ${timeUntil} хвилин`,
            tag: 'lesson-reminder',
            requireInteraction: false
        });
    }
}

export default new NotificationService();
