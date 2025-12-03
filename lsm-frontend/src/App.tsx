/**
 * LSM (Local Store Marketing) Tracking App
 * Main Application Component
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { LsmEntryPage } from "./pages/LsmEntryPage";
import { HistoryPage } from "./pages/HistoryPage";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main>
          <Routes>
            {/* LSM Entry - Main page */}
            <Route path="/" element={<LsmEntryPage />} />

            {/* History - View past entries */}
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
