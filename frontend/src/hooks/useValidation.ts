import { useState, useEffect, useMemo } from "react";
import useDebounce from "./useDebounce";
import { axiosInstance } from "@/lib/axios";

export interface UsernameStatus {
  available: boolean;
  message: string;
}

/**
 * Hook for real-time debounced username availability checking
 */
export function useUsernameAvailability(
  rawUsername: string,
  isEnabled: boolean = true,
  delay: number = 400,
) {
  const debouncedUsername = useDebounce(rawUsername.trim(), delay);
  const [isChecking, setIsChecking] = useState(false);
  const [serverStatus, setServerStatus] = useState<{
    checkedUsername: string;
    available: boolean;
    message: string;
  } | null>(null);

  // Local synchronous validation for format & length
  const localValidation = useMemo(() => {
    if (!isEnabled || !debouncedUsername) return null;
    if (debouncedUsername.length < 3) {
      return {
        available: false,
        message: "Username must be at least 3 characters",
      };
    }
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(debouncedUsername)) {
      return {
        available: false,
        message: "Only letters, numbers, _, -, and . allowed",
      };
    }
    return null;
  }, [debouncedUsername, isEnabled]);

  // Async server validation against MongoDB / Redis cache
  useEffect(() => {
    if (!isEnabled || !debouncedUsername || localValidation !== null) {
      return;
    }

    let isMounted = true;

    const runCheck = async () => {
      setIsChecking(true);
      try {
        const res = await axiosInstance.get(
          `/auth/check-username?username=${encodeURIComponent(debouncedUsername)}`,
        );
        if (isMounted && res.data) {
          setServerStatus({
            checkedUsername: debouncedUsername,
            available: !!res.data.available,
            message:
              res.data.message ||
              (res.data.available
                ? "Username is available"
                : "Username is already taken"),
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setServerStatus({
            checkedUsername: debouncedUsername,
            available: false,
            message: err.payload?.message || "Failed to check username",
          });
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    runCheck();

    return () => {
      isMounted = false;
    };
  }, [debouncedUsername, isEnabled, localValidation]);

  // Combined status (local takes precedence, then server result)
  const status = useMemo((): UsernameStatus | null => {
    if (!isEnabled || !rawUsername.trim()) return null;
    if (localValidation) return localValidation;
    if (
      serverStatus &&
      serverStatus.checkedUsername === debouncedUsername
    ) {
      return {
        available: serverStatus.available,
        message: serverStatus.message,
      };
    }
    return null;
  }, [isEnabled, rawUsername, localValidation, serverStatus, debouncedUsername]);

  return {
    isChecking,
    status,
    debouncedUsername,
  };
}

/**
 * Universal validation hook for authentication forms
 */
export const useValidation = () => {
  const checkPassword = (password: string): string | true => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      if (!password) return "Password is required";
      if (!/^(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
      if (!/^(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
      if (!/^(?=.*\d)/.test(password)) return "Password must contain at least one number";
      if (!/^(?=.*[@$!%*?&])/.test(password)) return "Password must contain at least one special character";
      if (password.length < 8) return "Password must be at least 8 characters long";
    }
    return true;
  };

  const checkEmail = (email: string): string | true => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    return true;
  };

  const checkFullName = (fullName: string): string | true => {
    if (!fullName || fullName.trim().length < 2) {
      return "Full name must be at least 2 characters";
    }
    return true;
  };

  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialCharacters = "!@#$%^&*(),.?\":{}|<>";

    const allCharacters = uppercase + lowercase + numbers + specialCharacters;
    let password = "";

    for (let i = 0; i < 12; i++) {
      password += allCharacters.charAt(
        Math.floor(Math.random() * allCharacters.length),
      );
    }

    return password;
  };

  return {
    checkPassword,
    checkEmail,
    checkFullName,
    generatePassword,
  };
};

export default useValidation;