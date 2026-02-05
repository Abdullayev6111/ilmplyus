import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ChartItem = {
  day: string;
  naqd: number;
  karta: number;
  bank: number;
};

const COLORS = {
  naqd: '#26ff00',
  karta: '#3f88c9',
  bank: '#fe0000',
};

const WeeklySalesChart = () => {
  const { t } = useTranslation();

  const data = useMemo<ChartItem[]>(
    () => [
      { day: t('home.day1'), naqd: 40, karta: 70, bank: 35 },
      { day: t('home.day2'), naqd: 50, karta: 30, bank: 55 },
      { day: t('home.day3'), naqd: 65, karta: 15, bank: 35 },
      { day: t('home.day4'), naqd: 20, karta: 25, bank: 15 },
      { day: t('home.day5'), naqd: 70, karta: 55, bank: 30 },
      { day: t('home.day6'), naqd: 40, karta: 70, bank: 35 },
    ],
    [t],
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />

        <Bar barSize={28} dataKey="naqd" fill={COLORS.naqd} radius={[6, 6, 0, 0]} />
        <Bar barSize={28} dataKey="karta" fill={COLORS.karta} radius={[6, 6, 0, 0]} />
        <Bar barSize={28} dataKey="bank" fill={COLORS.bank} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklySalesChart;
