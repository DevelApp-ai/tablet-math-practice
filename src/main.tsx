import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { startConsoleCapture } from './lib/diagnostics/errorReport'
import "./main.css"
import "./styles/theme.css"
import "./index.css"

startConsoleCapture()

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
