import BurgerMenu from "./BurgerMenu";
import "./MapMiniHeader.css";

const MapMiniHeader: React.FC = () => {
    return (
        <header className="map-mini-header">
            {/* Burger IDENTIC cu Home */}
            <BurgerMenu />

            {/* TITLUL RĂMÂNE */}
            <h2 className="map-mini-title">BioBuy Map</h2>
        </header>
    );
};

export default MapMiniHeader;
