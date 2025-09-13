'use client';
import { useEffect, useState, useCallback } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleGameClick = useCallback(async () => {
    if (typeof window !== 'undefined' && mounted) {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        try {
          // Request fullscreen before navigating on mobile
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
            await document.documentElement.mozRequestFullScreen();
          }
          
          // Hide address bar
          window.scrollTo(0, 1);
          setTimeout(() => window.scrollTo(0, 1), 100);
        } catch (err) {
          console.log('Fullscreen request failed or blocked');
        }
      }
      
      // Navigate to game
      window.location.href = '/game';
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <style jsx>{`
            .pencil {
              display: block;
              width: 10em;
              height: 10em;
            }
            .pencil__body1,
            .pencil__body2,
            .pencil__body3,
            .pencil__eraser,
            .pencil__eraser-skew,
            .pencil__point,
            .pencil__rotate,
            .pencil__stroke {
              animation-duration: 3s;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
            }
            .pencil__body1,
            .pencil__body2,
            .pencil__body3 {
              transform: rotate(-90deg);
            }
            .pencil__body1 {
              animation-name: pencilBody1;
            }
            .pencil__body2 {
              animation-name: pencilBody2;
            }
            .pencil__body3 {
              animation-name: pencilBody3;
            }
            .pencil__eraser {
              animation-name: pencilEraser;
              transform: rotate(-90deg) translate(49px,0);
            }
            .pencil__eraser-skew {
              animation-name: pencilEraserSkew;
              animation-timing-function: ease-in-out;
            }
            .pencil__point {
              animation-name: pencilPoint;
              transform: rotate(-90deg) translate(49px,-30px);
            }
            .pencil__rotate {
              animation-name: pencilRotate;
            }
            .pencil__stroke {
              animation-name: pencilStroke;
              transform: translate(100px,100px) rotate(-113deg);
            }
            @keyframes pencilBody1 {
              from,
              to {
                stroke-dashoffset: 351.86;
                transform: rotate(-90deg);
              }
              50% {
                stroke-dashoffset: 150.8;
                transform: rotate(-225deg);
              }
            }
            @keyframes pencilBody2 {
              from,
              to {
                stroke-dashoffset: 406.84;
                transform: rotate(-90deg);
              }
              50% {
                stroke-dashoffset: 174.36;
                transform: rotate(-225deg);
              }
            }
            @keyframes pencilBody3 {
              from,
              to {
                stroke-dashoffset: 296.88;
                transform: rotate(-90deg);
              }
              50% {
                stroke-dashoffset: 127.23;
                transform: rotate(-225deg);
              }
            }
            @keyframes pencilEraser {
              from,
              to {
                transform: rotate(-45deg) translate(49px,0);
              }
              50% {
                transform: rotate(0deg) translate(49px,0);
              }
            }
            @keyframes pencilEraserSkew {
              from,
              32.5%,
              67.5%,
              to {
                transform: skewX(0);
              }
              35%,
              65% {
                transform: skewX(-4deg);
              }
              37.5%, 
              62.5% {
                transform: skewX(8deg);
              }
              40%,
              45%,
              50%,
              55%,
              60% {
                transform: skewX(-15deg);
              }
              42.5%,
              47.5%,
              52.5%,
              57.5% {
                transform: skewX(15deg);
              }
            }
            @keyframes pencilPoint {
              from,
              to {
                transform: rotate(-90deg) translate(49px,-30px);
              }
              50% {
                transform: rotate(-225deg) translate(49px,-30px);
              }
            }
            @keyframes pencilRotate {
              from {
                transform: translate(100px,100px) rotate(0);
              }
              to {
                transform: translate(100px,100px) rotate(720deg);
              }
            }
            @keyframes pencilStroke {
              from {
                stroke-dashoffset: 439.82;
                transform: translate(100px,100px) rotate(-113deg);
              }
              50% {
                stroke-dashoffset: 164.93;
                transform: translate(100px,100px) rotate(-113deg);
              }
              75%,
              to {
                stroke-dashoffset: 439.82;
                transform: translate(100px,100px) rotate(112deg);
              }
            }
          `}</style>
          
          <svg xmlns="http://www.w3.org/2000/svg" height="200px" width="200px" viewBox="0 0 200 200" className="pencil">
            <defs>
              <clipPath id="pencil-eraser">
                <rect height="30" width="30" ry="5" rx="5"></rect>
              </clipPath>
            </defs>
            <circle 
              transform="rotate(-113,100,100)" 
              strokeLinecap="round" 
              strokeDashoffset="439.82" 
              strokeDasharray="439.82 439.82" 
              strokeWidth="2" 
              stroke="currentColor" 
              fill="none" 
              r="70" 
              className="pencil__stroke"
            ></circle>
            <g transform="translate(100,100)" className="pencil__rotate">
              <g fill="none">
                <circle 
                  transform="rotate(-90)" 
                  strokeDashoffset="402" 
                  strokeDasharray="402.12 402.12" 
                  strokeWidth="30" 
                  stroke="hsl(223,90%,50%)" 
                  r="64" 
                  className="pencil__body1"
                ></circle>
                <circle 
                  transform="rotate(-90)" 
                  strokeDashoffset="465" 
                  strokeDasharray="464.96 464.96" 
                  strokeWidth="10" 
                  stroke="hsl(223,90%,60%)" 
                  r="74" 
                  className="pencil__body2"
                ></circle>
                <circle 
                  transform="rotate(-90)" 
                  strokeDashoffset="339" 
                  strokeDasharray="339.29 339.29" 
                  strokeWidth="10" 
                  stroke="hsl(223,90%,40%)" 
                  r="54" 
                  className="pencil__body3"
                ></circle>
              </g>
              <g transform="rotate(-90) translate(49,0)" className="pencil__eraser">
                <g className="pencil__eraser-skew">
                  <rect height="30" width="30" ry="5" rx="5" fill="hsl(223,90%,70%)"></rect>
                  <rect clipPath="url(#pencil-eraser)" height="30" width="5" fill="hsl(223,90%,60%)"></rect>
                  <rect height="20" width="30" fill="hsl(223,10%,90%)"></rect>
                  <rect height="20" width="15" fill="hsl(223,10%,70%)"></rect>
                  <rect height="20" width="5" fill="hsl(223,10%,80%)"></rect>
                  <rect height="2" width="30" y="6" fill="hsla(223,10%,10%,0.2)"></rect>
                  <rect height="2" width="30" y="13" fill="hsla(223,10%,10%,0.2)"></rect>
                </g>
              </g>
              <g transform="rotate(-90) translate(49,-30)" className="pencil__point">
                <polygon points="15 0,30 30,0 30" fill="hsl(33,90%,70%)"></polygon>
                <polygon points="15 0,6 30,0 30" fill="hsl(33,90%,50%)"></polygon>
                <polygon points="15 0,20 10,10 10" fill="hsl(223,10%,10%)"></polygon>
              </g>
            </g>
          </svg>
          
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .modern-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50px;
          color: white;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.5px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
          text-transform: uppercase;
          min-width: 200px;
        }

        .modern-button:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.6s;
        }

        .modern-button:hover:before {
          left: 100%;
        }

        .modern-button:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        .modern-button:active {
          transform: translateY(-1px) scale(1.02);
          transition: all 0.1s;
        }

        .modern-button .button-icon {
          margin-right: 12px;
          transition: transform 0.3s ease;
        }

        .modern-button:hover .button-icon {
          transform: rotate(15deg) scale(1.1);
        }

        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .shape {
          position: absolute;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .shape:nth-child(1) { 
          left: 10%; 
          top: 20%; 
          animation-delay: 0s; 
          animation-duration: 8s;
        }
        .shape:nth-child(2) { 
          right: 10%; 
          top: 30%; 
          animation-delay: 2s; 
          animation-duration: 6s;
        }
        .shape:nth-child(3) { 
          left: 20%; 
          bottom: 30%; 
          animation-delay: 4s; 
          animation-duration: 7s;
        }
        .shape:nth-child(4) { 
          right: 20%; 
          bottom: 20%; 
          animation-delay: 1s; 
          animation-duration: 9s;
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          33% { 
            transform: translateY(-30px) rotate(120deg); 
          }
          66% { 
            transform: translateY(-10px) rotate(240deg); 
          }
        }

        .glass-card {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
        }

        .step-card {
          backdrop-filter: blur(15px);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          transition: all 0.3s ease;
        }

        .step-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .step-number {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .title-glow {
          text-shadow: 0 0 20px rgba(102, 126, 234, 0.5),
                       0 0 40px rgba(118, 75, 162, 0.3),
                       0 0 60px rgba(102, 126, 234, 0.1);
        }

        @media (max-width: 640px) {
          .modern-button {
            padding: 14px 28px;
            font-size: 16px;
            min-width: 180px;
          }
        }
      `}</style>

      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Floating Background Shapes */}
        <div className="floating-shapes">
          <div className="shape w-32 h-32 bg-blue-500 rounded-full"></div>
          <div className="shape w-24 h-24 bg-purple-500 rounded-full"></div>
          <div className="shape w-20 h-20 bg-pink-500 rounded-full"></div>
          <div className="shape w-28 h-28 bg-green-500 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Main Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-6 title-glow">
              Jetpack Rider
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 leading-relaxed px-4 font-medium">
              Embark on an epic space adventure where knowledge is your fuel!
            </p>
          </div>

          {/* How to Play Container */}
          <div className="mb-16 max-w-4xl mx-auto px-4">
            <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-8 text-center">How to Play</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="step-card text-center p-6 rounded-2xl">
                  <div className="flex justify-center mb-4">
                    <span className="step-number w-16 h-16 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      1
                    </span>
                  </div>
                  <h4 className="font-semibold text-white mb-3 text-lg">Launch Your Jetpack</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">Use SPACEBAR (desktop) or tap (mobile) to fly up. Gravity pulls you down naturally.</p>
                </div>
                
                <div className="step-card text-center p-6 rounded-2xl">
                  <div className="flex justify-center mb-4">
                    <span className="step-number w-16 h-16 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      2
                    </span>
                  </div>
                  <h4 className="font-semibold text-white mb-3 text-lg">Dodge Obstacles</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">Avoid the red obstacles. Each hit costs a life - you only have 3!</p>
                </div>
                
                <div className="step-card text-center p-6 rounded-2xl">
                  <div className="flex justify-center mb-4">
                    <span className="step-number w-16 h-16 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      3
                    </span>
                  </div>
                  <h4 className="font-semibold text-white mb-3 text-lg">Answer Questions</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">When questions appear, fly through the correct answer. Each correct answer gives you 25 points!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleGameClick}
              className="modern-button"
            >
              <svg 
                viewBox="0 0 16 16" 
                fill="currentColor" 
                height="20"
                width="20" 
                xmlns="http://www.w3.org/2000/svg" 
                className="button-icon"
              > 
                <path d="M11.5 6.027a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm-6.5-3h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1z"></path> 
                <path d="M3.051 3.26a.5.5 0 0 1 .354-.613l1.932-.518a.5.5 0 0 1 .62.39c.655-.079 1.35-.117 2.043-.117.72 0 1.443.041 2.12.126a.5.5 0 0 1 .622-.399l1.932.518a.5.5 0 0 1 .306.729c.14.09.266.19.373.297.408.408.78 1.05 1.095 1.772.32.733.599 1.591.805 2.466.206.875.34 1.78.364 2.606.024.816-.059 1.602-.328 2.21a1.42 1.42 0 0 1-1.445.83c-.636-.067-1.115-.394-1.513-.773-.245-.232-.496-.526-.739-.808-.126-.148-.25-.292-.368-.423-.728-.804-1.597-1.527-3.224-1.527-1.627 0-2.496.723-3.224 1.527-.119.131-.242.275-.368.423-.243.282-.494.575-.739.808-.398.38-.877.706-1.513.773a1.42 1.42 0 0 1-1.445-.83c-.27-.608-.352-1.395-.329-2.21.024-.826.16-1.73.365-2.606.206-.875.486-1.733.805-2.466.315-.722.687-1.364 1.094-1.772a2.34 2.34 0 0 1 .433-.335.504.504 0 0 1-.028-.079zm2.036.412c-.877.185-1.469.443-1.733.708-.276.276-.587.783-.885 1.465a13.748 13.748 0 0 0-.748 2.295 12.351 12.351 0 0 0-.339 2.406c-.022.755.062 1.368.243 1.776a.42.42 0 0 0 .426.24c.327-.034.61-.199.929-.502.212-.202.4-.423.615-.674.133-.156.276-.323.44-.504C4.861 9.969 5.978 9.027 8 9.027s3.139.942 3.965 1.855c.164.181.307.348.44.504.214.251.403.472.615.674.318.303.601.468.929.503a.42.42 0 0 0 .426-.241c.18-.408.265-1.02.243-1.776a12.354 12.354 0 0 0-.339-2.406 13.753 13.753 0 0 0-.748-2.295c-.298-.682-.61-1.19-.885-1.465-.264-.265-.856-.523-1.733-.708-.85-.179-1.877-.27-2.913-.27-1.036 0-2.063.091-2.913.27z"></path>
              </svg>
              Play Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}