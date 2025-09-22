"use client";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaBookOpen, FaUsers } from "react-icons/fa";
import { MdDashboard, MdEmail } from "react-icons/md";
import { PiPackageBold } from "react-icons/pi";
import {
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiMailSendFill,
} from "react-icons/ri";
import { TbLogout } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { signOutRequest } from "../../store/auth/authSlice";
import classes from "./SideBar.module.css";
import { BsChatLeftTextFill } from "react-icons/bs";

const RenderItem = ({ icon, title, subMenu = [], path }) => {
  const navigate = useRouter();
  const active = usePathname();
  const [subnav, setSubnav] = useState(false);

  const subActive = subMenu.find((item, index) => item?.path == active);

  const showSubnav = () => setSubnav(!subnav);
  return (
    <>
      <div
        className={[
          classes?.listItemContainer,
          path == active && classes?.active,
          subActive && classes?.subActive,
          subnav && classes?.marginZero,
        ].join(" ")}
        onClick={() => {
          if (subMenu?.length > 0) {
            showSubnav(!subnav);
          } else {
            navigate.push(path);
          }
        }}
      >
        {icon}
        <span>{title}</span>
        {subMenu?.length > 0 &&
          (subnav ? (
            <RiArrowUpSFill
              size={20}
              color={"white"}
              className={classes?.dropDownIcon}
            />
          ) : (
            <RiArrowDownSFill
              size={20}
              color={"white"}
              className={classes?.dropDownIcon}
            />
          ))}
      </div>
      {subnav &&
        subMenu.map((item, index) => {
          return (
            <div
              className={[
                classes?.innerItemContainer,
                item?.path == active && classes?.active,
              ].join(" ")}
              key={index}
              onClick={() => {
                navigate(item?.path);
              }}
            >
              <span>{item.label}</span>
            </div>
          );
        })}
    </>
  );
};

const SideBar = () => {
  const dispatch = useDispatch();
  const navigate = useRouter();

  const HandleSubmitSignOut = () => {
    Cookies.remove("xpdx");
    Cookies.remove("role");
    dispatch(signOutRequest());

    navigate.replace("/login");
  };

  return (
    <div className={classes?.mainContainer}>
      <div className={classes.logoContainer}>
        <h4 className="text-white text-center mt-4">
          <span>Nexus</span> <span className="text-xl block">AI Space</span>
        </h4>
      </div>
      <div className={classes.itemsContainer}>
        <>
          <RenderItem
            title={"Dashboard"}
            icon={<MdDashboard size={22} color={"rgba(255, 255, 255, 0.6)"} />}
            path={"/admin/dashboard"}
          />
          <RenderItem
            title={"Users"}
            icon={<FaUsers size={22} color={"rgba(255, 255, 255, 0.6)"} />}
            path={"/admin/users"}
          />
          <RenderItem
            title={"Sessions"}
            icon={<FaBookOpen size={22} color={"rgba(255, 255, 255, 0.6)"} />}
            path={"/admin/sessions"}
          />
          <RenderItem
            title={"Reviews"}
            icon={
              <BsChatLeftTextFill
                size={22}
                color={"rgba(255, 255, 255, 0.6)"}
              />
            }
            path={"/admin/reviews"}
          />
          <RenderItem
            title={"Plans"}
            icon={
              <PiPackageBold size={22} color={"rgba(255, 255, 255, 0.6)"} />
            }
            path={"/admin/plans"}
          />
          <RenderItem
            title={"Emails Report"}
            icon={<MdEmail size={22} color={"rgba(255, 255, 255, 0.6)"} />}
            path={"/admin/emails"}
          />
          <RenderItem
            title={"Send Emails"}
            icon={
              <RiMailSendFill size={22} color={"rgba(255, 255, 255, 0.6)"} />
            }
            path={"/admin/send-emails"}
          />
        </>
        <div
          className={[classes?.listItemContainer].join(" ")}
          onClick={() => {
            HandleSubmitSignOut();
          }}
        >
          <TbLogout size={22} color={"rgba(255, 255, 255, 0.6)"} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
