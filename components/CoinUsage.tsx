import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import IconBuyServices from './icons/IconBuyServices';
import IconBoostProfile from './icons/IconBoostProfile';
import IconRewards from './icons/IconRewards';

const usages = [
  {
    icon: IconBuyServices,
    title: 'Buy Services',
    description: 'Pay freelancers directly with FOG Coins for faster, cheaper transactions.',
  },
  {
    icon: IconBoostProfile,
    title: 'Boost Your Profile',
    description: 'Use FOG Coins to feature your profile and get more visibility.',
  },
  {
    icon: IconRewards,
    title: 'Rewards Program',
    description: 'Earn FOG Coins for completing tasks, referrals, and achievements.',
  },
];

const CoinUsage = () => {
  return (
    <section className="py-14 bg-[--color-bg-primary]">
      <div className="container mx-auto px-4">
        <motion.div
          {...{
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.5 },
          }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2 text-[--color-text-primary]">Coin Usage</h2>
          <p className="text-[--color-text-secondary] max-w-2xl mx-auto">
            Discover the various ways you can utilize FOG Coins within our platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {usages.map((usage, index) => (
            <motion.div
              key={index}
              {...{
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.5, delay: index * 0.1 },
              }}
              className="h-full"
            >
              <Card className="hover:shadow-lg transition-shadow h-full p-4">
                <CardContent className="flex flex-col items-center text-center pt-6">
                  <div className="w-16 h-16 mb-4">
                    <usage.icon />
                  </div>
                  <h3 className="font-bold text-lg text-[--color-text-primary] mb-2">{usage.title}</h3>
                  <p className="text-[--color-text-secondary] text-sm flex-grow mb-4">{usage.description}</p>
                  <Button variant="link">Learn More</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoinUsage;