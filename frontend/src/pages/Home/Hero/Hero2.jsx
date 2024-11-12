import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import banner2 from "../../../assets/home/banner-2.jpg";

const Hero2 = () => {
    const [showTaglines, setShowTaglines] = useState(0); // Control the display of taglines

    // Triggering the animation for text fade-in
    const fadeIn = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: { duration: 1500 }
    });

    // Change the taglines every 3 seconds to display them one by one
    useEffect(() => {
        const timer = setInterval(() => {
            setShowTaglines(prev => (prev + 1) % 3); // There are 3 taglines, looping through them
        }, 3000); // Change every 3 seconds

        return () => clearInterval(timer); // Clear the interval on component unmount
    }, []);

    const taglines = [
        "Find Your Flow – Where Instructors and Yogis Unite",
        "Join today and see how we can make your vision a reality!",
        "Your Path to Wellness Starts with the Right Guide"
    ];

    return (
        <div className='min-h-screen bg-cover' style={{ backgroundImage: `url(${banner2})` }}>
            <div className="min-h-screen flex justify-start pl-11 text-white items-center bg-black bg-opacity-60">
                <div className="space-y-4">
                    {/* Title Section */}
                    <animated.h3 className="md:text-4xl text-2xl" style={fadeIn}>
                        WE PROVIDE
                    </animated.h3>
                    <animated.h1 className="md:text-7xl text-4xl font-bold" style={fadeIn}>
                        Super Creative Support
                    </animated.h1>

                    {/* Description Section */}
                    <div className="md:w-1/2">
                        <animated.p className="transition-opacity duration-1000" style={fadeIn}>
                            We offer super creative support. Our team is dedicated to helping you achieve your goals with innovative solutions.
                        </animated.p>
                    </div>

                    {/* Tagline Section */}
                    <div className="mt-6">
                        <animated.p className="text-xl md:text-2xl" style={fadeIn}>
                            {taglines[showTaglines]}
                        </animated.p>
                    </div>

                    {/* Button Section */}
                    {/* <div className="flex flex-wrap items-center gap-5 mt-6">
                        <button className='px-7 py-3 rounded-lg bg-secondary font-bold uppercase'>
                            Join Today
                        </button>
                        <button className='px-7 py-[10px] bg-opacity-80 hover:bg-white hover:text-black hover:outline-white duration-200 rounded-lg bg-transparent outline font-bold uppercase'>
                            View Courses
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default Hero2;
