
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { topTalent } from '../constants';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';

const TopTalent = () => {
  return (
    <section className="py-24 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <motion.div
            {...{
              initial: { opacity: 0, x: -20 },
              whileInView: { opacity: 1, x: 0 },
              viewport: { once: true },
              transition: {duration: 0.5},
            }}
          >
            <h2 className="text-3xl font-bold text-[--color-text-primary]">Top Talent</h2>
            <p className="text-[--color-text-secondary]">Highly-rated professionals ready for your project</p>
          </motion.div>
          <motion.div
            {...{
              initial: { opacity: 0, x: 20 },
              whileInView: { opacity: 1, x: 0 },
              viewport: { once: true },
              transition: {duration: 0.5},
            }}
          >
            <Button variant="link">
              Browse all talent <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {topTalent.map((talent, index) => (
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
                <CardContent className="p-6 pt-6 flex flex-col h-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-gray-200/50 border-2 border-dashed rounded-full w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-[--color-text-primary]">{talent.name}</h3>
                      <p className="text-[--color-text-secondary]">{talent.role}</p>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 text-sm font-semibold">{talent.rating}</span>
                        <span className="ml-2 text-sm text-[--color-text-secondary]">({talent.projects} projects)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-grow mb-4">
                    {talent.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-[--color-bg-secondary] rounded-md text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-auto">View Profile</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopTalent;