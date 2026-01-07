import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { useInfiniteList } from '../providers/InfiniteListContext';
import { getUserLocation } from '../helpers/userLocation';
import { useEffect, useState } from 'react';
import { icon, Icon } from 'leaflet';

const RaveMap = () => {
    const { items } = useInfiniteList();
    const [ userLocation, setUserLocation ] = useState<GeolocationPosition | null>(null);

    useEffect(() => {
        console.log("effect ran");
        getUserLocation().then(location => {
            setUserLocation(location);
        }); // TODO maybe add catch block to catch errors later
    }, []);

    if (!userLocation) {
        return <div>Loading user location...</div>;
    }

    // TODO hier muss noch ein besseres Icon her
    const customMarkerIcon = icon({
        iconUrl: "../../public/arrow.svg", 
        iconSize: [32, 32]
    });

    const handleMarkerClick = (index: number) => {
        console.log('Marker clicked:', index);
        // highlight list item
    }

    return (
        <MapContainer center={[userLocation.coords.latitude, userLocation.coords.longitude]}
                      zoom={13}
                      scrollWheelZoom={true}
                      style={{ height: '100vh', width: '100wh' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />
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