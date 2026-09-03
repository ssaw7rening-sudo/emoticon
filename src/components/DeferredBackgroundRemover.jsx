// 지연 로딩 배경 제거기 및 에러 격리 래퍼
import React, { Component, useEffect, useRef, useState } from 'react';

class BackgroundRemoverBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('BackgroundRemover isolated error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto my-6 max-w-lg rounded-2xl border border-[#E7DDCF] bg-white p-5 text-center shadow-sm">
          <div className="text-2xl">⚠️</div>
          <p className="mt-2 text-sm font-bold text-[#554C42]">
            배경 제거 도구를 불러오는 중 일시적인 오류가 발생했습니다.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 rounded-xl bg-[#38332D] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#27231F]"
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const lazyWithRetry = (componentImport) =>
  React.lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn('BackgroundRemover chunk load failed, retrying once...', error);
      await new Promise((resolve) => setTimeout(resolve, 600));
      return await componentImport();
    }
  });

const BackgroundRemover = lazyWithRetry(() => import('./BackgroundRemover.jsx'));

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
        <BackgroundRemoverBoundary>
          <React.Suspense fallback={null}>
            <BackgroundRemover lang={lang} />
          </React.Suspense>
        </BackgroundRemoverBoundary>
      ) : null}
    </div>
  );
}
