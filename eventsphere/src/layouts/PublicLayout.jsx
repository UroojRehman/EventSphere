import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./PublicLayout.css";

const PublicLayout = () => {
  const location = useLocation();

  return (
    <div className="public-layout">

      {/* Premium background */}
      <div className="public-background" aria-hidden="true">
        <div className="public-glow public-glow-one" />
        <div className="public-glow public-glow-two" />
        <div className="public-glow public-glow-three" />

        <div className="public-grid" />
      </div>

      <Navbar />

      {/* Main Website */}
      <main className="public-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.28,
              ease: "easeOut",
            }}
            className="public-page"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;