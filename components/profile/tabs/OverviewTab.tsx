import React, { useState, useEffect } from 'react';
import { Eye, Target, TrendingUp, Calendar, ArrowDownLeft, ArrowUpRight, Users } from 'lucide-react';
import { User as FirebaseUser, UserProfile } from '../../../firebase/types/user';
import { getUserAdStats, getUserDailyActivity } from '../../../firebase/services/adService';
import { getUserEarnings } from '../../../firebase/services/userEarningsService';
import { UserAdStats, UserDailyActivity, UserEarning } from '../../../firebase/types/ads';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { formatFog, formatUsd, getFogCoinSettingsWithCache } from '../../../utils/fogCoinUtils';
import { FogCoinSettings } from '../../../firebase/types/fogCoinSettings';

interface OverviewTabProps {
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
}

const OverviewTab = React.memo(({ userProfile, currentUser }: OverviewTabProps) => {
  const [userStats, setUserStats] = useState<UserAdStats | null>(null);
  const [dailyActivity, setDailyActivity] = useState<UserDailyActivity | null>(null);
  const [userEarnings, setUserEarnings] = useState<UserEarning | null>(null);
  const [fogSettings, setFogSettings] = useState<FogCoinSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const [stats, dailyAct, earnings, settings] = await Promise.all([
          getUserAdStats(currentUser.uid),
          getUserDailyActivity(currentUser.uid, today),
          getUserEarnings(currentUser.uid),
          getFogCoinSettingsWithCache()
        ]);

        setUserStats(stats);
        setDailyActivity(dailyAct);
        setUserEarnings(earnings);
        setFogSettings(settings);
      } catch (error) {
        console.error('Error loading overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-[--color-bg-tertiary] rounded mb-2"></div>
              <div className="h-8 bg-[--color-bg-tertiary] rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const todaysAds = dailyActivity?.adsWatched || 0;
  const todaysEarnings = dailyActivity?.earningsToday || 0;
  const totalAdsWatched = userStats?.totalAdsWatched || 0;
  
  // ✅ NEW: Simplified 3 earning sources
  const totalEarnings = userEarnings?.totalEarnings || 0;
  const availableBalance = userEarnings?.availableBalance || 0;
  const adsEarnings = userEarnings?.adsEarnings || 0;
  const transferEarnings = userEarnings?.depositEarnings || 0;
  const referralEarnings = userEarnings?.referralEarnings || 0;
  
  const currentRate = fogSettings?.fogToUsdRate || 0.10;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[--color-text-primary]">Earning Sources Overview</h3>
      
      {/* 3 Earning Sources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4  text-center">
            <div className="flex items-center mt-4 justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-[--color-text-primary]">{formatFog(adsEarnings)}</p>
            <p className="text-sm text-[--color-text-secondary]">From Ads</p>
            <p className="text-xs text-blue-600 mt-1">{totalAdsWatched} ads watched</p>
            <p className="text-xs text-[--color-text-secondary]">≈ {formatUsd(adsEarnings * currentRate)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center mt-4 justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <ArrowDownLeft className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xl font-bold text-[--color-text-primary]">{formatFog(transferEarnings)}</p>
            <p className="text-sm text-[--color-text-secondary]">From Transfers</p>
            <p className="text-xs text-green-600 mt-1">Received coins</p>
            <p className="text-xs text-[--color-text-secondary]">≈ {formatUsd(transferEarnings * currentRate)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center mt-4 justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            {/* <p className="text-xl font-bold text-[--color-text-primary]">{formatFog(referralEarnings) || 0}</p> */}
            <p className="text-xl font-bold text-[--color-text-primary]">0 FOG</p>
            <p className="text-sm text-[--color-text-secondary]">From Referrals</p>
            <p className="text-xs text-purple-600 mt-1">Share & earn</p>
            <p className="text-xs text-[--color-text-secondary]">≈ {formatUsd(referralEarnings * currentRate)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Total Earnings Summary */}
      {/* <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-[--color-text-secondary]">Available Earnings</p>
              <p className="text-2xl font-bold text-[--color-text-primary]">{formatFog(availableBalance)}</p>
              <p className="text-sm text-[--color-text-secondary]">≈ {formatUsd(availableBalance * currentRate)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[--color-text-secondary]">Total Earned</p>
              <p className="text-xl font-bold text-[--color-text-primary]">{formatFog(totalEarnings)}</p>
              <p className="text-xs text-[--color-text-secondary]">All-time earnings</p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[--color-text-secondary]">Ads Watched Today</span>
              <span className="text-[--color-text-primary]">{todaysAds} / 50</span>
            </div>
            <div className="w-full bg-[--color-bg-tertiary] rounded-full h-2">
              <div 
                className="bg-[--color-primary] h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((todaysAds / 50) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[--color-text-secondary]">Today's Earnings</span>
              <span className="text-[--color-text-primary]">{formatFog(todaysEarnings)}</span>
            </div>
            <p className="text-xs text-[--color-text-secondary] text-center">
              {todaysAds >= 50 
                ? "You've reached your daily limit! Come back tomorrow for more ads." 
                : `Watch ${50 - todaysAds} more ads to reach your daily limit.`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

OverviewTab.displayName = 'OverviewTab';

export default OverviewTab;
