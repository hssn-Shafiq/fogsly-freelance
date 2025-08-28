
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonials } from '../constants';
import { Card, CardContent } from './ui/Card';


const TestimonialImage = ({ testimonial }: { testimonial: typeof testimonials[0] }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const initials = testimonial.author.split(' ').map(n => n[0]).join('');

  return (
    <div className="w-32 h-32 rounded-full mx-auto mb-6 bg-[--color-bg-tertiary] border-4 border-white dark:border-[--color-bg-secondary] shadow-lg flex items-center justify-center overflow-hidden relative">
      {/* Show initials as fallback/loading state */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'
        }`}>
        <span className={`text-5xl font-bold text-[--color-text-secondary] ${!imageLoaded && testimonial.clientImage ? 'animate-pulse' : ''
          }`}>
          {initials}
        </span>
      </div>

      {/* Show image when available and loaded */}
      {testimonial.clientImage && (
        <img
          src={testimonial.clientImage}
          alt={testimonial.author}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
            }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
      )}
    </div>
  );
};

const Testimonials = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);


  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-10 bg-[--color-bg-secondary]">
      <div className="container mx-auto px-4">
        <motion.div
          {...{
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.5 },
          }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-[--color-text-primary]">Success Stories</h2>
          <p className="text-[--color-text-secondary] max-w-2xl mx-auto">
            Hear from our community of freelancers and clients
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          <div className="overflow-hidden relative h-80">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                {...{
                  initial: { opacity: 0, x: 50 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -50 },
                  transition: { duration: 0.5 },
                }}
                className="absolute w-full h-full"
              >
                <Card className="p-8 h-full">
                  <CardContent className="p-0 h-full">
                    <div className="flex flex-col md:flex-row items-center h-full">
                      <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                        {/* <div className="bg-gray-200/50 border-2 border-dashed rounded-full w-32 h-32" /> */}
                        {testimonials[activeTestimonial].clientImage ? (
                          <TestimonialImage testimonial={testimonials[activeTestimonial]} />
                        ) : (
                          <div className="bg-gray-200/50 border-2 border-dashed rounded-full w-32 h-32" />
                        )}
                      </div>
                      <div className="md:w-2/3 md:pl-8 text-center md:text-left">
                        <p className="text-lg italic mb-6 text-[--color-text-primary]">
                          "{testimonials[activeTestimonial].quote}"
                        </p>
                        <div>
                          <p className="font-bold text-[--color-text-primary]">{testimonials[activeTestimonial].author}</p>
                          <p className="text-[--color-text-secondary] mb-2">{testimonials[activeTestimonial].role}</p>
                          <p className="text-sm font-semibold text-[--color-primary]">{testimonials[activeTestimonial].stats}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${activeTestimonial === index ? 'bg-[--color-primary]' : 'bg-[--color-border]'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-2 rounded-full bg-[--color-bg-primary] shadow-md hover:bg-[--color-bg-tertiary] transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-[--color-text-secondary]" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-2 rounded-full bg-[--color-bg-primary] shadow-md hover:bg-[--color-bg-tertiary] transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-[--color-text-secondary]" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;