import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDonation } from "../context/DonationContext";
import "./Navbar.css";

function Navbar() {
  const { openDonateModal } = useDonation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const topOffset =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setScrolled(topOffset > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleDonate = () => {
    closeMenu();
    openDonateModal();
  };

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>

      {/* =================================================
          TOP INFORMATION BAR
      ================================================= */}

      <div className="top-bar">
        <div className="top-bar-container">
          <div className="top-left">
            <span className="top-item">
              <i className="fa-regular fa-envelope"></i>
              Contact Mdeaver Charity Foundation
            </span>

            <span className="top-item">
              <i className="fa-regular fa-clock"></i>
              Serving Communities Since 2020
            </span>
          </div>

          <div className="top-right">
            <span className="top-message">
              Empowering Lives. Restoring Hope.
            </span>
          </div>
        </div>
      </div>

      {/* =================================================
          MAIN NAVIGATION
      ================================================= */}

      <nav className="main-navbar">
        <div className="navbar-container">
          {/* =================================================
              LOGO
          ================================================= */}

          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <img
              src="/assets/charity-logo.png"
              alt="Mdeaver Charity Foundation Ltd."
            />
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div className="desktop-nav">
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>

            <Link to="/about" onClick={closeMenu}>
              About
            </Link>

            <Link to="/impact" onClick={closeMenu}>
              Our Impact
            </Link>

            <Link to="/contact" onClick={closeMenu}>
              Contact
            </Link>
          </div>

          {/* =================================================
              DESKTOP DONATE BUTTON
          ================================================= */}

          <button
            type="button"
            className="donate-btn desktop-donate"
            onClick={handleDonate}
          >
            DONATE
          </button>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* =================================================
            MOBILE NAVIGATION
        ================================================= */}

        <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/about" onClick={closeMenu}>
            About
          </Link>

          <Link to="/impact" onClick={closeMenu}>
            Our Impact
          </Link>

          <Link to="/donate" onClick={closeMenu}>
            Get Support
          </Link>

          <Link to="/contact" onClick={closeMenu}>
            Contact
          </Link>

          {/* MOBILE DONATE */}

          <button
            type="button"
            className="donate-btn mobile-donate"
            onClick={handleDonate}
          >
            DONATE
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
