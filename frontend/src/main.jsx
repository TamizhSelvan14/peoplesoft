import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

// Dynamic redirect URI based on environment
const getRedirectUri = () => {
    // If env variable is set, use it
    if (import.meta.env.VITE_AUTH0_REDIRECT_URI) {
        return import.meta.env.VITE_AUTH0_REDIRECT_URI;
    }
    // Otherwise, auto-detect based on current URL
    return `${window.location.origin}/callback`;
};

const redirectUri = getRedirectUri();

// Log to verify env vars are loading
console.log('Auth0 Config:', {
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    redirectUri: redirectUri
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: redirectUri
            }}
            useRefreshTokens={true}
            cacheLocation="localstorage"
        >
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Auth0Provider>
    </React.StrictMode>
);
