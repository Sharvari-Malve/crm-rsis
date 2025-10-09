import { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import UserManagement from "./components/UserManagement";
import LeadManagement from "./components/LeadManagement";
import QuotationManager from "./components/QuotationManager";
import FollowUpData from "./components/FollowUpData";
import PaymentStatus from "./components/PaymentStatus";
import Totalleads from "./components/Totalleads";
import Notification from "./components/Notification";
import TotalFollowUps from "./components/TotalFollowUps";
import Login from "./login/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => {
          setIsLoggedIn(true);
          navigate("/dashboard");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <Navbar
            userName="Andrea Pirlo"
            userRole="C Manager"
            userEmail="andrea@example.com"
            userContact="+91 9876543210"
            setActiveTab={(tab) => navigate(`/${tab}`)}
            setSidebarOpen={setSidebarOpen}
            onSignOut={() => {
              setIsLoggedIn(false);
              navigate("/login");
            }}
          />
          <div className="flex-1 p-4 md:p-6 overflow-auto bg-[#ebedfa] rounded-2xl mb-4 md:mr-4">
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard setActiveTab={(tab) => navigate(`/${tab}`)} />
                }
              />
              <Route
                path="/dashboard"
                element={
                  <Dashboard setActiveTab={(tab) => navigate(`/${tab}`)} />
                }
              />
              <Route
                path="/user"
                element={
                  <UserManagement setActiveTab={(tab) => navigate(`/${tab}`)} />
                }
              />
              <Route
                path="/leads"
                element={
                  <LeadManagement setActiveTab={(tab) => navigate(`/${tab}`)} />
                }
              />
              <Route path="/follow" element={<FollowUpData />} />
              <Route path="/totalleads" element={<Totalleads />} />
              <Route path="/totalfollow" element={<TotalFollowUps />} />
              <Route
                path="/notify"
                element={
                  <Notification setActiveTab={(tab) => navigate(`/${tab}`)} />
                }
              />
              <Route path="/quotations" element={<QuotationManager />} />
              <Route path="/payment" element={<PaymentStatus />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>

          {/* Toast container */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </main>
      </div>
    </div>
  );
}

export default App;
