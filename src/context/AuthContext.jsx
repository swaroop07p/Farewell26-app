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
      const q = query(
        collection(db, "guests"), 
        where("usn", "==", usn.toUpperCase()),
        where("name", "==", name)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        userData.isAdmin = (userData.usn === ADMIN_USN);
        
        setCurrentUser(userData);
        localStorage.setItem('farewellUser', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: "User not found. Check Name and USN." };
      }
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: "Database error." };
    }
  };

  // Logout function
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