# ✅ База: Playwright с Node и Python
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

# 📁 Рабочая директория
WORKDIR /app

# 🔑 Копируем package.json/package-lock.json для npm install отдельно
COPY package*.json ./

# 📦 Устанавливаем Node зависимости
RUN npm install

# 📁 Копируем всё остальное
COPY . .

# 🐍 Обновляем pip и ставим Python Playwright
RUN apt-get update && apt-get install -y python3-pip && \
    pip3 install --upgrade pip && \
    pip3 install playwright && \
    python3 -m playwright install

# ✅ Разрешаем порт
EXPOSE 3000

# 🚀 Стартуем
CMD ["npm", "start"]
