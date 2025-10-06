import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface Lead {
  id: number;
  name: string; 
  status: "approved" | "rejected" | "pending";
  leadOwner: string; 
  company: string;
  lastFollowUp?: string;
  nextFollowUp?: string;
}

const leadsData: Lead[] = [
  {
    id: 1,
    name: "Lead A",
    status: "approved",
    leadOwner: "Alice",
    company: "Company X",
    lastFollowUp: "2025-09-15",
  },
  {
    id: 2,
    name: "Lead B",
    status: "rejected",
    leadOwner: "Bob",
    company: "Company Y",
    lastFollowUp: "2025-09-10",
  },
  {
    id: 3,
    name: "Lead C",
    status: "pending",
    leadOwner: "Charlie",
    company: "Company Z",
    lastFollowUp: "2025-09-18",
    nextFollowUp: "2025-09-25",
  },
  {
    id: 4,
    name: "Lead D",
    status: "approved",
    leadOwner: "Alice",
    company: "Company A",
    lastFollowUp: "2025-09-20",
  },
];

const LeadDashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<
    "approved" | "rejected" | "pending" | null
  >(null);

  const [selectedLead, setSelectedLead] = useState<string>(""); // Lead filter state

  const handleBack = () => {
    window.history.back();
  };

  // Filter by category and selected lead
  const filteredLeads =
    selectedCategory &&
    leadsData.filter(
      (l) =>
        l.status === selectedCategory &&
        (selectedLead === "" || l.name === selectedLead)
    );
  return (
    <div className="p-6">
      {/* Header */}
      <div className="w-full h-20 bg-white rounded-xl p-6 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
         <div className="relative inline-block w-64">
            <select
              value={selectedLead}
              onChange={(e) => setSelectedLead(e.target.value)}
              className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-lg shadow-md leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 cursor-pointer"
            >
              <option value="">All Leads</option>
              {leadsData.map((lead) => (
                <option key={lead.id} value={lead.name}>
                  {lead.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M5.516 7.548l4.484 4.486 4.484-4.486L16 9l-6 6-6-6z" />
              </svg>
            </div>
          </div>

          <button
            onClick={handleBack}
            className="flex items-center px-8 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 rounded-xl">
        {(["approved", "rejected", "pending"] as const).map((category) => (
          <div
            key={category}
            className={`p-4 rounded shadow text-center cursor-pointer ${
              selectedCategory === category ? "bg-white" : "bg-white"
            } hover:bg-gray-50`}
            onClick={() =>
              setSelectedCategory(selectedCategory === category ? null : category)
            }
          >
            <h3 className="text-xl font-bold capitalize">{category}</h3>
            <p>
              {leadsData.filter((l) => l.status === category).length} Leads
            </p>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      {selectedCategory && filteredLeads && (
        <div className="bg-white p-4 rounded shadow rounded-xl">
          <h4 className="text-lg font-semibold mb-2 capitalize">
            {selectedCategory} Leads
          </h4>
          {filteredLeads.length > 0 ? (
            <table className="w-full table-auto border-collapse border border-gray-300 rounded-xl">
              <thead>
                <tr className="bg-teal-500 text-white text-center">
                  <th className="border p-2">Lead Name</th>
                  <th className="border p-2">Last Follow-up</th>
                  <th className="border p-2">Company</th>
                  {selectedCategory === "pending" && (
                    <th className="border p-2">Next Follow-up</th>
                  )}
                  <th className="border p-2">Assigned By</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="text-center">
                    <td className="border p-2">{lead.name}</td>
                    <td className="border p-2">{lead.lastFollowUp}</td>
                    <td className="border p-2">{lead.company}</td>
                    {selectedCategory === "pending" && (
                      <td className="border p-2">{lead.nextFollowUp}</td>
                    )}
                    <td className="border p-2">{lead.leadOwner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No leads found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadDashboard;
