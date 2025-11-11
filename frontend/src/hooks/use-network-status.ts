/**
 * Network Status Hook
 * Detects online/offline status and provides network information
 */

import { useState, useEffect } from 'react'

export interface NetworkStatus {
  isOnline: boolean
  isOffline: boolean
  effectiveType?: string // '4g', '3g', '2g', 'slow-2g'
  downlink?: number // Mbps
  rtt?: number // Round-trip time in ms
}

/**
 * Hook to monitor network status
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof window !== 'undefined' ? window.navigator.onLine : true,
    isOffline: typeof window !== 'undefined' ? !window.navigator.onLine : false,
  })

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const updateNetworkStatus = () => {
      const isOnline = window.navigator.onLine
      
      // Get network information if available
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      setStatus({
        isOnline,
        isOffline: !isOnline,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      })
    }

    // Initial update
    updateNetworkStatus()

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    // Listen for connection changes if available
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    if (connection) {
      connection.addEventListener('change', updateNetworkStatus)
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus)
      }
    }
  }, [])

  return status
}

/**
 * Check if network is slow
 */
export function isSlowNetwork(status: NetworkStatus): boolean {
  if (!status.isOnline) return true
  
  // Check effective type
  if (status.effectiveType === 'slow-2g' || status.effectiveType === '2g') {
    return true
  }
  
  // Check RTT (round-trip time)
  if (status.rtt && status.rtt > 1000) {
    return true
  }
  
  // Check downlink speed
  if (status.downlink && status.downlink < 0.5) {
    return true
  }
  
  return false
}
