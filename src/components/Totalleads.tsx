import React, { useState } from "react";
import { ArrowLeft, Eye } from "lucide-react";

// Updated Project interface
interface Project {
  id: number;
  name: string;
  status: "approved" | "rejected" | "completed" | "pending";
  user: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  days?: number;
  reason?: string;
  quotationUrl?: string;
}

// Example project data with extra fields
const projectsData: Project[] = [
  { id: 1, name: "Project A", status: "approved", user: "Alice", startDate: "2025-09-01", endDate: "2025-09-10", date: "2025-09-01", quotationUrl: "/docs/projectA.pdf" },
  { id: 2, name: "Project B", status: "approved", user: "Alice", startDate: "2025-09-05", endDate: "2025-09-15", date: "2025-09-05" ,quotationUrl: "/docs/projectA.pdf" },
  { id: 3, name: "Project C", status: "completed", user: "Alice", startDate: "2025-08-01", endDate: "2025-08-10", days: 10, date: "2025-08-10" },
  { id: 4, name: "Project D", status: "pending", user: "Alice", startDate: "2025-09-10", endDate: "2025-09-20", days: 5 },
  { id: 5, name: "Project E", status: "rejected", user: "Alice", date: "2025-08-15", reason: "Client cancelled" },
  { id: 6, name: "Project F", status: "approved", user: "Bob", startDate: "2025-09-01", endDate: "2025-09-08", date: "2025-09-01" ,quotationUrl: "/docs/projectA.pdf" },
  { id: 7, name: "Project G", status: "completed", user: "Bob", startDate: "2025-08-01", endDate: "2025-08-07", days: 7, date: "2025-08-07" },
  { id: 8, name: "Project H", status: "rejected", user: "Charlie", date: "2025-08-12", reason: "Budget issue" },
  { id: 9, name: "Project I", status: "approved", user: "Charlie", startDate: "2025-09-03", endDate: "2025-09-12", date: "2025-09-03", quotationUrl: "/docs/projectA.pdf" },
];

// User stats calculation
interface UserStats {
  user: string;
  approved: number;
  rejected: number;
  completed: number;
  pending: number;
}

const usersData: UserStats[] = ["Alice", "Bob", "Charlie"].map((user) => {
  const userProjects = projectsData.filter((p) => p.user === user);
  return {
    user,
    approved: userProjects.filter((p) => p.status === "approved").length,
    rejected: userProjects.filter((p) => p.status === "rejected").length,
    completed: userProjects.filter((p) => p.status === "completed").length,
    pending: userProjects.filter((p) => p.status === "pending").length,
  };
});

const UserDashboard: React.FC = () => {
  // ✅ Default All User
  const [selectedUser, setSelectedUser] = useState<string>(""); 
  const [selectedCategory, setSelectedCategory] = useState<"approved" | "rejected" | "completed" | "pending" | null>(null);

  const userStats =
    selectedUser === ""
      ? {
          user: "All",
          approved: projectsData.filter((p) => p.status === "approved").length,
          rejected: projectsData.filter((p) => p.status === "rejected").length,
          completed: projectsData.filter((p) => p.status === "completed").length,
          pending: projectsData.filter((p) => p.status === "pending").length,
        }
      : usersData.find((u) => u.user === selectedUser);

  const handleBack = () => {
    window.history.back();
  };

  const filteredProjects =
    selectedCategory &&
    projectsData.filter(
      (p) =>
        (selectedUser === "" || p.user === selectedUser) &&
        p.status === selectedCategory
    );

  return (
    <div className="p-6 ">
      {/* Header */}
      <div className="w-full h-20 md:h-20 bg-white rounded-xl p-6 shadow-lg  mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="relative inline-block w-64">
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setSelectedCategory(null);
              }}
              className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-lg shadow-md leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 cursor-pointer"
            >
              <option value="">All User</option>
              {usersData.map((user) => (
                <option key={user.user} value={user.user}>
                  {user.user}
                </option>
              ))}
            </select>

            {/* Custom arrow icon */}
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
            className="flex items-center px-8  py-2 bg-teal-500 text-white rounded-md hover:bg-teal-500"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* User Stats */}
      {userStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 rounded-full">
          {(["approved", "rejected", "completed", "pending"] as const).map(
            (category) => (
              <div
                key={category}
                className="bg-white p-4 rounded shadow text-center cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category ? null : category
                  )
                }
              >
                <h3 className="text-xl font-bold">{userStats[category]}</h3>
                <p className="capitalize">{category}</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Projects Table */}
      {selectedCategory && filteredProjects && (
        <div className="bg-white p-4 rounded shadow ">
          <h4 className="text-lg font-semibold mb-2 capitalize">
            {selectedCategory} Projects
          </h4>
          {filteredProjects.length > 0 ? (
            <table className="w-full table-auto border-collapse border border-gray-300 break-words rounded-full">
              <thead>
                <tr className="bg-teal-500 text-white text-center">
                  <th className="border p-2  ">Project Name</th>
                  {selectedCategory === "approved" && (
                    <>
                      <th className="border p-2 ">Date</th>
                      <th className="border p-2 ">Start Date</th>
                      <th className="border p-2 ">End Date</th>
                      <th className="border p-2 ">Quotation</th>
                    </>
                  )}
                  {selectedCategory === "completed" && (
                    <>
                      <th className="border p-2 ">Start Date</th>
                      <th className="border p-2 ">End Date</th>
                      <th className="border p-2 ">Days</th>
                    </>
                  )}
                  {selectedCategory === "pending" && (
                    <>
                      <th className="border p-2 ">Start Date</th>
                      <th className="border p-2">End Date</th>
                      <th className="border p-2 ">Days</th>
                    </>
                  )}
                  {selectedCategory === "rejected" && (
                    <>
                      <th className="border p-2 ">Reason</th>
                      <th className="border p-2 ">Date</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="text-center">
                    <td className="border p-2 whitespace-normal ">
                      {project.name}
                    </td>
                    {selectedCategory === "approved" && (
                      <>
                        <td className="border p-2">{project.date}</td>
                        <td className="border p-2">{project.startDate}</td>
                        <td className="border p-2">{project.endDate}</td>
                        <td className="border p-2 ">
                          {project.quotationUrl ? (
                            <button
                              onClick={() =>
                                window.open(project.quotationUrl, "_blank")
                              }
                              className="text-teal-600 hover:text-teal-800"
                            >
                              <Eye size={20} />
                            </button>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </>
                    )}
                    {selectedCategory === "completed" && (
                      <>
                        <td className="border p-2">{project.startDate}</td>
                        <td className="border p-2">{project.endDate}</td>
                        <td className="border p-2">{project.days}</td>
                      </>
                    )}
                    {selectedCategory === "pending" && (
                      <>
                        <td className="border p-2">{project.startDate}</td>
                        <td className="border p-2">{project.endDate}</td>
                        <td className="border p-2">{project.days}</td>
                      </>
                    )}
                    {selectedCategory === "rejected" && (
                      <>
                        <td className="border p-2">{project.reason}</td>
                        <td className="border p-2">{project.date}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No projects found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
