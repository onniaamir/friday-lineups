import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Background: React.FC<{color?: string}> = ({color = '#5bd786'}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#090a0b',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 50% -5%, ${color}3d, transparent 38%), linear-gradient(155deg, #202225 0%, #0b0c0d 56%, #040405 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -220,
          left: -240,
          width: 700,
          height: 700,
          borderRadius: '50%',
          border: `2px solid ${color}35`,
          boxShadow: `0 0 120px ${color}22`,
          scale: interpolate(frame, [0, 720], [1, 1.2], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -420,
          bottom: -160,
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}1f, transparent 66%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.07,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 7px, white 8px)',
        }}
      />
    </AbsoluteFill>
  );
};
