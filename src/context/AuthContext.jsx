import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState({
    language: "id",
    dateFormat: "dd/mm/yyyy",
    timeFormat: "24h",
    itemsPerPage: 20,
  });
  const [globalSettings, setGlobalSettings] = useState({
    sessionTimeout: 60,
    autoLogout: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Load user settings
          const userSettingsDoc = doc(db, "userSettings", currentUser.uid);
          const userSettingsSnap = await getDoc(userSettingsDoc);
          if (userSettingsSnap.exists()) {
            setUserSettings((prev) => ({
              ...prev,
              ...userSettingsSnap.data(),
            }));
          }

          // Load global settings
          const globalSettingsDoc = doc(db, "globalSettings", "security");
          const globalSettingsSnap = await getDoc(globalSettingsDoc);
          if (globalSettingsSnap.exists()) {
            setGlobalSettings((prev) => ({
              ...prev,
              ...globalSettingsSnap.data(),
            }));
          }

          // Set Firebase auth persistence based on autoLogout
          const persistence =
            globalSettingsSnap.exists() && globalSettingsSnap.data().autoLogout
              ? browserSessionPersistence
              : browserLocalPersistence;
          await setPersistence(auth, persistence);
        } catch (error) {
          console.error("Failed to load settings:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userSettings,
        setUserSettings,
        globalSettings,
        setGlobalSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
