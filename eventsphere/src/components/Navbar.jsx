import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import "./Navbar.css";
import { useAuthContext } from "../context/AuthContext";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Events", path: "/events" },
  { label: "Gallery", path: "/gallery" },
  { label: "Announcements", path: "/announcements" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "FAQs", path: "/faqs" },
];

function Navbar() {
  const location = useLocation();
  const { user } = useAuthContext();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setCategoryOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();

    const value = searchValue.trim();

    if (!value) return;

    window.location.href = `/events?search=${encodeURIComponent(value)}`;
  };

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className={`navbar-wrapper ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <nav className="navbar-main">

            {/* LOGO */}
            <Link to="/" className="navbar-logo">
              <div className="navbar-logo-icon">
                <CalendarDays size={21} />
              </div>

              <div>
                <div className="navbar-brand-name">
                  Event<span>Sphere</span>
                </div>

                <div className="navbar-brand-subtitle">
                  College Events
                </div>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <div className="navbar-links">

              {navItems.slice(0, 4).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `navbar-link ${isActive ? "active" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {/* MORE */}
              <div className="navbar-more">
                <button
                  type="button"
                  className="navbar-more-button"
                  onClick={() => setCategoryOpen((prev) => !prev)}
                >
                  More

                  <ChevronDown
                    size={14}
                    className={
                      categoryOpen ? "rotate-180" : ""
                    }
                  />
                </button>

                <AnimatePresence>
                  {categoryOpen && (
                    <motion.div
                      className="navbar-dropdown"
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                    >

                    <div className="navbar-dropdown-title">
                      Explore
                    </div>

                    {navItems.slice(4).map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="navbar-dropdown-link"
                      >
                        {item.label}
                      </Link>
                    ))}

                    <Link
                      to="/events"
                      className="navbar-dropdown-link"
                    >
                      Event Categories
                    </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="navbar-actions">

              {/* SEARCH */}
              <button
                type="button"
                className="navbar-icon-button"
                aria-label="Search"
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  setCategoryOpen(false);
                }}
              >
                <Search size={18} />
              </button>

              {/* LOGIN */}
              <Link
                to={user ? `/${user.role}/dashboard` : "/login"}
                className={`navbar-login ${user ? "navbar-user" : ""}`}
                title={user ? "Open dashboard" : "Sign in"}
              >
                <UserRound size={16} />
                <span>{user?.name || user?.username || "Login"}</span>
              </Link>

              {/* MOBILE */}
              <button
                type="button"
                className="navbar-mobile-button"
                aria-label="Menu"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                {mobileOpen ? (
                  <X size={19} />
                ) : (
                  <Menu size={19} />
                )}
              </button>
            </div>

            {/* SEARCH BOX */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  className="navbar-search"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                >

                <form
                  onSubmit={handleSearch}
                  className="navbar-search-form"
                >
                  <div className="navbar-search-input-wrapper">

                    <Search
                      size={17}
                      style={{
                        position: "absolute",
                        left: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                      }}
                    />

                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) =>
                        setSearchValue(e.target.value)
                      }
                      placeholder="Search events, workshops, seminars..."
                      autoFocus
                      className="navbar-search-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="navbar-search-button"
                  >
                    Search
                  </button>
                </form>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>
      </header>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar-mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >

          <div className="navbar-dropdown-title">
            Navigation
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `navbar-mobile-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div
            style={{
              height: "1px",
              background: "#e2e8f0",
              margin: "12px 0",
            }}
          />

          <Link
            to={user ? `/${user.role}/dashboard` : "/login"}
            className="navbar-mobile-login"
          >
            <UserRound size={17} />
            {user ? user.name || user.username || "My dashboard" : "Login / Register"}
          </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;