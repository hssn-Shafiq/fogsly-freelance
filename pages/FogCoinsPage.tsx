import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CheckCircle, ChevronDown, Repeat, CreditCard, PartyPopper, ArrowLeft } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { type Route } from '../types';
import HodlManager from '../components/HodlManager';

const FOG_RATE = 0.10;

type PurchaseStep = 'idle' | 'confirming' | 'success';

interface FogCoinsPageProps {
  navigate: (route: Route) => void;
}

const FogCoinsPage = ({ navigate }: FogCoinsPageProps) => {
  const [usdValue, setUsdValue] = useState('100.00');
  const [fogValue, setFogValue] = useState((100 / FOG_RATE).toFixed(2));
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>('idle');

  const isModalOpen = purchaseStep !== 'idle';
  const isBuyButtonDisabled = parseFloat(usdValue) <= 0 || isNaN(parseFloat(usdValue));

  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsdValue(val);
    if (val && !isNaN(parseFloat(val))) {
      setFogValue((parseFloat(val) / FOG_RATE).toFixed(2));
    } else {
      setFogValue('0.00');
    }
  };

  const handleFogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFogValue(val);
    if (val && !isNaN(parseFloat(val))) {
      setUsdValue((parseFloat(val) * FOG_RATE).toFixed(2));
    } else {
      setUsdValue('0.00');
    }
  };

  const benefits = [
    "Zero transaction fees",
    "Instant global transfers",
    "Exclusive feature access",
    "Earn loyalty rewards"
  ];
  
  const faqs = [
    { q: "What is FOG Coin?", a: "FOG Coin is our native digital currency, designed to make transactions on the FOGSLY platform faster, cheaper, and more secure." },
    { q: "Is it a real cryptocurrency?", a: "Yes, FOG Coin is a utility token built on a secure blockchain, specifically for use within the FOGSLY ecosystem." },
    { q: "How can I spend my FOG Coins?", a: "You can use FOG Coins to pay for any service, boost your profile visibility, access premium features, and get discounts." },
    { q: "What is HODLing?", a: "HODLing (a term derived from 'hold') means locking your FOG Coins for a specified duration to earn percentage-based returns. It's a way to generate passive income from your assets." }
  ];

  const presetAmounts = [50, 100, 250, 500];

  const handleSetPreset = (amount: number) => {
      setUsdValue(amount.toFixed(2));
      setFogValue((amount / FOG_RATE).toFixed(2));
  };

  const handleBuyClick = () => {
      if (!isBuyButtonDisabled) {
          setPurchaseStep('confirming');
      }
  }

  const handleConfirmPurchase = () => {
      // Simulate API call
      setTimeout(() => {
          setPurchaseStep('success');
      }, 800);
  }

  const handleCloseModal = () => {
      setPurchaseStep('idle');
  }


  return (
    <>
      <div className="pt-24 bg-[--color-bg-primary]">
        <section className="py-16 md:py-24">
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
                        <p className="text-xs text-right mt-1 text-[--color-text-secondary]">Rate: 1 FOG = $0.10</p>
                      </div>

                      <Button size="lg" className="w-full text-lg font-bold" onClick={handleBuyClick} disabled={isBuyButtonDisabled}>
                        <CreditCard className="w-5 h-5 mr-2" /> Buy FOG Coins
                      </Button>
                      <p className="text-xs text-center text-[--color-text-secondary]">
                        Secure payments powered by Stripe.
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

        <section className="py-16 md:pb-24 bg-[--color-bg-secondary]">
          <div className="container mx-auto px-4">
            <HodlManager />
          </div>
        </section>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={purchaseStep === 'confirming' ? "Confirm Purchase" : "Success!"}>
          {purchaseStep === 'confirming' && (
              <div className="text-center">
                  <p className="text-lg text-[--color-text-secondary] mb-4">
                      You are about to purchase <span className="font-bold text-[--color-text-primary]">{parseFloat(fogValue).toLocaleString()} FOG</span> for <span className="font-bold text-[--color-text-primary]">${parseFloat(usdValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>.
                  </p>
                  <div className="flex justify-end gap-3 mt-6">
                      <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                      <Button onClick={handleConfirmPurchase}>Confirm Purchase</Button>
                  </div>
              </div>
          )}
          {purchaseStep === 'success' && (
              <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
                      <PartyPopper className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[--color-text-primary]">Purchase Complete!</h3>
                  <p className="text-[--color-text-secondary] mb-4">
                      <span className="font-bold text-[--color-text-primary]">{parseFloat(fogValue).toLocaleString()} FOG</span> has been added to your wallet.
                  </p>
                  <Button onClick={handleCloseModal} className="w-full">
                      Done
                  </Button>
              </div>
          )}
      </Modal>
    </>
  );
};

export default FogCoinsPage;