import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { featuredJobs } from '../constants';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';

const FeaturedJobs = () => {
  return (
    <section className="py-5 bg-[--color-bg-secondary]">
      <div className="container mx-auto px-4">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-12 text-center md:text-left">
          <motion.div
            {...{
              initial: { opacity: 0, x: -20 },
              whileInView: { opacity: 1, x: 0 },
              viewport: { once: true },
              transition: { duration: 0.5 },
            }}
            className="mb-4 md:mb-0"
          >
            <h2 className="text-3xl font-bold text-[--color-text-primary]">Featured Jobs</h2>
            <p className="text-[--color-text-secondary]">High-paying opportunities from top clients</p>
          </motion.div>
          <motion.div
            {...{
              initial: { opacity: 0, x: 20 },
              whileInView: { opacity: 1, x: 0 },
              viewport: { once: true },
              transition: { duration: 0.5 },
            }}
          >
            <Button variant="link" className="mx-auto md:mx-0">
              View all jobs <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
        
        {/* Jobs Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {featuredJobs.map((job, index) => (
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
              <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-[--color-text-primary]">{job.title}</CardTitle>
                  <CardDescription className="text-[--color-primary] font-bold !mt-2">
                    {job.budget}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[--color-bg-secondary] rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-sm text-[--color-text-secondary]">
                    <Clock className="w-4 h-4 mr-2" /> {job.type}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Apply Now</Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
