
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';

const steps = [
  { step: "1", title: "Create Profile", description: "Set up your profile showcasing skills, experience, and portfolio." },
  { step: "2", title: "Find Work/Post Job", description: "Browse jobs or post your project with clear requirements." },
  { step: "3", title: "Collaborate", description: "Use our tools to communicate and manage projects efficiently." },
  { step: "4", title: "Get Paid", description: "Receive secure payments upon project completion." }
];

const HowItWorks = () => {
  return (
    <section className="py-14">
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
          <h2 className="text-3xl font-bold mb-2 text-[--color-text-primary]">How It Works</h2>
          <p className="text-[--color-text-secondary] max-w-2xl mx-auto">
            Get started in minutes and begin your freelance journey or find the perfect talent.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
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
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[--color-primary] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-lg text-[--color-text-primary] mb-2">{step.title}</h3>
                  <p className="text-[--color-text-secondary] text-sm">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;