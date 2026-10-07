import { createContext, useContext, useEffect, useState } from "react";

// Shared app state (query, papers, screening results). Kept in sessionStorage so a page refresh
// does not lose the search. Swap this for a real store/database-backed API later.
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const KEY = "citemap-state-v1";
const EMPTY = { query: "", papers: [], source: null, notice: null, screening: {}, criteria: null };

function load() {
  try {
    return { ...EMPTY, ...JSON.parse(sessionStorage.getItem(KEY)) };
  } catch {
    return EMPTY;
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or disabled: the app still works, just without persistence */
    }
  }, [state]);

  const update = (patch) => setState((s) => ({ ...s, ...patch }));
  const setSearchResults = ({ query, papers, source, notice }) =>
    // a new search invalidates old screening results
    setState({ ...EMPTY, query, papers, source, notice });

  return <Ctx.Provider value={{ ...state, update, setSearchResults }}>{children}</Ctx.Provider>;
}
