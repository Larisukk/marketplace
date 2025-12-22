import styles from './UploadProduct.module.css';

import UploadProduct from "../../components/UploadProduct";

const UploadProductPage = () => {
    return (
        <div className={styles['upload-page-layout']}>

            <MainHeader />
            <main>
                <UploadProduct />
            </main>
        </div>
    );
};

export default UploadProductPage;
