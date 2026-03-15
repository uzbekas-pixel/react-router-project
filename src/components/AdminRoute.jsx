import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return; }
      const docSnap = await getDoc(doc(db, "admins", user.uid));
      setIsAdmin(docSnap.exists() && docSnap.data().isAdmin === true);
    };
    if (!loading) checkAdmin();
  }, [user, loading]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;