import type {CSSProperties} from 'react';

const line: CSSProperties = {
  position: 'absolute',
  border: '4px solid rgba(255,255,255,0.58)',
};

export const Pitch: React.FC<{color: string}> = ({color}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 42,
        overflow: 'hidden',
        backgroundColor: '#101113',
        backgroundImage: `linear-gradient(90deg, ${color}0e 50%, transparent 50%), repeating-linear-gradient(0deg, transparent 0px, transparent 31px, rgba(255,255,255,0.025) 32px)`,
        backgroundSize: '100% 100%, 100% 32px',
        border: `5px solid ${color}`,
        boxShadow: `inset 0 0 110px rgba(0,0,0,0.72), 0 28px 70px rgba(0,0,0,0.5), 0 0 36px ${color}2f`,
      }}
    >
      <div style={{...line, inset: 22, borderRadius: 20, borderColor: `${color}b8`}} />
      <div
        style={{
          ...line,
          left: 22,
          right: 22,
          top: '50%',
          borderWidth: '4px 0 0 0',
        }}
      />
      <div
        style={{
          ...line,
          left: '50%',
          top: '50%',
          width: 178,
          height: 178,
          borderRadius: '50%',
          translate: '-50% -50%',
        }}
      />
      <div
        style={{
          ...line,
          left: '50%',
          top: '50%',
          width: 12,
          height: 12,
          border: 0,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.7)',
          translate: '-50% -50%',
        }}
      />
      <div
        style={{
          ...line,
          left: '27%',
          right: '27%',
          top: 22,
          height: 118,
          borderTop: 0,
          borderRadius: '0 0 22px 22px',
        }}
      />
      <div
        style={{
          ...line,
          left: '27%',
          right: '27%',
          bottom: 22,
          height: 118,
          borderBottom: 0,
          borderRadius: '22px 22px 0 0',
        }}
      />
    </div>
  );
};
