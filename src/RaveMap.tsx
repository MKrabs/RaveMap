import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

const markers = [
    {
        position: [49.0069, 8.4044],
        popupText: "GROOVELINK @Akk 🫧 - Rap & Groove w/ NOA (live), Fubi (live), Lawrence, Noird, Rhoe - 19.00 deep-house + Secco Empfang / 20.00 - 21.00 live acts / 21.00 - 02.00 DJs 🪩"
    },
    {
        position: [49.070, 8.330],
        popupText: "UTOPIA Camp Pre-Party! 🌞 @Rheinhafen, Südbeckenstr. 2              RhøE b2b Theo Hermann Bergdoktor b2b VertrauUns ELSA und Josia Schlakker                   von takt:werk & Stampffabrik & United Nights ⛴️🏗️        Folgt uns auf Insta für mehr Infos zum Camp! 🏕️"
    },
    {
        position: [49.012, 8.404],
        popupText: "HAWAII RAVE 🌺 @carpediemrave @Tunnelrave unter dem Karlsruher Hauptbahnhof w/tba"
    },
    {
        position: [49.012, 8.404],
        popupText: "IBIZA RAVE ☀️ @carpediemrave @Tunnelrave unterm Karlsruher Hauptbahnhof w/tba"
    },
    {
        position: [49.0145, 8.4320],
        popupText: "Neuland auf dem Durlacher Altstadtfest - House, Techno & Trance"
    },
    {
        position: [49.0069, 8.4044],
        popupText: "KID38 RELEASE PARTY 19 Uhr Kronenplatz @Kaffee-Intro"
    },
    {
        position: [49.0145, 8.4320],
        popupText: "AFTER RAVE 🕶️ zu Durlach Altstadtfest @carpediemrave @Tunnelrave Karlsruher Hauptbahnhof w/tba"
    },
    {
        position: [49.0069, 8.4044],
        popupText: "Forro brazilian couple dance with Caipirinhas  @AKK  16-23 Uhr"
    },
    {
        position: [48.523, 8.476],
        popupText: "UTOPIA Camp 76 🦒🌴💫 von United Nights, Stampffabrik & takt:werk auf einer schönen Waldlichtung bei Bad Wildbad🌀"
    },
    {
        position: [49.012, 8.404],
        popupText: "DAS FEST RAVE 🚉🥳 @carpediemrave @Tunnelrave unterm Karlsruher Hauptbahnhof Face versus Face w/tba"
    },
    {
        position: [49.012, 8.404],
        popupText: "DAS FEST BOILER RAVE🚉❤️‍🔥 @carpediemrave @Tunnelrave Karlsruher Hauptbahnhof w/tba"
    },
    {
        position: [49.280, 8.450],
        popupText: "Mango Beach Open Air takt:werk x Dunkelrot @ Tropic Beach Island Rheinsheim"
    }
];

const RaveMap = () => {
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
            {markers.map((marker, index) => (
                <Marker key={index} position={marker.position}>
                    <Popup>
                        <span dangerouslySetInnerHTML={{ __html: marker.popupText }} />
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default RaveMap;