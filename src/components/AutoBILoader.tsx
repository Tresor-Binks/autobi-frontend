// /**
//  * AUTOBI LOADER
//  * 
//  * Écran de chargement affiché au démarrage de l application.
//  * S affiche pendant 5 secondes puis redirige vers la page d accueil.
//  **/

import React from 'react';

export const AutoBILoader: React.FC = () => {
  return (
    <div className='bg-base-100' style={styles.body}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.02); }
          }
          @keyframes shimmer {
            0% { left: -100%; }
            50%, 100% { left: 100%; }
          }
          @keyframes drawPath {
            0% { stroke-dashoffset: 400; }
            40%, 100% { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes fadeInDots {
            0%, 20% { opacity: 0; }
            45%, 100% { opacity: 1; }
          }
          @keyframes syncText {
            0%, 25% { opacity: 0; transform: translateY(10px); filter: blur(5px); }
            35%, 100% { opacity: 1; transform: translateY(0); filter: blur(0); }
          }
        `}
      </style>

      <div style={styles.loaderWrapper}>
        {/* Barre Gauche */}
        <div style={{ ...styles.bar, ...styles.barLeft }}>
          <div style={styles.shimmer} />
        </div>
        
        {/* Barre Milieu */}
        <div style={{ ...styles.bar, ...styles.barCenter }}>
          <div style={styles.shimmer} />
        </div>
        
        {/* Barre Droite */}
        <div style={{ ...styles.bar, ...styles.barRight }}>
          <div style={styles.shimmer} />
        </div>

        {/* Courbe SVG */}
        <svg style={styles.curveSvg} viewBox="0 0 200 250">
          <path
            d="M10,180 L50,150 L90,165 L135,110 L190,105"
            style={styles.pathLine}
          />
          {[
            { cx: 10, cy: 180 },
            { cx: 50, cy: 150 },
            { cx: 90, cy: 165 },
            { cx: 135, cy: 110 },
            { cx: 190, cy: 105 },
          ].map((dot, i) => (
            <circle key={i} cx={dot.cx} cy={dot.cy} r="5" style={styles.dot} />
          ))}
        </svg>
      </div>

      <div style={styles.mainTitle}>AUTO BI</div>

      <div style={styles.footer}>
        Made by <span style={{ color: '#388e3c' }}>ARTICODE</span>
      </div>
    </div>
  );
};

// Styles typés pour TypeScript
const styles: { [key: string]: React.CSSProperties } = {
  body: {
    margin: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    overflow: 'hidden',
  },
  loaderWrapper: {
    position: 'relative',
    width: '200px',
    height: '250px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
  },
  bar: {
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
    animation: 'pulse 2s ease-in-out infinite',
    backgroundImage: 'linear-gradient(0deg, transparent 95%, rgba(255,255,255,0.1) 95%)',
    backgroundSize: '100% 40px',
  },
  barLeft: {
    width: '85px',
    height: '130px',
    backgroundColor: '#2d6a30',
    zIndex: 3,
  },
  barCenter: {
    width: '75px',
    height: '180px',
    backgroundColor: '#388e3c',
    marginLeft: '-25px',
    zIndex: 2,
  },
  barRight: {
    width: '70px',
    height: '240px',
    backgroundColor: '#1b431e',
    marginLeft: '-25px',
    zIndex: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    animation: 'shimmer 2s infinite',
  },
  curveSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    overflow: 'visible',
  },
  pathLine: {
    fill: 'none',
    stroke: '#52b788',
    strokeWidth: 5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDasharray: 400,
    strokeDashoffset: 400,
    animation: 'drawPath 5s ease-in-out',
  },
  dot: {
    fill: '#52b788',
    stroke: '#ffffff',
    strokeWidth: 2,
    opacity: 0,
    animation: 'fadeInDots 5s',
  },
  mainTitle: {
    marginTop: '60px',
    fontSize: '38px',
    fontWeight: 900,
    color: '#1b431e',
    letterSpacing: '8px',
    textTransform: 'uppercase',
    textAlign: 'center',
    animation: 'syncText 5s ease-in-out',
  },
  footer: {
    position: 'absolute',
    bottom: '30px',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '3px',
    color: '#aaa',
    textTransform: 'uppercase',
    animation: 'syncText 5s ease-in-out',
  },
};

export default AutoBILoader;