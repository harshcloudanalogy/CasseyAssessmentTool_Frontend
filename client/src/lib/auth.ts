/**
 * Centralized authentication utilities for JWT handling and token validation.
 */

export const parseJwt = (token: string) => {
    if (!token) return null;
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("❌ [Auth] Failed to parse JWT:", e);
        return null;
    }
};

/**
 * Checks if a JWT token is expired.
 * @param token The JWT token string
 * @returns boolean true if expired or invalid
 */
export const isTokenExpired = (token: string): boolean => {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
};

/**
 * Gets the remaining time until token expiration in milliseconds.
 * @param token The JWT token string
 * @returns number milliseconds until expiration (negative if already expired)
 */
export const getRemainingTime = (token: string): number => {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return 0;

    return decoded.exp * 1000 - Date.now();
};

/**
 * Standard logout function to clear session and redirect.
 */
export const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token_timestamp");
    window.location.href = "/";
};
