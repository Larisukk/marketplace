import React, { useState, useRef, useEffect } from 'react';

const categories = [
    { value: "fructe", label: "Fructe" },
    { value: "legume", label: "Legume" },
    { value: "lactate", label: "Lactate" },
    { value: "oua", label: "Ouă" },
    { value: "altele", label: "Altele" },
];

const unitOptions = [
    { value: "buc", label: "Bucata" },
    { value: "kg", label: "Kilogram" },
    { value: "l", label: "Litru" },
];

const UploadProduct = () => {
    const [photos, setPhotos] = useState<File[]>([]);
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('0.00');
    const [unit, setUnit] = useState('');

    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);

    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const unitDropdownRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setPhotos(Array.from(event.target.files));
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log({
            photos,
            category,
            title,
            description,
            price,
            unit
        });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryDropdownOpen(false);
            }
            if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target as Node)) {
                setIsUnitDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedCategoryLabel = categories.find(c => c.value === category)?.label;
    const selectedUnitLabel = unitOptions.find(u => u.value === unit)?.label;

    return (
        <div className="upload-form-container">
            <form onSubmit={handleSubmit}>

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
                        style={{ display: 'none' }}
                    />
                </div>

                <div className="form-section category-select-wrapper" ref={categoryDropdownRef}>
                    <label>Categorie</label>

                    <div
                        className="category-select-display"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        aria-expanded={isCategoryDropdownOpen}
                    >
                        <span className={`category-display-text ${!category ? 'placeholder' : ''}`}>
                            {selectedCategoryLabel || "Selectează o categorie"}
                        </span>
                        <span className="dropdown-arrow">▼</span>
                    </div>

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

                <div className="form-section">
                    <label>Titlu</label>
                    <input
                        type="text"
                        placeholder="Spune cumpărătorilor ce vinzi"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="form-section">
                    <label>Descrie articolul</label>
                    <textarea
                        rows={4}
                        placeholder="Oferă detalii cumpărătorilor"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                <div className="form-section category-select-wrapper" ref={unitDropdownRef}>
                    <label>Unitate</label>

                    <div
                        className="category-select-display"
                        onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                        aria-expanded={isUnitDropdownOpen}
                    >
                        <span className={`category-display-text ${!unit ? 'placeholder' : ''}`}>
                            {selectedUnitLabel || "Selectează unitatea"}
                        </span>
                        <span className="dropdown-arrow">▼</span>
                    </div>

                    {isUnitDropdownOpen && (
                        <div className="category-select-dropdown">
                            {unitOptions.map((u) => (
                                <div
                                    key={u.value}
                                    className={`category-select-option ${unit === u.value ? 'selected' : ''}`}
                                    onClick={() => {
                                        setUnit(u.value);
                                        setIsUnitDropdownOpen(false);
                                    }}
                                >
                                    {u.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <label>Preț</label>
                    <div className="price-input-wrapper">
                        <input
                            type="text"
                            value={price}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
                                    setPrice(value);
                                }
                            }}
                        />
                        <span className="currency-label">RON</span>
                    </div>
                </div>

                <button type="submit" className="submit-product-btn">Publică Anunțul</button>
            </form>
        </div>
    );
};

export default UploadProduct;
