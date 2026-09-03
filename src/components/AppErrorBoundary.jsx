// 애플리케이션 최상위 예외 처리 및 복구 경계
import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled application error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleHardReload = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      }).catch(() => {});
    }
    window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const errorMessage = this.state.error?.message || String(this.state.error || '알 수 없는 오류')
    const errorStack = this.state.error?.stack || ''

    return (
      <main className="min-h-screen bg-[#FFF9EF] px-5 py-16 text-[#4D443A]">
        <section className="mx-auto max-w-md rounded-3xl border border-[#E7DDCF] bg-white p-6 text-center shadow-sm">
          <div className="text-3xl" aria-hidden="true">⚠️</div>
          <h1 className="mt-3 text-lg font-extrabold">예기치 않은 오류가 발생했습니다.</h1>
          <p className="mt-2 text-sm leading-6 text-[#74695D]">
            새 버전 배포 중 브라우저 캐시 불일치로 발생할 수 있습니다. 아래 새로고침을 누르시면 정상적으로 복구됩니다.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row justify-center">
            <button
              type="button"
              onClick={this.handleReload}
              className="min-h-[44px] rounded-xl bg-[#38332D] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#27231F]"
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={this.handleHardReload}
              className="min-h-[44px] rounded-xl border border-[#D9CDBD] bg-[#FFFDF9] px-5 py-2.5 text-sm font-bold text-[#5F574E] transition hover:bg-[#F8F5EF]"
            >
              캐시 비우고 재시도
            </button>
          </div>

          <details className="mt-5 text-left border-t border-[#F0EAE1] pt-3">
            <summary className="text-xs font-bold text-[#9D9387] cursor-pointer hover:text-[#5F574E]">
              🛠️ 오류 상세 정보 확인
            </summary>
            <div className="mt-2 p-3 bg-[#FDFBF7] rounded-xl border border-[#EBE3D7] text-[11px] font-mono text-[#7A6652] overflow-x-auto whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
              <strong>오류 메시지:</strong> {errorMessage}
              {errorStack && (
                <>
                  <br /><br />
                  <strong>스택 트레이스:</strong>
                  <br />
                  {errorStack}
                </>
              )}
            </div>
          </details>
        </section>
      </main>
    )
  }
}
