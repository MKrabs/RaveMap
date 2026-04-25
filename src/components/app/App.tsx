import './App.css'
import RaveList from '../RaveList.tsx';
import RaveMap from '../RaveMap.tsx';

function App() {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-background">
            <RaveMap />
            <RaveList />
        </div>
    )
}

export default App;
