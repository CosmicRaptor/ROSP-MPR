import { Link, NavLink, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Results from "./pages/Results.jsx";
import PaperDetail from "./pages/PaperDetail.jsx";
import GraphPage from "./pages/GraphPage.jsx";

const navCls = ({ isActive }) =>
  `px-3 py-1.5 rounded text-sm ${isActive ? "bg-slate-200 font-medium" : "hover:bg-slate-100"}`;

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <Link to="/" className="text-xl font-semibold tracking-tight text-indigo-800">
            Citemap
          </Link>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navCls}>Search</NavLink>
            <NavLink to="/results" className={navCls}>Results</NavLink>
            <NavLink to="/graph" className={navCls}>Citation graph</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/results" element={<Results />} />
          <Route path="/paper/:id" element={<PaperDetail />} />
          <Route path="/graph" element={<GraphPage />} />
        </Routes>
      </main>
      <footer className="text-center text-xs text-slate-500 py-4">
        Citemap V1 demo · metadata from OpenAlex
      </footer>
    </div>
  );
}
