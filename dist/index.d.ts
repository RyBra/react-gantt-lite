import React, { ReactNode, MouseEvent } from 'react';

type GanttId = string | number;
type GanttTaskStatus = 'planned' | 'in_progress' | 'completed' | 'overdue';
interface GanttTaskGroupRef {
    id: number;
    name: string;
    size?: number;
}
interface GanttTaskActivityRef {
    id: number;
    name: string;
    category: string;
}
interface GanttTask {
    id: GanttId;
    name: string;
    startDate: Date;
    endDate: Date;
    progress: number;
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
type GanttGroupBy = 'group' | 'category' | 'none';
interface GanttTimeScale {
    unit: 'day' | 'week' | 'month';
    step: number;
}
interface GanttFilters {
    groups?: number[];
    categories?: string[];
    status?: GanttTaskStatus[];
    dateRange?: {
        start: Date;
        end: Date;
    };
}
interface GanttViewConfig {
    timeScale: GanttTimeScale;
    showWeekends: boolean;
    showDependencies: boolean;
    groupBy: GanttGroupBy;
}
type GanttLinkType = 'FS' | 'SS' | 'FF' | 'SF';
interface GanttLink {
    id: GanttId;
    from: GanttId;
    to: GanttId;
    type?: GanttLinkType;
}
interface GanttChartProps {
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
    onTaskClick?: (task: GanttTask, event: MouseEvent) => void;
    onTaskHover?: (task: GanttTask | null) => void;
    onRangeChange?: (range: {
        start: Date;
        end: Date;
    }) => void;
    onViewportChange?: (viewport: {
        scrollLeftPx: number;
        widthPx: number;
    }) => void;
    onLinkClick?: (link: GanttLink) => void;
    virtualizeRows?: boolean;
    showTodayLine?: boolean;
    stickyHeaders?: boolean;
    locale?: string;
    dateFormatter?: (date: Date, unit: GanttTimeScale['unit']) => string;
    currentDate?: Date;
}
interface GanttFiltersProps {
    value: GanttFilters;
    onChange: (filters: GanttFilters) => void;
    fieldOptions: Array<{
        id: number;
        name: string;
        area: number;
    }>;
    categoryOptions: string[];
    statusOptions?: Array<{
        value: GanttTaskStatus;
        label: string;
        color?: 'blue' | 'orange' | 'green' | 'red';
    }>;
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

declare const GanttChart: React.FC<GanttChartProps>;

export { GanttChart, type GanttChartProps, type GanttFilters, type GanttFiltersProps, type GanttGroupBy, type GanttId, type GanttLink, type GanttLinkType, type GanttTask, type GanttTaskActivityRef, type GanttTaskGroupRef, type GanttTaskStatus, type GanttTimeScale, type GanttViewConfig };
