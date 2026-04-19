import { Link } from "react-router-dom";
import { useLang } from "../context/useLang";

const NotFound = ({ darkMode }) => {
  const { t } = useLang();
  return (
    <div className={`page-transition min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <h1 className="text-9xl font-extrabold text-blue-400">404</h1>
      <p className={`text-2xl font-bold mt-4 mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
        {t.notFoundTitle}
      </p>
      <p className={`text-sm mb-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        {t.notFoundText}
      </p>
      <Link to="/" className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-300">
        {t.goHome}
      </Link>
    </div>
  );
};

export default NotFound;
