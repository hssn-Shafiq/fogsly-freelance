import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Banknote,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Building,
  CreditCard
} from 'lucide-react';
import { type Route } from '../../types';
import { 
  getBankAccountsByCurrency,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount
} from '../../firebase/services/paymentsService';
import type { BankAccount, Currency } from '../../firebase/types/payments';
import { useAuth } from '../../firebase/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface PaymentMethodsPageProps {
  navigate: (route: Route) => void;
}

interface BankAccountFormData {
  currency: Currency;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  iban?: string;
  branchName?: string;
  address?: string;
  isActive: boolean;
}

const PaymentMethodsPage = ({ navigate }: PaymentMethodsPageProps) => {
  const { user } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

  const [formData, setFormData] = useState<BankAccountFormData>({
    currency: 'USD',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    iban: '',
    branchName: '',
    address: '',
    isActive: true
  });

  // Load all bank accounts
  useEffect(() => {
    const loadBankAccounts = async () => {
      try {
        setLoading(true);
        const [usdAccounts, pkrAccounts] = await Promise.all([
          getBankAccountsByCurrency('USD'),
          getBankAccountsByCurrency('PKR')
        ]);
        setBankAccounts([...usdAccounts, ...pkrAccounts]);
      } catch (error) {
        console.error('Error loading bank accounts:', error);
        toast.error('Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };

    loadBankAccounts();
  }, []);

  const resetForm = () => {
    setFormData({
      currency: 'USD',
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      iban: '',
      branchName: '',
      address: '',
      isActive: true
    });
  };

  const handleAddAccount = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      currency: account.currency,
      bankName: account.bankName,
      accountHolderName: account.accountHolderName,
      accountNumber: account.accountNumber,
      iban: account.iban || '',
      branchName: account.branchName || '',
      address: account.address || '',
      isActive: account.isActive
    });
    setShowEditModal(true);
  };

  const handleDeleteAccount = async (account: BankAccount) => {
    if (!confirm(`Are you sure you want to delete ${account.bankName} account?`)) return;

    try {
      setProcessing(true);
      await deleteBankAccount(account.id);
      setBankAccounts(prev => prev.filter(acc => acc.id !== account.id));
      toast.success('Payment method deleted successfully');
    } catch (error) {
      console.error('Error deleting bank account:', error);
      toast.error('Failed to delete payment method');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitAdd = async () => {
    // Currency-specific validation
    if (formData.currency === 'USD') {
      // For USD: only bankName and address (wallet address) are required
      if (!formData.bankName || !formData.address) {
        toast.error('Please fill in Service Name and Wallet Address for USD payment method');
        return;
      }
    } else {
      // For PKR: bankName, accountHolderName, and accountNumber are required
      if (!formData.bankName || !formData.accountHolderName || !formData.accountNumber) {
        toast.error('Please fill in Bank Name, Account Holder Name, and Account Number for PKR payment method');
        return;
      }
    }

    try {
      setProcessing(true);
      const newAccount = await addBankAccount(formData);
      setBankAccounts(prev => [...prev, newAccount]);
      toast.success('Payment method added successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast.error('Failed to add payment method');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitEdit = async () => {
    // Currency-specific validation
    if (formData.currency === 'USD') {
      // For USD: only bankName and address (wallet address) are required
      if (!editingAccount || !formData.bankName || !formData.address) {
        toast.error('Please fill in Service Name and Wallet Address for USD payment method');
        return;
      }
    } else {
      // For PKR: bankName, accountHolderName, and accountNumber are required
      if (!editingAccount || !formData.bankName || !formData.accountHolderName || !formData.accountNumber) {
        toast.error('Please fill in Bank Name, Account Holder Name, and Account Number for PKR payment method');
        return;
      }
    }

    try {
      setProcessing(true);
      const updatedAccount = await updateBankAccount(editingAccount.id, formData);
      setBankAccounts(prev => prev.map(acc => acc.id === editingAccount.id ? updatedAccount : acc));
      toast.success('Payment method updated successfully');
      setShowEditModal(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Error updating bank account:', error);
      toast.error('Failed to update payment method');
    } finally {
      setProcessing(false);
    }
  };

  const getCurrencyIcon = (currency: Currency) => {
    return currency === 'USD' ? <DollarSign className="w-4 h-4" /> : <Banknote className="w-4 h-4" />;
  };

  const filteredAccounts = bankAccounts.filter(account => 
    selectedCurrency === 'USD' ? account.currency === 'USD' : account.currency === 'PKR'
  );

  const stats = {
    total: bankAccounts.length,
    usd: bankAccounts.filter(acc => acc.currency === 'USD').length,
    pkr: bankAccounts.filter(acc => acc.currency === 'PKR').length,
    active: bankAccounts.filter(acc => acc.isActive).length,
    inactive: bankAccounts.filter(acc => !acc.isActive).length
  };

  return (
    <>
      <div className="pt-0 bg-[--color-bg-primary] min-h-screen">
        <section className="py-16 pt-4 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Button variant="ghost" onClick={() => navigate('admin')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold mb-4">Payment Methods</h1>
                  <p className="text-lg text-[--color-text-secondary]">
                    Manage bank accounts and payment methods for deposits
                  </p>
                </div>
                <Button onClick={handleAddAccount}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[--color-text-primary]">{stats.total}</div>
                  <div className="text-sm text-[--color-text-secondary]">Total Methods</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.usd}</div>
                  <div className="text-sm text-[--color-text-secondary]">USD Methods</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.pkr}</div>
                  <div className="text-sm text-[--color-text-secondary]">PKR Methods</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[--color-primary]">{stats.active}</div>
                  <div className="text-sm text-[--color-text-secondary]">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                  <div className="text-sm text-[--color-text-secondary]">Inactive</div>
                </CardContent>
              </Card>
            </div>

            {/* Currency Filter */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <CreditCard className="w-5 h-5 text-[--color-text-secondary]" />
                  <div className="flex gap-2">
                    <Button
                      variant={selectedCurrency === 'USD' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCurrency('USD')}
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      USD Methods
                    </Button>
                    <Button
                      variant={selectedCurrency === 'PKR' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCurrency('PKR')}
                    >
                      <Banknote className="w-4 h-4 mr-1" />
                      PKR Methods
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAccounts.map((account) => (
                <Card key={account.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCurrencyIcon(account.currency)}
                        <CardTitle className="text-lg">{account.bankName}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={account.isActive ? 'default' : 'outline'}>
                          {account.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline">{account.currency}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-[--color-text-secondary]">Account Holder</div>
                      <div className="font-medium">{account.accountHolderName}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-[--color-text-secondary]">Account Number</div>
                      <div className="font-mono text-sm">{account.accountNumber}</div>
                    </div>

                    {account.iban && (
                      <div>
                        <div className="text-sm text-[--color-text-secondary]">IBAN</div>
                        <div className="font-mono text-sm">{account.iban}</div>
                      </div>
                    )}

                    {account.branchName && (
                      <div>
                        <div className="text-sm text-[--color-text-secondary]">Branch</div>
                        <div className="text-sm">{account.branchName}</div>
                      </div>
                    )}

                    {account.address && (
                      <div>
                        <div className="text-sm text-[--color-text-secondary]">Address</div>
                        <div className="font-mono text-xs break-all">{account.address}</div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditAccount(account)} className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteAccount(account)}
                        className="text-red-600 hover:text-red-700"
                        disabled={processing}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredAccounts.length === 0 && !loading && (
                <div className="col-span-full text-center py-12">
                  <Building className="w-12 h-12 mx-auto mb-4 text-[--color-text-secondary]" />
                  <h3 className="text-lg font-semibold mb-2">No {selectedCurrency} payment methods</h3>
                  <p className="text-[--color-text-secondary] mb-4">
                    Add your first {selectedCurrency} payment method to start accepting deposits.
                  </p>
                  <Button onClick={handleAddAccount}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add {selectedCurrency} Method
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Add Payment Method Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="Add Payment Method"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Currency *</label>
              <select
                className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value as Currency})}
              >
                <option value="USD">USD</option>
                <option value="PKR">PKR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {formData.currency === 'USD' ? 'Service Name *' : 'Bank/Service Name *'}
            </label>
            <input
              type="text"
              className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
              placeholder={formData.currency === 'USD' ? "e.g., USDC (TRC20), PayPal" : "e.g., Meezan Bank, Easypaisa"}
              value={formData.bankName}
              onChange={(e) => setFormData({...formData, bankName: e.target.value})}
            />
          </div>

          {formData.currency === 'PKR' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                  placeholder="Full name as registered"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Account Number *</label>
                <input
                  type="text"
                  className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                  placeholder="Account number"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">IBAN (Optional)</label>
                <input
                  type="text"
                  className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                  placeholder="PK81MEZN0008320107924427"
                  value={formData.iban}
                  onChange={(e) => setFormData({...formData, iban: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Branch Name (Optional)</label>
                <input
                  type="text"
                  className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                  placeholder="e.g., CHAKRA BRANCH RWP"
                  value={formData.branchName}
                  onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                />
              </div>
            </>
          )}

          {formData.currency === 'USD' && (
            <div>
              <label className="block text-sm font-medium mb-1">Wallet Address *</label>
              <input
                type="text"
                className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                placeholder="Cryptocurrency wallet address or payment account"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAdd} 
              className="flex-1"
              disabled={processing || (formData.currency === 'USD' ? (!formData.bankName || !formData.address) : (!formData.bankName || !formData.accountHolderName || !formData.accountNumber))}
            >
              {processing ? 'Adding...' : 'Add Payment Method'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Payment Method Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Edit Payment Method"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Currency *</label>
              <select
                className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value as Currency})}
              >
                <option value="USD">USD</option>
                <option value="PKR">PKR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {formData.currency === 'USD' ? 'Service Name *' : 'Bank/Service Name *'}
            </label>
            <input
              type="text"
              className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
              placeholder={formData.currency === 'USD' ? "e.g., USDC (TRC20), PayPal" : "e.g., Meezan Bank, Easypaisa"}
              value={formData.bankName}
              onChange={(e) => setFormData({...formData, bankName: e.target.value})}
            />
          </div>

          {formData.currency === 'PKR' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                  placeholder="Full name as registered"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Account Number *</label>
                <input
                  type="text"
                  className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                  placeholder="Account number"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">IBAN (Optional)</label>
                <input
                  type="text"
                  className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                  placeholder="PK81MEZN0008320107924427"
                  value={formData.iban}
                  onChange={(e) => setFormData({...formData, iban: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Branch Name (Optional)</label>
                <input
                  type="text"
                  className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                  placeholder="e.g., CHAKRA BRANCH RWP"
                  value={formData.branchName}
                  onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                />
              </div>
            </>
          )}

          {formData.currency === 'USD' && (
            <div>
              <label className="block text-sm font-medium mb-1">Wallet Address *</label>
              <input
                type="text"
                className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                placeholder="Cryptocurrency wallet address or payment account"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowEditModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitEdit} 
              className="flex-1"
              disabled={processing || (formData.currency === 'USD' ? (!formData.bankName || !formData.address) : (!formData.bankName || !formData.accountHolderName || !formData.accountNumber))}
            >
              {processing ? 'Updating...' : 'Update Payment Method'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PaymentMethodsPage;
