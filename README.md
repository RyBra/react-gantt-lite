# react-gantt-lite (work-in-progress)

![npm version](https://img.shields.io/npm/v/react-gantt-lite.svg?color=blue)
![npm downloads](https://img.shields.io/npm/dm/react-gantt-lite.svg)
![license](https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-blue)
![bundle size](https://img.shields.io/bundlephobia/minzip/react-gantt-lite?label=size)
![types](https://img.shields.io/badge/types-TypeScript-informational)
[![pages](https://github.com/RyBra/react-gantt-lite/actions/workflows/pages.yml/badge.svg)](https://github.com/RyBra/react-gantt-lite/actions/workflows/pages.yml)
[![website](https://img.shields.io/badge/website-Playground-success)](https://rybra.github.io/react-gantt-lite/)

React-компонент диаграммы Ганта. Пакет ESM/CJS/DT. SSR-safe, без tailwind.

Данный пакет распространяется по лицензии PolyForm Noncommercial 1.0.0 и не может бесплатно использоваться в коммерческих продуктах. Для коммерческого использования свяжитесь для получения коммерческой лицензии.

Ссылки:
- npm: https://www.npmjs.com/package/react-gantt-lite
- GitHub: https://github.com/RyBra/react-gantt-lite
- Донаты: https://boosty.to/compick/donate

## Установка

```bash
npm i react-gantt-lite
```

## Playground / GitHub Pages

Для публикации playground на GitHub Pages:

1. В `vite.config.ts` задан `base: '/react-gantt-lite/'` — замените на имя вашего репозитория при необходимости.
2. Скрипты:
   - `npm run build:site` — сборка статики в `site-dist`.
   - `npm run deploy:pages` — публикация в ветку `gh-pages` (требует `gh-pages`).
3. В настройках репозитория включите Pages (ветка `gh-pages`, корень).

## Быстрый старт

```tsx
import { GanttChart, GanttTask } from 'react-gantt-lite';

const tasks: GanttTask[] = [
  { id: 1, name: 'Task', startDate: new Date(), endDate: new Date(), progress: 50, status: 'planned', group: { id: 1, name: 'Group 1' }, activity: { id: 1, name: 'Op', category: 'Cat' } }
];

<GanttChart tasks={tasks} />
```

## API

См. типы в `src/types.ts` — `GanttChartProps`, `GanttTask`, `GanttFilters`, `GanttViewConfig`.

## Лицензия

PolyForm Noncommercial 1.0.0. Коммерческое использование требует отдельной коммерческой лицензии.
