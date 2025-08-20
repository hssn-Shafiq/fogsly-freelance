import React from 'react';
import { motion } from 'framer-motion';
import FogCoins from './FogCoins';
import { type Route } from '../types';

const FogCoinsSection = ({ navigate }: { navigate: (route: Route) => void }) => {
    return (
        <section className="bg-[--color-bg-primary] pt-12">
            <div className="container mx-auto px-4">
                 <motion.div
                    className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-[--color-border]"
                    {...{
                        initial: { opacity: 0, y: 40 },
                        whileInView: { opacity: 1, y: 0 },
                        viewport: { once: true },
                        transition: { duration: 0.5, delay: 0.2 },
                    }}
                 >
                    <FogCoins navigate={navigate} />
                </motion.div>
            </div>
        </section>
    );
}

export default FogCoinsSection;