# Пилот интеграции GitHub Spec Kit × Android Skills

Проект: `Xalidmuslim/RashodyPRO-Android`. Базовая ветка: `main` на коммите `2c4189fad2a5efe0352b77518db82ea07c9f2a50`. Изолированная ветка: `experiment/spec-kit-rashodypro-2026-10-31`.

## Проверенные факты
- Фактический репозиторий использует Capacitor 8, HTML/CSS/JS и нативный Android-плагин; это **не** Kotlin/Compose-only приложение.
- Существуют инструкции `AGENTS.md`, Android-навыки `.agents/skills/android-*` и CI для APK, их менять не требуется.
- В текущей сборке есть проверка `npm run verify` с несколькими специализированными скриптами.
- Spec Kit — проектно-локальные навыки и шаблоны для агента, а не плагин, автоматически устанавливающийся в каждый чат ChatGPT.

## Способ установки
Workflow `.github/workflows/spec-kit-bootstrap.yml` на этой тестовой ветке запускает официальный Spec Kit **v1.2.5**, через `uvx`, c `--integration codex`. Версия закреплена тегом. Применение `specify init` разрешено **только в изолированной ветке**, а скрипт проверяет сохранность `AGENTS.md`, Android-навыков и кода приложения перед коммитом.

После успешного прогона ожидаются `.specify/` и `.agents/skills/speckit-*/SKILL.md`. Это готовит Spec Kit для **Codex CLI, открывшего этот репозиторий**, но само по себе не запускает агента и не генерирует приложение.

## Роли
1. Spec Kit: `specify` → `plan` → `tasks` → `analyze` → реализация после проверки плана.
2. Android Skills / AI-Council: recon перед работой, targeted tests, diff, UI/регрессия и device profiling при необходимости.
3. GitHub Actions: неизменённая сборка/проверки APK; GitHub connector: чтение и изменение файлов, **не** выполнение Spec Kit.
4. Пилотная спецификация: `specs/001-matte-ui-audit/spec.md` — этап анализа без изменения продукта.

## Проверка
- В GitHub Actions открыть `Spec Kit bootstrap (isolated)` на этой ветке и проверить зелёный статус.
- Убедиться, что добавлены настоящие шаблоны `.specify/` и навыки `.agents/skills/speckit-*`.
- Сравнить ветку с `main`: не допускаются изменения `www/`, `native/`, `package.json`, Android workflow или старых навыков.
- Прогон `npm run verify` и Android APK **не заменяется** установкой Spec Kit и отдельно должен быть выполнен перед следующими изменениями.

## Ограничения
При недоступности GitHub Actions либо ошибке установки bootstrap остаётся незавершённым. Документы или workflow сами по себе не означают успешную установку CLI.
