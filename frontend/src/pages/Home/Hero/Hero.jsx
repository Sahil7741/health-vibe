import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import bgImg from '../../../assets/home/banner-1.jpg';

const Hero = () => {
    const [showTaglines, setShowTaglines] = useState(0); // Control the display of taglines

    // Triggering the animation for text fade-in
    const fadeIn = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: { duration: 1500 }
    });

    // Change the taglines every 2 seconds to display them one by one
    useEffect(() => {
        const timer = setInterval(() => {
            setShowTaglines(prev => (prev + 1) % 3); // There are 3 taglines, looping through them
        }, 3000); // Change every 3 seconds

        return () => clearInterval(timer); // Clear the interval on component unmount
    }, []);

    const taglines = [
        "Find your balance, unlock your potential, and live your best life with yoga.",
        "Your journey towards inner peace starts here. Join us today!",
        "Connect with Certified Instructors for a Healthier You"
    ];

    return (
        <div className='min-h-screen bg-cover' style={{ backgroundImage: `url(${bgImg})` }}>
            <div className="min-h-screen flex justify-start pl-11 text-white items-center bg-black bg-opacity-60">
                <div className="space-y-4">
                    {/* Title Section */}
                    <animated.h3 className="md:text-4xl text-2xl" style={fadeIn}>
                    Your Perfect Health Vibe Awaits
                    </animated.h3>
                    <animated.h1 className="md:text-7xl text-4xl font-bold" style={fadeIn}>
                    Vibe with Wellness.
                    </animated.h1>

                    {/* Tagline Section */}
                    <div className="mt-6">
                        <animated.p className="text-xl md:text-2xl" style={fadeIn}>
                            {taglines[showTaglines]}
                        </animated.p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
