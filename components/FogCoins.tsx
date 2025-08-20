import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRightLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { type Route } from '../types';

const FogCoins = ({ navigate }: { navigate: (route: Route) => void }) => {
  const features = [
    "Zero transaction fees for FOG Coin payments",
    "Instant global transfers with blockchain technology",
    "Earn rewards through our loyalty program",
    "Exclusive discounts on premium services"
  ];

  return (
    <div className="p-8 md:p-12 bg-[--color-bg-secondary]">
      <div className="text-center mb-12">
        <motion.h1
          {...{
            initial: { opacity: 0, y: -20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.5 },
          }}
          className="text-4xl md:text-5xl font-bold text-[--color-text-primary]"
        >
          FOG Coins
        </motion.h1>
        <motion.p
          {...{
            initial: { opacity: 0, y: -20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.5, delay: 0.1 },
          }}
          className="mt-4 text-lg text-[--color-text-secondary] max-w-2xl mx-auto"
        >
          Our native cryptocurrency for seamless transactions on the platform
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-5 gap-12 items-center">
        {/* Left Side */}
        <motion.div
          className="lg:col-span-3"
          {...{
            initial: { opacity: 0, x: -30 },
            whileInView: { opacity: 1, x: 0 },
            viewport: { once: true },
            transition: { duration: 0.6, delay: 0.2 },
          }}
        >
          <h2 className="text-2xl font-bold mb-4 text-[--color-text-primary]">What are FOG Coins?</h2>
          <p className="text-[--color-text-secondary] mb-6">
            FOG Coins are our platform's native digital currency designed to make transactions faster, cheaper, and more secure. Use them to pay for services, boost your profile, or access premium features.
          </p>
          <ul className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-[--color-text-secondary]">{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            size="lg" 
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold shadow-lg hover:shadow-yellow-500/30 transition-shadow"
            onClick={() => navigate('fog-coins')}
          >
            Get Started with FOG Coins
          </Button>
        </motion.div>

        {/* Right Side - Wallet Card */}
        <motion.div
          className="lg:col-span-2"
          {...{
            initial: { opacity: 0, scale: 0.9 },
            whileInView: { opacity: 1, scale: 1 },
            viewport: { once: true },
            transition: { duration: 0.6, delay: 0.3 },
          }}
        >
          <div className="bg-[--color-card] rounded-2xl shadow-lg p-6 border border-[--color-border]">
            <div className="flex flex-col justify-between items-start mb-0">
              <span className="text-xs font-semibold bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">
                CURRENT RATE
              </span>
              <span className="text-4xl font-bold">1 FOG = $0.10</span>
            </div>
            <p className="text-xs text-[--color-text-secondary] text-right mb-3">Updated just now</p>

            <div className="bg-[--color-bg-secondary] p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-[--color-text-secondary]">Your Balance</p>
                  <p className="text-xs text-[--color-text-secondary]/70">Wallet #123456789</p>
                </div>
                <div className="flex items-center">
                   <div className="w-6 h-6 rounded-full bg-[--color-primary] mr-3"></div>
                   <span className="text-lg font-bold text-[--color-text-primary]">1,250 FOG</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[--color-success-bg] p-4 rounded-lg">
               <div className="flex justify-between items-center">
                 <div>
                    <p className="text-sm font-medium text-[--color-success-fg]">24h Change</p>
                    <p className="text-xs text-[--color-success-fg]/80">+2.5%</p>
                 </div>
                 <div className="flex items-center">
                    <ArrowRightLeft className="w-5 h-5 text-[--color-success-icon] mr-3"/>
                    <span className="text-lg font-bold text-[--color-success-fg]">+$31.25</span>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FogCoins;