"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Menu from "./../public/menu.svg";
import MobConnect from "./ConnectWallet";

interface MobileNavProps {
  className?: string;
}

const MobileNav: React.FC<MobileNavProps> = ({ className = "" }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getHeaderText = () => {
    switch (pathname) {
      case "/":
        return "Bridge Assets";
      case "/bridge-transaction":
        return "Bridge Transaction";
      // Add more cases for other routes as needed
      default:
        return "Bridge dApp";
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header
        className={`bg-[#000000] text-white h-16 border-b border-b-[#3E4347] ${className}`}
      >
        <div className="container mx-auto flex items-center h-full px-4 relative">
          <div
            className="absolute left-4 cursor-pointer"
            onClick={toggleSidebar}
          >
            <Image src={Menu} alt="menu" width={14} height={10} />
          </div>
          <span className="text-[#A6A9B8] font-bold text-xl flex-grow text-center">
            {getHeaderText()}
          </span>
          <MobConnect />
        </div>
        
          

      </header>

      {/* Sidebar */}
      <div
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-[#1A1A1A] transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <h2 className="text-[#A6A9B8] text-xl font-bold mb-4">Menu</h2>
          {/* Add your sidebar content here */}
          <ul className="text-[#A6A9B8]">
            <li className="mb-2 cursor-pointer hover:text-white">Home</li>
            <li className="mb-2 cursor-pointer hover:text-white">Bridge</li>
            <li className="mb-2 cursor-pointer hover:text-white">Settings</li>
          </ul>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default MobileNav;
