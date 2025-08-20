import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import IconPiggyBank from './icons/IconPiggyBank';
import { Coins, BarChart, Calendar, ChevronRight } from 'lucide-react';

const hodlOptions = [
  { duration: 30, apy: 5 },
  { duration: 90, apy: 8 },
  { duration: 180, apy: 12 },
  { duration: 365, apy: 18 },
];

const activeHodls = [
  { id: 1, amount: 5000, apy: 8, startDate: new Date('2024-06-01'), endDate: new Date('2024-08-30'), earnings: 65.75 },
  { id: 2, amount: 10000, apy: 12, startDate: new Date('2024-04-15'), endDate: new Date('2024-10-12'), earnings: 345.21 },
];

const HodlManager = () => {
  const [amount, setAmount] = useState('1000');
  const [selectedOption, setSelectedOption] = useState(hodlOptions[1]);
  const userFogBalance = 25000; // Mock balance

  const estimatedEarnings = useMemo(() => {
    if (!amount || !selectedOption) return '0.00';
    const principal = parseFloat(amount);
    if (isNaN(principal) || principal <= 0) return '0.00';
    const dailyRate = selectedOption.apy / 100 / 365;
    const earnings = principal * dailyRate * selectedOption.duration;
    return earnings.toFixed(2);
  }, [amount, selectedOption]);

  const endDate = useMemo(() => {
      const date = new Date();
      date.setDate(date.getDate() + selectedOption.duration);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, [selectedOption]);

  const handleSetMax = () => {
      setAmount(userFogBalance.toString());
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
          {...{
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.5 },
          }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-[--color-text-primary]">Grow Your FOG Coins</h2>
          <p className="text-[--color-text-secondary] max-w-2xl mx-auto">
            HODL your FOG Coins for a set period and earn passive income. The longer you hold, the higher the rewards.
          </p>
      </motion.div>
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Side: Create Hodl */}
        <div className="lg:col-span-3">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center"><IconPiggyBank className="w-6 h-6 mr-3 text-[--color-primary]" /> Create a HODL Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="hodl-amount">Amount to HODL</Label>
                <div className="relative mt-1">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-secondary]" />
                    <Input id="hodl-amount" type="number" placeholder="Enter FOG amount" value={amount} onChange={e => setAmount(e.target.value)} className="pl-10"/>
                    <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={handleSetMax}>Max</Button>
                </div>
                <p className="text-xs text-[--color-text-secondary] mt-1">Your balance: {userFogBalance.toLocaleString()} FOG</p>
              </div>

              <div>
                <Label>Choose Duration</Label>
                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                    {hodlOptions.map(option => (
                        <motion.div key={option.duration} {...{ whileHover: { y: -3 } }} className="h-full">
                            <button onClick={() => setSelectedOption(option)} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedOption.duration === option.duration ? 'border-[--color-primary] bg-[--color-primary]/5' : 'border-[--color-border] hover:border-[--color-primary]/50'}`}>
                                <p className="font-bold text-lg text-[--color-text-primary]">{option.duration} Days</p>
                                <p className="text-sm text-[--color-text-secondary]">Annual Yield (APY): <span className="font-semibold text-[--color-success-fg]">{option.apy}%</span></p>
                            </button>
                        </motion.div>
                    ))}
                </div>
              </div>
              
              <Card className="bg-[--color-bg-secondary]">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-[--color-text-primary]">Summary</h3>
                    <div className="flex justify-between text-sm">
                        <span className="text-[--color-text-secondary] flex items-center"><BarChart className="w-4 h-4 mr-2"/>Estimated Earnings</span>
                        <span className="font-medium text-[--color-text-primary]">{estimatedEarnings} FOG</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-[--color-text-secondary] flex items-center"><Calendar className="w-4 h-4 mr-2"/>Unlock Date</span>
                        <span className="font-medium text-[--color-text-primary]">{endDate}</span>
                    </div>
                  </CardContent>
              </Card>

              <Button size="lg" className="w-full">Start HODLing</Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Side: Active Hodls */}
        <div className="lg:col-span-2">
            <Card className="shadow-lg h-full">
                <CardHeader>
                    <CardTitle>Your Active HODLs</CardTitle>
                    <CardDescription>Track your ongoing positions and earnings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activeHodls.length > 0 ? activeHodls.map(hodl => {
                            const totalDays = (hodl.endDate.getTime() - hodl.startDate.getTime()) / (1000 * 3600 * 24);
                            const elapsedDays = (new Date().getTime() - hodl.startDate.getTime()) / (1000 * 3600 * 24);
                            const progress = Math.min(100, (elapsedDays / totalDays) * 100);

                            return (
                                <div key={hodl.id} className="p-4 rounded-lg bg-[--color-bg-secondary]">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-lg text-[--color-text-primary]">{hodl.amount.toLocaleString()} FOG</span>
                                        <span className="text-sm font-semibold text-[--color-success-fg]">+{hodl.earnings.toLocaleString()} FOG</span>
                                    </div>
                                    <div className="h-2 bg-[--color-bg-tertiary] rounded-full mb-2">
                                        <div className="h-full bg-[--color-primary] rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-[--color-text-secondary]">
                                        <span>{hodl.apy}% APY</span>
                                        <span>Unlocks: {hodl.endDate.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-8">
                                <p className="text-[--color-text-secondary]">You have no active HODL positions.</p>
                            </div>
                        )}
                         <Button variant="link" className="w-full mt-4">View HODL History <ChevronRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default HodlManager;