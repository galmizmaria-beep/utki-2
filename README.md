# Меткий ответ — редактор учебной игры

Откройте `index.html` через локальный сервер:

```sh
python3 -m http.server 4173
```

Адрес редактора: http://localhost:4173/ . Установка зависимостей не нужна.

Актуальная игра: `game-v20261022-features1.html`, самостоятельный снимок плеера — `player-v20261022-features1/`.

Картинки в заданиях, набор целей с перетаскиваемыми стартовыми позициями, строгие траектории и эффекты попадания описаны в [NEW-FEATURES.md](NEW-FEATURES.md).

В этот репозиторий включён только текущий выпуск. Старые выпуски, старые экспорты и их маршруты не загружены. Исторический адрес `index.html?player=1` не используется для нового выпуска; открывайте новую игру по указанному выше пути.

Браузерные проверки: `tests/features-browser-smoke.html`, `tests/export-browser-smoke.html`, `tests/runtime-parity-browser-smoke.html`, `tests/result-button-browser-smoke.html`. Открывайте их через локальный сервер.

Для публикации сайта через GitHub Pages выберите Settings → Pages → Deploy from a branch → main → / (root). Загрузка исходников сама по себе не включает GitHub Pages.
