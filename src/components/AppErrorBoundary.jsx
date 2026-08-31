import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled application error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="min-h-screen bg-[#FFF9EF] px-5 py-16 text-[#4D443A]">
        <section className="mx-auto max-w-md rounded-3xl border border-[#E7DDCF] bg-white p-6 text-center shadow-sm">
          <div className="text-3xl" aria-hidden="true">⚠️</div>
          <h1 className="mt-3 text-lg font-extrabold">예기치 않은 오류가 발생했습니다.</h1>
          <p className="mt-2 text-sm leading-6 text-[#74695D]">
            페이지를 새로고침하면 대부분 정상적으로 복구됩니다.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 min-h-[44px] rounded-xl border border-[#D9CDBD] bg-[#FFFDF9] px-5 py-2.5 text-sm font-bold"
          >
            새로고침
          </button>
        </section>
      </main>
    )
  }
}
