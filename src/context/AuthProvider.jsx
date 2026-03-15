import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { auth } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};