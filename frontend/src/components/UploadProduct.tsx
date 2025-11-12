import React, { useState, useRef, useEffect } from 'react';

// Lista de categorii (actualizată)
const categories = [
    { value: "fructe", label: "Fructe" },
    { value: "legume", label: "Legume" },
    { value: "lactate", label: "Lactate" },
    { value: "oua", label: "Ouă" },
    { value: "altele", label: "Altele" },
];

// Această componentă este containerul alb
const UploadProduct = () => {
    const [photos, setPhotos] = useState<File[]>([]);
    const [category, setCategory] = useState(''); // Păstrează valoarea (ex: 'fructe')
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('0.00');

    // --- State și Ref pentru noul dropdown ---
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setPhotos(Array.from(event.target.files));
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log({ photos, category, title, description, price });
        // Aici vei trimite datele către server
    };

    // --- Funcție pentru a închide dropdown-ul la click în exterior ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Găsește eticheta categoriei selectate (ex: 'Fructe')
    const selectedCategoryLabel = categories.find(c => c.value === category)?.label;

    return (
        // Acesta este containerul alb și rotunjit
        <div className="upload-form-container">
            <h3>Vinde un articol</h3>
            <form onSubmit={handleSubmit}>
                {/* Secțiunea de încărcare fotografii (fără hint) */}
                <div className="form-section photo-upload-section">
                    <label htmlFor="photo-upload" className="photo-upload-label">
                        {photos.length === 0 ? (
                            <>
                                <span className="plus-icon">+</span>
                                <span>Încărcare fotografii</span>
                            </>
                        ) : (
                            <p>{photos.length} fotografii selectate</p>
                        )}
                    </label>
                    <input
                        type="file"
                        id="photo-upload"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }} // Ascunde input-ul original
                    />
                </div>

                {/* Categoria (cu dropdown-ul personalizat) */}
                <div
                    className="form-section category-select-wrapper"
                    ref={categoryDropdownRef}
                >
                    <label>Categorie</label>
                    <div
                        className="category-select-display"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        aria-expanded={isCategoryDropdownOpen}
                    >
                        <span
                            className={`category-display-text ${!category ? 'placeholder' : ''}`}
                        >
                            {selectedCategoryLabel || "Selectează o categorie"}
                        </span>
                        <span className="dropdown-arrow">▼</span>
                    </div>

                    {/* Lista dropdown */}
                    {isCategoryDropdownOpen && (
                        <div className="category-select-dropdown">
                            {categories.map((cat) => (
                                <div
                                    key={cat.value}
                                    className={`category-select-option ${category === cat.value ? 'selected' : ''}`}
                                    onClick={() => {
                                        setCategory(cat.value);
                                        setIsCategoryDropdownOpen(false);
                                    }}
                                >
                                    {cat.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {/* Titlu */}
                <div className="form-section">
                    <label htmlFor="title">Titlu</label>
                    <input
                        type="text"
                        id="title"
                        placeholder="Spune cumpărătorilor ce vinzi"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Descriere articol */}
                <div className="form-section">
                    <label htmlFor="description">Descrie articolul</label>
                    <textarea
                        id="description"
                        rows={4}
                        placeholder="Oferă detalii cumpărătorilor"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                {/* Preț */}
                <div className="form-section">
                    <label htmlFor="price">Preț</label>
                    <div className="price-input-wrapper">
                        <input
                            type="text"
                            id="price"
                            value={price}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
                                    setPrice(value);
                                }
                            }}
                        />
                        <span> RON</span>
                    </div>
                </div>

                <button type="submit" className="submit-product-btn">Publică Anunțul</button>
            </form>
        </div>
    );
};

export default UploadProduct;