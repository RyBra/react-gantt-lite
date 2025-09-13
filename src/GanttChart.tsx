import React, { useMemo, useState } from 'react';
import { cn } from './utils/cn';
import { GanttChartProps, GanttTask } from './types';

const DEFAULT_COLUMN_WIDTH = 64;
const DEFAULT_ROW_HEIGHT = 80;

function formatHeader(
  date: Date,
  unit: 'day' | 'week' | 'month',
  locale: string,
  opts?: { weekNumbering?: 'fixed52' | 'iso'; weekHeaderMode?: 'date' | 'week' | 'date+week' }
) {
  if (unit === 'day') {
    return date.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
  }
  if (unit === 'week') {
    const weekStart = new Date(date);
    const dayIdx = (weekStart.getDay() + 6) % 7; // Mon=0..Sun=6
    weekStart.setDate(weekStart.getDate() - dayIdx);
    const d = weekStart.getDate();
    const m = weekStart.getMonth() + 1;
    if (opts?.weekHeaderMode === 'week' || opts?.weekHeaderMode === 'date+week') {
      let week = getISOWeek(weekStart);
      if ((opts?.weekNumbering ?? 'fixed52') === 'fixed52' && week === 53) week = 52;
      if (opts?.weekHeaderMode === 'week') return `W${week}`;
      return `${d}.${m} · W${week}`;
    }
    return `${d}.${m}`;
  }
  return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

export const GanttChart: React.FC<GanttChartProps> = (props) => {
  const {
    tasks,
    filters,
    onFiltersChange,
    onTaskClick,
    className,
    styles,
    theme,
    activityStatusColors,
    renderGroupHeader,
    renderTimeCell,
    renderTaskBar,
    selectedTaskId,
    onSelectedTaskChange,
    onTaskDoubleClick,
    onTaskContextMenu,
    onTaskLongPress,
    dateFormatter,
    viewConfig: controlledView,
    onViewConfigChange,
    defaultViewConfig,
    locale = 'ru-RU',
    showTodayLine = true,
    weekNumbering = 'fixed52',
    weekHeaderMode = 'date+week'
  } = props;

  const [uncontrolledView, setUncontrolledView] = useState(() => ({
    timeScale: { unit: 'day' as const, step: 1 },
    showWeekends: true,
    showDependencies: false,
    groupBy: 'group' as const,
    ...(defaultViewConfig || {})
  }));
  const view = controlledView || uncontrolledView;

  const setView = (updater: (prev: typeof view) => typeof view) => {
    const next = updater(view);
    if (controlledView && onViewConfigChange) onViewConfigChange(next);
    else setUncontrolledView(next);
  };

  const filteredTasks = useMemo(() => {
    let result = tasks.slice();
    if (filters?.groups?.length) result = result.filter(t => filters.groups!.includes(t.group.id));
    if (filters?.categories?.length) result = result.filter(t => filters.categories!.includes(t.activity.category));
    if (filters?.status?.length) result = result.filter(t => filters.status!.includes(t.status));
    if (filters?.dateRange) {
      result = result.filter(t => t.startDate >= filters.dateRange!.start && t.endDate <= filters.dateRange!.end);
    }
    return result;
  }, [tasks, filters]);

  const groupedTasks = useMemo(() => {
    if (view.groupBy === 'none') return { 'Все задачи': filteredTasks };
    const groups: Record<string, GanttTask[]> = {};
    for (const task of filteredTasks) {
      const key = view.groupBy === 'group' ? `${task.group.name}${typeof task.group.size === 'number' ? ` (${task.group.size})` : ''}` : task.activity.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    }
    return groups;
  }, [filteredTasks, view.groupBy]);

  const timeScale = useMemo(() => {
    if (filteredTasks.length === 0) return [] as Date[];
    const allDates = filteredTasks.flatMap(t => [t.startDate, t.endDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    const startDate = new Date(minDate);
    const endDate = new Date(maxDate);
    // Normalize times to midnight to avoid DST drift
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // For week view, align to week boundaries (Mon-Sun)
    if (view.timeScale.unit === 'week') {
      const dayIdxStart = (startDate.getDay() + 6) % 7; // Mon=0 .. Sun=6
      startDate.setDate(startDate.getDate() - dayIdxStart);
      const dayIdxEnd = (endDate.getDay() + 6) % 7; // Mon=0 .. Sun=6
      const addToSunday = (6 - dayIdxEnd);
      endDate.setDate(endDate.getDate() + addToSunday);
    }
    const dates: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      if (view.timeScale.unit === 'day') current.setDate(current.getDate() + view.timeScale.step);
      else if (view.timeScale.unit === 'week') current.setTime(current.getTime() + 7 * 24 * 60 * 60 * 1000 * view.timeScale.step);
      else current.setMonth(current.getMonth() + view.timeScale.step);
    }
    // Ensure at least two buckets for week/month/day so bars are visible when range < one step
    if (dates.length < 2) {
      const next = new Date(startDate);
      if (view.timeScale.unit === 'day') next.setDate(next.getDate() + view.timeScale.step);
      else if (view.timeScale.unit === 'week') next.setTime(next.getTime() + 7 * 24 * 60 * 60 * 1000 * view.timeScale.step);
      else next.setMonth(next.getMonth() + view.timeScale.step);
      dates.push(next);
    }
    return dates;
  }, [filteredTasks, view.timeScale]);

  const columnWidth = styles?.columnWidthPx ?? DEFAULT_COLUMN_WIDTH;
  const rowHeight = styles?.rowHeightPx ?? DEFAULT_ROW_HEIGHT;
  const minBarWidth = styles?.minTaskBarWidthPx ?? 60;

  const getTaskPosition = (task: GanttTask) => {
    if (timeScale.length === 0) return { left: 0, width: 0 };
    const startTime = task.startDate.getTime();
    const endTime = task.endDate.getTime();
    const scaleStartTime = timeScale[0].getTime();
    const scaleEndTime = timeScale[timeScale.length - 1].getTime();
    const total = scaleEndTime - scaleStartTime;
    if (total <= 0) return { left: 0, width: 0 };
    const leftPercent = ((startTime - scaleStartTime) / total) * 100;
    const widthPercent = ((endTime - startTime) / total) * 100;
    const left = Math.min(100, Math.max(0, leftPercent));
    const width = Math.max(1, Math.min(100 - left, widthPercent));
    return { left, width };
  };

  const formatHeaderCell = (date: Date) => (dateFormatter ? dateFormatter(date, view.timeScale.unit) : formatHeader(date, view.timeScale.unit, locale));

  return (
    <div className={cn('fx-gantt w-full', className)}>
      <div className="fx-gantt-toolbar" style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', color: theme?.textColor }}>
        <div style={{ fontWeight: 600 }}>Диаграмма Ганта</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={view.groupBy}
            onChange={(e) => setView(prev => ({ ...prev, groupBy: e.target.value as any }))}
          >
            <option value="group">По группам</option>
            <option value="category">По категориям</option>
            <option value="none">Без группировки</option>
          </select>
          <select
            value={view.timeScale.unit}
            onChange={(e) => setView(prev => ({ ...prev, timeScale: { ...prev.timeScale, unit: e.target.value as any } }))}
          >
            <option value="day">По дням</option>
            <option value="week">По неделям</option>
            <option value="month">По месяцам</option>
          </select>
        </div>
      </div>

      <div className="fx-gantt-card" style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: theme?.cardBg ?? '#ffffff', color: theme?.textColor }}>
        <div style={{ display: 'flex' }}>
          <div className={cn('fx-gantt-sidebar')} style={{ width: 320, flexShrink: 0, background: theme?.sidebarBg ?? '#fafafa' }}>
            <div style={{ height: 49, display: 'flex', alignItems: 'center', padding: '0 12px', borderBottom: '1px solid #e5e7eb', background: theme?.headerBg ?? '#fafafa', fontWeight: 500, boxSizing: 'border-box' }}>Операции</div>
            {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
              <div key={groupName}>
                <div style={{ height: 40, display: 'flex', alignItems: 'center', padding: '0 10px', borderBottom: `1px solid ${theme?.gridLine ?? '#f1f5f9'}`, background: theme?.headerBg ?? (theme?.sidebarBg ?? '#fafafa'), boxSizing: 'border-box' }}>
                  {renderGroupHeader ? renderGroupHeader(groupName, groupTasks) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 500 }}>{groupName}</span>
                      <span style={{ fontSize: 12, background: theme?.gridLine ?? '#f3f4f6', borderRadius: 8, padding: '2px 6px' }}>{groupTasks.length}</span>
                    </div>
                  )}
                </div>
                {groupTasks.map(task => (
                  <div key={task.id} style={{ height: rowHeight, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, padding: '0 10px', borderBottom: '1px solid #f1f5f9', boxSizing: 'border-box' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: theme?.textColor ?? '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.name || 'Без названия'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, color: theme?.textColor ?? '#6b7280', opacity: 0.75, fontSize: 12 }}>
                      <span>{task.activity.name}</span>
                      {typeof task.group.size === 'number' && (
                        <>
                          <span>•</span>
                          <span>{task.group.size}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="fx-gantt-timeline" style={{ flex: 1, overflow: 'auto' }}>
            <div style={{ minWidth: `${timeScale.length * columnWidth}px`, position: 'relative' }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 1, background: theme?.headerBg ?? '#fff', borderBottom: '1px solid #e5e7eb', color: theme?.textColor }}>
                <div style={{ display: 'flex', height: 48 }}>
                  {timeScale.map((date, index) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <div key={index} style={{ minWidth: columnWidth, width: columnWidth, borderRight: `1px solid ${theme?.gridLine ?? '#f1f5f9'}`, padding: 8, textAlign: 'center', fontSize: 12, fontWeight: 500, background: isToday ? (theme?.headerTodayBg ?? '#eff6ff') : undefined, color: isToday ? (theme?.headerTodayText ?? '#1d4ed8') : undefined, boxSizing: 'border-box' }}>
                        {renderTimeCell ? renderTimeCell(date, index, isToday) : (
                          <div>{dateFormatter ? dateFormatter(date, view.timeScale.unit) : formatHeader(date, view.timeScale.unit, locale, { weekNumbering, weekHeaderMode })}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                  <div key={groupName}>
                    <div style={{ position: 'relative', height: 40, background: theme?.headerBg ?? (theme?.cardBg ?? '#fafafa'), borderBottom: `1px solid ${theme?.gridLine ?? '#f1f5f9'}`, boxSizing: 'border-box' }}>
                      {timeScale.map((_, index) => (
                        <div key={index} style={{ position: 'absolute', top: 0, bottom: 0, left: index * columnWidth, width: 0, borderRight: `1px solid ${theme?.gridLine ?? '#f1f5f9'}` }} />
                      ))}
                    </div>
                    {groupTasks.map(task => {
                      const position = getTaskPosition(task);
                      const leftPx = (position.left / 100) * (timeScale.length * columnWidth);
                      const widthPx = Math.max(minBarWidth, (position.width / 100) * (timeScale.length * columnWidth));
                      const isSelected = selectedTaskId === task.id;
                      return (
                        <div key={task.id} style={{ position: 'relative', height: rowHeight, borderBottom: '1px solid #f1f5f9', boxSizing: 'border-box' }}>
                          {timeScale.map((_, index) => (
                            <div key={index} style={{ position: 'absolute', top: 0, bottom: 0, left: index * columnWidth, width: 0, borderRight: `1px solid ${theme?.gridLine ?? '#f1f5f9'}` }} />
                          ))}

                          {renderTaskBar ? (
                            renderTaskBar({ task, leftPercent: position.left, widthPercent: position.width, isSelected })
                          ) : (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                onTaskClick?.(task, e.nativeEvent as any);
                                onSelectedTaskChange?.(isSelected ? null : task.id);
                              }}
                              onDoubleClick={(e) => onTaskDoubleClick?.(task, e as any)}
                              onContextMenu={(e) => { e.preventDefault(); onTaskContextMenu?.(task, e as any); }}
                              style={{
                                position: 'absolute',
                                top: 24,
                                left: leftPx,
                                width: widthPx,
                                height: 32,
                                background: (task.activity.status && activityStatusColors?.[task.activity.status]) ?? (theme?.taskBarBg ?? '#dbeafe'),
                                border: `2px solid ${isSelected ? (theme?.taskBarSelectedBorder ?? '#ef4444') : (theme?.taskBarBorder ?? '#93c5fd')}`,
                                borderRadius: 6,
                                display: position.width > 0 ? 'flex' : 'none',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0 8px',
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                              }}
                            >
                              <span
                                style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                onPointerDown={(e) => {
                                  const target = e.currentTarget as HTMLSpanElement;
                                  const timeout = setTimeout(() => onTaskLongPress?.(task, e as any), 500);
                                  const cancel = () => clearTimeout(timeout);
                                  target.addEventListener('pointerup', cancel, { once: true });
                                  target.addEventListener('pointercancel', cancel, { once: true });
                                  target.addEventListener('pointerleave', cancel, { once: true });
                                }}
                              >
                                {task.name || 'Без названия'}
                              </span>
                              {task.assignedResources ? <span style={{ fontSize: 10, opacity: 0.7 }}>res</span> : null}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {showTodayLine && (
                <div style={{ position: 'absolute', top: 48, bottom: 0, pointerEvents: 'none' }}>
                  {timeScale.map((date, index) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    if (!isToday) return null;
                    return <div key="today-line" style={{ position: 'absolute', top: 0, bottom: 0, left: index * columnWidth, width: 2, background: theme?.todayLine ?? '#3b82f6' }} />;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;

