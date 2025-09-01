import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import CircleSpinner from "../common/CircleSpinner";
import { fetchWithAuth } from "@/utils/generalUtils";
import {
  FaArrowDownAZ,
  FaArrowUpAZ,
  FaArrowDownLong,
  FaArrowUpLong,
  FaPlus,
} from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import { MdWarning } from "react-icons/md";
import Alert from "../ui/common/Alert";

function ProgramList() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteProgramAlert, setShowDeleteProgramAlert] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProgram, setNewProgram] = useState({
    name: "",
    duration: "",
    price: "",
    description: "",
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [editProgram, setEditProgram] = useState({
    id: "",
    name: "",
    duration: "",
    price: "",
    description: "",
    active: "",
  });

  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteProgram, setDeleteProgram] = useState({
    id: "",
    name: "",
    duration: "",
    price: "",
    description: "",
    active: false,
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetchWithAuth("/api/organization/program");
        const data = await response.json();

        if (Array.isArray(data)) {
          setPrograms(data);
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleSearch = (query) => setSearchQuery(query);

  const filteredPrograms = programs.filter((program) =>
    program.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedPrograms = useMemo(() => {
    return [...filteredPrograms].sort((a, b) => {
      const order = sortConfig.direction === "asc" ? 1 : -1;
      return a[sortConfig.key] < b[sortConfig.key] ? -order : order;
    });
  }, [filteredPrograms, sortConfig]);

  const handleAddProgramChange = (e) => {
    setNewProgram({ ...newProgram, [e.target.name]: e.target.value });
  };

  const handleAddProgramSubmit = async (e) => {
    e.preventDefault();

    const durationInDays =
      newProgram.durationUnit === "weeks"
        ? parseInt(newProgram.duration) * 7
        : parseInt(newProgram.duration);

    try {
      const response = await fetchWithAuth("/api/organization/program", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProgram,
          duration: durationInDays,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add program");
      }

      const addedProgram = await response.json();

      setPrograms([...programs, addedProgram]);
      setShowAddForm(false);
      setNewProgram({
        name: "",
        duration: "",
        price: "",
        description: "",
      });
    } catch (error) {
      console.error("Error adding program:", error);
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleEditClick = (program) => {
    setEditProgram({
      id: program.id,

      duration: program.duration,
      durationUnit: "days",
      price: program.price,
      description: program.description,
      active: program.active,
    });
    setShowEditForm(true);
    setActiveDropdown(null);
  };

  const handleEditProgramChange = (e) => {
    setEditProgram({ ...editProgram, [e.target.name]: e.target.value });
  };

  const handleEditProgramSubmit = async (e) => {
    e.preventDefault();

    const durationInDays =
      editProgram.durationUnit === "weeks"
        ? parseInt(editProgram.duration) * 7
        : parseInt(editProgram.duration);

    try {
      const response = await fetchWithAuth(
        `/api/organization/updateprogram/${editProgram.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            duration: durationInDays,
            price: editProgram.price,
            description: editProgram.description,
            active: editProgram.active,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update program");
      }

      const updatedProgram = await response.json();

      setPrograms(
        programs.map((program) =>
          program.id === updatedProgram.id ? updatedProgram : program
        )
      );
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating program:", error);
    }
  };
  // delete program
  const handleDeleteClick = (program) => {
    setDeleteProgram({
      id: program.id,

      duration: program.duration,
      price: program.price,
      description: program.description,
      active: false,
    });
    setShowDeleteForm(true);
    setShowDeleteProgramAlert(true);
    setActiveDropdown(null);
  };

  const handleDeleteProgramSubmit = async () => {
    try {
      const response = await fetchWithAuth(
        `/api/organization/updateprogram/${deleteProgram.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            duration: deleteProgram.duration,
            price: deleteProgram.price,
            description: deleteProgram.description,
            active: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete program");
      }

      setPrograms(
        programs.filter((program) => program.id !== deleteProgram.id)
      );
      setShowDeleteForm(false);
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center w-full py-4">
        <CircleSpinner loading={loading} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg px-2 sm:p-6">
      <div className="mb-6">
        <h3 className="text-3xl font-bold text-gray-900">Programs</h3>
        <p className="text-base text-gray-600">List of available programs.</p>
      </div>
      <div className="flex justify-between items-center my-2 w-full flex-wrap gap-4">
        <div className="flex items-center space-x-2 min-w-96 w-96 bg-white rounded-md border py-2 px-2">
          <CiSearch className="text-lg md:text-2xl" />
          <input
            type="text"
            placeholder="Search for a program..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="text-base placeholder:text-gray-500 outline-none w-full"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="flex justify-center items-center space-x-2 px-5 py-2 rounded-lg bg-white hover:bg-blue-50 text-black border hover:border-gray-800 cursor-pointer"
            onClick={() => handleSort("name")}
          >
            {sortConfig.key === "name" && sortConfig.direction === "asc" ? (
              <FaArrowUpAZ className="size-5" />
            ) : (
              <FaArrowDownAZ className="size-5" />
            )}
            <span className="text-xs sm:text-base lg:text-base">
              Alphabetical
            </span>
          </button>
          <button
            className="flex justify-center items-center space-x-2 px-5 py-2 rounded-lg bg-white hover:bg-blue-50 text-black border hover:border-gray-800 cursor-pointer"
            onClick={() => handleSort("createdAt")}
          >
            {sortConfig.key === "createdAt" &&
            sortConfig.direction === "asc" ? (
              <FaArrowUpLong className="size-4" />
            ) : (
              <FaArrowDownLong className="size-4" />
            )}
            <span className="text-xs sm:text-base lg:text-base">
              Date Added
            </span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-5 py-2 bg-blue-300 text-gray-900 font-bold  rounded-lg hover:bg-blue-500"
          >
            <FaPlus />
            <span>New Program</span>
          </button>
        </div>
      </div>
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-30">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <form onSubmit={handleAddProgramSubmit} className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Add New Program
              </h3>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Program Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={newProgram.name}
                  onChange={handleAddProgramChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
                />
              </div>
              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Duration
                </label>
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  value={newProgram.duration}
                  onChange={handleAddProgramChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
                />
                <select
                  name="durationUnit"
                  value={newProgram.durationUnit}
                  onChange={handleAddProgramChange}
                  required
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={newProgram.price}
                  onChange={handleAddProgramChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={newProgram.description}
                  onChange={handleAddProgramChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 py-2 px-4 bg-red-400 hover:bg-red-500 text-white rounded-lg"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-400 hover:bg-blue-500 text-white rounded-lg"
                >
                  Add Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-30">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <form onSubmit={handleEditProgramSubmit} className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Edit Program
              </h3>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={editProgram.price}
                  onChange={handleEditProgramChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={editProgram.description}
                  onChange={handleEditProgramChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 py-2 px-4 bg-red-400 hover:bg-red-500 text-white rounded-lg"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-400 hover:bg-blue-500 text-white rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* //deleteProgram */}

      {showDeleteForm && (
        <Alert
          show={showDeleteForm}
          title="Delete Program"
          message="Are you sure you want to delete the program? This action cannot be undone."
          onCancel={() => setShowDeleteForm(false)}
          onConfirm={handleDeleteProgramSubmit}
          Icon={MdWarning}
          buttonActionText="Delete Program"
        />
      )}

      <div className="">
        <table className="table-fixed w-full">
          <thead className="bg-blue-300">
            <tr>
              <th className="text-left text-sm font-bold uppercase px-4 py-3">
                Name
              </th>
              <th className="text-left text-sm font-bold uppercase px-4 py-3">
                Duration
              </th>
              <th className="text-left text-sm font-bold uppercase px-4 py-3">
                Price
              </th>
              <th className="text-left text-sm font-bold uppercase px-4 py-3">
                Description
              </th>
              <th className="text-left text-sm font-bold uppercase px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPrograms.map((program) => (
              <tr
                key={program.id}
                className="bg-white border hover:bg-slate-200 text-sm "
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {program.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {program.duration} Days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  ${program.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium truncate">
                  {program.description}
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(program.id)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                        />
                      </svg>
                    </button>
                    {activeDropdown === program.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button
                          onClick={() => handleEditClick(program)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(program)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProgramList;
