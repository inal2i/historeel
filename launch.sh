#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Загружаем переменные из .env если файл существует
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Проверяем обязательный ключ
: "${OPENAI_API_KEY:?Ошибка: OPENAI_API_KEY не задан. Скопируй .env.example в .env и укажи ключ.}"

# Устанавливаем зависимости если нужно
if [ ! -d node_modules ]; then
  echo "Устанавливаю зависимости..."
  npm install
fi

echo "Запуск редактора на http://localhost:9000"
exec npx vite
