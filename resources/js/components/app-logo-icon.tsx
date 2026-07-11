import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* contorno do olho (amêndoa) */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2 12 Q12 3 22 12 Q12 21 2 12 Z M5 12 Q12 7 19 12 Q12 17 5 12 Z"
            />
            {/* íris (anel) */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 12 A4 4 0 1 1 16 12 A4 4 0 1 1 8 12 Z M9.8 12 A2.2 2.2 0 1 1 14.2 12 A2.2 2.2 0 1 1 9.8 12 Z"
            />
            {/* fóvea (ponto central) */}
            <circle cx="12" cy="12" r="1.1" />
        </svg>
    );
}