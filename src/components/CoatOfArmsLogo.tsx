import React from 'react';

interface CoatOfArmsLogoProps {
  className?: string;
  size?: number;
}

export const CoatOfArmsLogo: React.FC<CoatOfArmsLogoProps> = ({ 
  className = "w-12 h-14", 
  size 
}) => {
  const width = size ? size : undefined;
  const height = size ? Math.round(size * 1.15) : undefined;

  return (
    <svg
      viewBox="0 0 320 370"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width, height }}
      aria-label="Escudo Municipal - La Voz de Galicia"
    >
      <defs>
        {/* Sky / Yellow Gold Gradient for Shield */}
        <linearGradient id="shieldGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        {/* Crown Red Velvet Gradient */}
        <linearGradient id="crownRed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>

        {/* Church Brick Pattern */}
        <linearGradient id="churchBrick" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
      </defs>

      {/* ================= CORONA REAL (ROYAL CROWN) ================= */}
      <g id="Crown">
        {/* Top Orb & Cross */}
        <circle cx="160" cy="18" r="8" fill="#eab308" stroke="#000" strokeWidth="2.5" />
        <path d="M160 8 V28 M150 18 H170" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        <circle cx="160" cy="18" r="3" fill="#3b82f6" />

        {/* Red Velvet Interior Arches */}
        <path
          d="M 85 110 C 85 50, 160 30, 160 30 C 160 30, 235 50, 235 110 Z"
          fill="url(#crownRed)"
          stroke="#000"
          strokeWidth="3.5"
        />

        {/* Crown Diadem Arches (Gold Bands) */}
        <path
          d="M 85 110 Q 120 40 160 30 Q 200 40 235 110"
          fill="none"
          stroke="#eab308"
          strokeWidth="12"
        />
        <path
          d="M 85 110 Q 120 40 160 30 Q 200 40 235 110"
          fill="none"
          stroke="#000"
          strokeWidth="3.5"
        />

        {/* Center Arch */}
        <path
          d="M 160 30 V 110"
          stroke="#eab308"
          strokeWidth="10"
        />
        <path
          d="M 160 30 V 110"
          stroke="#000"
          strokeWidth="3.5"
        />

        {/* Pearls on Arches */}
        <circle cx="115" cy="62" r="5" fill="#ffffff" stroke="#000" strokeWidth="2" />
        <circle cx="138" cy="42" r="5" fill="#ffffff" stroke="#000" strokeWidth="2" />
        <circle cx="182" cy="42" r="5" fill="#ffffff" stroke="#000" strokeWidth="2" />
        <circle cx="205" cy="62" r="5" fill="#ffffff" stroke="#000" strokeWidth="2" />

        {/* Main Crown Rim Base */}
        <path
          d="M 75 105 H 245 V 125 H 75 Z"
          fill="#ca8a04"
          stroke="#000"
          strokeWidth="4"
        />
        
        {/* Crown Jewels (Rubies & Emeralds) */}
        <polygon points="100,110 110,115 100,120 90,115" fill="#ef4444" stroke="#000" strokeWidth="1.5" />
        <ellipse cx="130" cy="115" rx="6" ry="4" fill="#22c55e" stroke="#000" strokeWidth="1.5" />
        <polygon points="160,110 170,115 160,120 150,115" fill="#ef4444" stroke="#000" strokeWidth="1.5" />
        <ellipse cx="190" cy="115" rx="6" ry="4" fill="#22c55e" stroke="#000" strokeWidth="1.5" />
        <polygon points="220,110 230,115 220,120 210,115" fill="#ef4444" stroke="#000" strokeWidth="1.5" />

        {/* Leaf points along crown base */}
        <path d="M 75 105 Q 85 90 95 105 Q 110 90 125 105 Q 140 88 160 105 Q 180 88 195 105 Q 210 90 225 105 Q 235 90 245 105" fill="#eab308" stroke="#000" strokeWidth="3" />
      </g>

      {/* ================= ESCUDO (SHIELD BODY) ================= */}
      <g id="Shield">
        {/* Outer Shield Shape */}
        <path
          d="M 80 130 H 240 V 270 C 240 330, 160 360, 160 360 C 160 360, 80 330, 80 270 Z"
          fill="url(#shieldGold)"
          stroke="#000"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Inner Shield Border Line */}
        <path
          d="M 86 136 H 234 V 267 C 234 322, 160 351, 160 351 C 160 351, 86 322, 86 267 Z"
          fill="none"
          stroke="#000000"
          strokeWidth="2"
        />

        {/* Clip Path for Shield Interior Features */}
        <clipPath id="shieldClip">
          <path d="M 82 132 H 238 V 268 C 238 325, 160 355, 160 355 C 160 355, 82 325, 82 268 Z" />
        </clipPath>

        <g clipPath="url(#shieldClip)">
          {/* Church / Hermitage (Iglesia / Ermita) */}
          <g id="Church">
            {/* Main Tower Body */}
            <path
              d="M 105 160 H 160 V 270 H 105 Z"
              fill="url(#churchBrick)"
              stroke="#000"
              strokeWidth="3.5"
            />

            {/* Brick Lines */}
            <path
              d="M 105 175 H 160 M 105 190 H 160 M 105 205 H 160 M 105 220 H 160 M 105 235 H 160 M 105 250 H 160"
              stroke="#451a03"
              strokeWidth="1.5"
            />

            {/* Belfry Roof with Cross */}
            <path
              d="M 100 160 L 132.5 140 L 165 160 Z"
              fill="#0d9488"
              stroke="#000"
              strokeWidth="3"
            />
            <path d="M 132.5 128 V 142 M 126 134 H 139" stroke="#000" strokeWidth="3" strokeLinecap="round" />

            {/* Bell Arches (Campanario) */}
            <path
              d="M 115 170 C 115 165, 128 165, 128 170 V 200 H 115 Z"
              fill="#fef08a"
              stroke="#000"
              strokeWidth="2.5"
            />
            <path
              d="M 137 170 C 137 165, 150 165, 150 170 V 200 H 137 Z"
              fill="#fef08a"
              stroke="#000"
              strokeWidth="2.5"
            />

            {/* Stairway / White Steps */}
            <path
              d="M 125 240 H 155 V 246 H 132 V 252 H 140 V 258 H 148 V 264 H 155 V 270"
              fill="#ffffff"
              stroke="#000"
              strokeWidth="2"
            />
          </g>

          {/* Leafy Green Tree (Árbol) */}
          <g id="Tree">
            {/* Trunk */}
            <path d="M 205 220 L 202 270 H 215 L 210 220 Z" fill="#78350f" stroke="#000" strokeWidth="3" />

            {/* Tree Foliage Canopy */}
            <path
              d="M 175 200 C 160 180, 180 150, 205 155 C 220 140, 245 155, 245 180 C 255 195, 240 225, 220 220 C 200 230, 180 220, 175 200 Z"
              fill="#15803d"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Foliage Texture */}
            <circle cx="195" cy="180" r="12" fill="#22c55e" opacity="0.6" />
            <circle cx="220" cy="185" r="10" fill="#166534" opacity="0.8" />
          </g>

          {/* Green Grass Base */}
          <path
            d="M 80 260 Q 130 250 160 262 Q 200 252 240 260 V 285 H 80 Z"
            fill="#4ade80"
            stroke="#000"
            strokeWidth="3"
          />

          {/* Ocean Wavy Water Lines (Olas del Mar) */}
          <g id="OceanWaves">
            {/* Blue Wave 1 */}
            <path
              d="M 80 280 Q 100 270 120 280 T 160 280 T 200 280 T 240 280 V 300 H 80 Z"
              fill="#2563eb"
              stroke="#000"
              strokeWidth="3"
            />
            {/* White Stripe 1 */}
            <path
              d="M 80 295 Q 100 288 120 295 T 160 295 T 200 295 T 240 295 V 310 H 80 Z"
              fill="#ffffff"
              stroke="#000"
              strokeWidth="2.5"
            />
            {/* Blue Wave 2 */}
            <path
              d="M 80 308 Q 100 300 120 308 T 160 308 T 200 308 T 240 308 V 330 H 80 Z"
              fill="#1d4ed8"
              stroke="#000"
              strokeWidth="3"
            />
            {/* White Stripe 2 */}
            <path
              d="M 80 325 Q 100 318 120 325 T 160 325 T 200 325 T 240 325 V 340 H 80 Z"
              fill="#ffffff"
              stroke="#000"
              strokeWidth="2"
            />
            {/* Deep Blue Bottom */}
            <path
              d="M 80 338 Q 100 332 120 338 T 160 338 T 200 338 T 240 338 V 370 H 80 Z"
              fill="#1e40af"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};
