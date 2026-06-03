import { Component } from 'react'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center">
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-2xl mb-4">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-display">
            Terjadi Kesalahan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
            Komponen mengalami error. Silakan coba lagi atau hubungi tim support.
          </p>
          <Button onClick={this.handleReset}>Coba Lagi</Button>
        </div>
      )
    }
    return this.props.children
  }
}
