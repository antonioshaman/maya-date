# ✅ Лёгкий базовый образ Node LTS
FROM node:18-alpine

# 📁 Рабочая директория
WORKDIR /app

# 📦 Устанавливаем только Node зависимости
COPY package*.json ./
RUN npm install

# 📁 Копируем всё остальное
COPY . .

# ✅ Открываем порт
EXPOSE 3000

# 🚀 Стартуем
CMD ["npm", "start"]
