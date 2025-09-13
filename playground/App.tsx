import React, { useMemo, useState } from 'react';
import { GanttChart, GanttTask, GanttFilters, GanttViewConfig, GanttThemeColors } from '../src';

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const App: React.FC = () => {
  const [filters, setFilters] = useState<GanttFilters>({});
  const [view, setView] = useState<GanttViewConfig>({
    timeScale: { unit: 'day', step: 1 },
    showWeekends: true,
    showDependencies: false,
    groupBy: 'group'
  });

  const initialTasks: GanttTask[] = useMemo(() => {
    const now = new Date();
    const groups = [
      { id: 1, name: 'Release v1 (NPM)', size: 8 },
      { id: 2, name: 'Docs & Examples', size: 6 },
      { id: 3, name: 'QA & CI/CD', size: 6 },
      { id: 4, name: 'vNext Features', size: 10 }
    ];
    const tasks: GanttTask[] = [];
    let id = 1;
    let activityId = 1000;

    function pushTask(params: {
      name: string;
      startOffsetDays: number;
      durationDays: number;
      group: (typeof groups)[number];
      activity: { name: string; category: string; status: 'planned' | 'queued' | 'running' | 'blocked' };
      progress?: number;
    }) {
      const startDate = addDays(now, params.startOffsetDays);
      const endDate = addDays(startDate, params.durationDays);
      const isPast = endDate < now;
      const isCurrent = startDate <= now && now <= endDate;
      const status: 'planned' | 'in_progress' | 'completed' = isPast ? 'completed' : (isCurrent ? 'in_progress' : 'planned');
      const progress = typeof params.progress === 'number' ? params.progress : (isPast ? 100 : (isCurrent ? 40 : 0));
      tasks.push({
        id: `R${id++}`,
        name: params.name,
        startDate,
        endDate,
        progress,
        status,
        group: { id: params.group.id, name: params.group.name, size: params.group.size },
        activity: { id: activityId++, name: params.activity.name, category: params.activity.category, status: params.activity.status }
      });
    }

    // Release v1 (NPM)
    const gRelease = groups[0];
    pushTask({ name: 'Repo cleanup, LICENSE, CONTRIBUTING', startOffsetDays: -3, durationDays: 5, group: gRelease, activity: { name: 'Repository', category: 'Packaging', status: 'running' }, progress: 60 });
    pushTask({ name: 'Build config (tsup/vite), sideEffects, exports', startOffsetDays: -1, durationDays: 4, group: gRelease, activity: { name: 'Build', category: 'Packaging', status: 'running' } });
    pushTask({ name: 'ESM/CJS bundles + .d.ts types', startOffsetDays: 1, durationDays: 4, group: gRelease, activity: { name: 'Bundles', category: 'Packaging', status: 'queued' } });
    pushTask({ name: 'Bundle size guard + tree-shaking', startOffsetDays: 4, durationDays: 3, group: gRelease, activity: { name: 'Perf', category: 'Packaging', status: 'queued' } });
    pushTask({ name: 'NPM metadata, README badges', startOffsetDays: 5, durationDays: 2, group: gRelease, activity: { name: 'Meta', category: 'Packaging', status: 'queued' } });

    // Docs & Examples
    const gDocs = groups[1];
    pushTask({ name: 'README: install, quick start, props', startOffsetDays: 1, durationDays: 2, group: gDocs, activity: { name: 'Docs', category: 'Docs', status: 'queued' } });
    pushTask({ name: 'API reference generation', startOffsetDays: 3, durationDays: 5, group: gDocs, activity: { name: 'API', category: 'Docs', status: 'queued' } });
    pushTask({ name: 'Playground publish (StackBlitz)', startOffsetDays: 5, durationDays: 4, group: gDocs, activity: { name: 'Playground', category: 'Docs', status: 'queued' } });
    pushTask({ name: 'Theming guide and tokens', startOffsetDays: 7, durationDays: 4, group: gDocs, activity: { name: 'Theme', category: 'Docs', status: 'queued' } });

    // QA & CI/CD
    const gQA = groups[2];
    pushTask({ name: 'ESLint/Prettier, strict TS, checks', startOffsetDays: 0, durationDays: 2, group: gQA, activity: { name: 'Quality', category: 'DX', status: 'running' }, progress: 35 });
    pushTask({ name: 'Vitest/Jest + CI matrix (Node 18/20)', startOffsetDays: 2, durationDays: 6, group: gQA, activity: { name: 'Tests', category: 'DX', status: 'queued' } });
    pushTask({ name: 'Release workflow: changesets, semver', startOffsetDays: 8, durationDays: 4, group: gQA, activity: { name: 'Release', category: 'DX', status: 'queued' } });
    pushTask({ name: 'npm publish dry-run', startOffsetDays: 10, durationDays: 2, group: gQA, activity: { name: 'Publish', category: 'DX', status: 'queued' } });
    pushTask({ name: 'v1.0.0 publish', startOffsetDays: 12, durationDays: 1, group: gQA, activity: { name: 'Publish', category: 'DX', status: 'blocked' } });

    // vNext Features
    const gNext = groups[3];
    pushTask({ name: 'Drag & Drop and Resize interactions', startOffsetDays: 14, durationDays: 14, group: gNext, activity: { name: 'Interactions', category: 'Feature', status: 'planned' } });
    pushTask({ name: 'Dependencies rendering (FS/SS/FF/SF)', startOffsetDays: 14, durationDays: 8, group: gNext, activity: { name: 'Links', category: 'Feature', status: 'planned' } });
    pushTask({ name: 'Inline editing (name/dates/progress)', startOffsetDays: 20, durationDays: 10, group: gNext, activity: { name: 'Editing', category: 'Feature', status: 'planned' } });
    pushTask({ name: 'Export to PNG/PDF', startOffsetDays: 24, durationDays: 8, group: gNext, activity: { name: 'Export', category: 'Feature', status: 'planned' } });
    pushTask({ name: 'Accessibility & keyboard navigation', startOffsetDays: 18, durationDays: 8, group: gNext, activity: { name: 'A11y', category: 'Feature', status: 'planned' } });
    pushTask({ name: 'Performance: virtualization tuning', startOffsetDays: 16, durationDays: 8, group: gNext, activity: { name: 'Perf', category: 'Feature', status: 'planned' } });

    return tasks;
  }, []);

  const [tasks, setTasks] = useState<GanttTask[]>(initialTasks);
  const DEFAULT_ACTIVITY_COLORS: Record<string, string> = { planned: '#e5e7eb', queued: '#fde68a', running: '#93c5fd', blocked: '#fecaca' };
  const [activityColors, setActivityColors] = useState<Record<string, string>>(DEFAULT_ACTIVITY_COLORS);
  const [jsonText, setJsonText] = useState<string>(() => {
    return JSON.stringify({
      plan: {
        packaging: [
          'Repo cleanup, LICENSE, CONTRIBUTING',
          'Build config (tsup/vite), sideEffects, exports',
          'ESM/CJS bundles + .d.ts types',
          'Bundle size guard + tree-shaking',
          'NPM metadata, README badges'
        ],
        docs: [
          'README: install, quick start, props',
          'API reference generation',
          'Playground publish (StackBlitz)',
          'Theming guide and tokens'
        ],
        qa: [
          'ESLint/Prettier, strict TS, checks',
          'Vitest/Jest + CI matrix (Node 18/20)',
          'Release workflow: changesets, semver',
          'npm publish dry-run',
          'v1.0.0 publish'
        ],
        features: [
          'Drag & Drop and Resize interactions',
          'Dependencies rendering (FS/SS/FF/SF)',
          'Inline editing (name/dates/progress)',
          'Export to PNG/PDF',
          'Accessibility & keyboard navigation',
          'Performance: virtualization tuning'
        ]
      },
      tasks: initialTasks,
      activityStatusColors: DEFAULT_ACTIVITY_COLORS
    }, (key, value) => value instanceof Date ? value.toISOString() : value, 2);
  });
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<GanttThemeColors>({});
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [logs, setLogs] = useState<string[]>([]);

  const pushLog = (type: string, task: GanttTask) => {
    const time = new Date().toLocaleTimeString();
    const msg = `[${time}] ${type}: ${task.name || 'Без названия'} (id=${String(task.id)})`;
    setLogs(prev => [msg, ...prev].slice(0, 200));
  };

  const LIGHT_THEME: GanttThemeColors = {
    taskBarBg: '#dbeafe',
    taskBarBorder: '#93c5fd',
    taskBarSelectedBorder: '#ef4444',
    todayLine: '#3b82f6',
    gridLine: '#f1f5f9',
    headerTodayBg: '#eff6ff',
    headerTodayText: '#1d4ed8',
    cardBg: '#ffffff',
    sidebarBg: '#fafafa',
    headerBg: '#ffffff',
    textColor: '#111827'
  };
  const DARK_THEME: GanttThemeColors = {
    taskBarBg: '#334155',
    taskBarBorder: '#64748b',
    taskBarSelectedBorder: '#f87171',
    todayLine: '#60a5fa',
    gridLine: '#475569',
    headerTodayBg: '#0f172a',
    headerTodayText: '#93c5fd',
    cardBg: '#0b1220',
    sidebarBg: '#0f172a',
    headerBg: '#0f172a',
    textColor: '#e5e7eb'
  };

  const baseTheme = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
  const effectiveTheme = { ...baseTheme, ...theme };

  const reviveDates = (key: string, value: any) => {
    if (typeof value === 'string' && key.toLowerCase().includes('date')) {
      const t = Date.parse(value);
      if (!Number.isNaN(t)) return new Date(t);
    }
    return value;
  };

  const applyJson = () => {
    try {
      setError(null);
      const parsed = JSON.parse(jsonText, reviveDates) as any;
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item !== 'object' || item == null) throw new Error('Элемент должен быть объектом');
          if (!('startDate' in item) || !('endDate' in item)) throw new Error('Каждая задача должна иметь startDate и endDate');
        }
        setTasks(parsed as GanttTask[]);
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.tasks)) {
          for (const item of parsed.tasks) {
            if (typeof item !== 'object' || item == null) throw new Error('Элемент должен быть объектом');
            if (!('startDate' in item) || !('endDate' in item)) throw new Error('Каждая задача должна иметь startDate и endDate');
          }
          setTasks(parsed.tasks as GanttTask[]);
        }
        const colors = parsed.activityStatusColors || parsed.activityColors;
        if (colors && typeof colors === 'object') {
          const next: Record<string, string> = {};
          for (const k of Object.keys(colors)) {
            const val = colors[k];
            if (typeof val !== 'string') continue;
            next[k] = val;
          }
          if (Object.keys(next).length > 0) setActivityColors(next);
        }
      } else {
        throw new Error('Ожидается массив задач или объект { tasks, activityStatusColors }');
      }
    } catch (e: any) {
      setError(e?.message || 'Ошибка парсинга JSON');
    }
  };

  const resetJson = () => {
    setError(null);
    setTasks(initialTasks);
    setActivityColors(DEFAULT_ACTIVITY_COLORS);
    setJsonText(JSON.stringify({ tasks: initialTasks, activityStatusColors: DEFAULT_ACTIVITY_COLORS }, (k, v) => v instanceof Date ? v.toISOString() : v, 2));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, background: themeMode === 'dark' ? '#0b1120' : '#ffffff', minHeight: '100vh', color: effectiveTheme.textColor }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <GanttChart
            tasks={tasks}
            filters={filters}
            onFiltersChange={setFilters}
            viewConfig={view}
            onViewConfigChange={setView}
            styles={{ columnWidthPx: 64, rowHeightPx: 80, minTaskBarWidthPx: 60 }}
            theme={effectiveTheme}
            activityStatusColors={activityColors}
            weekHeaderMode="week"
            weekNumbering="fixed52"
            onTaskClick={(task) => pushLog('click', task)}
            onTaskDoubleClick={(task) => pushLog('dblclick', task)}
            onTaskContextMenu={(task) => pushLog('contextmenu', task)}
            onTaskLongPress={(task) => pushLog('longpress', task)}
          />
        </div>
      </div>

      <div style={{ background: themeMode === 'dark' ? '#0b1120' : '#ffffff', borderTop: `1px solid ${themeMode === 'dark' ? '#334155' : '#e5e7eb'}`, paddingTop: 12, paddingBottom: 12, boxShadow: themeMode === 'dark' ? '0 -6px 18px rgba(0,0,0,0.35)' : '0 -6px 18px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {/* JSON Pane */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e5e7eb'}`, borderRadius: 8, overflow: 'hidden', background: themeMode === 'dark' ? '#0f172a' : '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: themeMode === 'dark' ? '#111827' : '#f3f4f6', color: effectiveTheme.textColor, borderBottom: `1px solid ${themeMode === 'dark' ? '#334155' : '#e5e7eb'}` }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>JSON</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={applyJson} style={{ padding: '6px 10px', border: `1px solid ${themeMode === 'dark' ? '#374151' : '#e5e7eb'}`, borderRadius: 6, background: '#111827', color: '#fff' }}>Применить</button>
                <button onClick={resetJson} style={{ padding: '6px 10px', border: `1px solid ${themeMode === 'dark' ? '#374151' : '#e5e7eb'}`, borderRadius: 6, background: themeMode === 'dark' ? '#0f172a' : '#f3f4f6', color: effectiveTheme.textColor }}>Сбросить</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontWeight: 600 }}>Тема</div>
                <select value={themeMode} onChange={(e) => { setThemeMode(e.target.value as any); }}>
                  <option value="light">Светлая</option>
                  <option value="dark">Тёмная</option>
                </select>
              </div>
              <div style={{ fontWeight: 600 }}>JSON данные задач</div>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                spellCheck={false}
                style={{ width: '100%', height: 260, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 12, border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e5e7eb'}`, borderRadius: 6, padding: 8, background: themeMode === 'dark' ? '#0b1120' : '#ffffff', color: effectiveTheme.textColor }}
              />
              {error && <div style={{ color: '#b91c1c', fontSize: 12 }}>{error}</div>}
              <div style={{ fontSize: 12, color: themeMode === 'dark' ? '#94a3b8' : '#6b7280' }}>
                Подсказка: можно указывать либо массив задач, либо объект вида:
                <pre style={{ marginTop: 6, padding: 8, border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e5e7eb'}`, borderRadius: 6, background: themeMode === 'dark' ? '#0f172a' : '#f8fafc' }}>
{`{
  "tasks": [ /* ... */ ],
  "activityStatusColors": {
    "planned": "#e5e7eb",
    "queued": "#fde68a",
    "running": "#93c5fd",
    "blocked": "#fecaca"
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Colors Pane */}
          <div style={{ width: 320, display: 'flex', flexDirection: 'column', border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e5e7eb'}`, borderRadius: 8, overflow: 'hidden', background: themeMode === 'dark' ? '#0f172a' : '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: themeMode === 'dark' ? '#111827' : '#f3f4f6', color: effectiveTheme.textColor, borderBottom: `1px solid ${themeMode === 'dark' ? '#334155' : '#e5e7eb'}` }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Цвета</div>
              <button onClick={() => setTheme({})} style={{ padding: '6px 10px', border: `1px solid ${themeMode === 'dark' ? '#374151' : '#e5e7eb'}`, borderRadius: 6, background: themeMode === 'dark' ? '#0f172a' : '#f3f4f6', color: effectiveTheme.textColor }}>Сбросить цвета</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                Полоса задачи
                <input type="color" value={effectiveTheme.taskBarBg ?? '#dbeafe'} onChange={(e) => setTheme(prev => ({ ...prev, taskBarBg: e.target.value }))} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                Граница задачи
                <input type="color" value={effectiveTheme.taskBarBorder ?? '#93c5fd'} onChange={(e) => setTheme(prev => ({ ...prev, taskBarBorder: e.target.value }))} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                Выделение
                <input type="color" value={effectiveTheme.taskBarSelectedBorder ?? '#ef4444'} onChange={(e) => setTheme(prev => ({ ...prev, taskBarSelectedBorder: e.target.value }))} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                Сегодня (линия)
                <input type="color" value={effectiveTheme.todayLine ?? '#3b82f6'} onChange={(e) => setTheme(prev => ({ ...prev, todayLine: e.target.value }))} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                Сетка
                <input type="color" value={effectiveTheme.gridLine ?? '#f1f5f9'} onChange={(e) => setTheme(prev => ({ ...prev, gridLine: e.target.value }))} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                Хедер (сегодня фон)
                <input type="color" value={effectiveTheme.headerTodayBg ?? '#eff6ff'} onChange={(e) => setTheme(prev => ({ ...prev, headerTodayBg: e.target.value }))} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                Хедер (сегодня текст)
                <input type="color" value={effectiveTheme.headerTodayText ?? '#1d4ed8'} onChange={(e) => setTheme(prev => ({ ...prev, headerTodayText: e.target.value }))} />
              </label>
            </div>
          </div>

          {/* Events Pane */}
          <div style={{ width: 360, display: 'flex', flexDirection: 'column', border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e5e7eb'}`, borderRadius: 8, overflow: 'hidden', background: themeMode === 'dark' ? '#0f172a' : '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: themeMode === 'dark' ? '#111827' : '#f3f4f6', color: effectiveTheme.textColor, borderBottom: `1px solid ${themeMode === 'dark' ? '#334155' : '#e5e7eb'}` }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>События</div>
              <button onClick={() => setLogs([])} style={{ padding: '6px 10px', border: `1px solid ${themeMode === 'dark' ? '#374151' : '#e5e7eb'}`, borderRadius: 6, background: themeMode === 'dark' ? '#0f172a' : '#f3f4f6', color: effectiveTheme.textColor }}>Очистить</button>
            </div>
            <div style={{ height: 260, overflow: 'auto', color: effectiveTheme.textColor, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 12, padding: 8 }}>
              {logs.length === 0 ? (
                <div style={{ opacity: 0.7 }}>Событий пока нет. Нажмите на задачу, сделайте двойной клик, удержание или контекстное меню.</div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {logs.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

