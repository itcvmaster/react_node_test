import React, { useEffect, useState, useRef } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserSidebar from "./UserSidebar";
import Column from "./Column";
import SortableItem from "./SortableItem";
import notificationSound from "./notification.mp3";

const UserDashboard = () => {
  const [tasks, setTasks] = useState({
    "To Do": [],
    "In Progress": [],
    Completed: [],
  });
  const [filter, setFilter] = useState("all"); // Add filter state
  const [search, setSearch] = useState(""); // Add search state

  const [notes, setNotes] = useState(localStorage.getItem("notes") || "");
  const audioRef = useRef(new Audio(notificationSound));

  // Helper to load and categorize tasks from localStorage
  const loadAndCategorizeTasks = () => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const categorizedTasks = {
      "To Do": storedTasks.filter((task) => task.progress <= 40),
      "In Progress": storedTasks.filter((task) => task.progress > 40 && task.progress <= 80),
      Completed: storedTasks.filter((task) => task.progress > 80),
    };
    setTasks(categorizedTasks);
    checkDeadlines(storedTasks);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // On first load, if no tasks, initialize with mock data
    if (!localStorage.getItem("tasks")) {
      const mockTasks = [
        {
          id: '1',
          title: 'Complete project documentation',
          description: 'Write comprehensive documentation for the TaskFlow project',
          progress: 0,
          priority: 'High',
          deadline: new Date().toISOString(),
          status: 'incomplete',
        },
        {
          id: '2',
          title: 'Fix navigation bug',
          description: 'Address the issue with sidebar navigation on mobile devices',
          progress: 100,
          priority: 'Medium',
          deadline: new Date().toISOString(),
          status: 'complete',
        },
        {
          id: '3',
          title: 'Implement user feedback',
          description: 'Add the user feedback form to the dashboard',
          progress: 50,
          priority: 'Low',
          deadline: new Date(Date.now() + 86400000).toISOString(),
          status: 'incomplete',
        },
        {
          id: '4',
          title: 'Update dependencies',
          description: 'Update all npm packages to their latest versions',
          progress: 20,
          priority: 'Medium',
          deadline: new Date(Date.now() + 172800000).toISOString(),
          status: 'incomplete',
        }
      ];
      localStorage.setItem("tasks", JSON.stringify(mockTasks));
    }
    loadAndCategorizeTasks();
    // Listen for storage changes (from other tabs/components)
    const handleStorage = (e) => {
      if (e.key === "tasks") {
        loadAndCategorizeTasks();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", notes);
  }, [notes]);

  const checkDeadlines = (tasks) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    tasks.forEach((task) => {
      if (task.deadline === today) {
        showNotification(`🚨 Task Due Today: "${task.title}"`, "bg-red-500 text-white");
      } else if (task.deadline === tomorrowStr) {
        showNotification(`⏳ Task Due Tomorrow: "${task.title}"`, "bg-yellow-500 text-black");
      }
    });
  };

  const showNotification = (message, bgClass) => {
    toast(
      <div className={`p-2 rounded-lg shadow-md font-semibold text-lg ${bgClass}`}>
        {message}
      </div>,
      { position: "top-right", autoClose: 5000, hideProgressBar: false }
    );
    audioRef.current.play();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceColumn = Object.keys(tasks).find((column) =>
      tasks[column].some((task) => task.id === active.id)
    );
    const targetColumn = Object.keys(tasks).find((column) => tasks[column].some((task) => task.id === over.id)) || over.id;

    if (!sourceColumn || !targetColumn || sourceColumn === targetColumn) return;

    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      const movedTask = updatedTasks[sourceColumn].find((task) => task.id === active.id);
      updatedTasks[sourceColumn] = updatedTasks[sourceColumn].filter((task) => task.id !== active.id);
      updatedTasks[targetColumn] = [...(updatedTasks[targetColumn] || []), movedTask];

      return updatedTasks;
    });

    localStorage.setItem("tasks", JSON.stringify([...tasks["To Do"], ...tasks["In Progress"], ...tasks["Completed"]]));
  };

  // Task Analytics Chart Data (Bar Graph)
  const chartData = {
    labels: ["To Do", "In Progress", "Completed"],
    datasets: [
      {
        label: "Number of Tasks",
        data: [
          tasks["To Do"].length,
          tasks["In Progress"].length,
          tasks.Completed.length,
        ],
        backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"],
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-gray-100">
      <UserSidebar />

      <div className="flex-1 p-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          🚀 User Dashboard
        </h2>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar />

        {/* Filter and Search Controls */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center">
            <label className="mr-2 font-semibold text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 w-full sm:w-64"
          />
        </div>

        {/* Kanban Board */}
        <div className="glassmorphism p-4 rounded-xl shadow-lg bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg border border-white/20">
          <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(tasks).map((columnKey) => {
                // Filtering logic for each column
                let showColumn = true;
                if (filter === "completed" && columnKey !== "Completed") showColumn = false;
                if (filter === "incomplete" && columnKey === "Completed") showColumn = false;
                if (!showColumn) return null;
                // Filter tasks in the column by search
                const filteredTasks = tasks[columnKey].filter(task =>
                  task.title.toLowerCase().includes(search.trim().toLowerCase())
                );
                return (
                  <Column key={columnKey} title={columnKey} id={columnKey} className="w-[280px]">
                    <SortableContext items={filteredTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                      {filteredTasks.map((task) => (
                        <SortableItem key={task.id} id={task.id} task={task} />
                      ))}
                    </SortableContext>
                  </Column>
                );
              })}
            </div>
          </DndContext>
        </div>

        {/* Task Analytics & Notes Section */}
        <div className="mt-10 flex flex-col lg:flex-row items-start gap-6">
          {/* Task Analytics Chart */}
          <div className="p-6 w-full lg:w-1/2 bg-white shadow-lg rounded-xl border border-gray-300">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center tracking-wide uppercase">
              📊 Task Analytics
            </h2>
            <Bar data={chartData} />
          </div>

          {/* Notes */}
          <div className="p-6 w-full lg:w-[590px] bg-green-900 text-white rounded-xl border-[12px] border-[#8B4501] shadow-lg flex flex-col">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2 text-center">📌 Notes</h2>

            {/* Notes Input Field - Enlarged to match Task Analytics */}
            <textarea
              className="flex-1 bg-transparent border-none outline-none text-white text-lg p-7"
              placeholder="Write your notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              autoFocus
              style={{
                fontFamily: "Chalkduster, Comic Sans MS, cursive",
                height: "320px",
                minHeight: "280px",
                textAlign: "left",
                resize: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
