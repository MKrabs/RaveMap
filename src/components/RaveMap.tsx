import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { useInfiniteList } from '../providers/InfiniteListContext';
import { getUserLocation } from '../helpers/userLocation';
import { useEffect, useState } from 'react';
import { icon } from 'leaflet';

// Default center (Berlin) if geolocation fails or is denied
const DEFAULT_CENTER: [number, number] = [52.52, 13.4050];

// Component to update map center when location is obtained
const MapCenterUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        // Only animate if we actually have a center to go to (not null)
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);
    return null;
};

const RaveMap = () => {
    const { items } = useInfiniteList();
    const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
    const [locationError, setLocationError] = useState<boolean>(false);

    useEffect(() => {
        getUserLocation()
            .then(location => {
                setUserLocation(location);
            })
            .catch(err => {
                console.warn('Geolocation failed, using default center:', err);
                setLocationError(true);
            });
    }, []);

    const customMarkerIcon = icon({
        iconUrl: "/arrow.svg",
        iconSize: [32, 32]
    });

    const handleMarkerClick = (index: number) => {
        console.log('Marker clicked:', index);
        // highlight list item
    }

    const center: [number, number] = userLocation
        ? [userLocation.coords.latitude, userLocation.coords.longitude]
        : DEFAULT_CENTER;

    return (
        <MapContainer center={center}
                      zoom={13}
                      scrollWheelZoom={true}
                      style={{ height: '100vh', width: '100vw' }}
        >
            {/* Update map view when userLocation changes */}
            <MapCenterUpdater center={center} />
            
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />
            {locationError && (
                <Marker position={DEFAULT_CENTER} icon={customMarkerIcon}>
                    <Popup>Default location (geolocation unavailable)</Popup>
                </Marker>
            )}
            {items.map((marker, index) => (
                <Marker key={index} position={[marker.latitude, marker.longitude]} icon={customMarkerIcon} eventHandlers={{ click: () => handleMarkerClick(index) }}>
                    <Popup>
                        <span dangerouslySetInnerHTML={{ __html: marker.description }} />
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default RaveMap;
