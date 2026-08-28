import {HEEBO_FONT} from '../fonts';

export const CaptainBadge: React.FC<{
  compact?: boolean;
  showLabel?: boolean;
}> = ({compact = false, showLabel = false}) => {
  const badgeSize = compact ? 38 : 62;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: compact ? 42 : 66,
        padding: showLabel ? '0 17px 0 7px' : compact ? 2 : 3,
        color: '#111214',
        background: 'linear-gradient(135deg, #ffffff 0%, #d8dde3 100%)',
        border: `${compact ? 3 : 4}px solid rgba(255,255,255,0.98)`,
        clipPath: 'polygon(8% 0, 100% 5%, 94% 100%, 0 91%)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.48)',
        fontFamily: HEEBO_FONT,
        direction: 'ltr',
      }}
    >
      <div
        style={{
          width: badgeSize,
          height: badgeSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: `0 0 ${badgeSize}px`,
          color: '#ffffff',
          backgroundColor: '#111214',
          borderRadius: '50%',
          border: `${compact ? 2 : 3}px solid #ffffff`,
          fontFamily: 'Arial, sans-serif',
          fontSize: compact ? 25 : 41,
          lineHeight: 1,
          fontWeight: 900,
        }}
      >
        C
      </div>
      {showLabel ? (
        <div
          dir="rtl"
          style={{
            minWidth: 80,
            paddingRight: 10,
            fontSize: 29,
            lineHeight: 1,
            fontWeight: 900,
            whiteSpace: 'nowrap',
          }}
        >
          קפטן
        </div>
      ) : null}
    </div>
  );
};
