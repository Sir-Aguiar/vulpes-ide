"use client";

import { createContext, useContext, useEffect, useState } from "react";
import API from "@/services/API";
import {
  IAuthResponse,
  IUser,
  IUserPreferences,
  ISignupRequest,
  ILoginRequest,
} from "@/@dtos/Auth";
import {
  clearStoredUserPreferences,
  writeStoredUserPreferences,
} from "@/utils/user-preferences-storage";

interface IAuthContext {
  user: IUser | null;
  loading: boolean;
  login: (data: ILoginRequest) => Promise<void>;
  signup: (data: ISignupRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<IAuthContext | undefined>(undefined);

let preferencesSyncedThisLoad = false;

// Decode JWT token to extract payload
const decodeToken = (token: string): IUser | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const userData = decodeToken(token);
    if (!userData) {
      localStorage.removeItem("token");
      clearStoredUserPreferences();
      setLoading(false);
      return;
    }

    setUser(userData);
    setLoading(false);

    if (preferencesSyncedThisLoad) return;
    preferencesSyncedThisLoad = true;

    API.get<IUserPreferences>("/user/me/preferences")
      .then(({ data }) => {
        writeStoredUserPreferences(data ?? {});
      })
      .catch(() => {
        // Mantém o que já está no localStorage se o ping falhar.
      });
  }, []);

  const login = async (data: ILoginRequest) => {
    const response = await API.post<IAuthResponse>("auth/login", data);
    const { access_token, user } = response.data;

    localStorage.setItem("token", access_token);
    writeStoredUserPreferences(user.userPreferences ?? {});
    setUser(user);
  };

  const signup = async (data: ISignupRequest) => {
    const response = await API.post<IAuthResponse>("auth/signup", data);
    const { access_token, user } = response.data;

    localStorage.setItem("token", access_token);
    writeStoredUserPreferences(user.userPreferences ?? {});
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    clearStoredUserPreferences();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
