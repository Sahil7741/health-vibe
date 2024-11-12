import React, { useState, useEffect } from 'react';

const Map = () => {
    const messages = [
        "We provide best-in-class service",
        "Health Vibe",
        "Because health matters"
    ];

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const messageDisplayTime = 3000; // Time each message stays fully visible
    const fadeTransitionTime = 1000; // Fade in and fade out duration

    useEffect(() => {
        const fadeOutTimer = setTimeout(() => setFade(false), messageDisplayTime);
        
        const fadeInTimer = setTimeout(() => {
            setFade(true);
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, messageDisplayTime + fadeTransitionTime);

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(fadeInTimer);
        };
    }, [currentMessageIndex]);

    return (
        <div
            className='md:h-[300px] h-full my-11 bg-secondary'
            style={{ backgroundImage: `url('https://validthemes.live/themeforest/edukat/assets/img/map.svg')` }}
        >
            <div
                className="md:h-[300px] text-white bg-black flex justify-center items-center bg-opacity-40"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            >
                <div
                    className="text-center"
                    style={{
                        opacity: fade ? 1 : 0,
                        transition: `opacity ${fadeTransitionTime}ms ease-in-out`,
                    }}
                >
                    <h1 className='text-5xl font-bold'>
                        {messages[currentMessageIndex]}
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default Map;
