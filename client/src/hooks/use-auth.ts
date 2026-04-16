import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseJwt, isTokenExpired, getRemainingTime, logout } from "@/lib/auth";

/**
 * Custom hook to monitor authentication token expiration.
 * Automatically logs the user out and redirects to /login when the token expires.
 */
export const useAuth = () => {
    const { toast } = useToast();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const checkToken = () => {
            const token = sessionStorage.getItem("access_token");

            if (!token) {
                window.location.href = "/";
                return;
            }

            if (isTokenExpired(token)) {
                console.warn("🔐 [useAuth] Token expired. Logging out...");
                logout();
                return;
            }

            const remainingTime = getRemainingTime(token);

            // Clear any existing timer
            if (timerRef.current) clearTimeout(timerRef.current);

            // Set a timer to automatically log out when the token expires
            // We add a tiny buffer (100ms) to ensure it's actually expired when the timer hits
            timerRef.current = setTimeout(() => {
                console.warn("🔐 [useAuth] Token timer hit. Logging out...");
                logout();
            }, remainingTime + 100);

            console.log(`🔐 [useAuth] Session monitored. Auto-logout in ${Math.round(remainingTime / 1000)}s`);
        };

        checkToken();

        // Listen for storage changes (e.g., if token is updated in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "access_token") {
                checkToken();
            }
        };
        window.addEventListener("storage", handleStorageChange);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [toast]);

    return { parseJwt, logout };
};
