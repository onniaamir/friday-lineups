import {random} from 'remotion';
import {matchdayWeekIndex} from './lineup-backgrounds';

export type IntroPosterLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  objectPosition: string;
  zIndex: number;
};

type AccentBandLayout = {
  top: number;
  height: number;
  rotate: number;
  color: string;
  clipPath: string;
};

export type IntroLayout = {
  id: 'classic' | 'rising' | 'cascade';
  posters: Record<'blue' | 'white' | 'red', IntroPosterLayout>;
  banner: {
    top: number;
    height: number;
    rotate: number;
    clipPath: string;
    background: string;
    topAccent: AccentBandLayout;
    bottomAccent: AccentBandLayout;
    title: {
      left: number;
      right: number;
      top: number;
      fontSize: number;
      rotate: number;
      color: string;
      textShadow: string;
    };
    icon: {
      left?: number;
      right?: number;
      top: number;
      size: number;
    };
  };
};

const introLayouts: IntroLayout[] = [
  {
    id: 'classic',
    posters: {
      blue: {left: 35, top: 155, width: 470, height: 660, angle: -5, objectPosition: '48% 50%', zIndex: 2},
      white: {left: 575, top: 250, width: 470, height: 650, angle: 4, objectPosition: '50% 50%', zIndex: 3},
      red: {left: 290, top: 760, width: 500, height: 650, angle: -3, objectPosition: '52% 50%', zIndex: 4},
    },
    banner: {
      top: 1390,
      height: 260,
      rotate: -2,
      clipPath: 'polygon(0 9%, 100% 0, 97% 88%, 2% 100%)',
      background: '#08090a',
      topAccent: {top: 1372, height: 30, rotate: 1, color: '#1677ff', clipPath: 'polygon(0 22%, 100% 0, 96% 100%, 4% 77%)'},
      bottomAccent: {top: 1622, height: 26, rotate: -3, color: '#ef3340', clipPath: 'polygon(0 0, 97% 16%, 100% 100%, 4% 72%)'},
      title: {
        left: 238,
        right: 28,
        top: 1432,
        fontSize: 162,
        rotate: -2,
        color: '#ffffff',
        textShadow: '0 9px 0 rgba(0,0,0,0.58)',
      },
      icon: {left: 55, top: 1425, size: 166},
    },
  },
  {
    id: 'rising',
    posters: {
      blue: {left: 48, top: 135, width: 455, height: 650, angle: -3, objectPosition: '48% 48%', zIndex: 3},
      white: {left: 578, top: 170, width: 455, height: 650, angle: 4, objectPosition: '50% 48%', zIndex: 2},
      red: {left: 280, top: 1120, width: 520, height: 750, angle: -1, objectPosition: '52% 50%', zIndex: 4},
    },
    banner: {
      top: 940,
      height: 245,
      rotate: -3,
      clipPath: 'polygon(1% 7%, 100% 0, 97% 91%, 3% 100%)',
      background: 'linear-gradient(104deg, #f23b4c 0%, #c4142f 60%, #8e0d24 100%)',
      topAccent: {top: 920, height: 30, rotate: 2, color: '#08090a', clipPath: 'polygon(2% 0, 100% 19%, 97% 100%, 0 70%)'},
      bottomAccent: {top: 1164, height: 28, rotate: -1, color: '#19b9ff', clipPath: 'polygon(0 18%, 97% 0, 100% 76%, 3% 100%)'},
      title: {
        left: 38,
        right: 226,
        top: 982,
        fontSize: 150,
        rotate: -3,
        color: '#ffffff',
        textShadow: '0 8px 0 rgba(80,0,14,0.72)',
      },
      icon: {right: 50, top: 965, size: 158},
    },
  },
  {
    id: 'cascade',
    posters: {
      blue: {left: -24, top: 270, width: 520, height: 700, angle: -3, objectPosition: '50% 50%', zIndex: 2},
      white: {left: 540, top: 300, width: 520, height: 700, angle: 3, objectPosition: '50% 50%', zIndex: 3},
      red: {left: 250, top: 890, width: 580, height: 860, angle: -1, objectPosition: '52% 50%', zIndex: 4},
    },
    banner: {
      top: 45,
      height: 200,
      rotate: 0,
      clipPath: 'polygon(0 8%, 98% 0, 100% 89%, 2% 100%)',
      background: 'linear-gradient(98deg, #f8edcc 0%, #e7bd55 58%, #c98b20 100%)',
      topAccent: {top: 25, height: 28, rotate: -1, color: '#007a68', clipPath: 'polygon(0 15%, 97% 0, 100% 78%, 2% 100%)'},
      bottomAccent: {top: 238, height: 26, rotate: 1, color: '#101214', clipPath: 'polygon(2% 0, 100% 19%, 97% 100%, 0 71%)'},
      title: {
        left: 188,
        right: 25,
        top: 78,
        fontSize: 132,
        rotate: 0,
        color: '#09231f',
        textShadow: '0 6px 0 rgba(255,255,255,0.38)',
      },
      icon: {left: 45, top: 72, size: 124},
    },
  },
];

const introLayoutCycle = introLayouts
  .map((layout) => ({layout, order: random(`intro-layout:${layout.id}`)}))
  .sort((left, right) => left.order - right.order)
  .map(({layout}) => layout);

export const selectIntroLayout = (matchDate: string) =>
  introLayoutCycle[matchdayWeekIndex(matchDate) % introLayoutCycle.length];
