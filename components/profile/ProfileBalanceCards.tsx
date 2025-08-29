import React, { useState, useEffect } from 'react';
import { Wallet, Coins, Play } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { getUserAdStats } from '../../firebase/services/adService';
import { getUserEarnings } from '../../firebase/services/userEarningsService';
import { UserAdStats, UserEarning } from '../../firebase/types/ads';
import { User } from '../../firebase/types/user';
import { formatFog, formatUsd, getFogCoinSettingsWithCache, formatFogWithUsdSync } from '../../utils/fogCoinUtils';
import { FogCoinSettings } from '../../firebase/types/fogCoinSettings';

interface BalanceCardProps {
  icon: React.ElementType;
  title: string;
  amount: string;
  description: string;
  cta: string;
  onClick?: () => void;
}

const BalanceCard = React.memo(({ icon: Icon, title, amount, description, cta, onClick }: BalanceCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4 pt-4 pb-2">
      <div className="flex justify-between items-start mt-4">
        <div>
          <p className="text-sm font-medium text-[--color-text-secondary]">{title}</p>
          <p className="text-2xl font-bold text-[--color-text-primary] mt-1">{amount}</p>
          <p className="text-xs text-[--color-text-secondary] mt-1">{description}</p>
        </div>
        <Icon className="w-6 h-6 text-[--color-text-secondary]/70"/>
      </div>
      <Button variant="link" className="p-0 h-auto mt-2 text-sm" onClick={onClick}>
        {cta}
      </Button>
    </CardContent>
  </Card>
));

BalanceCard.displayName = 'BalanceCard';

interface ProfileBalanceCardsProps {
  currentUser: User | null;
  navigate?: (route: string) => void;
}

const ProfileBalanceCards = React.memo(({ currentUser, navigate }: ProfileBalanceCardsProps) => {
  const [userStats, setUserStats] = useState<UserAdStats | null>(null);
  const [userEarnings, setUserEarnings] = useState<UserEarning | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fogSettings, setFogSettings] = useState<FogCoinSettings | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const [stats, earnings, settings] = await Promise.all([
          getUserAdStats(currentUser.uid),
          getUserEarnings(currentUser.uid),
          getFogCoinSettingsWithCache()
        ]);
        setUserStats(stats);
        setUserEarnings(earnings);
        setFogSettings(settings);
      } catch (error) {
        console.error('Error loading data:', error);
        // Set fallback settings if FOG settings fail
        setFogSettings({
          id: 'fallback',
          fogToUsdRate: 0.10,
          minimumWithdrawAmount: 50,
          maximumDailyEarnings: 100,
          isWithdrawalsEnabled: true,
          lastUpdatedBy: 'system',
          lastUpdatedAt: new Date(),
          effectiveFrom: new Date(),
          notes: 'Fallback settings'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleWatchAds = () => {
    navigate?.('watch-ads');
  };

  const handleWithdraw = () => {
    // TODO: Implement withdrawal functionality
    console.log('Withdraw clicked');
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 pt-4">
              <div className="h-4 bg-[--color-bg-tertiary] rounded mb-2"></div>
              <div className="h-8 bg-[--color-bg-tertiary] rounded mb-2"></div>
              <div className="h-3 bg-[--color-bg-tertiary] rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ✅ NEW: Get earnings from centralized UserEarning collection (3 sources only)
  const totalEarningsFog = userEarnings?.totalEarnings || 0;
  const availableBalanceFog = userEarnings?.depositEarnings || 0;
  const adsEarningsFog = userEarnings?.adsEarnings || 0;
  // const transferEarningsFog = userEarnings?.transferEarnings || 0;
  const referralEarningsFog = userEarnings?.referralEarnings || 0;
  const adsWatched = userStats?.totalAdsWatched || 0;
  const todaysCount = userStats?.dailyWatchCount || userStats?.todaysCount || 0;
  const currentRate = fogSettings?.fogToUsdRate || 0.10;

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <BalanceCard 
        icon={Wallet} 
        title="Total Earnings" 
        amount={formatFog(totalEarningsFog)} 
        description={`≈ ${formatUsd(totalEarningsFog * currentRate)} USD `} 
        cta="Withdraw"
        onClick={handleWithdraw}
      />
      <BalanceCard 
        icon={Coins} 
        title="Available Balance" 
        amount={formatFog(availableBalanceFog)} 
        description={`≈ ${formatUsd(availableBalanceFog * currentRate)} ready to use`} 
        cta="Transfer Coins"
      />
      <BalanceCard 
        icon={Play} 
        title="Ads Watched" 
        amount={adsWatched.toString()} 
        // description={`${todaysCount} watched today | ${formatFog(adsEarningsFog)} earned`} 
        description={`${todaysCount} watched today `} 
        cta="Watch More"
        onClick={handleWatchAds}
      />
    </div>
  );
});

ProfileBalanceCards.displayName = 'ProfileBalanceCards';

export default ProfileBalanceCards;
