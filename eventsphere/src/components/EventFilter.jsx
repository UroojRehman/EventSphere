import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import categoryService from "../services/categoryService";
import {
  CalendarDays,
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const categories = [
  "All",
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Seminar",
  "Competition",
];

const fallbackDepartments = [
  "All Departments",
  "Computer Science",
  "Software Engineering",
  "Management",
  "Electrical",
  "Media Studies",
];

function EventFilter({ onFilterChange, initialFilters = {} }) {
  const [departments, setDepartments] = useState(fallbackDepartments);
  const [eventTypes, setEventTypes] = useState(["All Event Types", "Seminar", "Workshop", "Competition", "Conference"]);
  const [search, setSearch] = useState(initialFilters.search || "");
  const [category, setCategory] = useState(initialFilters.category || "All");
  const [department, setDepartment] = useState(
    initialFilters.department || "All Departments"
  );
  const [eventType, setEventType] = useState(initialFilters.eventType || "All Event Types");
  const [status, setStatus] = useState(initialFilters.status || "All");
  const [startDate, setStartDate] = useState(initialFilters.startDate || "");
  const [endDate, setEndDate] = useState(initialFilters.endDate || "");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    Promise.all([categoryService.getAll("department"), categoryService.getAll("eventType")])
      .then(([departmentResponse, eventTypeResponse]) => {
        if (departmentResponse.categories?.length) {
          setDepartments(["All Departments", ...departmentResponse.categories.map((item) => item.name)]);
        }
        if (eventTypeResponse.categories?.length) {
          setEventTypes(["All Event Types", ...eventTypeResponse.categories.map((item) => item.name)]);
        }
      })
      .catch(() => {});
  }, []);

  const emitFilters = (updatedValues = {}) => {
    const filters = {
      search,
      category,
      department,
      eventType,
      status,
      startDate,
      endDate,
      ...updatedValues,
    };

    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  const handleReset = () => {
    const reset = {
      search: "",
      category: "All",
      department: "All Departments",
      eventType: "All Event Types",
      status: "All",
      startDate: "",
      endDate: "",
    };

    setSearch("");
    setCategory("All");
    setDepartment("All Departments");
    setEventType("All Event Types");
    setStatus("All");
    setStartDate("");
    setEndDate("");

    if (onFilterChange) {
      onFilterChange(reset);
    }
  };

  return (
    <motion.div className="event-filter-panel w-full min-w-0 rounded-[28px] border border-white/10 bg-[#091525] p-4 shadow-xl shadow-black/10 sm:p-5" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      {/* Top Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
            <SlidersHorizontal size={19} />
          </div>

          <div>
            <p className="text-sm font-black text-white">Find your event</p>
            <p className="text-xs text-slate-600">
              Search and refine upcoming experiences
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 lg:ml-auto lg:max-w-md">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              emitFilters({ search: e.target.value });
            }}
            placeholder="Search events..."
            className="event-filter-control h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
          />
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300 transition hover:bg-white/10 lg:hidden"
        >
          <Filter size={15} />
          Filters
        </button>
      </div>

      {/* Filters */}
      <div
        className={`mt-4 grid gap-3 ${
          mobileOpen ? "grid" : "hidden"
        } lg:grid lg:grid-cols-6`}
      >
        {/* Category */}
        <FilterSelect
          label="Category"
          icon={<Filter size={14} />}
          value={category}
          options={categories}
          onChange={(value) => {
            setCategory(value);
            emitFilters({ category: value });
          }}
        />

        {/* Department */}
        <FilterSelect
          label="Department"
          value={department}
          options={departments}
          onChange={(value) => {
            setDepartment(value);
            emitFilters({ department: value });
          }}
        />

        <FilterSelect
          label="Event Type"
          value={eventType}
          options={eventTypes}
          onChange={(value) => {
            setEventType(value);
            emitFilters({ eventType: value });
          }}
        />

        {/* Status */}
        <FilterSelect
          label="Event Status"
          value={status}
          options={["All", "Upcoming", "Ongoing", "Past"]}
          onChange={(value) => {
            setStatus(value);
            emitFilters({ status: value });
          }}
        />

        {/* Date range */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">
            <CalendarDays size={13} />
            Date
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              emitFilters({ startDate: e.target.value });
            }}
            className="event-filter-control h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs text-slate-300 outline-none focus:border-cyan-400/40 [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">
            <CalendarDays size={13} />
            Until
          </label>

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              emitFilters({ endDate: e.target.value });
            }}
            className="event-filter-control h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs text-slate-300 outline-none focus:border-cyan-400/40 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <CalendarDays size={14} className="text-cyan-400" />
          <span>Explore events across your campus</span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-white/5 hover:text-white"
        >
          <RotateCcw size={13} />
          Reset filters
        </button>
      </div>
    </motion.div>
  );
}

function FilterSelect({ label, icon, value, options, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">
        {icon}
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`event-filter-select flex h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 text-left text-xs font-semibold text-slate-300 transition hover:border-white/20 ${open ? "is-open" : ""}`}
      >
        <span className="truncate">{value}</span>

        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-600 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="event-filter-menu absolute left-0 right-0 top-[74px] z-30 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-[#0c192a] p-1.5 shadow-2xl">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-xs transition ${
                value === option
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventFilter;