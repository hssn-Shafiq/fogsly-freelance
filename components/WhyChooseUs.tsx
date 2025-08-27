import React from 'react';
import { motion } from 'framer-motion';
import { benefits } from '../constants';
import { Card, CardContent } from './ui/Card';

const WhyChooseUs = () => {
  return (
    <section className="py-14 bg-[--color-bg-tertiary]">
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
          <h2 className="text-3xl font-bold mb-2 text-[--color-text-primary]">Why Choose FOGSLY</h2>
          <p className="text-[--color-text-secondary] max-w-2xl mx-auto">
            We're building the most flexible and rewarding platform for modern professionals
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              {...{
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.5, delay: index * 0.05 },
              }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full border-transparent hover:border-[--color-primary]/20">
                <CardContent className="p-8 pt-6">
                  <div className="w-12 h-12 mb-6">
                    <benefit.icon />
                  </div>
                  <h3 className="font-bold text-lg text-[--color-text-primary] mb-2">{benefit.title}</h3>
                  <p className="text-[--color-text-secondary]">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;