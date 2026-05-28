'use client'
import { useState } from 'react'

export default function ImageGallery({ urls, alt }: { urls: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  if (urls.length === 0) return null

  return (
    <div>
      <div className="aspect-square bg-zinc-100 rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urls[active]} alt={alt} className="w-full h-full object-contain" />
      </div>
      {urls.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {urls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 ${
                i === active ? 'border-zinc-900' : 'border-transparent'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
