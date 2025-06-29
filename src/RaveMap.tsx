import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { useInfiniteList } from './InfiniteListProvider';

const RaveMap = () => {
    const { items, loadMore, hasMore, loading } = useInfiniteList();
    return (
        <MapContainer center={[49.0128881,8.4064407]}
                      zoom={13}
                      scrollWheelZoom={true}
                      style={{ height: '100vh', width: '100wh' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {items.map((marker, index) => (
                <Marker key={index} position={[marker.latitude, marker.longitude]}>
                    <Popup>
                        <span dangerouslySetInnerHTML={{ __html: marker.description }} />
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default RaveMap;