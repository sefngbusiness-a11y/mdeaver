import { Link } from "react-router-dom";
import { useDonation } from "../context/DonationContext";
import "./Footer.css";

const causeImage1 = "/assets/community-children.jpeg";
const causeImage2 = "/assets/homeless-community.jpg";
const causeImage3 = "/assets/outreach-support.jpg";
const causeImage4 = "/assets/children-donation.jpg";
const squareImage1 = "/assets/individual-support.jpg";
const squareImage2 = "/assets/street-assistance.jpg";
const foundationImage = "/assets/community-outreach.jpg";

function Footer() {
  const { openDonateModal } = useDonation();
  return (
    <footer className="footer">
      <div className="footer-overlay">
        <div className="footer-container">
          {/* =================================================
              ABOUT US
          ================================================= */}
          <div className="footer-column about-column">
            <h3>ABOUT US</h3>

            <p>
              Mdeaver Charity Foundation Ltd. is committed to supporting
              individuals and families facing difficult circumstances and
              helping them move toward greater stability, dignity, and
              opportunity.
            </p>

            {/* <div className="footer-socials">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social facebook"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>

              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social twitter"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>

              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social youtube"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube"></i>
              </a>
            </div> */}
          </div>

          {/* =================================================
              CONTACTS
          ================================================= */}
          <div className="footer-column">
            <h3>CONTACT US</h3>

            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>

              <span>Mdeaver Charity Foundation Ltd.</span>
            </div>

            <div className="contact-item">
              <i className="fas fa-phone-alt"></i>

              <span>Contact us for more information</span>
            </div>

            {/* <div className="contact-item">
              <i className="far fa-envelope"></i>

              <span>info@mdeavercharityfoundation.org</span>
            </div> */}

            <div className="contact-item">
              <i className="far fa-clock"></i>

              <span>Supporting communities since 2020</span>
            </div>
          </div>

          {/* =================================================
              OUR MISSION
          ================================================= */}
          <div className="footer-column subscribe-column">
            <h3>OUR MISSION</h3>

            <p>
              To make a meaningful difference in the lives of people who need
              support, with particular focus on single mothers, people
              experiencing homelessness, and individuals and families facing
              financial hardship.
            </p>

            <a href="/request-assistance" className="footer-action-button">
              REQUEST ASSISTANCE
            </a>
          </div>

          {/* =================================================
              GALLERY
          ================================================= */}
          <div className="footer-column gallery-column">
            <h3>OUR WORK</h3>

            <div className="footer-gallery">
              <img src={causeImage1} alt="Mdeaver Charity Foundation" />

              <img src={causeImage2} alt="Community support" />

              <img src={causeImage3} alt="Charity support" />

              <img src={causeImage4} alt="Helping communities" />

              <img src={squareImage1} alt="Foundation activities" />

              <img src={squareImage2} alt="Community assistance" />

              <img src={foundationImage} alt="Mdeaver Charity Foundation" />

              <img src={causeImage2} alt="Supporting families" />
            </div>
          </div>
        </div>

        {/* =================================================
            BOTTOM FOOTER
        ================================================= */}
        <div className="footer-bottom">
          <div className="copyright">
            <span className="copyright-icon">©</span>

            <span>Mdeaver Charity Foundation Ltd. — Founded in 2020</span>
          </div>

          <div className="footer-emails">
            {/* <button
              type="button"
              className="footer-donate-btn"
              onClick={() => openDonateModal()}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                font: "inherit",
                cursor: "pointer",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <span>›</span>
              Donate
            </button>

            <Link to="/contact">
              <span>›</span>
              Request Assistance
            </Link>

            <Link to="/contact">
              <span>›</span>
              Contact Us
            </Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
