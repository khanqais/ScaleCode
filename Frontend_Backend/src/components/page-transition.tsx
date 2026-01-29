'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface PageTransitionProps {
  children: ReactNode
}


const PageTransition = ({ children }: PageTransitionProps) => {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    
    setIsTransitioning(true)
    
    
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsTransitioning(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [pathname, children])

  return (
    <div
      className={`w-full transition-opacity duration-200 ease-out ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        
        transform: isTransitioning ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'opacity 200ms ease-out, transform 200ms ease-out',
      }}
    >
      {displayChildren}
    </div>
  )
}

export default PageTransition
