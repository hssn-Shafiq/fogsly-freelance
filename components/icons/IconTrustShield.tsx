import React from 'react';

const IconTrustShield = () => (
    <svg width="160" height="180" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 0L0 30V90C0 140 80 180 80 180C80 180 160 140 160 90V30L80 0Z" fill="url(#shield-gradient)"/>
        <path d="M80 0L0 30V90C0 140 80 180 80 180C80 180 160 140 160 90V30L80 0Z" fill="url(#shield-pattern)" fillOpacity="0.1"/>
        <path d="M50 90L70 110L110 70" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="shield-gradient" x1="80" y1="0" x2="80" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--color-accent)" stopOpacity="0.8"/>
                <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0.8"/>
            </linearGradient>
            <pattern id="shield-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                <path d="M0 10h20M10 0v20" stroke="white" strokeWidth="1" strokeOpacity="0.5"/>
            </pattern>
        </defs>
    </svg>
);

export default IconTrustShield;