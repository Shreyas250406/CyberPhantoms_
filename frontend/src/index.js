import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './Dashboard';
import './index.css';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1>🚨 CyberPhantoms Dashboard Error</h1>
            <p>We encountered an unexpected error. Please try refreshing the page.</p>
            <button onClick={this.handleRefresh} className="refresh-btn">
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <Dashboard />
    </GlobalErrorBoundary>
  </React.StrictMode>
);