import React from 'react'
import { I18nProvider } from './i18n/I18nProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App'

export const AppWrapper: React.FC = () => {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </I18nProvider>
  )
}

export default AppWrapper
