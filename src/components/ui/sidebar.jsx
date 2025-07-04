// src/components/ui/sidebar.jsx

"use client";
import { cn } from "./../../lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion"; // Corrected import
import { IconMenu2, IconX } from "@tabler/icons-react";
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

// NEW: Import NavLink from react-router-dom
import { NavLink } from "react-router-dom";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// --- No changes to the components below this line ---

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true
}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;
  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-950 border-r border-neutral-800 w-[240px] shrink-0", // Adjusted background color and width
          className
        )}
        animate={{
          width: animate ? (open ? "240px" : "60px") : "240px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}>
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-950 w-full" // Adjusted background
        )}
        {...props}>
        <div className="flex justify-end z-20 w-full">
          <IconMenu2
            className="text-neutral-200"
            onClick={() => setOpen(!open)} />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-neutral-900 p-10 z-[100] flex flex-col justify-between text-white",
                className
              )}>
              <div
                className="absolute right-10 top-10 z-50 text-neutral-200"
                onClick={() => setOpen(!open)}>
                <IconX />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};


// --- UPDATED SidebarLink COMPONENT ---
export const SidebarLink = ({
  link,
  className,
  ...props
}) => {
  const { open, animate } = useSidebar();

  // Handle the "Logout" button specifically
  if (link.label === "Logout") {
    const handleLogout = async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    return (
      <a
        href={link.href}
        onClick={handleLogout}
        className={cn(
          "flex items-center justify-start gap-2 group/sidebar py-2 cursor-pointer text-neutral-400 hover:bg-red-600/20 hover:text-red-300 rounded-md px-2",
          open ? "justify-start gap-2" : "justify-center",
          className
        )}
        {...props}
      >
        {link.icon}
        <motion.span
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0">
          {link.label}
        </motion.span>
      </a>
    );
  }

  // Handle all other navigation links using NavLink
  return (
    <NavLink
      to={link.href}
      end={link.href === "/"} // Use `end` for the dashboard link to not match all child routes
      className={({ isActive }) => cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 cursor-pointer transition-colors rounded-md px-2",
        open ? "justify-start gap-2" : "justify-center",
        isActive
          ? "bg-purple-600/20 text-purple-300"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-white",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </NavLink>
  );
};