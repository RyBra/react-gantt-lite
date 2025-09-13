import type { ReactNode, MouseEvent as ReactMouseEvent } from 'react';
export type GanttId = string | number;

export type GanttTaskStatus = 'planned' | 'in_progress' | 'completed' | 'overdue';

export interface GanttTaskGroupRef {
  id: number;
  name: string;
  size?: number;
}

export interface GanttTaskActivityRef {
  id: number;
  name: string;
  category: string;
  status?: string; // optional, used for color-coding activities
}

export interface GanttTask {
  id: GanttId;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0..100
  status: GanttTaskStatus;
  group: GanttTaskGroupRef;
  activity: GanttTaskActivityRef;
  assignedResources?: {
    vehicles?: string[];
    workers?: string[];
    materials?: string[];
  };
  dependencies?: GanttId[];
  notes?: string;
}

export type GanttGroupBy = 'group' | 'category' | 'none';

export interface GanttTimeScale {
  unit: 'day' | 'week' | 'month';
  step: number; // 1..N
}

export interface GanttFilters {
  groups?: number[];
  categories?: string[];
  status?: GanttTaskStatus[];
  dateRange?: { start: Date; end: Date };
}

export interface GanttViewConfig {
  timeScale: GanttTimeScale;
  showWeekends: boolean;
  showDependencies: boolean;
  groupBy: GanttGroupBy;
}

export type GanttLinkType = 'FS' | 'SS' | 'FF' | 'SF';
export interface GanttLink {
  id: GanttId;
  from: GanttId;
  to: GanttId;
  type?: GanttLinkType;
}

export interface GanttThemeColors {
  taskBarBg?: string; // default #dbeafe
  taskBarBorder?: string; // default #93c5fd
  taskBarSelectedBorder?: string; // default #ef4444
  todayLine?: string; // default #3b82f6
  gridLine?: string; // default #f1f5f9
  headerTodayBg?: string; // default #eff6ff
  headerTodayText?: string; // default #1d4ed8
  cardBg?: string; // default #ffffff
  sidebarBg?: string; // default #fafafa
  headerBg?: string; // default #ffffff
  textColor?: string; // default inherit
}

export interface GanttChartProps {
  tasks: GanttTask[];
  links?: GanttLink[];
  defaultViewConfig?: Partial<GanttViewConfig>;
  viewConfig?: GanttViewConfig;
  onViewConfigChange?: (next: GanttViewConfig) => void;
  filters?: GanttFilters;
  onFiltersChange?: (filters: GanttFilters) => void;
  className?: string;
  classes?: {
    root?: string;
    sidebar?: string;
    header?: string;
    timeHeaderCell?: string;
    groupHeader?: string;
    row?: string;
    gridLine?: string;
    taskBar?: string;
    todayLine?: string;
    statsCard?: string;
  };
  styles?: {
    columnWidthPx?: number;
    rowHeightPx?: number;
    minTaskBarWidthPx?: number;
  };
  theme?: GanttThemeColors;
  activityStatusColors?: Record<string, string>; // map activity.status -> color
  weekNumbering?: 'fixed52' | 'iso'; // default 'fixed52': 53-я неделя приводится к 52
  weekHeaderMode?: 'date' | 'week' | 'date+week'; // default 'date'
  renderTaskBar?: (ctx: {
    task: GanttTask;
    leftPercent: number;
    widthPercent: number;
    isSelected: boolean;
  }) => ReactNode;
  renderGroupHeader?: (groupName: string, groupTasks: GanttTask[]) => ReactNode;
  renderTimeCell?: (date: Date, index: number, isToday: boolean) => ReactNode;
  renderTaskTooltip?: (task: GanttTask) => ReactNode;
  selectable?: boolean;
  selectedTaskId?: GanttId;
  onSelectedTaskChange?: (taskId: GanttId | null) => void;
  onTaskClick?: (task: GanttTask, event: ReactMouseEvent) => void;
  onTaskHover?: (task: GanttTask | null) => void;
  onTaskDoubleClick?: (task: GanttTask, event: ReactMouseEvent) => void;
  onTaskContextMenu?: (task: GanttTask, event: ReactMouseEvent) => void;
  onTaskLongPress?: (task: GanttTask, event: ReactMouseEvent) => void;
  onRangeChange?: (range: { start: Date; end: Date }) => void;
  onViewportChange?: (viewport: { scrollLeftPx: number; widthPx: number }) => void;
  onLinkClick?: (link: GanttLink) => void;
  virtualizeRows?: boolean;
  showTodayLine?: boolean;
  stickyHeaders?: boolean;
  locale?: string;
  dateFormatter?: (date: Date, unit: GanttTimeScale['unit']) => string;
  currentDate?: Date;
}

export interface GanttFiltersProps {
  value: GanttFilters;
  onChange: (filters: GanttFilters) => void;
  fieldOptions: Array<{ id: number; name: string; area: number }>;
  categoryOptions: string[];
  statusOptions?: Array<{ value: GanttTaskStatus; label: string; color?: 'blue' | 'orange' | 'green' | 'red' }>;
  defaultExpanded?: boolean;
  className?: string;
  labels?: Partial<{
    title: string;
    clear: string;
    expand: string;
    collapse: string;
    fields: string;
    categories: string;
    statuses: string;
    period: string;
    startDate: string;
    endDate: string;
    apply: string;
  }>;
}

