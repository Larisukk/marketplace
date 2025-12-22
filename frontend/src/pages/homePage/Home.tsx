import React from 'react';
import { useNavigate } from "react-router-dom";
import Header from '../../components/Header';
import HomeHero from '../../components/HomeHero';
import styles from './Home.module.css'
import { COUNTY_BBOX } from '@/utils/counties';

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
        <div className={styles['home-page-layout']}>
            <Header />

            <main>
                <HomeHero
                    onSearch={handleSearch}
                    counties={Object.keys(COUNTY_BBOX)}
                />
            </main>
        </div>
    );
};

export default Home;
