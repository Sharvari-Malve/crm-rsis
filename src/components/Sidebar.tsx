import { LayoutDashboard, Users, User, Banknote } from 'lucide-react';


import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "user", label: "User Management", icon: User, path: "/user" },
    { id: "leads", label: "Lead Management", icon: Users, path: "/leads" },
    // { id: "quotations", label: "Quotation Log", icon: FileText, path: "/quotations" },
    { id: "payment", label: "Payment Status", icon: Banknote, path: "/payment" },
  ];
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between w-64 bg-[#ebedfa] p-6 shadow-xl rounded-2xl m-4">
      {/* Top Section */}
      <div>
        {/* Sidebar Title */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-gray-800">CRM Project</h1>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? "bg-[#278f9b] text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/30"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className=" text-sm text-gray-500">
        <a
          href="https://www.rsinfotechsys.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center"
        >
          <p className="">Powered By</p>
          <p className=" font-semibold">R S Infotech System Pvt. Ltd.</p>
        </a>
      </div>
    </div>
  );
}
