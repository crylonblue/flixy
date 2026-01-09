'use client'

import { useEffect, useRef } from 'react'

export default function ApiDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Dynamically load Scalar
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference'
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div ref={containerRef} style={{ height: '100vh' }}>
      <script
        id="api-reference"
        data-url="/api/v1/openapi.json"
        data-configuration={JSON.stringify({
          theme: 'default',
          hideModels: false,
          hideDownloadButton: false,
          darkMode: false,
          searchHotKey: 'k',
        })}
      />
    </div>
  )
}
