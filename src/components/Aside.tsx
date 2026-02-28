interface Props {
  collapsed: boolean;
  onOpen: () => void;
  onClose: () => void;
}

import asideLogo from "../assets/images/o'quv-markaz.svg";
import mainLogo from '../assets/images/logo-min.svg';
import dashboardIcon from '../assets/images/dashboard-icon.svg';
import lidsIcon from '../assets/images/lidlar-icon.svg';
import paymentsIcon from '../assets/images/payments-icon.svg';
import registrationIcon from '../assets/images/registration-icon.svg';
import coursesIcon from '../assets/images/courses-icon.svg';
import reportsIcon from '../assets/images/reports-icon.svg';
import tasksIcon from '../assets/images/tasks-icon.svg';
import { Accordion } from '@mantine/core';
import { NavLink } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';

const Aside = ({ collapsed, onOpen, onClose }: Props) => {
  // const { t } = useTranslation();

  const menu = [
    { label: 'Dashboard', icon: dashboardIcon, path: '/' },
    { label: 'LIDlar', icon: lidsIcon, path: '/lids' },
    { label: "To'lovlar", icon: paymentsIcon, path: '/payments' },
    { label: "Ro'yhatga olish", icon: registrationIcon, path: '/registration' },
    { label: 'Kurslar', icon: coursesIcon, path: '/courses' },
    { label: 'Hisobotlar', icon: reportsIcon, path: '/reports' },
    { label: 'Vazifalar', icon: tasksIcon, path: '/tasks' },
  ];

  return (
    <aside
      className={collapsed ? 'aside collapsed' : 'aside'}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <div className="aside-top">
        <img
          src={collapsed ? mainLogo : asideLogo}
          alt="logo"
          className={collapsed ? 'collapsed-logo' : 'aside-logo'}
        />
      </div>

      <div className="aside-content">
        <Accordion radius={0} className="sidebar" multiple={false}>
          {menu.map((item) => {
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-icon">
                  <img src={item.icon} alt={item.label} />
                </span>
                <span className={`sidebar-label ${collapsed ? 'hidden' : ''}`}>{item.label}</span>
              </NavLink>
            );
          })}
        </Accordion>
      </div>
    </aside>
  );
};

export default Aside;
