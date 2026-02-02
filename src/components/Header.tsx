import userIcon from '../assets/images/user-icon.svg';
import LanguageSelect from './LanguageSelect/LanguageSelect';

const Header = () => {
  return (
    <header className="header">
      <LanguageSelect />
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div className="user-icon-circle">
          <img src={userIcon} alt="" />
        </div>

        <div>
          <h1 className="user-name">Obidov Ibrohim</h1>
          <p className="user-role">Administrator</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
