import styles from './UploadProduct.module.css';

import MainHeader from "../../components/MainHeader";
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