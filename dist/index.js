// src/GanttChart.tsx
import { useMemo, useState } from "react";

// src/utils/cn.ts
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/GanttChart.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var DEFAULT_COLUMN_WIDTH = 64;
var DEFAULT_ROW_HEIGHT = 80;
function formatHeader(date, unit, locale) {
  if (unit === "day") {
    return date.toLocaleDateString(locale, { day: "2-digit", month: "short" });
  }
  if (unit === "week") {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay() + 1);
    return `${weekStart.getDate()}.${weekStart.getMonth() + 1}`;
  }
  return date.toLocaleDateString(locale, { month: "short", year: "numeric" });
}
var GanttChart = (props) => {
  const {
    tasks,
    filters,
    onFiltersChange,
    onTaskClick,
    className,
    styles,
    renderGroupHeader,
    renderTimeCell,
    renderTaskBar,
    selectedTaskId,
    onSelectedTaskChange,
    dateFormatter,
    viewConfig: controlledView,
    onViewConfigChange,
    defaultViewConfig,
    locale = "ru-RU",
    showTodayLine = true
  } = props;
  const [uncontrolledView, setUncontrolledView] = useState(() => ({
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
  const filteredTasks = useMemo(() => {
    let result = tasks.slice();
    if (filters?.groups?.length) result = result.filter((t) => filters.groups.includes(t.group.id));
    if (filters?.categories?.length) result = result.filter((t) => filters.categories.includes(t.activity.category));
    if (filters?.status?.length) result = result.filter((t) => filters.status.includes(t.status));
    if (filters?.dateRange) {
      result = result.filter((t) => t.startDate >= filters.dateRange.start && t.endDate <= filters.dateRange.end);
    }
    return result;
  }, [tasks, filters]);
  const groupedTasks = useMemo(() => {
    if (view.groupBy === "none") return { "\u0412\u0441\u0435 \u0437\u0430\u0434\u0430\u0447\u0438": filteredTasks };
    const groups = {};
    for (const task of filteredTasks) {
      const key = view.groupBy === "group" ? `${task.group.name}${typeof task.group.size === "number" ? ` (${task.group.size})` : ""}` : task.activity.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    }
    return groups;
  }, [filteredTasks, view.groupBy]);
  const timeScale = useMemo(() => {
    if (filteredTasks.length === 0) return [];
    const allDates = filteredTasks.flatMap((t) => [t.startDate, t.endDate]);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const startDate = new Date(minDate);
    const endDate = new Date(maxDate);
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      if (view.timeScale.unit === "day") current.setDate(current.getDate() + view.timeScale.step);
      else if (view.timeScale.unit === "week") current.setDate(current.getDate() + 7 * view.timeScale.step);
      else current.setMonth(current.getMonth() + view.timeScale.step);
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
  return /* @__PURE__ */ jsxs("div", { className: cn("fx-gantt w-full", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "fx-gantt-toolbar", style: { marginBottom: 12, display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontWeight: 600 }, children: "\u0414\u0438\u0430\u0433\u0440\u0430\u043C\u043C\u0430 \u0413\u0430\u043D\u0442\u0430" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: view.groupBy,
            onChange: (e) => setView((prev) => ({ ...prev, groupBy: e.target.value })),
            children: [
              /* @__PURE__ */ jsx("option", { value: "group", children: "\u041F\u043E \u0433\u0440\u0443\u043F\u043F\u0430\u043C" }),
              /* @__PURE__ */ jsx("option", { value: "category", children: "\u041F\u043E \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F\u043C" }),
              /* @__PURE__ */ jsx("option", { value: "none", children: "\u0411\u0435\u0437 \u0433\u0440\u0443\u043F\u043F\u0438\u0440\u043E\u0432\u043A\u0438" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: view.timeScale.unit,
            onChange: (e) => setView((prev) => ({ ...prev, timeScale: { ...prev.timeScale, unit: e.target.value } })),
            children: [
              /* @__PURE__ */ jsx("option", { value: "day", children: "\u041F\u043E \u0434\u043D\u044F\u043C" }),
              /* @__PURE__ */ jsx("option", { value: "week", children: "\u041F\u043E \u043D\u0435\u0434\u0435\u043B\u044F\u043C" }),
              /* @__PURE__ */ jsx("option", { value: "month", children: "\u041F\u043E \u043C\u0435\u0441\u044F\u0446\u0430\u043C" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "fx-gantt-card", style: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex" }, children: [
      /* @__PURE__ */ jsxs("div", { className: cn("fx-gantt-sidebar"), style: { width: 320, flexShrink: 0 }, children: [
        /* @__PURE__ */ jsx("div", { style: { height: 49, display: "flex", alignItems: "center", padding: "0 12px", borderBottom: "1px solid #e5e7eb", background: "#fafafa", fontWeight: 500, boxSizing: "border-box" }, children: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u0438" }),
        Object.entries(groupedTasks).map(([groupName, groupTasks]) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { style: { height: 40, display: "flex", alignItems: "center", padding: "0 10px", borderBottom: "1px solid #f1f5f9", background: "#fafafa", boxSizing: "border-box" }, children: renderGroupHeader ? renderGroupHeader(groupName, groupTasks) : /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontWeight: 500 }, children: groupName }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 12, background: "#f3f4f6", borderRadius: 8, padding: "2px 6px" }, children: groupTasks.length })
          ] }) }),
          groupTasks.map((task) => /* @__PURE__ */ jsxs("div", { style: { height: rowHeight, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, padding: "0 10px", borderBottom: "1px solid #f1f5f9", boxSizing: "border-box" }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 500, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: task.name || "\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F" }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, color: "#6b7280", fontSize: 12 }, children: [
              /* @__PURE__ */ jsx("span", { children: task.activity.name }),
              typeof task.group.size === "number" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { children: "\u2022" }),
                /* @__PURE__ */ jsx("span", { children: task.group.size })
              ] })
            ] })
          ] }, task.id))
        ] }, groupName))
      ] }),
      /* @__PURE__ */ jsx("div", { className: "fx-gantt-timeline", style: { flex: 1, overflow: "auto" }, children: /* @__PURE__ */ jsxs("div", { style: { minWidth: `${timeScale.length * columnWidth}px`, position: "relative" }, children: [
        /* @__PURE__ */ jsx("div", { style: { position: "sticky", top: 0, zIndex: 1, background: "#fff", borderBottom: "1px solid #e5e7eb" }, children: /* @__PURE__ */ jsx("div", { style: { display: "flex", height: 48 }, children: timeScale.map((date, index) => {
          const isToday = date.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
          return /* @__PURE__ */ jsx("div", { style: { minWidth: columnWidth, width: columnWidth, borderRight: "1px solid #f1f5f9", padding: 8, textAlign: "center", fontSize: 12, fontWeight: 500, background: isToday ? "#eff6ff" : void 0, color: isToday ? "#1d4ed8" : void 0, boxSizing: "border-box" }, children: renderTimeCell ? renderTimeCell(date, index, isToday) : /* @__PURE__ */ jsx("div", { children: formatHeaderCell(date) }) }, index);
        }) }) }),
        /* @__PURE__ */ jsx("div", { style: { position: "relative" }, children: Object.entries(groupedTasks).map(([groupName, groupTasks]) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { style: { position: "relative", height: 40, background: "#fafafa", borderBottom: "1px solid #f1f5f9", boxSizing: "border-box" }, children: timeScale.map((_, index) => /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 0, bottom: 0, left: index * columnWidth, width: 0, borderRight: "1px solid #f1f5f9" } }, index)) }),
          groupTasks.map((task) => {
            const position = getTaskPosition(task);
            const leftPx = position.left / 100 * (timeScale.length * columnWidth);
            const widthPx = Math.max(minBarWidth, position.width / 100 * (timeScale.length * columnWidth));
            const isSelected = selectedTaskId === task.id;
            return /* @__PURE__ */ jsxs("div", { style: { position: "relative", height: rowHeight, borderBottom: "1px solid #f1f5f9", boxSizing: "border-box" }, children: [
              timeScale.map((_, index) => /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 0, bottom: 0, left: index * columnWidth, width: 0, borderRight: "1px solid #f1f5f9" } }, index)),
              renderTaskBar ? renderTaskBar({ task, leftPercent: position.left, widthPercent: position.width, isSelected }) : /* @__PURE__ */ jsxs(
                "div",
                {
                  role: "button",
                  tabIndex: 0,
                  onClick: (e) => {
                    onTaskClick?.(task, e.nativeEvent);
                    onSelectedTaskChange?.(isSelected ? null : task.id);
                  },
                  style: {
                    position: "absolute",
                    top: 24,
                    left: leftPx,
                    width: widthPx,
                    height: 32,
                    background: "#dbeafe",
                    border: `2px solid ${isSelected ? "#ef4444" : "#93c5fd"}`,
                    borderRadius: 6,
                    display: position.width > 0 ? "flex" : "none",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 8px",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
                  },
                  children: [
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: task.name || "\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F" }),
                    task.assignedResources ? /* @__PURE__ */ jsx("span", { style: { fontSize: 10, opacity: 0.7 }, children: "res" }) : null
                  ]
                }
              )
            ] }, task.id);
          })
        ] }, groupName)) }),
        showTodayLine && /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 48, bottom: 0, pointerEvents: "none" }, children: timeScale.map((date, index) => {
          const isToday = date.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
          if (!isToday) return null;
          return /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 0, bottom: 0, left: index * columnWidth, width: 2, background: "#3b82f6" } }, "today-line");
        }) })
      ] }) })
    ] }) })
  ] });
};
var GanttChart_default = GanttChart;
export {
  GanttChart_default as GanttChart
};
//# sourceMappingURL=index.js.map