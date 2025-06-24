import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import CardCentricLayout from './layouts/CardCentricLayout';
import MinimalisticLayout from './layouts/MinimalisticLayout';
import TopNavigation from './components/TopNavigation';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="dashboard-container">
          <TopNavigation />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/minimal" replace />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/minimal" replace />} />
            <Route path="/dashboard/minimal" element={<MinimalisticLayout />} />
            <Route path="/dashboard/cards" element={<CardCentricLayout />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
