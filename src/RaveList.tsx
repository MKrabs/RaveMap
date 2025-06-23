import { List, ListItem, ListItemButton, ListItemContent, ListItemDecorator } from '@mui/joy';
import Home from '@mui/icons-material/Home';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

interface Event {
    name?: string;
    date: string;
    description: string;
    location: [number, number];
    link?: string;
}

const eventList: Event[] = [
    {
        date: "19.06.",
        name: "GROOVELINK",
        description: "Rap & Groove w/ NOA (live), Fubi (live), Lawrence, Noird, Rhoe - 19.00 deep-house, Secco Empfang, 20.00–21.00 live acts, 21.00–02.00 DJs 🪩",
        location: [0, 0]
    },
    {
        date: "22.06.",
        name: "UTOPIA Camp Pre-Party! 🌞",
        description: "Rheinhafen, Südbeckenstr. 2 – RhøE b2b Theo Hermann Bergdoktor b2b VertrauUns ELSA und Josia Schlakker, von takt:werk & Stampffabrik & United Nights ⛴️🏗️. Follow on Insta for more info.",
        location: [0, 0]
    },
    {
        date: "27.06",
        name: "HAWAII RAVE 🌺",
        description: "unter dem Karlsruher Hauptbahnhof w/tba",
        location: [0, 0]
    },
    {
        date: "28.06",
        name: "IBIZA RAVE ☀️",
        description: "unterm Karlsruher Hauptbahnhof w/tba",
        location: [0, 0]
    },
    {
        date: "04.07.-05.07.",
        name: "Neuland",
        description: "auf dem Durlacher Altstadtfest – House, Techno & Trance",
        location: [0, 0]
    },
    {
        date: "11.06.",
        name: "KID38 RELEASE PARTY",
        description: "19 Uhr Kronenplatz @Kaffee-Intro",
        location: [0, 0]
    },
    {
        date: "4.07",
        name: "AFTER RAVE 🕶️",
        description: "zu Durlach Altstadtfest, Karlsruher Hauptbahnhof w/tba",
        location: [0, 0]
    },
    {
        date: "20.07.",
        name: "Forro brazilian couple dance",
        description: "with Caipirinhas @AKK, 16–23 Uhr",
        location: [0, 0]
    },
    {
        date: "24.07.-28.07.",
        name: "UTOPIA Camp 76 🦒🌴💫",
        description: "von United Nights, Stampffabrik & takt:werk on a scenic woodland in Bad Wildbad🌀",
        location: [0, 0]
    },
    {
        date: "25.07",
        name: "DAS FEST RAVE 🚉🥳",
        description: "Face versus Face w/tba",
        location: [0, 0]
    },
    {
        date: "26.07",
        name: "DAS FEST BOILER RAVE🚉❤️‍🔥",
        description: "w/tba",
        location: [0, 0]
    },
    {
        date: "02.08.",
        name: "Mango Beach Open Air",
        description: "takt:werk x Dunkelrot @ Tropic Beach Island Rheinsheim",
        location: [0, 0]
    }
];

const RaveList = () => {
    return (
        <List>
            {eventList.map((event, index) => (
                <ListItem key={index}>
                    <ListItemButton>
                        <ListItemDecorator>
                            <Home />
                        </ListItemDecorator>
                        <ListItemContent>
                            <div>{event.date}</div>
                            <div>{event.name}</div>
                            <div>{event.description}</div>
                        </ListItemContent>
                        <KeyboardArrowRight />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}

export default RaveList;