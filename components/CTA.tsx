
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

const CTA = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          {...{
            initial: { opacity: 0, scale: 0.95 },
            whileInView: { opacity: 1, scale: 1 },
            viewport: { once: true },
            transition: { duration: 0.5 },
          }}
          className="bg-gradient-to-r from-[--color-primary] to-[--color-accent] rounded-3xl p-8 md:p-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8 text-lg">
            Join thousands of professionals building their future on FOGSLY. It's free to sign up and takes less than 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-[--color-primary] hover:bg-white/90">
              Sign Up Free
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;