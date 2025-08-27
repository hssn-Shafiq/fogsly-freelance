import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import StatsBar from '../components/StatsBar';
import Categories from '../components/Categories';
import FeaturedJobs from '../components/FeaturedJobs';
import TopTalent from '../components/TopTalent';
import WhyChooseUs from '../components/WhyChooseUs';
import HowItWorks from '../components/HowItWorks';
import CoinUsage from '../components/CoinUsage';
import Trust from '../components/Trust';
import Visionaries from '../components/Visionaries';
import Testimonials from '../components/Testimonials';
import { type Route } from '../types';
import FogCoinsSection from '../components/FogCoinsSection';

const HomePage = ({ navigate }: { navigate: (route: Route) => void }) => {
  return (
    <>
      <Hero navigate={navigate} />
      <StatsBar />
      <FogCoinsSection navigate={navigate} />
      <Categories />
      <FeaturedJobs />
      <TopTalent />
      <WhyChooseUs />
      <HowItWorks />
      <CoinUsage />
      <Trust />
      <Visionaries />
      <Testimonials />
    </>
  );
};

export default HomePage;