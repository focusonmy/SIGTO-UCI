import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [23.1136, -82.3666]
const DEFAULT_ZOOM = 12

const START_ICON = L.divIcon({
  className: 'custom-marker',
  html: '<div style="width:24px;height:24px;background:#10b981;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

const END_ICON = L.divIcon({
  className: 'custom-marker',
  html: '<div style="width:24px;height:24px;background:#ef4444;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

const POINT_ICON = L.divIcon({
  className: 'custom-marker',
  html: '<div style="width:12px;height:12px;background:#2563eb;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
})

export default function MapaRuta({ puntos = [], altura = '300px' }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    mapInstanceRef.current = L.map(mapRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !puntos || puntos.length === 0) return

    const map = mapInstanceRef.current

    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer)
      }
    })

    if (puntos.length > 0) {
      const coords = puntos.map(p => [p.lat, p.lng])
      
      if (coords.length > 0) {
        L.polyline(coords, {
          color: '#2563eb',
          weight: 4,
          opacity: 0.8
        }).addTo(map)

        L.marker(coords[0], { icon: START_ICON })
          .bindPopup(`<b>Inicio:</b> ${puntos[0].nombre.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`)
          .addTo(map)

        L.marker(coords[coords.length - 1], { icon: END_ICON })
          .bindPopup(`<b>Fin:</b> ${puntos[puntos.length - 1].nombre.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`)
          .addTo(map)

        if (coords.length > 2) {
          coords.slice(1, -1).forEach((coord, i) => {
            L.marker(coord, { icon: POINT_ICON })
              .bindPopup(`<b>Punto ${i + 1}:</b> ${puntos[i + 1].nombre.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`)
              .addTo(map)
          })
        }

        const bounds = L.latLngBounds(coords)
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      }
    }
  }, [puntos])

  const tieneCoordenadasValidas = puntos && puntos.some(p => p.lat !== 0 || p.lng !== 0)

  if (!tieneCoordenadasValidas) {
    return (
      <div 
        style={{ 
          height: altura, 
          background: '#f8fafc', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e2e8f0'
        }}
      >
        <p style={{ color: '#64748b' }}>
          Agregue puntos de recorrido para ver el mapa
        </p>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef}
      style={{ 
        height: altura, 
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    />
  )
}