import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import { Instagram, Linkedin, Phone, Twitter } from 'lucide-react';

const visionaries = [
  {
    name: 'Ibrar Hussain',
    role: 'Chairman & Chief Advisor',
    bio: "Guiding FOGSLY's strategic direction with decades of experience, ensuring a foundation built on integrity and long-term vision.",
    image: null, // No image available yet
    socials: {
      linkedin: '#',
      twitter: '#',
      instagram: '#',
      phone: '#',
    },
  },
  {
    name: 'Ruh Ul Hassnain',
    role: 'Founder & CEO',
    bio: 'Pioneering the next generation of on-demand services, bridging the gap between talent and opportunity with blockchain technology.',
    image: '/images/CEO.jpg',
    socials: {
      linkedin: '#',
      twitter: '#',
       instagram: 'https://www.instagram.com/ruh_ulhassnain',
      phone: 'tel:03117557999',
    },
  },
  {
    name: 'Alishba Sundas',
    role: 'Co-founder & COO',
    bio: 'Architecting the operational framework of FOGSLY, dedicated to creating a seamless and empowering user experience.',
    image: '/images/Co-founder.jpg',
    socials: {
      linkedin: '#',
      twitter: '#',
       instagram: '#',
      phone: '#',
    },
  },
];

// Image component with loading state and fallback
const VisionaryImage = ({ visionary }: { visionary: typeof visionaries[0] }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const initials = visionary.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="w-32 h-32 rounded-full mx-auto mb-6 bg-[--color-bg-tertiary] border-4 border-white dark:border-[--color-bg-secondary] shadow-lg flex items-center justify-center overflow-hidden relative">
      {/* Show initials as fallback/loading state */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
        imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'
      }`}>
        <span className={`text-5xl font-bold text-[--color-text-secondary] ${
          !imageLoaded && visionary.image ? 'animate-pulse' : ''
        }`}>
          {initials}
        </span>
      </div>
      
      {/* Show image when available and loaded */}
      {visionary.image && (
        <img
          src={visionary.image}
          alt={visionary.name}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${
            imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
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

const Visionaries = () => {
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
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[--color-text-primary]">The Visionaries Behind FOGSLY</h2>
          <p className="text-[--color-text-secondary] text-lg">
            FOGSLY is driven by a leadership team with a passion for innovation and a commitment to empowering professionals worldwide.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visionaries.map((visionary, index) => (
            <motion.div
              key={visionary.name}
              {...{
                initial: { opacity: 0, y: 30 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.5, delay: index * 0.15 },
              }}
              className="h-full"
            >
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                <CardContent className="p-8 pt-6 text-center flex flex-col h-full">
                  <VisionaryImage visionary={visionary} />
                  <h3 className="text-xl font-bold text-[--color-text-primary]">{visionary.name}</h3>
                  <p className="text-[--color-primary] font-semibold mt-1">{visionary.role}</p>
                  <p className="text-sm text-[--color-text-secondary] mt-4 flex-grow">
                    "{visionary.bio}"
                  </p>
                  <div className="flex justify-center gap-4 mt-6">
                    <a href={visionary.socials.linkedin} aria-label={`${visionary.name} on LinkedIn`} className="text-[--color-text-secondary] hover:text-[--color-primary] transition-colors">
                      <Linkedin className="w-6 h-6" />
                    </a>
                    <a href={visionary.socials.twitter} aria-label={`${visionary.name} on Twitter`} className="text-[--color-text-secondary] hover:text-[--color-primary] transition-colors">
                      <Twitter className="w-6 h-6" />
                    </a>
                    <a href={visionary.socials.instagram} aria-label={`${visionary.name} on Instagram`} className="text-[--color-text-secondary] hover:text-[--color-primary] transition-colors">
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a href={visionary.socials.phone} aria-label={`${visionary.name} on Phone`} className="text-[--color-text-secondary] hover:text-[--color-primary] transition-colors">
                      <Phone className="w-6 h-6" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Visionaries;