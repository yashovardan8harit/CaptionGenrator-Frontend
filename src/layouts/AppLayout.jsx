// src/layouts/AppLayout.jsx

"use client";
import React, { useState } from "react";
import { Outlet } from "react-router-dom"; // <--- CRUCIAL: Make sure this import is here
import { Sidebar, SidebarBody, SidebarLink } from "./../components/ui/sidebar";
import { Home, LogOut, Settings, User } from "lucide-react";
import { BackgroundBeamsWithCollision } from "./../components/ui/background";
import { motion } from "framer-motion";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <User className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5 shrink-0" />,
    },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar remains the same */}
      <div className="fixed left-0 top-0 h-full z-20">
        <Sidebar 
          className="h-full border-r border-neutral-800 bg-neutral-900"
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        >
          <SidebarBody className="flex flex-col justify-between h-full px-4 py-6">
            <div className="space-y-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
            <div className="pt-6 border-t border-neutral-700">
              <SidebarLink
                link={{
                  label: "Logout",
                  href: "/logout",
                  icon: <LogOut className="h-5 w-5 shrink-0" />,
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* Main content area */}
      <motion.main 
        className="flex-1 relative bg-black text-white overflow-y-auto h-screen"
        animate={{
          marginLeft: sidebarOpen ? "300px" : "60px"
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        {/* The background is part of the layout */}
        <div className="fixed inset-0 z-0">
          <BackgroundBeamsWithCollision />
        </div>
        
        {/* 
          THIS IS THE CRUCIAL PART!
          The <Outlet/> tells React Router where to render the child routes
          (Dashboard, Profile, or Settings).
          All the caption generator UI should be GONE from this file.
        */}
        <Outlet />
        
      </motion.main>
    </div>
  );
};

export default AppLayout;