# RashodyPRO-Android

## Android v5.9 Sculptural Matte — тестовая сборка

- **APK для прямой загрузки:** [RashodyPRO-Premium-Matte-v5.9-PREVIEW.apk](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/download/premium-matte-v5.9-preview/RashodyPRO-Premium-Matte-v5.9-PREVIEW.apk).
- **Страница тестового релиза:** https://github.com/Xalidmuslim/RashodyPRO-Android/releases/tag/premium-matte-v5.9-preview
- **Отдельный идентификатор приложения:** `ru.rashody.pro.preview59`. Тестовый APK устанавливается отдельно от основной версии, существующие данные расходов автоматически не переносит.
- **Исходная рабочая ветка:** `fix/keyboard-sheet-matte-v55`.
- **Проверка:** GitHub Actions выполняет регрессионные тесты и сборку Android. Визуальное поведение на реальном устройстве нужно проверить отдельно.

Если GitHub Release ещё не опубликован, сборка запускается автоматически при выпуске нового тестового APK.

## 6.1 — Sculptural Matte (тестовая сборка)

Скриншотный редизайн после v6.0: округление карточек, глубокие матовые тени, приглушённая палитра, устранение серой плашки за обычным текстом, исправление кнопки удаления. Основные финансовые функции и данные не изменены.

