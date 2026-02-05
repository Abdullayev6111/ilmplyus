import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

type ControlItem = {
  id: number;
  title: string;
  number: string;
  path: string;
};

const ControlCard = () => {
  const { t } = useTranslation();
  const controlData: ControlItem[] = [
    { id: 1, title: t('home.dailySale'), number: `13.200.000 ${t('home.sum')}`, path: '/' },
    { id: 2, title: t('home.users'), number: `74 ${t('home.piece')}`, path: '/users' },
    { id: 3, title: t('home.errors'), number: `11 ${t('home.piece')}`, path: '/' },
    { id: 4, title: t('home.branches'), number: `4 ${t('home.piece')}`, path: '/branches' },
    { id: 5, title: t('home.products'), number: `10 ${t('home.piece')}`, path: '/' },
  ];
  return (
    <>
      {controlData.map((item) => (
        <NavLink key={item.id} to={item.path} className="control-card">
          <h4>{item.title}</h4>
          <p>{item.number}</p>
        </NavLink>
      ))}
    </>
  );
};

export default ControlCard;
