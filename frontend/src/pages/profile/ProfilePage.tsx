import React from "react";
import MainHeader from "../../components/MainHeader";
import Profile from "../../components/Profile";
import "./Profile.css";

export default function ProfilePage() {
    return (
        <div className="profile-page-wrapper">
            <MainHeader />

            <div className="profile-card-split">

                {/* STÂNGA */}
                <Profile />

                {/* DREAPTA — IMAGINEA DIN PUBLIC */}
                <div
                    className="profile-right-image"
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
