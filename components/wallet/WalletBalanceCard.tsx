import React, { useState, useEffect } from 'react';
import { Wallet, Send, QrCode, ArrowUpRight, ArrowDownLeft, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { WalletBalance, WalletStats, WalletTransfer, UserWallet } from '../../firebase/types/wallet';
import { getWalletBalance, getWalletStats, getUserTransfers, getUserWallet } from '../../firebase/services/walletService';
import { formatWalletAddress } from '../../utils/qrUtils';
import { type Route } from '../../types';
import ShareProfileModal from './ShareProfileModal';
import TransferCoinsModal from './TransferCoinsModal';

interface WalletBalanceCardProps {
  userId: string;
  userName?: string;
  navigate?: (route: Route) => void;
}

export default function WalletBalanceCard({ 
  userId, 
  userName = 'User',
  navigate
}: WalletBalanceCardProps) {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [recentTransfers, setRecentTransfers] = useState<WalletTransfer[]>([]);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, [userId]);

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      const [balanceData, statsData, transfersData, walletData] = await Promise.all([
        getWalletBalance(userId),
        getWalletStats(userId),
        getUserTransfers(userId, 5), // Get last 5 transfers
        getUserWallet(userId)
      ]);

      setBalance(balanceData);
      setStats(statsData);
      setRecentTransfers(transfersData);
      setWallet(walletData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardContent className="p-6">
          <div className="h-8 bg-[--color-bg-tertiary] rounded mb-4"></div>
          <div className="h-12 bg-[--color-bg-tertiary] rounded mb-4"></div>
          <div className="h-6 bg-[--color-bg-tertiary] rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const getTransferIcon = (transfer: WalletTransfer) => {
    return transfer.fromUserId === userId ? (
      <ArrowUpRight className="w-4 h-4 text-red-600" />
    ) : (
      <ArrowDownLeft className="w-4 h-4 text-green-600" />
    );
  };

  const getTransferLabel = (transfer: WalletTransfer) => {
    return transfer.fromUserId === userId ? 'Sent' : 'Received';
  };

  const getTransferAmount = (transfer: WalletTransfer) => {
    const prefix = transfer.fromUserId === userId ? '-' : '+';
    const colorClass = transfer.fromUserId === userId ? 'text-red-600' : 'text-green-600';
    return { prefix, colorClass };
  };

  const handleShareProfile = () => {
    setShowShareModal(true);
  };

  const handleTransferCoins = () => {
    setShowTransferModal(true);
  };

  const handleTransferComplete = () => {
    loadWalletData(); // Reload wallet data after transfer
    setShowTransferModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Overview */}
      <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Wallet Balance</h3>
                <p className="text-white text-opacity-80 text-sm">Your FOG coin wallet</p>
              </div>
            </div>
            <Button
              onClick={handleShareProfile}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
              size="sm"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-3xl font-bold">{balance?.totalBalance.toFixed(2) || '0.00'} FOG</div>
              <div className="text-white text-opacity-80 text-sm">
                Available: {balance?.availableBalance.toFixed(2) || '0.00'} FOG
              </div>
            </div>
            
            {balance?.pendingIncoming && balance.pendingIncoming > 0 && (
              <div className="text-sm text-white text-opacity-70">
                Pending incoming: {balance.pendingIncoming.toFixed(2)} FOG
              </div>
            )}
            
            {balance?.pendingOutgoing && balance.pendingOutgoing > 0 && (
              <div className="text-sm text-white text-opacity-70">
                Pending outgoing: {balance.pendingOutgoing.toFixed(2)} FOG
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={handleTransferCoins}
          className="w-full h-12"
          variant="default"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Coins
        </Button>
        
        <Button
          onClick={() => navigate?.('earnings-dashboard')}
          className="w-full h-12"
          variant="outline"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          View Earnings
        </Button>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mx-auto mb-2">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-lg font-bold text-[--color-text-primary]">
              {stats?.totalSent.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-[--color-text-secondary]">Total Sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-lg font-bold text-[--color-text-primary]">
              {stats?.totalReceived.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-[--color-text-secondary]">Total Received</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transfers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransfers.length === 0 ? (
            <p className="text-[--color-text-secondary] text-center py-4">
              No recent transfers
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransfers.map((transfer) => {
                const { prefix, colorClass } = getTransferAmount(transfer);
                return (
                  <div
                    key={transfer.id}
                    className="flex items-center justify-between p-3 bg-[--color-bg-secondary] rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-[--color-bg-tertiary] rounded-full">
                        {getTransferIcon(transfer)}
                      </div>
                      <div>
                        <p className="font-medium text-[--color-text-primary]">
                          {getTransferLabel(transfer)}
                        </p>
                        <p className="text-sm text-[--color-text-secondary]">
                          {transfer.fromUserId === userId
                            ? `To: ${formatWalletAddress(transfer.toWalletAddress)}`
                            : `From: ${formatWalletAddress(transfer.fromWalletAddress)}`
                          }
                        </p>
                        <p className="text-xs text-[--color-text-secondary]">
                          {new Date(transfer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${colorClass}`}>
                        {prefix}{transfer.amount.toFixed(2)} FOG
                      </p>
                      <p className="text-xs text-[--color-text-secondary] capitalize">
                        {transfer.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Profile Modal */}
      {wallet && (
        <ShareProfileModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          wallet={wallet}
          userName={userName}
        />
      )}

      {/* Transfer Coins Modal */}
      {balance && (
        <TransferCoinsModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          currentUserId={userId}
          balance={balance}
          onTransferComplete={handleTransferComplete}
        />
      )}
    </div>
  );
}
