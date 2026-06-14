import { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  Search, 
  HelpCircle, 
  ArrowUpDown, 
  CheckSquare, 
  Info,
  Layers,
  Sparkles,
  CalendarDays
} from "lucide-react";
import { ArrivalRecord, DepartureRecord, EmployeeAttendance, AttendanceDayLog, Language } from "./types";
import { translations } from "./translations";
// Demo datasets are no longer active as requested
import DashboardStats from "./components/DashboardStats";
import ExcelInputForm from "./components/ExcelInputForm";
import ArrivalTable from "./components/ArrivalTable";
import DepartureTable from "./components/DepartureTable";
import AttendanceTable from "./components/AttendanceTable";

export default function App() {
  // 1. Core States (Arrivals, Departures, Employee Attendance)
  const [arrivals, setArrivals] = useState<ArrivalRecord[]>([]);
  const [departures, setDepartures] = useState<DepartureRecord[]>([]);
  const [attendance, setAttendance] = useState<EmployeeAttendance[]>([]);

  // 2. Active view Tab state
  const [activeTab, setActiveTab] = useState<"arrival" | "departure" | "attendance">("arrival");

  // 3. Search and Date Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // 4. Instructions/Help overlay visibility
  const [showHelp, setShowHelp] = useState(true);

  // 4b. Language Translation State
  const [language, setLanguage] = useState<Language>(() => {
    const cached = localStorage.getItem("tourops_language");
    return (cached === "en" || cached === "tl") ? cached : "tl";
  });

  const t = translations[language];

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("tourops_language", lang);
  };

  // Load from local storage or fallback to curated demo dataset (default to empty state so the user can enter fresh records)
  useEffect(() => {
    const cachedArrivals = localStorage.getItem("tourops_arrivals_v3");
    const cachedDepartures = localStorage.getItem("tourops_departures_v3");
    const cachedAttendance = localStorage.getItem("tourops_attendance_v3");

    if (cachedArrivals) {
      setArrivals(JSON.parse(cachedArrivals));
    } else {
      setArrivals([]);
      localStorage.setItem("tourops_arrivals_v3", JSON.stringify([]));
    }

    if (cachedDepartures) {
      setDepartures(JSON.parse(cachedDepartures));
    } else {
      setDepartures([]);
      localStorage.setItem("tourops_departures_v3", JSON.stringify([]));
    }

    if (cachedAttendance) {
      setAttendance(JSON.parse(cachedAttendance));
    } else {
      setAttendance([]);
      localStorage.setItem("tourops_attendance_v3", JSON.stringify([]));
    }
  }, []);

  // Sync back to local storage whenever state changes
  const saveToStorage = (type: "arr" | "dep" | "att", data: any) => {
    if (type === "arr") {
      localStorage.setItem("tourops_arrivals_v3", JSON.stringify(data));
    } else if (type === "dep") {
      localStorage.setItem("tourops_departures_v3", JSON.stringify(data));
    } else if (type === "att") {
      localStorage.setItem("tourops_attendance_v3", JSON.stringify(data));
    }
  };

  // Helper to completely clear all spreadsheet records
  const handleClearAllData = () => {
    if (confirm(t.alertClearConfirm)) {
      setArrivals([]);
      setDepartures([]);
      setAttendance([]);
      
      localStorage.setItem("tourops_arrivals_v3", JSON.stringify([]));
      localStorage.setItem("tourops_departures_v3", JSON.stringify([]));
      localStorage.setItem("tourops_attendance_v3", JSON.stringify([]));
      
      setSearchQuery("");
      setDateFilter("");
      alert(t.alertClearSuccess);
    }
  };

  // Demo loading has been removed as requested

  // 5. Operations: ARRIVALS
  const handleAddArrival = (newArr: Omit<ArrivalRecord, "id">) => {
    const record: ArrivalRecord = {
      ...newArr,
      id: `arr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    const updated = [...arrivals, record];
    setArrivals(updated);
    saveToStorage("arr", updated);
  };

  const handleUpdateArrival = (id: string, updatedFields: Partial<ArrivalRecord>) => {
    const updated = arrivals.map((row) => (row.id === id ? { ...row, ...updatedFields } : row));
    setArrivals(updated);
    saveToStorage("arr", updated);
  };

  const handleDeleteArrival = (id: string) => {
    const updated = arrivals.filter((row) => row.id !== id);
    setArrivals(updated);
    saveToStorage("arr", updated);
  };

  const handleAddEmptyArrivalRow = (dateStr: string) => {
    const blankRow: ArrivalRecord = {
      id: `arr-blank-${Date.now()}`,
      date: dateStr,
      name: "",
      pax: 1,
      avail: "RT Transfer",
      number: "",
      hotel: "Enter Hotel Name",
      eta: "12:00 PM",
      collect: "N/A"
    };
    const updated = [...arrivals, blankRow];
    setArrivals(updated);
    saveToStorage("arr", updated);
  };

  // 6. Operations: DEPARTURES
  const handleAddDeparture = (newDep: Omit<DepartureRecord, "id">) => {
    const record: DepartureRecord = {
      ...newDep,
      id: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    const updated = [...departures, record];
    setDepartures(updated);
    saveToStorage("dep", updated);
  };

  const handleUpdateDeparture = (id: string, updatedFields: Partial<DepartureRecord>) => {
    const updated = departures.map((row) => (row.id === id ? { ...row, ...updatedFields } : row));
    setDepartures(updated);
    saveToStorage("dep", updated);
  };

  const handleDeleteDeparture = (id: string) => {
    const updated = departures.filter((row) => row.id !== id);
    setDepartures(updated);
    saveToStorage("dep", updated);
  };

  const handleAddEmptyDepartureRow = (dateStr: string) => {
    const blankRow: DepartureRecord = {
      id: `dep-blank-${Date.now()}`,
      date: dateStr,
      name: "",
      pax: 1,
      avail: "RT Outbound Transfer",
      number: "",
      hotel: "Enter Hotel Name",
      etd: "12:00 PM",
      pickupTime: "09:00 AM"
    };
    const updated = [...departures, blankRow];
    setDepartures(updated);
    saveToStorage("dep", updated);
  };

  // 7. Operations: ATTENDANCE
  const handleUpdateAttendance = (employeeId: string, dateStr: string, log: AttendanceDayLog | null) => {
    const updated = attendance.map((emp) => {
      if (emp.id !== employeeId) return emp;
      
      const nextLogs = { ...emp.logs };
      if (log === null) {
        delete nextLogs[dateStr];
      } else {
        nextLogs[dateStr] = log;
      }
      return { ...emp, logs: nextLogs };
    });
    
    setAttendance(updated);
    saveToStorage("att", updated);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    const updated = attendance.filter((emp) => emp.id !== employeeId);
    setAttendance(updated);
    saveToStorage("att", updated);
  };

  const handleUpdateEmployeeName = (employeeId: string, newName: string) => {
    const updated = attendance.map((emp) => (emp.id === employeeId ? { ...emp, name: newName } : emp));
    setAttendance(updated);
    saveToStorage("att", updated);
  };

  const handleAddEmployee = (name: string) => {
    const newEmp: EmployeeAttendance = {
      id: `emp-${Date.now()}`,
      name,
      logs: {}
    };
    const updated = [...attendance, newEmp];
    setAttendance(updated);
    saveToStorage("att", updated);
  };

  // Global filtered arrays depending on selected date filter (if set)
  const viewArrivals = dateFilter ? arrivals.filter((a) => a.date === dateFilter) : arrivals;
  const viewDepartures = dateFilter ? departures.filter((d) => d.date === dateFilter) : departures;

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1A1A1A] font-sans antialiased pb-16">
      
      {/* 🟢 TOP NAVIGATION HEADER */}
      <header className="bg-white border-b border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1A1A1A] p-2 rounded-none text-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <FileSpreadsheet className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="font-serif font-black text-2xl uppercase tracking-tighter leading-none italic select-none text-black">
                  {t.title}
                </h1>
                <span className="bg-[#1A1A1A] text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {t.versionBadge}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Header Right Widgets */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Switch */}
            <div className="flex border-2 border-black bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-2 py-1.5 text-[10px] font-mono font-black uppercase transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-neutral-100"
                }`}
                title="Switch to English"
              >
                ENGLISH (EN)
              </button>
              <button
                onClick={() => changeLanguage("tl")}
                className={`px-2 py-1.5 text-[10px] font-mono font-black uppercase transition-all cursor-pointer ${
                  language === "tl"
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-neutral-100"
                }`}
                title="Lumipat sa Tagalog"
              >
                TAGALOG (TL)
              </button>
            </div>

            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-[#1A1A1A] hover:text-black transition-colors px-3 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 border-2 border-black bg-[#FAFAFA] hover:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              title="Show / Hide Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-black" />
              {t.guideButton}
            </button>
            <button
              onClick={handleClearAllData}
              className="bg-red-600 text-white hover:bg-red-700 px-3 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              title="Empty the records"
            >
              <span>🗑️</span> {t.clearButton}
            </button>
          </div>
        </div>
      </header>

      {/* 🟢 MAIN WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Help / Gabay Alert Panel */}
        {showHelp && (
          <div className="bg-white border-2 border-black p-5 mb-6 text-[#1A1A1A] relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-4 items-start rounded-none">
            <div className="bg-amber-100 border border-black p-2 rounded-none shrink-0">
              <Info className="w-5.5 h-5.5 text-slate-900" />
            </div>
            <div className="flex-1 space-y-1 text-xs">
              <div className="flex justify-between items-center border-b border-black pb-1.5 mb-2">
                <h4 className="font-serif font-black italic text-base uppercase tracking-tight text-black">
                  {t.guideTitle}
                </h4>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-gray-500 hover:text-black font-black px-1.5 py-0.5 border border-black cursor-pointer text-xs uppercase"
                >
                  {t.hideButton}
                </button>
              </div>
              <p className="text-[#1A1A1A] leading-relaxed max-w-4xl text-xs">
                {t.guideIntro}
              </p>
              <ul className="list-disc pl-4 space-y-1 pr-1 text-slate-800 pt-1 text-[11px] font-mono">
                <li><span className="font-bold text-black uppercase">{t.guideCellEdit}</span> {t.guideCellEditText}</li>
                <li><span className="font-bold text-black uppercase">{t.guideInsertRow}</span> {t.guideInsertRowText}</li>
                <li><span className="font-bold text-black uppercase">{t.guideAutoSave}</span> {t.guideAutoSaveText}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Real-time Indicator summaries */}
        <DashboardStats 
          arrivals={arrivals} 
          departures={departures} 
          attendance={attendance} 
          onDeleteArrival={handleDeleteArrival}
          onUpdateArrival={handleUpdateArrival}
          language={language}
        />

        {/* Primary Data Input Encoder Panel */}
        <ExcelInputForm 
          onSaveArrival={handleAddArrival} 
          onSaveDeparture={handleAddDeparture} 
          onAddEmployee={handleAddEmployee}
          onUpdateAttendance={handleUpdateAttendance}
          employees={attendance}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
        />

        {/* 🟢 EXCEL SEARCH & FILTER UTILITY BAR */}
        <div className="bg-[#FAFAFA] border border-black p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          
          {/* Left search tools */}
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-black">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full text-xs font-mono placeholder-gray-500 border border-black rounded-none pl-9 pr-3 py-2 bg-white uppercase font-bold outline-none text-black"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 font-bold text-gray-500 hover:text-black text-xs uppercase cursor-pointer"
                >
                  {t.btnClearSearch}
                </button>
              )}
            </div>
            
            {/* Global Date Sorter filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <CalendarDays className="w-4 h-4 text-black" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-xs font-mono font-bold border border-black px-3 py-1.5 bg-white uppercase rounded-none outline-none text-black"
                title="Filter by particular date"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="text-[10px] font-bold uppercase tracking-wider text-rose-755 border border-rose-300 bg-rose-50 px-2 py-1.5 hover:bg-rose-100 cursor-pointer"
                  title="Show all dates"
                >
                  {t.filterAllDates}
                </button>
              )}
            </div>
          </div>

          {/* Section Section Selector Tabs */}
          <div className="flex border border-black bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <button
              onClick={() => setActiveTab("arrival")}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 rounded-none border-r border-black font-display ${
                activeTab === "arrival"
                  ? "bg-emerald-100 text-emerald-950"
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeTab === "arrival" ? "bg-emerald-600 animate-pulse" : "bg-emerald-300"}`} />
              {t.tabArrivals}
            </button>
            <button
              onClick={() => setActiveTab("departure")}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 rounded-none border-r border-black font-display ${
                activeTab === "departure"
                  ? "bg-blue-100 text-blue-950"
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeTab === "departure" ? "bg-blue-600 animate-pulse" : "bg-blue-300"}`} />
              {t.tabDepartures}
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 rounded-none font-display ${
                activeTab === "attendance"
                  ? "bg-slate-200 text-slate-950"
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeTab === "attendance" ? "bg-black animate-pulse" : "bg-gray-400"}`} />
              {t.tabPersonnel}
            </button>
          </div>

        </div>

        {/* 🟢 TAB CONTENT PANELS */}
        <div id="spreadsheet-workspace-panel" className="transition-all duration-300">
          {activeTab === "arrival" && (
            <ArrivalTable
              records={viewArrivals}
              onUpdateRecord={handleUpdateArrival}
              onDeleteRecord={handleDeleteArrival}
              onAddEmptyRecord={handleAddEmptyArrivalRow}
              searchQuery={searchQuery}
              language={language}
            />
          )}

          {activeTab === "departure" && (
            <DepartureTable
              records={viewDepartures}
              onUpdateRecord={handleUpdateDeparture}
              onDeleteRecord={handleDeleteDeparture}
              onAddEmptyRecord={handleAddEmptyDepartureRow}
              searchQuery={searchQuery}
              language={language}
            />
          )}

          {activeTab === "attendance" && (
            <AttendanceTable
              employees={attendance}
              onUpdateAttendance={handleUpdateAttendance}
              onDeleteEmployee={handleDeleteEmployee}
              onUpdateEmployeeName={handleUpdateEmployeeName}
              onAddEmployee={handleAddEmployee}
              searchQuery={searchQuery}
              language={language}
            />
          )}
        </div>

      </main>

      {/* Editorial Bottom Status Bar / Footer */}
      <footer className="mt-20 border-t-2 border-black bg-black text-white py-4 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest">
          <div className="flex gap-4">
            <span className="text-emerald-400">● ONLINE / STABLE</span>
            <span>DB: LOCALSTORAGE_ACTIVE</span>
            <span>OPERATOR: SECURE_AGENT</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <div>
              TOUROPS EXCEL SYSTEM © 2026 • REGISTRY MANAGEMENT SYSTEM / V2.5
            </div>
            <div className="text-[9px] tracking-wider text-amber-300 font-mono font-bold uppercase select-none">
              CREATED BY ARJOE SOLIDUM.. COMPUTER SCIENCE DEVELOPER
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
