import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CheckCircle, ChevronDown, Repeat, CreditCard, PartyPopper, ArrowLeft, DollarSign, Banknote, Copy } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { type Route } from '../types';
import HodlManager from '../components/HodlManager';
import { useAuth } from '../firebase/hooks/useAuth';
import { getFogCoinSettings } from '../firebase/services/fogCoinSettingsService';
import { 
  getBankAccountsByCurrency, 
  createPaymentRequest
} from '../firebase/services/paymentsService';
import type { Currency, BankAccount } from '../firebase/types/payments';
import { toast } from 'react-hot-toast';

type PurchaseStep = 'idle' | 'currency' | 'amount' | 'bank' | 'verification' | 'submitted';

interface FogCoinsPageProps {
  navigate: (route: Route) => void;
}

const FogCoinsPage = ({ navigate }: FogCoinsPageProps) => {
  const { user } = useAuth();
  const [fogUsdRate, setFogUsdRate] = useState(0.10);
  const [usdToPkrRate] = useState(284.67);
  
  // State for purchase flow
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>('idle');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [usdValue, setUsdValue] = useState('100.00');
  const [fogValue, setFogValue] = useState('1000.00');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [paymentRequestId, setPaymentRequestId] = useState<string>('');

  const isModalOpen = purchaseStep !== 'idle';
  const isBuyButtonDisabled = parseFloat(usdValue) <= 0 || isNaN(parseFloat(usdValue));

  // Load FOG coin settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getFogCoinSettings();
        if (settings) {
          setFogUsdRate(settings.fogToUsdRate);
          // Update FOG value when rate changes
          if (usdValue && !isNaN(parseFloat(usdValue))) {
            setFogValue((parseFloat(usdValue) / settings.fogToUsdRate).toFixed(2));
          }
        }
      } catch (error) {
        console.error('Error loading FOG coin settings:', error);
        toast.error('Failed to load current rates');
      }
    };
    
    loadSettings();
  }, []);

  // Load bank accounts when currency is selected
  useEffect(() => {
    if (selectedCurrency) {
      const loadBankAccounts = async () => {
        try {
          const accounts = await getBankAccountsByCurrency(selectedCurrency);
          setBankAccounts(accounts);
        } catch (error) {
          console.error('Error loading bank accounts:', error);
          toast.error('Failed to load bank accounts');
        }
      };
      
      loadBankAccounts();
    }
  }, [selectedCurrency]);

  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsdValue(val);
    if (val && !isNaN(parseFloat(val))) {
      setFogValue((parseFloat(val) / fogUsdRate).toFixed(2));
    } else {
      setFogValue('0.00');
    }
  };

  const handleFogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFogValue(val);
    if (val && !isNaN(parseFloat(val))) {
      setUsdValue((parseFloat(val) * fogUsdRate).toFixed(2));
    } else {
      setUsdValue('0.00');
    }
  };

  const getLocalAmount = () => {
    const usd = parseFloat(usdValue);
    return selectedCurrency === 'USD' ? usd : usd * usdToPkrRate;
  };

  const getLocalCurrencySymbol = () => {
    return selectedCurrency === 'USD' ? '$' : 'PKR ';
  };

  const handleSetPreset = (amount: number) => {
    setUsdValue(amount.toFixed(2));
    setFogValue((amount / fogUsdRate).toFixed(2));
  };

  const handleBuyClick = () => {
    if (!user) {
      toast.error('Please log in to purchase FOG Coins');
      navigate('auth');
      return;
    }
    if (!isBuyButtonDisabled) {
      setPurchaseStep('currency');
    }
  };

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setPurchaseStep('amount');
  };

  const handleAmountConfirm = () => {
    setPurchaseStep('bank');
  };

  const handleBankSelect = async (bank: BankAccount) => {
    if (!user) return;
    
    try {
      setSelectedBankAccount(bank);
      
      // Create payment request
      const requestId = await createPaymentRequest(
        user.uid,
        user.email || '',
        user.displayName || 'Unknown User',
        parseFloat(fogValue),
        parseFloat(usdValue),
        selectedCurrency,
        fogUsdRate,
        bank.id
      );
      
      setPaymentRequestId(requestId);
      setPurchaseStep('submitted');
      
      toast.success('Payment request created! Please complete verification in Customer Service.');
    } catch (error) {
      console.error('Error creating payment request:', error);
      toast.error('Failed to create payment request');
    }
  };

  const handleCloseModal = () => {
    setPurchaseStep('idle');
    setSelectedCurrency('USD');
    setSelectedBankAccount(null);
    setPaymentRequestId('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const benefits = [
    "Zero transaction fees within platform",
    "Instant global transfers",
    "Exclusive feature access",
    "Earn loyalty rewards through HODLing"
  ];
  
  const faqs = [
    { q: "What is FOG Coin?", a: "FOG Coin is our native digital currency, designed to make transactions on the FOGSLY platform faster, cheaper, and more secure." },
    { q: "How do I deposit money?", a: "Choose your currency (USD/PKR), select amount, pick a bank account, make payment, and upload verification. Admin will approve within 24 hours." },
    { q: "What payment methods do you accept?", a: "We accept bank transfers, mobile wallets (Easypaisa), and USDC cryptocurrency for international payments." },
    { q: "How can I spend my FOG Coins?", a: "You can use FOG Coins to pay for any service, boost your profile visibility, access premium features, and get discounts." },
    { q: "What is HODLing?", a: "HODLing means locking your FOG Coins for a specified duration to earn percentage-based returns. It's a way to generate passive income." }
  ];

  const presetAmounts = [50, 100, 250, 500];


  return (
    <>
      <div className="pt-0 bg-[--color-bg-primary]">
        <section className="py-16 pt-4 md:py-24">
          <div className="container mx-auto px-4">
             <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate('home')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Button>
            </div>
            <motion.div
              {...{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.5 },
              }}
              className="max-w-3xl mx-auto text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Your Gateway to FOG Coins</h1>
              <p className="text-lg md:text-xl text-[--color-text-secondary]">
                Start using our native currency for lower fees, instant transfers, and exclusive rewards.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <motion.div
                {...{
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.5, delay: 0.1 },
                }}
              >
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">Acquire FOG Coins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {presetAmounts.map(amount => (
                              <Button key={amount} variant="outline" onClick={() => handleSetPreset(amount)}>
                                  ${amount}
                              </Button>
                          ))}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[--color-text-secondary]">You pay</label>
                        <div className="relative mt-1">
                          <input 
                            type="number"
                            value={usdValue}
                            onChange={handleUsdChange}
                            className="w-full h-12 pl-4 pr-20 rounded-md border border-[--color-border] bg-[--color-bg-secondary] text-lg font-semibold focus:ring-2 focus:ring-[--color-primary] outline-none transition-shadow" 
                            placeholder="0.00"
                          />
                          <span className="absolute inset-y-0 right-4 flex items-center text-[--color-text-secondary] font-medium">USD</span>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Repeat className="w-6 h-6 text-[--color-text-secondary]/70" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-[--color-text-secondary]">You receive</label>
                        <div className="relative mt-1">
                          <input 
                            type="number"
                            value={fogValue}
                            onChange={handleFogChange}
                            className="w-full h-12 pl-4 pr-20 rounded-md border border-[--color-border] bg-[--color-bg-secondary] text-lg font-semibold focus:ring-2 focus:ring-[--color-primary] outline-none transition-shadow" 
                            placeholder="0.00"
                          />
                          <span className="absolute inset-y-0 right-4 flex items-center text-[--color-text-secondary] font-medium">FOG</span>
                        </div>
                        <p className="text-xs text-right mt-1 text-[--color-text-secondary]">Rate: 1 FOG = ${fogUsdRate.toFixed(3)}</p>
                      </div>

                      <Button size="lg" className="w-full text-lg font-bold" onClick={handleBuyClick} disabled={isBuyButtonDisabled}>
                        <CreditCard className="w-5 h-5 mr-2" /> Deposit FOG Coins
                      </Button>
                      <p className="text-xs text-center text-[--color-text-secondary]">
                        Secure manual verification process.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                className="space-y-8"
                {...{
                  initial: { opacity: 0, x: 20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.5, delay: 0.2 },
                }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Key Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {benefits.map(b => (
                        <li key={b} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-[--color-success-icon] mr-3 flex-shrink-0" />
                          <span className="text-[--color-text-primary]">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {faqs.map(faq => (
                      <details key={faq.q} className="group border-b border-[--color-border] pb-3">
                          <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                            <span className="text-[--color-text-primary]">{faq.q}</span>
                            <ChevronDown className="w-5 h-5 text-[--color-text-secondary] transition-transform duration-300 group-open:rotate-180" />
                          </summary>
                          <p className="text-[--color-text-secondary] mt-2 group-open:animate-fadeIn">
                            {faq.a}
                          </p>
                      </details>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* <section className="py-16 md:pb-24 bg-[--color-bg-secondary]">
          <div className="container mx-auto px-4">
            <HodlManager />
          </div>
        </section> */}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        preventBackgroundClose={true}
        title={
          purchaseStep === 'currency' ? "Select Currency" :
          purchaseStep === 'amount' ? "Confirm Amount" :
          purchaseStep === 'bank' ? "Select Payment Method" :
          purchaseStep === 'submitted' ? "Request Submitted" : ""
        }
      >
        {/* Currency Selection */}
        {purchaseStep === 'currency' && (
          <div className="space-y-4">
            <p className="text-[--color-text-secondary] mb-4">
              Choose your preferred currency for payment:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-16 flex flex-col items-center"
                onClick={() => handleCurrencySelect('USD')}
              >
                <DollarSign className="w-6 h-6 mb-1" />
                <span>USD</span>
                <span className="text-xs text-[--color-text-secondary]">International</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col items-center"
                onClick={() => handleCurrencySelect('PKR')}
              >
                <Banknote className="w-6 h-6 mb-1" />
                <span>PKR</span>
                <span className="text-xs text-[--color-text-secondary]">Pakistan</span>
              </Button>
            </div>
          </div>
        )}

        {/* Amount Confirmation */}
        {purchaseStep === 'amount' && (
          <div className="space-y-4">
            <div className="text-center p-6 bg-[--color-bg-secondary] rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>FOG Coins:</span>
                  <span className="font-bold">{parseFloat(fogValue).toLocaleString()} FOG</span>
                </div>
                <div className="flex justify-between">
                  <span>USD Amount:</span>
                  <span className="font-bold">${parseFloat(usdValue).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Local Amount:</span>
                  <span className="font-bold">{getLocalCurrencySymbol()}{getLocalAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[--color-text-secondary]">
                  <span>Exchange Rate:</span>
                  <span>{selectedCurrency === 'PKR' ? `1 USD = ${usdToPkrRate} PKR` : '1 USD = 1 USD'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setPurchaseStep('currency')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleAmountConfirm} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Bank Selection */}
        {purchaseStep === 'bank' && (
          <div className="space-y-4">
            <p className="text-[--color-text-secondary] mb-4">
              Select a payment method for {selectedCurrency}:
            </p>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {bankAccounts.map((bank) => (
                <Card 
                  key={bank.id} 
                  className="cursor-pointer hover:bg-[--color-bg-secondary] transition-colors"
                  onClick={() => handleBankSelect(bank)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{bank.bankName}</h4>
                        <p className="text-sm text-[--color-text-secondary]">
                          {bank.accountHolderName}
                        </p>
                        <p className="text-xs text-[--color-text-secondary]">
                          {bank.accountNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-[--color-primary]">
                          {bank.currency}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setPurchaseStep('amount')} className="w-full">
              Back to Amount
            </Button>
          </div>
        )}

        {/* Submitted Confirmation */}
        {purchaseStep === 'submitted' && selectedBankAccount && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-[--color-text-primary]">Payment Request Created!</h3>
              <p className="text-[--color-text-secondary] mt-2">
                Request ID: <span className="font-mono font-bold">{paymentRequestId}</span>
              </p>
            </div>

            <div className="bg-[--color-bg-secondary] p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Payment Instructions</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Bank:</span>
                  <span className="font-medium">{selectedBankAccount.bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Account Name:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedBankAccount.accountHolderName}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(selectedBankAccount.accountHolderName)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedBankAccount.accountNumber}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(selectedBankAccount.accountNumber)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {selectedBankAccount.iban && (
                  <div className="flex justify-between items-center">
                    <span>IBAN:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedBankAccount.iban}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(selectedBankAccount.iban)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {selectedBankAccount.address && (
                  <div className="flex justify-between items-center">
                    <span>Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs">{selectedBankAccount.address}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(selectedBankAccount.address)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Amount to Send:</span>
                    <span className="text-[--color-primary]">
                      {getLocalCurrencySymbol()}{getLocalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Next Steps:</h4>
              <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>1. Make the payment using the details above</li>
                <li>2. Take a screenshot of your payment confirmation</li>
                <li>3. Go to Customer Service to upload verification details</li>
                <li>4. Our team will approve your deposit within 24 hours</li>
              </ol>
            </div>

            <div className="space-y-2 text-sm text-center">
              <p><strong>FOG Coins:</strong> {parseFloat(fogValue).toLocaleString()} FOG</p>
              <p><strong>Amount:</strong> {getLocalCurrencySymbol()}{getLocalAmount().toFixed(2)}</p>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleCloseModal} className="flex-1">
                Close
              </Button>
              <Button 
                onClick={() => {
                  handleCloseModal();
                  navigate('customer-service');
                }} 
                className="flex-1"
              >
                Complete Verification
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default FogCoinsPage;