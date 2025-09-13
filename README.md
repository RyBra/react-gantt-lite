# react-gantt-lite (work-in-progress)

React-компонент диаграммы Ганта. Пакет ESM/CJS/DT. SSR-safe, без tailwind.

Данный пакет распространяется по лицензии PolyForm Noncommercial 1.0.0 и не может бесплатно использоваться в коммерческих продуктах. Для коммерческого использования свяжитесь для получения коммерческой лицензии.

## Установка

```bash
npm i react-gantt-lite
```

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
