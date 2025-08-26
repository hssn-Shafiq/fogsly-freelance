import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/hooks/useAuth';
import { getUserEarnings, transferEarningsToWallet } from '../firebase/services/userEarningsService';
import { UserEarning } from '../firebase/types/ads';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import IconFogCoin from '../components/icons/IconFogCoin';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: 'ads' | 'referrals' | 'tasks' | 'bonuses';
  availableBalance: number;
  onTransfer: (amount: number) => void;
  isLoading: boolean;
}

const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  sourceType,
  availableBalance,
  onTransfer,
  isLoading
}) => {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleTransfer = () => {
    const transferAmount = parseFloat(amount);
    
    if (!transferAmount || transferAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (transferAmount > availableBalance) {
      setError('Amount exceeds available balance');
      return;
    }
    
    onTransfer(transferAmount);
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };

  const sourceLabels = {
    ads: 'Ad Earnings',
    referrals: 'Referral Earnings',
    tasks: 'Task Earnings',
    bonuses: 'Bonus Earnings'
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Transfer ${sourceLabels[sourceType]}`}>
      <div className="space-y-4">
        <div>
          <Label>Available Balance</Label>
          <div className="flex items-center space-x-2 text-lg font-semibold text-blue-600">
            <IconFogCoin className="w-5 h-5" />
            <span>{availableBalance.toFixed(2)} FOG</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="amount">Transfer Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            min="0"
            max={availableBalance}
            step="0.01"
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={isLoading}>
            {isLoading ? 'Transferring...' : 'Transfer to Wallet'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const EarningsCard: React.FC<{
  title: string;
  sourceType: 'ads' | 'referrals' | 'tasks' | 'bonuses';
  available: number;
  total: number;
  onTransfer: (sourceType: 'ads' | 'referrals' | 'tasks' | 'bonuses') => void;
}> = ({ title, sourceType, available, total, onTransfer }) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <IconFogCoin className="w-6 h-6 text-blue-600" />
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Available Balance</p>
          <div className="flex items-center space-x-2">
            <IconFogCoin className="w-4 h-4 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">{available.toFixed(2)}</span>
            <span className="text-sm text-gray-500">FOG</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Total Earned</p>
          <div className="flex items-center space-x-2">
            <IconFogCoin className="w-4 h-4 text-gray-400" />
            <span className="text-lg font-semibold text-gray-700">{total.toFixed(2)}</span>
            <span className="text-sm text-gray-500">FOG</span>
          </div>
        </div>
        
        <Button 
          onClick={() => onTransfer(sourceType)}
          disabled={available <= 0}
          className="w-full"
          size="sm"
        >
          Transfer to Wallet
        </Button>
      </div>
    </Card>
  );
};

export const EarningsDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [userEarnings, setUserEarnings] = useState<UserEarning | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean;
    sourceType: 'ads' | 'referrals' | 'tasks' | 'bonuses' | null;
  }>({
    isOpen: false,
    sourceType: null
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const earnings = await getUserEarnings(user.uid);
      setUserEarnings(earnings);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (amount: number) => {
    if (!user || !transferModal.sourceType) return;
    
    try {
      setIsTransferring(true);
      // Map UI source type to service source type
      const serviceSourceType = transferModal.sourceType === 'tasks' ? 'deposits' : transferModal.sourceType;
      const result = await transferEarningsToWallet(user.uid, amount, serviceSourceType as 'ads' | 'deposits' | 'referrals');
      
      if (result.success) {
        // Reload dashboard data
        await loadDashboardData();
        // Close modal
        setTransferModal({ isOpen: false, sourceType: null });
        // Show success message (you might want to add a toast notification)
        alert('Transfer successful!');
      } else {
        alert(result.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  const openTransferModal = (sourceType: 'ads' | 'referrals' | 'tasks' | 'bonuses') => {
    setTransferModal({ isOpen: true, sourceType });
  };

  const closeTransferModal = () => {
    setTransferModal({ isOpen: false, sourceType: null });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your earnings dashboard.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your earnings dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userEarnings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">Failed to load earnings data.</p>
          <Button onClick={loadDashboardData} className="mt-4">Try Again</Button>
        </Card>
      </div>
    );
  }

  // Calculate earnings from the UserEarning collection
  const adsEarnings = userEarnings.adsEarnings || 0;
  const totalAdsEarnings = userEarnings.totalAdsEarnings || 0; // ✅ Total lifetime ads earnings
  const referralEarnings = userEarnings.referralEarnings || 0;
  const depositEarnings = userEarnings.depositEarnings || 0;
  const totalEarnings = userEarnings.totalEarnings || 0;
  const availableBalance = userEarnings.availableBalance || 0;
  const withdrawnAmount = userEarnings.withdrawnAmount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your FOG coin earnings and transfers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Earnings</p>
                <div className="flex items-center space-x-2 mt-1">
                  <IconFogCoin className="w-6 h-6" />
                  <span className="text-2xl font-bold">{totalEarnings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Available Earnings</p>
                <div className="flex items-center space-x-2 mt-1">
                  <IconFogCoin className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{availableBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Deposits</p>
                <div className="flex items-center space-x-2 mt-1">
                  <IconFogCoin className="w-6 h-6 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{depositEarnings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Withdrawn</p>
                <div className="flex items-center space-x-2 mt-1">
                  <IconFogCoin className="w-6 h-6 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">{withdrawnAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Lifetime Ads Earnings</p>
                <div className="flex items-center space-x-2 mt-1">
                  <IconFogCoin className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{totalAdsEarnings.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Never deducted • Total earned from ads</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Earnings Sources */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Earning Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EarningsCard
              title="Ad Earnings"
              sourceType="ads"
              available={adsEarnings}
              total={adsEarnings}
              onTransfer={openTransferModal}
            />
            <EarningsCard
              title="Referral Earnings"
              sourceType="referrals"
              available={referralEarnings}
              total={referralEarnings}
              onTransfer={openTransferModal}
            />
            {/* <EarningsCard
              title="Deposit Earnings"
              sourceType="tasks"
              available={depositEarnings}
              total={depositEarnings}
              onTransfer={openTransferModal}
            /> */}
          </div>
        </div>

        {/* Earnings Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Earnings</p>
                <p className="text-sm text-gray-500">All-time earnings from all sources</p>
              </div>
              <div className="flex items-center space-x-2">
                <IconFogCoin className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-600">{totalEarnings.toFixed(2)} FOG</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Available Balance</p>
                <p className="text-sm text-gray-500">Ready to transfer to wallet</p>
              </div>
              <div className="flex items-center space-x-2">
                <IconFogCoin className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">{availableBalance.toFixed(2)} FOG</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transfer Modal */}
      {transferModal.sourceType && (
        <TransferModal
          isOpen={transferModal.isOpen}
          onClose={closeTransferModal}
          sourceType={transferModal.sourceType}
          availableBalance={
            transferModal.sourceType === 'ads' ? adsEarnings :
            transferModal.sourceType === 'referrals' ? referralEarnings :
            transferModal.sourceType === 'tasks' ? depositEarnings : 0
          }
          onTransfer={handleTransfer}
          isLoading={isTransferring}
        />
      )}
    </div>
  );
};
