interface Props {
  collapsed: boolean;
  onOpen: () => void;
  onClose: () => void;
}

import asideLogo from "../assets/images/o'quv-markaz.svg";
import mainLogo from "../assets/images/logo-min.svg";
import dashboardIcon from "../assets/images/dashboard-icon.svg";
import lidsIcon from "../assets/images/lidlar-icon.svg";
import paymentsIcon from "../assets/images/payments-icon.svg";
import registrationIcon from "../assets/images/registration-icon.svg";
import coursesIcon from "../assets/images/courses-icon.svg";
import reportsIcon from "../assets/images/reports-icon.svg";
import tasksIcon from "../assets/images/tasks-icon.svg";
import attendanceIcon from "../assets/images/user-clock-solid-full.svg";
import groupIcon from "../assets/images/graduation-cap-solid-full.svg";
import contractsIcon from "../assets/images/handshake-solid-full.svg";
import { Accordion } from "@mantine/core";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Aside = ({ collapsed, onOpen, onClose }: Props) => {
  const { t } = useTranslation();

  const menu = [
    { label: t("header.controlPanel"), icon: dashboardIcon, path: "/" },
    { label: t("header.lids"), icon: lidsIcon, path: "/lids" },
    { label: t("header.tasks"), icon: tasksIcon, path: "/tasks" },
    { label: t("header.payments"), icon: paymentsIcon, path: "/payments" },
    {
      label: t("header.registration"),
      icon: registrationIcon,
      path: "/registration",
    },
    { label: t("header.courses"), icon: coursesIcon, path: "/courses" },
    { label: t("header.groups"), icon: groupIcon, path: "/groups" },
    { label: t("header.reports"), icon: reportsIcon, path: "/reports" },
    {
      label: t("header.attendance"),
      icon: attendanceIcon,
      path: "/attendance",
    },
    { label: t("header.contracts"), icon: contractsIcon, path: "/contracts" },
  ];

  return (
    <aside
      className={collapsed ? "aside collapsed" : "aside"}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <div className="aside-top">
        <img
          src={collapsed ? mainLogo : asideLogo}
          alt="logo"
          className={collapsed ? "collapsed-logo" : "aside-logo"}
        />
      </div>

      <div className="aside-content">
        <Accordion radius={0} className="sidebar" multiple={false}>
          {menu.map((item) => {
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? "active" : ""}`
                }
              >
                <span className="sidebar-icon">
                  <img src={item.icon} alt={item.label} />
                </span>
                <span className={`sidebar-label ${collapsed ? "hidden" : ""}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </Accordion>
      </div>
    </aside>
  );
};

export default Aside;
