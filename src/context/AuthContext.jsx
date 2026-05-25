import React, { createContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const ADMIN_USN = "4JN24AI100";

  // Check localStorage on load to keep user logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('farewellUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (name, usn) => {
    try {
      // 🛡️ ROLE BASED ACCESS: The Camera Team Login (Gatekeepers)
    // Inside AuthContext.jsx -> login()
    if (usn === "4JN24AI101" && name === "CAMERA") {
      const cameraUser = { usn: "4JN24AI101", name: "CAMERA", isScanner: true, isAdmin: false };
      setCurrentUser(cameraUser);
      localStorage.setItem('farewellUser', JSON.stringify(cameraUser));
      
      // 👉 MAKE SURE THIS SAYS isScanner: true!
      return { success: true, isScanner: true }; 
    }

      const q = query(
        collection(db, "guests"), 
        where("usn", "==", usn.toUpperCase()),
        where("name", "==", name)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        userData.isAdmin = (userData.usn === ADMIN_USN);
        userData.isScanner = false;
        
        setCurrentUser(userData);
        localStorage.setItem('farewellUser', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: "Niv party attend agake agalla sorry!! Details correct agi enter madi." };
      }
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: "Database error." };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('farewellUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};