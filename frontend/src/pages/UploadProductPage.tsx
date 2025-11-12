import '../style/UploadProduct.css';

import MainHeader from '../components/MainHeader';
import UploadProduct from '../components/UploadProduct';

const UploadProductPage = () => {
    return (
        <div className="upload-page-layout">
            {/* MODIFICAT: Folosește componenta MainHeader */}
            <MainHeader />
            <main>
                <UploadProduct />
            </main>
        </div>
    );
};

export default UploadProductPage;