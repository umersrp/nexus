"use client";
import { isMobileViewHook } from "@/custom-hooks/isMobileViewHook";
import { useEffect, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import Drawer from "react-modern-drawer";
import Header from "../Header";
import SideBar from "../SideBar";
import classes from "./SideBarSkeleton.module.css";

const SideBarSkeleton = ({ heading, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    isMobileViewHook(setIsMobile);
  }, []);

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <style>{`
        .drawerContainer {
          width: 320px !important;
        }
        @media (max-width: 768px) {
          .drawerContainer {
            width: 290px !important;
          }
        }
      `}</style>
      <div fluid className="g-0">
        <div className="g-0 flex h-screen">
          <div className={[!isMobile && classes.sidebarDiv].join(" ")}>
            {!isMobile ? (
              <SideBar />
            ) : (
              <Drawer
                open={isOpen}
                onClose={toggleDrawer}
                direction="left"
                className="drawerContainer"
              >
                <SideBar />
              </Drawer>
            )}
          </div>
          <div className={[!isMobile && classes.contentDiv].join(" ")}>
            {isMobile && (
              <GiHamburgerMenu
                className={[classes.GiHamburgerMenu]}
                onClick={() => {
                  toggleDrawer();
                }}
              />
            )}
            <div style={{ paddingLeft: isMobile ? "20px" : "0" }}>
              <Header heading={heading} />
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBarSkeleton;