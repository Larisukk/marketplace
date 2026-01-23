import React, { useState, useEffect, useRef } from 'react';
import styles from './countySelect.module.css';

interface CountySelectProps {
    counties: string[];
    selectedCounty: string;
    onSelectCounty: (county: string) => void;
    className?: string;
}

const LocationIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: '#555' }}
    >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const CountySelect: React.FC<CountySelectProps> = ({
    counties,
    selectedCounty,
    onSelectCounty,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCounties = counties.filter((county) =>
        county.toLowerCase().includes(selectedCounty.toLowerCase())
    );

    const handleSelect = (county: string) => {
        onSelectCounty(county);
        setIsOpen(false);
    };

    return (
        <div className={`${styles['county-select-wrapper']} ${className}`} ref={wrapperRef}>
            <div
                className={`${styles['county-select-display']} ${!selectedCounty ? styles['placeholder'] : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className={styles['county-display-content']}>
                    <LocationIcon />
                    <input
                        type="text"
                        value={selectedCounty}
                        placeholder="Judet"
                        onChange={(e) => {
                            onSelectCounty(e.target.value);
                            setIsOpen(true);
                        }}
                        className={styles['county-input']}
                        // Prevent click from closing/toggling immediately if clicking input
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(true);
                        }}
                    />
                </div>
                <span className={styles['dropdown-arrow']}>
                    ▼
                </span>
            </div>

            {isOpen && (
                <div className={styles['county-select-dropdown']}>
                    {filteredCounties.length === 0 ? (
                        <div className={styles['county-select-option']} style={{ cursor: 'default' }}>
                            Niciun județ găsit
                        </div>
                    ) : (
                        filteredCounties.map((county) => (
                            <div
                                key={county}
                                className={styles['county-select-option']}
                                onClick={() => handleSelect(county)}
                            >
                                <LocationIcon />
                                <span style={{ marginLeft: 8 }}>{county}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default CountySelect;
