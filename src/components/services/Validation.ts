const VALIDATION_RULES = {
  first_name: /^[A-ZА-ЯЁ][a-zа-яёA-ZА-ЯЁ\-]*$/,
  second_name: /^[A-ZА-ЯЁ][a-zа-яёA-ZА-ЯЁ\-]*$/,
  login: /^(?=.*[a-zA-Z])[a-zA-Z0-9\-_]{3,20}$/, // 3-20 симв, не только цифры
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[A-Z])(?=.*\d).{8,40}$/, // 8-40 симв, 1 заглавная, 1 цифра
  phone: /^\+?\d{10,15}$/,
  message: null, 
};

// Функция валидации одного конкретного поля
export function validateField(name: string, value: string): string {
  const trimmedValue = value.trim();

  // Отдельная проверка для сообщения
  if (name === "message" || name === "messageInput") {
    return trimmedValue === "" ? "Сообщение не должно быть пустым" : "";
  }

  const ruleKey = name as keyof typeof VALIDATION_RULES;
  const regex = VALIDATION_RULES[ruleKey];

  if (!regex) {
    return ""; // Если для поля нет правил, считаем его валидным
  }

  if (!regex.test(trimmedValue)) {
    switch (ruleKey) {
      case "first_name":
      case "second_name":
        return "Латиница или кириллица, первая буква заглавная, без пробелов/цифр (допустим дефис)";
      case "login":
        return "3–20 символов, латиница, может содержать цифры (но не только из них), без пробелов";
      case "email":
        return "Некорректный формат почты (обязательны @ и точка после неё)";
      case "password":
        return "8–40 символов, минимум одна заглавная буква и одна цифра";
      case "phone":
        return "10–15 символов, только цифры, может начинаться с плюса";
      default:
        return "Неверный формат поля";
    }
  }

  return ""; // Ошибок нет
}
