import React, { useState } from 'react';
import { Search, Bell, LogOut, User, Mail, Phone } from 'lucide-react';

interface NavbarProps {
  userName: string;
  userRole: string;
  userEmail: string;
  userContact: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ userName, userRole, userEmail, userContact, setActiveTab }: NavbarProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const unreadCount = 3;


  return (
    <nav className="px-6 py-2 bg-[#ebedfa] rounded-2xl mt-4 mr-4 mb-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Welcome Section */}
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2 bg-white/30 rounded-xl hover:bg-white/40 transition-colors"
              onClick={() => setActiveTab("notify")}
            >
              <Bell size={20} className="text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/40 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">{userName}</p>
                <p className="text-xs text-gray-600">{userRole}</p>
              </div>
            </button>

            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{userName.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{userName}</p>
                    <p className="text-sm text-gray-600">{userRole}</p>
                  </div>
                </div>
              </div>

              {/* My Profile Button */}
              <div className="py-2">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <User size={18} className="text-gray-600" />
                  <span className="text-gray-800">My Profile</span>
                </button>
              </div>

              {/* Sign Out */}
              <div className="border-t border-gray-100 py-2">
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-left">
                  <LogOut size={18} className="text-red-600" />
                  <span className="text-red-600">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="mt-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
      </div>

      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[350px] shadow-xl relative p-6">

            {/* Gradient background circle effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-400 rounded-2xl -z-10" />

            {/* Profile Image Placeholder */}
            <div className="flex justify-center -mt-16 mb-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md">
                <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {userName.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">{userName}</h2>
              <p className="text-sm text-gray-600">{userRole}</p>
            </div>

            {/* Contact Info */}

            <div className="mt-4 space-y-2 px-4">


              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-teal-600" />
                <span>{userEmail}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-teal-600" />
                <span>{userContact}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="mt-6 w-full bg-teal-600 hover:bg-teal-600 text-white py-2 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </nav>
  );
}
