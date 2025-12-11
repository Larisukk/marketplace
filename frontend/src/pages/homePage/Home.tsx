import React from 'react';
import Header from '../../components/Header';
import HomeHero from '../../components/HomeHero';
import './styles.css'

const Home: React.FC = () => {

    const handleSearch = (product: string, county: string) => {
        // Construct the search query string
        const query = [product, county].filter(Boolean).join(' din ');
        console.log(`Navigating to results with query: ${query}`);

        alert(`Căutare trimisă: "${query}". (Implementează navigarea reală aici)`);
    };

    return (
        <div className="home-page-layout">
            <Header />

            <main>
                <HomeHero onSearch={handleSearch} />

                {/* Future: Value Proposition and Footer components */}
            </main>

        </div>
    );
};

export default Home;