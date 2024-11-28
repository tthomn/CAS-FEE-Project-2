import React from "react";

const FlyingBees: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
            {}
            <img
                src="/images/bee1.png"
                alt="Bee 1"
                className="absolute w-16 h-16 animate-bounceBeeLeft"
                style={{
                    top: "50%",
                    left: "25%",
                    transform: "translate(-50%, -50%)",
                }}
            />
            {}
            <img
                src="/images/bee2.png"
                alt="Bee 2"
                className="absolute w-20 h-20 animate-bounceBeeRight"
                style={{
                    top: "70%",
                    right: "25%",
                    transform: "translate(50%, -50%)",
                }}
            />
        </div>
    );
};

export default FlyingBees;
