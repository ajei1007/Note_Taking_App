import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AuthGuard = ({ children }) => {
    const token = useSelector((state) => state.auth.token) || localStorage.getItem("token");

    if (!token) {
        return (
            <Navigate to="/" />
        )
    }

    return children;
};

export default AuthGuard;
