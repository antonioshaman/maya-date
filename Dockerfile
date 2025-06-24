# 1️⃣ Используем Python + Node вместе
FROM python:3.11-slim

# 2️⃣ Устанавливаем Node.js
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# 3️⃣ Создаём рабочую директорию
WORKDIR /app

# 4️⃣ Копируем файлы
COPY . .

# 5️⃣ Устанавливаем Python зависимости
RUN pip install playwright && python3 -m playwright install

# 6️⃣ Устанавливаем Node зависимости
RUN npm install

# 7️⃣ Указываем порт
ENV PORT=3000

# 8️⃣ Стартуем Node сервер
CMD ["node", "index.cjs"]

