import React from 'react';

const ADSENSE_CLIENT = 'ca-pub-2418297087346563';

export default function AdSenseUnit({ slot, className = '' }) {
  const pushedRef = React.useRef(false);

  React.useEffect(() => {
    if (!slot || pushedRef.current || typeof window === 'undefined') return undefined;

    const timer = window.setTimeout(() => {
      if (pushedRef.current) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (error) {
        console.warn('AdSense unit initialization skipped:', error);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [slot]);

  if (!slot) return null;

  return (
    <div className={className} data-adsense-placement="background-howto">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
