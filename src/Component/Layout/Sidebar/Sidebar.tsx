import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const SIDEBAR_TABS = [
    { name: "Your Restaurants", path: "/restaurants" },
    { name: "Add Restaurant", path: "/list-your-restaurant" },
    { name: "Reservation request", path: "/reservation-request" },
  ];

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <aside
      id="logo-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
      aria-label="Sidebar"
    >
      <div className="h-full  pb-4 overflow-y-auto bg-white dark:bg-gray-800 mt-14">
        <ul className="space-y-2 font-medium">
          {SIDEBAR_TABS?.map((tab) => (
            <li key={tab.name} className="">
              <button
                className="flex items-center p-3 text-gray-900 w-full rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => handleTabClick(tab.path)}
              >

                <span className="ml-3">{tab.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
