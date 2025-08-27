import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '120K+', label: 'Verified Users' },
  { value: '$25M+', label: 'Paid to Freelancers' },
  { value: '85K+', label: 'Jobs Completed' },
  { value: '4.8/5', label: 'Average Rating' },
];

const StatsBar = () => {
  return (
    <motion.section
      className="bg-[--color-bg-primary] shadow-lg relative z-20 mt-3 md:mt-6 mx-4 md:mx-auto max-w-5xl rounded-xl border border-[--color-border]"
      {...{
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.5, duration: 0.5 },
      }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              {...{ whileHover: { scale: 1.05 } }}
              className="p-4 rounded-lg hover:bg-[--color-bg-secondary] transition-colors"
            >
              <p className="text-3xl font-bold text-[--color-primary]">{stat.value}</p>
              <p className="text-sm text-[--color-text-secondary] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default StatsBar;
