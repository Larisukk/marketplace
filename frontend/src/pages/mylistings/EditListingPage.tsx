import { useParams } from "react-router-dom";
import MainHeader from "../../components/MainHeader";
import UploadProduct from "../../components/UploadProduct";
import styles from "../uploadProductPage/UploadProduct.module.css";

export default function EditListingPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <div className={styles['upload-page-layout']}>
            <MainHeader />
            <main>
                {id && <UploadProduct listingId={id} />}
            </main>
        </div>
    );
}
