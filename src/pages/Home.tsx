import { useTranslation } from 'react-i18next';
import ControlCard from '../components/ControlCard';
import WeeklySalesChart from '../components/WeeklySalesChart';

const Home = () => {
  const { t } = useTranslation();
  return (
    <section className="control container">
      <div className="control-top">
        <ControlCard />
      </div>

      <div className="control-content">
        <div className="control-content-left">
          <h1>{t('home.weeklySales')}</h1>

          <div className="chart">
            <WeeklySalesChart />
          </div>
        </div>

        <div className="control-content-right">
          <h1>{t('home.saleType')}</h1>

          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              marginTop: 35,
              gap: 10,
            }}
          >
            <h4>
              {t('home.saleAmount')} <span>12{t('home.piece')}</span>
            </h4>
            <h5>
              {t('home.inCash')} <span>3.500.000</span>
            </h5>
            <h5>
              {t('home.byCard')} <span>750.000</span>
            </h5>
            <h5>
              {t('home.bank')} <span>2.000.000</span>
            </h5>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'center',
              marginTop: 45,
            }}
          >
            <h2>{t('home.totalPrice')}</h2>

            <div
              style={{
                width: '100%',
                paddingTop: 12,
                borderTop: '1px solid #003366',
                textAlign: 'center',
              }}
            >
              <h3>6.250.000{t('home.sum')}</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
