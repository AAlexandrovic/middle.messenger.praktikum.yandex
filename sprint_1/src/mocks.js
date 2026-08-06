export const mockData = {
    // Данные для страницы списка чатов и переписки
    chatsPage: {
        title: "Чаты",
        currentUser: {
            name: "Иван",
            avatar: "https://placehold.co"
        },
        chats: [
            {
                id: 1,
                name: "Андрей",
                avatar: "https://placehold.co",
                lastMessage: "Привет! Как дела? Проект готов?",
                time: "18:45",
                unreadCount: 2,
                isActive: true
            },
            {
                id: 2,
                name: "Дизайн-выпускной",
                avatar: "https://placehold.co",
                lastMessage: "Коллеги, гляньте новые макеты в Фигме...",
                time: "15:12",
                unreadCount: 0,
                isActive: false
            },
            {
                id: 3,
                name: "Мама",
                avatar: "https://placehold.co",
                lastMessage: "Ты поел?",
                time: "Вчера",
                unreadCount: 0,
                isActive: false
            }
        ],
        activeChat: {
            name: "Андрей",
            messages: [
                { id: 101, text: "Привет! Проект готов?", time: "18:45", isIncoming: true },
                { id: 102, text: "Да, пишу базовые шаблоны на Handlebars.", time: "18:46", isIncoming: false },
                { id: 103, text: "Отлично, добавь туда еще моки для наглядности!", time: "18:48", isIncoming: true }
            ]
        }
    },

    // Данные для страницы настроек
    settingsPage: {
        title: "Профиль",
        user: {
            firstName: "Иван",
            secondName: "Иванов",
            displayName: "Ivan_Dev",
            email: "ivan@example.com",
            phone: "+7 (999) 999-99-99",
            avatar: "https://placehold.co"
        }
    }
};
