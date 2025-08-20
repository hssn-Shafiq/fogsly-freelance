import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button } from './ui/Button';
import { type Route } from '../types';

const Hero = ({ navigate }: { navigate: (route: Route) => void }) => {
  return (
    <section className="relative overflow-hidden pt-24">
      <div className="absolute inset-0 bg-gradient-to-r from-[--color-primary]/10 to-[--color-accent]/10 -skew-y-3 transform origin-top-left"></div>
      <div className=" container mx-auto  px-8 pt-0 md:pt-0 pb-14 relative z-10">
        <div className="max-w-7xl bg-[--color-bg-hero] rounded-3xl shadow-2xl mt-0 mx-auto py-10 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-[--color-text-hero]"
            {...{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.1, duration: 0.5 },
            }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[--color-primary] to-[--color-accent]">Freelance.</span> On-Demand. 
            <div>Global Services.</div>
          </motion.h1>

          <motion.h2
            className="font-kalam text-4xl md:text-6xl my-4"
            style={{ color: '#C85738' }}
            {...{
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { delay: 0.15, duration: 0.6, type: 'spring', stiffness: 100 },
            }}
          >
            Loyalty & Yield.
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-[--color-text-hero] max-w-3xl mx-auto mb-10"
            {...{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.2, duration: 0.5 },
            }}
          >
            FOGSLY is the premier platform for professionals. Hire expert freelancers for digital projects or find reliable taskers for local, physical jobs. No distractions, just results.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
            {...{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.3, duration: 0.5 },
            }}
          >
            <Button size="lg" className="shadow-lg hover:shadow-[--color-primary]/30 transition-shadow">
              Freelance Hub
            </Button>
            <Button size="lg" className="text-[--color-text-hero] hover:text-[--color-primary]" variant="outline">
              Tasker Hub
            </Button>
            <Button size="lg" variant="ghost" className="group text-[--color-text-hero] hover:text-[--color-primary]">
              Watch Demo <Play className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;