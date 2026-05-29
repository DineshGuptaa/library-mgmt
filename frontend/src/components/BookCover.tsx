import { useState } from 'react'

interface BookCoverProps {
  src?: string
  alt: string
  className?: string
}

export default function BookCover({ src, alt, className = '' }: BookCoverProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  const showSkeleton = !src || errored || !loaded

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {showSkeleton && <div className="absolute inset-0 shimmer rounded-lg" />}
      {src && !errored && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  )
}
