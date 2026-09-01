import React, { useEffect, useRef, useState } from 'react';

const BackgroundRemover = React.lazy(() => import('./BackgroundRemover.jsx'));

export default function DeferredBackgroundRemover({ lang = 'ko' }) {
  const sentinelRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return undefined;

    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: '1600px 0px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={sentinelRef} data-deferred-background-remover style={{ minHeight: '1px' }}>
      {shouldLoad ? (
        <React.Suspense fallback={null}>
          <BackgroundRemover lang={lang} />
        </React.Suspense>
      ) : null}
    </div>
  );
}