- [Скачать тестовый APK v6.1](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/download/rashody-sculptural-v6.1-test/RashodyPRO-Sculptural-Matte-v6.1-TEST.apk)
- [Релиз v6.1](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/tag/rashody-sculptural-v6.1-test)
- [Сборка/проверки](https://github.com/Xalidmuslim/RashodyPRO-Android/actions/workflows/rashody-v61-sculptural-qa.yml)

Android package `ru.rashody.pro.preview61` устанавливается отдельно от основного приложения; его данные не переносятся автоматически. Визуальный тест на реальном устройстве обязателен перед слиянием в основную ветку.

## v6.2 — приглушённый матовый 3D и исправления наложений

Исправлены исходные цвета SVG-диаграмм и связанных легенд, уменьшены конфликты теней вложенных карточек, исправлен заход модального окна расхода под Android status bar и просвечивание содержимого ниже плавающей навигации. Изменения дизайна изолированы от финансовых данных.

- [Скачать APK v6.2 напрямую](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/download/rashody-muted-matte-v6.2-test/RashodyPRO-Muted-Matte-v6.2-TEST.apk)
- [Страница тестового релиза v6.2](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/tag/rashody-muted-matte-v6.2-test)
- [Автоматические тесты и сборка](https://github.com/Xalidmuslim/RashodyPRO-Android/actions/workflows/rashody-v62-matte-qa.yml)

Идентификатор тестового приложения `ru.rashody.pro.preview62`; основная программа не заменяется и данные автоматически не переносятся. APK не тестировался на устройстве, требуется визуальная QA-проверка.

## v6.3 — проверенный в Chromium матовый дизайн (TEST)

После проверки реально собранного APK v6.2 и воспроизведения экрана в Chromium исправлены применяемые стили, а не только номинальные переменные: фон, приглушённая палитра диаграмм и карточек, отступы переключателя аналитики, трёхслойные мягкие тени, геометрия панели ввода. Сохранены все операции, SQLite, логика клавиатуры и импорта/экспорта.

- [Прямая загрузка v6.3 APK](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/download/rashody-measured-matte-v6.3-test/RashodyPRO-Measured-Matte-v6.3-TEST.apk)
- [Страница тестового релиза](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/tag/rashody-measured-matte-v6.3-test)
- [Автоматическая Android-сборка](https://github.com/Xalidmuslim/RashodyPRO-Android/actions/workflows/rashody-v63-measured-qa.yml)

Тестовый пакет `ru.rashody.pro.preview63` устанавливается отдельно и не переносит автоматически расходы из v6.2. Предварительная проверка UI выполнена в Chromium (393dp), но не на физическом Android-устройстве.

## STUDIO MATTE v7.0 — единая дизайн-система (тестовая версия)

Редизайн заменяет конфликтующие темы v5.7–v6.3 одной **Studio**-системой. Оставлены базовая разметка, сценарии операций и SQLite. Дизайн: тёплая светлая поверхность, контрастный графитовый текст, глубокий локальный 3D вместо серых широких теней, согласованные радиусы и спокойные акценты. Затронуты обзор, история, аналитика, настройки, диалоги и навигация.

- **[Скачать APK v7.0](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/download/rashody-studio-v7.0-test/RashodyPRO-Studio-v7.0-TEST.apk)**
- [Страница релиза v7.0](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/tag/rashody-studio-v7.0-test)
- [Проверки Android v7.0](https://github.com/Xalidmuslim/RashodyPRO-Android/actions/workflows/rashody-v70-studio.yml)

Тестовый packageId `ru.rashody.pro.preview70` устанавливается отдельно, существующие расходы между версиями автоматически не переносятся. Проверено в Chromium на трёх ширинах, но не на физическом Android-устройстве.

## STUDIO MATTE v7.1 — проверенная геометрия (TEST)

v7.1 **заменяет v7.0**: в проверке Android CSS воспроизведено и исправлено перекрытие длинного окна «Новый расход» системной строкой состояния. Верхний запас 74 px проверен в эмуляции native-стилей на ширинах 320 / 393 / 430 px. Сохранены единая дизайн-система, функции операций, хранилище и разрешения.

- [Прямое скачивание v7.1 APK](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/download/rashody-studio-v7.1-test/RashodyPRO-Studio-v7.1-TEST.apk)
- [Страница тестового релиза v7.1](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/tag/rashody-studio-v7.1-test)
- [Проверки исходников и Android-сборка](https://github.com/Xalidmuslim/RashodyPRO-Android/actions/workflows/rashody-v71-studio.yml)

Отдельный тестовый идентификатор `ru.rashody.pro.preview71`; данные других версий автоматически не переносятся. Физический Android-устройственный тест ещё требуется.


## 7.2 — Studio Touch Depth Motion (Android TEST)

Тактильные интерактивные эффекты на кнопках и днях календаря: perspective tilt, раздельный параллакс текста/иконок, слабое матовое освещение, динамическая тень, вдавливание при касании и пружинное возвращение. Делегированные Pointer Events работают на всех разделах и открываемых динамически формах, без перехвата событий, прокрутки и изменения финансовой логики. При включённом системном reduced motion анимация не применяется.

- [Скачать тестовый APK v7.2 напрямую](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/download/rashody-studio-v7.2-test/RashodyPRO-Studio-v7.2-TEST.apk)
- [Страница релиза v7.2](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/tag/rashody-studio-v7.2-test)
- [CI: тесты и Android-сборка](https://github.com/Xalidmuslim/RashodyPRO-Android/actions/workflows/rashody-v72-touch-depth.yml)

APK имеет отдельный package `ru.rashody.pro.preview72`. Он не заменяет основное приложение и не переносит автоматически сохранённые в других пакетах расходы. Перформанс/ощущение на реальном Android-устройстве необходимо проверить вручную.

## v7.3 — Premium Motion: длительные анимации кнопок и карточек

Действующая тема Studio Matte. Новая система premium-motion-v73.js заменяет короткие отклики v7.2: удержание 205–310 мс, наклон до 7°, параллакс значка и текста, умеренное матовое освещение, смещение тени и пружинное возвращение в течение 0,86–1,22 с. Для цифровой клавиатуры — отдельный более быстрый отклик 175/690 мс. Анимируется только активный элемент, прокрутка, финансовые операции и SQLite не изменены. Переключатели периода и навигация получают отдельную 930-мс анимацию выбранного состояния.

- [Прямая загрузка тестового APK v7.3](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/download/rashody-studio-v7.3-test/RashodyPRO-Studio-v7.3-TEST.apk)
- [Страница релиза v7.3](https://github.com/Xalidmuslim/RashodyPRO-Android/releases/tag/rashody-studio-v7.3-test)
- [Автоматические тесты и сборка](https://github.com/Xalidmuslim/RashodyPRO-Android/actions/workflows/rashody-v73-premium-motion.yml)

Версия v7.3 устанавливается отдельно (`ru.rashody.pro.preview73`), не заменяя основной пакет. Поведение анимаций на физическом Android требуется проверить отдельно.
