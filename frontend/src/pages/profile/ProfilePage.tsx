import React from "react";
import Profile from "../../components/Profile";
import styles from "./Profile.module.css";

export default function ProfilePage() {
    return (
        <div className={styles['profile-page-wrapper']}>
            <MainHeader />

            <div className={styles['profile-card-split']}>

                {/* STÂNGA */}
                <Profile />

                {/* DREAPTA — IMAGINEA DIN PUBLIC */}
                <div
                    className={styles['profile-right-image']}
                    style={{
                        backgroundImage: `url("/box_photo.jpg")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "20px",
                        width: "350px"
                    }}
                ></div>

            </div>
        </div>
    );
}
