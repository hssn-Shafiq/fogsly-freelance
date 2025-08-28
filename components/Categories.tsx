import React from 'react';
import { motion } from 'framer-motion';
import { categories } from '../constants';
import { Card, CardContent } from './ui/Card';

const Categories = () => {
  return (
    <section className="pt-06 md:pt-12 md:pb-3 ">
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
          <h2 className="text-3xl font-bold mb-2 text-[--color-text-primary]">
            Browse by Category
          </h2>
          <p className="text-[--color-text-secondary] max-w-2xl mx-auto">
            Find the perfect service for your needs across dozens of professional categories
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              {...{
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.5, delay: index * 0.05 },
              }}
              className="h-full"
            >
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 h-full cursor-pointer">
                <CardContent className="pt-3 pb-3 px-6 flex flex-col items-center text-center justify-center h-full">
                  <span className="text-4xl mb-3">{category.icon}</span>
                  <h3 className="font-medium text-[--color-text-primary] leading-tight">
                    {category.name}
                  </h3>
                  <p className="text-sm text-[--color-text-secondary] mt-1">
                    {category.jobs} jobs
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
