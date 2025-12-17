import React from "react";
import { useNavigate } from "react-router-dom";
import HomeHero from "../../components/HomeHero";
import "./styles.css";

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleSearch = (product: string, county: string) => {
        const params = new URLSearchParams();

        if (product.trim()) {
            params.set("q", product.trim());
        }

        if (county) {
            params.set("county", county);
        }

        navigate(`/map?${params.toString()}`);
    };

    return (
        <div className="home-page-layout">
            <main>
                <HomeHero onSearch={handleSearch} />
            </main>
        </div>
    );
};

export default Home;
