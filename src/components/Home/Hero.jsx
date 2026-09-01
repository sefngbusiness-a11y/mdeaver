import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Hero.css";

const heroBackground = "/assets/image-hero.jpeg";
const personImage = "/assets/community-children.jpeg";
const plantImage = "/assets/children-community.jpeg";

function Hero() {
  // Tracks which card is centered in the mobile swipe deck so the
  // dot rail underneath can reflect where the thumb has scrolled to.
  const cardsRef = useRef(null);
  const [activeCard, setActiveCard] = useState(0);
  const cardCount = 2; // hero-info-card, hero-contact-card

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;

    let frame = null;

    const handleScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const cardWidth = el.firstElementChild
          ? el.firstElementChild.getBoundingClientRect().width
          : el.clientWidth;
        const gap = 14;
        const index = Math.round(el.scrollLeft / (cardWidth + gap));
        setActiveCard(Math.min(Math.max(index, 0), cardCount - 1));
      });
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="hero" style={{ "--hero-bg": `url(${heroBackground})` }}>
      {/* Desktop angled panel */}
      <div className="hero-dark-panel"></div>

      <div className="hero-container">
        {/* =================================================
            MOBILE INTRO
        ================================================= */}
        <div className="hero-mobile-intro" data-aos="fade-down">
          <span className="hero-mobile-eyebrow">Together, we can</span>

          <h1>
            Empowering
            <strong>Lives</strong>
          </h1>

          <p>Restoring hope and building stronger communities.</p>
        </div>

        {/* =================================================
            DESKTOP LEFT CONTENT
        ================================================= */}
        <div className="hero-content" data-aos="fade-right" data-aos-delay="100">
          <div className="hero-title">
            <span>EMPOWERING</span>
            <span>LIVES</span>
            <span>TOGETHER</span>
          </div>

          <p className="hero-small-text">SINCE 2020</p>

          <p className="hero-description">
            RESTORING HOPE
            <br />
            AND BUILDING
            <br />
            STRONGER COMMUNITIES
          </p>

          <div className="hero-zigzag">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* =================================================
            CARDS
        ================================================= */}
        <div className="hero-cards" ref={cardsRef} data-aos="fade-left" data-aos-delay="200">
          {/* =================================================
              SUPPORT / COMMUNITY IMAGE (desktop only)
          ================================================= */}
          <div className="hero-card hero-person-card">
            <img
              src={personImage}
              alt="Mdeaver Charity Foundation community support"
            />
          </div>

          {/* =================================================
              OUR MISSION
          ================================================= */}
          <div className="hero-card hero-info-card">
            <div className="card-pattern"></div>

            <div className="card-content">
              <span className="card-label">OUR MISSION</span>

              <h3>
                MAKING A
                <br />
                MEANINGFUL DIFFERENCE
              </h3>

              <p>
                We aid individuals and families in hardship, guiding them toward stability, dignity, and opportunity.
              </p>

              <Link to="/about" className="hero-card-button">
                <span>LEARN MORE</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          {/* =================================================
              WHO WE SUPPORT
          ================================================= */}
          <div className="hero-card hero-contact-card">
            <div className="card-pattern"></div>

            <div className="card-content">
              <span className="card-label">WHO WE SUPPORT</span>

              <h3>
                HELPING PEOPLE
                <br />
                MOVE FORWARD
              </h3>

              <p>
                Single mothers, families in hardship, the homeless, and others.
              </p>

              <Link to="/contact" className="hero-card-button">
                <span>GET SUPPORT</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          {/* =================================================
              PLANT / HOPE IMAGE (desktop only)
          ================================================= */}
          <div className="hero-card hero-plant-card">
            <img
              src={plantImage}
              alt="New growth representing hope and a better future"
            />
          </div>
        </div>

        {/* =================================================
            MOBILE DOT RAIL — tracks the swipe deck above
        ================================================= */}
        <div className="hero-mobile-dots" aria-hidden="true">
          {Array.from({ length: cardCount }).map((_, i) => (
            <span
              key={i}
              className={i === activeCard ? "is-active" : ""}
            ></span>
          ))}
        </div>
      </div>

      {/* =================================================
          MOBILE BOTTOM MESSAGE
      ================================================= */}
      <div className="hero-mobile-bottom">
        <p>
          A helping hand at the right time can give someone hope for a better
          tomorrow.
        </p>

        <Link to="/contact" className="hero-mobile-cta">
          Request help
        </Link>
      </div>

      {/* =================================================
          MOBILE SOCIALS
      ================================================= */}
      {/* <div className="hero-mobile-socials">

        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <i className="fa-brands fa-facebook-f"></i>
        </a>

        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
          <i className="fa-brands fa-twitter"></i>
        </a>

        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <i className="fa-brands fa-youtube"></i>
        </a>

      </div> */}

      {/* =================================================
          DESKTOP SCROLL
      ================================================= */}
      <a
        href="#impact"
        className="hero-scroll"
        aria-label="Scroll to impact section"
      >
        <span></span>
        <span></span>
      </a>
    </section>
  );
}

export default Hero;
