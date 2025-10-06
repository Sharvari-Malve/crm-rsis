import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import UserManagement from "./components/UserManagement";
import LeadManagement from "./components/LeadManagement";
import QuotationManager from "./components/QuotationManager";
import FollowUpData from "./components/FollowUpData";
import PaymentStatus from "./components/PaymentStatus";
import Totalleads from "./components/Totalleads";
import Assignlist from "./components/Assignlist";
import Notification from "./components/Notification";
import TotalFollowUps from "./components/TotalFollowUps"
import Login from "./login/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
  switch (activeTab) {
    case "dashboard":
      return <Dashboard setActiveTab={setActiveTab} />;
    case "user":
      return <UserManagement />;
    case "leads":
      return <LeadManagement setActiveTab={setActiveTab} />;
    case "follow":
      return <FollowUpData />;
    case "assign":
      return <Assignlist />;
    case "totalleads":
      return <Totalleads />;
       case "totalfollow":
      return <TotalFollowUps />;
    case "notify":
      return <Notification />;
    case "quotations":
      return <QuotationManager />;
    case "payment":
      return <PaymentStatus />;
    default:
      return <Dashboard setActiveTab={setActiveTab} />;
  }
};


  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen">
      <div className="flex h-screen">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/*------------ Pass setActiveTab AND user info-------- */}
          <Navbar
            userName="Andrea Pirlo"
            userRole="CRM Manager"
            userEmail="andrea@example.com"
            userContact="+91 9876543210"
            setActiveTab={setActiveTab}
          />
          <div className="flex-1 p-6 overflow-auto bg-[#ebedfa] rounded-2xl mb-4 mr-4">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
