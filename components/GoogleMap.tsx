'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

type GoogleMapProps = {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
};

export default function GoogleMap({
  center = { lat: 48.8738, lng: 2.3332 }, // Galeries Lafayette Paris 좌표
  zoom = 15,
  className = '',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current || !window.google) return;

    // 커스텀 스타일 (미니멀 블랙&화이트)
    const mapStyles: google.maps.MapTypeStyle[] = [
      {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#1b1b1b' }],
      },
      {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#e5e5e5' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#f0f0f0' }],
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#fafafa' }],
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#e8f5e9' }],
      },
    ];

    // 맵 초기화
    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: mapStyles,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
    });

    // 커스텀 마커 추가
    new google.maps.Marker({
      position: center,
      map,
      title: 'BYREDO Paris - Galeries Lafayette',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#1b1b1b',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    mapInstanceRef.current = map;
  };

  useEffect(() => {
    if (isLoaded) {
      initMap();
    }
  }, [isLoaded, center, zoom]);

  const handleScriptLoad = () => {
    setIsLoaded(true);
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />
      <div ref={mapRef} className={className}>
        {!isLoaded && (
          <div className="flex h-full items-center justify-center bg-gray-100 text-[11px] text-black/30">
            Loading map...
          </div>
        )}
      </div>
    </>
  );
}

