import React from 'react';
import { motion } from 'framer-motion';
import IconTrustShield from './icons/IconTrustShield';

const Trust = () => {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <motion.div 
          {...{
            initial: { opacity: 0, y: 30 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.6 },
          }}
          className="bg-[--color-bg-secondary] rounded-3xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-[--color-text-primary]">Build on a Foundation of Trust</h2>
              <p className="text-[--color-text-secondary]">
                We prioritize your safety and security. Our verification systems and transparent profiles ensure you can hire and work with confidence.
              </p>
              <div>
                <h3 className="font-bold text-lg text-[--color-text-primary] mb-2">Multi-layered Verification</h3>
                <p className="text-[--color-text-secondary] text-sm">
                  Profiles are vetted through ID, LinkedIn, and Passport verification to build a trustworthy community.
                </p>
              </div>
               <div>
                <h3 className="font-bold text-lg text-[--color-text-primary] mb-2">Informed Decisions</h3>
                <p className="text-[--color-text-secondary] text-sm">
                  Make informed decisions with access to detailed work history and honest, verified reviews from other users.
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <IconTrustShield />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Trust;