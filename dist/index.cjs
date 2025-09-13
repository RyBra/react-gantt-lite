"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  GanttChart: () => GanttChart_default
});
module.exports = __toCommonJS(index_exports);

// src/GanttChart.tsx
var import_react = require("react");

// src/utils/cn.ts
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/GanttChart.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var DEFAULT_COLUMN_WIDTH = 64;
var DEFAULT_ROW_HEIGHT = 80;
function formatHeader(date, unit, locale, opts) {
  if (unit === "day") {
    return date.toLocaleDateString(locale, { day: "2-digit", month: "short" });
  }
  if (unit === "week") {
    const weekStart = new Date(date);
    const dayIdx = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - dayIdx);
    const d = weekStart.getDate();
    const m = weekStart.getMonth() + 1;
    if (opts?.weekHeaderMode === "week" || opts?.weekHeaderMode === "date+week") {
      let week = getISOWeek(weekStart);
      if ((opts?.weekNumbering ?? "fixed52") === "fixed52" && week === 53) week = 52;
      if (opts?.weekHeaderMode === "week") return `W${week}`;
      return `${d}.${m} \xB7 W${week}`;
    }
    return `${d}.${m}`;
  }
  return date.toLocaleDateString(locale, { month: "short", year: "numeric" });
}
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
  return weekNo;
}
var GanttChart = (props) => {
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
    locale = "ru-RU",
    showTodayLine = true,
    weekNumbering = "fixed52",
    weekHeaderMode = "date+week"
  } = props;
  const [uncontrolledView, setUncontrolledView] = (0, import_react.useState)(() => ({
    timeScale: { unit: "day", step: 1 },
    showWeekends: true,
    showDependencies: false,
    groupBy: "group",
    ...defaultViewConfig || {}
  }));
  const view = controlledView || uncontrolledView;
  const setView = (updater) => {
    const next = updater(view);
    if (controlledView && onViewConfigChange) onViewConfigChange(next);
    else setUncontrolledView(next);
  };
  const filteredTasks = (0, import_react.useMemo)(() => {
    let result = tasks.slice();
    if (filters?.groups?.length) result = result.filter((t) => filters.groups.includes(t.group.id));
    if (filters?.categories?.length) result = result.filter((t) => filters.categories.includes(t.activity.category));
    if (filters?.status?.length) result = result.filter((t) => filters.status.includes(t.status));
    if (filters?.dateRange) {
      result = result.filter((t) => t.startDate >= filters.dateRange.start && t.endDate <= filters.dateRange.end);
    }
    return result;
  }, [tasks, filters]);
  const groupedTasks = (0, import_react.useMemo)(() => {
    if (view.groupBy === "none") return { "\u0412\u0441\u0435 \u0437\u0430\u0434\u0430\u0447\u0438": filteredTasks };
    const groups = {};
    for (const task of filteredTasks) {
      const key = view.groupBy === "group" ? `${task.group.name}${typeof task.group.size === "number" ? ` (${task.group.size})` : ""}` : task.activity.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    }
    return groups;
  }, [filteredTasks, view.groupBy]);
  const timeScale = (0, import_react.useMemo)(() => {
    if (filteredTasks.length === 0) return [];
    const allDates = filteredTasks.flatMap((t) => [t.startDate, t.endDate]);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const startDate = new Date(minDate);
    const endDate = new Date(maxDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    if (view.timeScale.unit === "week") {
      const dayIdxStart = (startDate.getDay() + 6) % 7;
      startDate.setDate(startDate.getDate() - dayIdxStart);
      const dayIdxEnd = (endDate.getDay() + 6) % 7;
      const addToSunday = 6 - dayIdxEnd;
      endDate.setDate(endDate.getDate() + addToSunday);
    }
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      if (view.timeScale.unit === "day") current.setDate(current.getDate() + view.timeScale.step);
      else if (view.timeScale.unit === "week") current.setTime(current.getTime() + 7 * 24 * 60 * 60 * 1e3 * view.timeScale.step);
      else current.setMonth(current.getMonth() + view.timeScale.step);
    }
    if (dates.length < 2) {
      const next = new Date(startDate);
      if (view.timeScale.unit === "day") next.setDate(next.getDate() + view.timeScale.step);
      else if (view.timeScale.unit === "week") next.setTime(next.getTime() + 7 * 24 * 60 * 60 * 1e3 * view.timeScale.step);
      else next.setMonth(next.getMonth() + view.timeScale.step);
      dates.push(next);
    }
    return dates;
  }, [filteredTasks, view.timeScale]);
  const columnWidth = styles?.columnWidthPx ?? DEFAULT_COLUMN_WIDTH;
  const rowHeight = styles?.rowHeightPx ?? DEFAULT_ROW_HEIGHT;
  const minBarWidth = styles?.minTaskBarWidthPx ?? 60;
  const getTaskPosition = (task) => {
    if (timeScale.length === 0) return { left: 0, width: 0 };
    const startTime = task.startDate.getTime();
    const endTime = task.endDate.getTime();
    const scaleStartTime = timeScale[0].getTime();
    const scaleEndTime = timeScale[timeScale.length - 1].getTime();
    const total = scaleEndTime - scaleStartTime;
    if (total <= 0) return { left: 0, width: 0 };
    const leftPercent = (startTime - scaleStartTime) / total * 100;
    const widthPercent = (endTime - startTime) / total * 100;
    const left = Math.min(100, Math.max(0, leftPercent));
    const width = Math.max(1, Math.min(100 - left, widthPercent));
    return { left, width };
  };
  const formatHeaderCell = (date) => dateFormatter ? dateFormatter(date, view.timeScale.unit) : formatHeader(date, view.timeScale.unit, locale);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: cn("fx-gantt w-full", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fx-gantt-toolbar", style: { marginBottom: 12, display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", color: theme?.textColor }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontWeight: 600 }, children: "\u0414\u0438\u0430\u0433\u0440\u0430\u043C\u043C\u0430 \u0413\u0430\u043D\u0442\u0430" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "select",
          {
            value: view.groupBy,
            onChange: (e) => setView((prev) => ({ ...prev, groupBy: e.target.value })),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "group", children: "\u041F\u043E \u0433\u0440\u0443\u043F\u043F\u0430\u043C" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "category", children: "\u041F\u043E \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F\u043C" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "none", children: "\u0411\u0435\u0437 \u0433\u0440\u0443\u043F\u043F\u0438\u0440\u043E\u0432\u043A\u0438" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "select",
          {
            value: view.timeScale.unit,
            onChange: (e) => setView((prev) => ({ ...prev, timeScale: { ...prev.timeScale, unit: e.target.value } })),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "day", children: "\u041F\u043E \u0434\u043D\u044F\u043C" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "week", children: "\u041F\u043E \u043D\u0435\u0434\u0435\u043B\u044F\u043C" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "month", children: "\u041F\u043E \u043C\u0435\u0441\u044F\u0446\u0430\u043C" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fx-gantt-card", style: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", background: theme?.cardBg ?? "#ffffff", color: theme?.textColor }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: cn("fx-gantt-sidebar"), style: { width: 320, flexShrink: 0, background: theme?.sidebarBg ?? "#fafafa" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: 49, display: "flex", alignItems: "center", padding: "0 12px", borderBottom: "1px solid #e5e7eb", background: theme?.headerBg ?? "#fafafa", fontWeight: 500, boxSizing: "border-box" }, children: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u0438" }),
        Object.entries(groupedTasks).map(([groupName, groupTasks]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: 40, display: "flex", alignItems: "center", padding: "0 10px", borderBottom: `1px solid ${theme?.gridLine ?? "#f1f5f9"}`, background: theme?.headerBg ?? (theme?.sidebarBg ?? "#fafafa"), boxSizing: "border-box" }, children: renderGroupHeader ? renderGroupHeader(groupName, groupTasks) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontWeight: 500 }, children: groupName }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 12, background: theme?.gridLine ?? "#f3f4f6", borderRadius: 8, padding: "2px 6px" }, children: groupTasks.length })
          ] }) }),
          groupTasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { height: rowHeight, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, padding: "0 10px", borderBottom: "1px solid #f1f5f9", boxSizing: "border-box" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 14, fontWeight: 500, color: theme?.textColor ?? "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: task.name || "\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8, color: theme?.textColor ?? "#6b7280", opacity: 0.75, fontSize: 12 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: task.activity.name }),
              typeof task.group.size === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u2022" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: task.group.size })
              ] })
            ] })
          ] }, task.id))
        ] }, groupName))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fx-gantt-timeline", style: { flex: 1, overflow: "auto" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { minWidth: `${timeScale.length * columnWidth}px`, position: "relative" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { position: "sticky", top: 0, zIndex: 1, background: theme?.headerBg ?? "#fff", borderBottom: "1px solid #e5e7eb", color: theme?.textColor }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", height: 48 }, children: timeScale.map((date, index) => {
          const isToday = date.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { minWidth: columnWidth, width: columnWidth, borderRight: `1px solid ${theme?.gridLine ?? "#f1f5f9"}`, padding: 8, textAlign: "center", fontSize: 12, fontWeight: 500, background: isToday ? theme?.headerTodayBg ?? "#eff6ff" : void 0, color: isToday ? theme?.headerTodayText ?? "#1d4ed8" : void 0, boxSizing: "border-box" }, children: renderTimeCell ? renderTimeCell(date, index, isToday) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: dateFormatter ? dateFormatter(date, view.timeScale.unit) : formatHeader(date, view.timeScale.unit, locale, { weekNumbering, weekHeaderMode }) }) }, index);
        }) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { position: "relative" }, children: Object.entries(groupedTasks).map(([groupName, groupTasks]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { position: "relative", height: 40, background: theme?.headerBg ?? (theme?.cardBg ?? "#fafafa"), borderBottom: `1px solid ${theme?.gridLine ?? "#f1f5f9"}`, boxSizing: "border-box" }, children: timeScale.map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { position: "absolute", top: 0, bottom: 0, left: index * columnWidth, width: 0, borderRight: `1px solid ${theme?.gridLine ?? "#f1f5f9"}` } }, index)) }),
          groupTasks.map((task) => {
            const position = getTaskPosition(task);
            const leftPx = position.left / 100 * (timeScale.length * columnWidth);
            const widthPx = Math.max(minBarWidth, position.width / 100 * (timeScale.length * columnWidth));
            const isSelected = selectedTaskId === task.id;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { position: "relative", height: rowHeight, borderBottom: "1px solid #f1f5f9", boxSizing: "border-box" }, children: [
              timeScale.map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { position: "absolute", top: 0, bottom: 0, left: index * columnWidth, width: 0, borderRight: `1px solid ${theme?.gridLine ?? "#f1f5f9"}` } }, index)),
              renderTaskBar ? renderTaskBar({ task, leftPercent: position.left, widthPercent: position.width, isSelected }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "div",
                {
                  role: "button",
                  tabIndex: 0,
                  onClick: (e) => {
                    onTaskClick?.(task, e.nativeEvent);
                    onSelectedTaskChange?.(isSelected ? null : task.id);
                  },
                  onDoubleClick: (e) => onTaskDoubleClick?.(task, e),
                  onContextMenu: (e) => {
                    e.preventDefault();
                    onTaskContextMenu?.(task, e);
                  },
                  style: {
                    position: "absolute",
                    top: 24,
                    left: leftPx,
                    width: widthPx,
                    height: 32,
                    background: (task.activity.status && activityStatusColors?.[task.activity.status]) ?? (theme?.taskBarBg ?? "#dbeafe"),
                    border: `2px solid ${isSelected ? theme?.taskBarSelectedBorder ?? "#ef4444" : theme?.taskBarBorder ?? "#93c5fd"}`,
                    borderRadius: 6,
                    display: position.width > 0 ? "flex" : "none",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 8px",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "span",
                      {
                        style: { fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
                        onPointerDown: (e) => {
                          const target = e.currentTarget;
                          const timeout = setTimeout(() => onTaskLongPress?.(task, e), 500);
                          const cancel = () => clearTimeout(timeout);
                          target.addEventListener("pointerup", cancel, { once: true });
                          target.addEventListener("pointercancel", cancel, { once: true });
                          target.addEventListener("pointerleave", cancel, { once: true });
                        },
                        children: task.name || "\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F"
                      }
                    ),
                    task.assignedResources ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 10, opacity: 0.7 }, children: "res" }) : null
                  ]
                }
              )
            ] }, task.id);
          })
        ] }, groupName)) }),
        showTodayLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { position: "absolute", top: 48, bottom: 0, pointerEvents: "none" }, children: timeScale.map((date, index) => {
          const isToday = date.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
          if (!isToday) return null;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { position: "absolute", top: 0, bottom: 0, left: index * columnWidth, width: 2, background: theme?.todayLine ?? "#3b82f6" } }, "today-line");
        }) })
      ] }) })
    ] }) })
  ] });
};
var GanttChart_default = GanttChart;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GanttChart
});
//# sourceMappingURL=index.cjs.map