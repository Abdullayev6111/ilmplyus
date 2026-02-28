import { useLocation } from 'react-router-dom';
import LanguageSelect from './LanguageSelect/LanguageSelect';
import adminImg from '../assets/images/admin-img.svg';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const pageTitles: Record<string, string> = {
    '/': t('header.controlPanel'),
    '/tasks': t('header.tasks'),
    '/users': t('header.users'),
    '/courses': t('header.courses'),
    '/lids': t('header.lids'),
    '/reports': t('header.reports'),
    '/payments': t('header.payments'),
    '/registration': t('header.registration'),
  };

  const title = pageTitles[pathname] ?? t('header.controlPanel');

  return (
    <header>
      <div className="header-left">
        <h1>{title}</h1>
        <form
          className="header-left-form"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder={t('registration.inputPlaceholder')} />
        </form>
      </div>

      <div className="header-right">
        <div className="header-right-buttons">
          <LanguageSelect />
          <button className="notification-btn">
            <i className="fa-solid fa-bell"></i>
          </button>
          <button className="chat-btn">
            <i className="fa-regular fa-message"></i>
          </button>
        </div>

        <div className="header-right-admin">
          <div style={{ textAlign: 'right' }}>
            <h1>{t('header.adminName')}</h1>
            <h3>{t('header.role')}</h3>
          </div>
          <div className="header-right-admin-card">
            <img src={adminImg} alt="admin avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
