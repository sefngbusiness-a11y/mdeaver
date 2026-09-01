import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDonation } from "../context/DonationContext";
import "./About.css";

const About = () => {
  const { openDonateModal } = useDonation();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "Who can request assistance?",
      answer:
        "Our programs are intended for individuals and families experiencing genuine hardship, with particular focus on single mothers, people experiencing homelessness, and those facing financial difficulties. Eligibility and available assistance may vary by program.",
    },
    {
      question: "How can I apply for assistance?",
      answer:
        "Visit our Request Assistance page to learn about the application process, eligibility requirements, and information that may be required.",
    },
    {
      question: "How can I support the foundation?",
      answer:
        "You can support our mission through donations, volunteering, partnerships, community outreach, or by helping us share our work with people who may benefit from our programs.",
    },
    {
      question: "Where does my donation go?",
      answer:
        "Donations are used to support the foundation's charitable mission and programs. We are committed to responsible stewardship of resources and transparent communication about our work.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="about-page">
      {/* ================= HERO ================= */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>

        <div className="about-hero-content" data-aos="fade-down">
          {/* <span>HOME / ABOUT US</span> */}
          <h1>About Us</h1>
        </div>
      </section>

      {/* ================= INTRODUCTION ================= */}
      <section className="about-intro section-padding" data-aos="fade-up">
        <div className="about-container intro-grid">
          <div className="intro-image-wrap">
            <img
              src="/assets/food-distribution.jpg"
              alt="Children receiving community support"
            />

            <div className="intro-stat">
              <i className="fa-solid fa-hands-holding-child"></i>
              <strong>2,000+</strong>
              <span>LIVES SUPPORTED</span>
            </div>
          </div>

          <div className="intro-content">
            <div className="section-label">
              <span></span>
              <p>A helping hand when it matters</p>
            </div>

            <h2>
              Empowering lives.
              <br />
              Restoring hope.
              <br />
              Building stronger communities.
            </h2>

            <div className="intro-text-columns">
              <p>
                Founded in 2020 by philanthropist Michele Deaver, Mdeaver
                Charity Foundation Ltd. is committed to supporting individuals
                and families facing difficult circumstances and helping them
                move toward greater stability, dignity, and opportunity.
              </p>

              <p>
                We believe that financial hardship, homelessness, or being a
                single parent should never prevent someone from having the
                opportunity to build a better future.
              </p>

              <p>
                Since our foundation was established, we have provided support
                to more than 2,000 individuals and families experiencing
                financial difficulties, housing instability, and other
                challenging circumstances.
              </p>

              <p>
                Through compassion, responsible giving, and community-focused
                initiatives, we strive to help people regain stability and move
                forward with confidence.
              </p>
            </div>

            <div className="intro-buttons">
              <Link to="/contact" className="btn btn-green">
                Get Assistance
                <i className="fa-solid fa-arrow-right"></i>
              </Link>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => openDonateModal()}
              >
                Donate Now
                <i className="fa-solid fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHO WE SUPPORT ================= */}
      <section className="support-section" data-aos="fade-up">
        <div className="about-container">
          <div className="support-heading">
            <div className="section-label">
              <span></span>
              <p>Who we support</p>
            </div>

            <h2>
              A helping hand for
              <br />
              people facing hardship.
            </h2>
          </div>

          <div className="support-grid">
            <article className="support-item">
              <div className="support-number">01</div>

              <div className="support-icon">
                <i className="fa-solid fa-person-breastfeeding"></i>
              </div>

              <h3>Single Mothers</h3>

              <p>
                Raising a family alone can bring significant financial and
                emotional challenges. We provide support designed to help single
                mothers navigate difficult periods and create more stable
                circumstances for themselves and their children.
              </p>

              <ul>
                <li>
                  <i className="fa-solid fa-check"></i>
                  Practical assistance
                </li>
                <li>
                  <i className="fa-solid fa-check"></i>
                  Family-focused support
                </li>
              </ul>
            </article>

            <article className="support-item">
              <div className="support-number">02</div>

              <div className="support-icon">
                <i className="fa-solid fa-wallet"></i>
              </div>

              <h3>Financial Hardship</h3>

              <p>
                Unexpected expenses, loss of employment, emergencies, and other
                financial challenges can affect anyone. We seek to provide
                assistance to individuals and families experiencing genuine
                financial difficulties.
              </p>

              <ul>
                <li>
                  <i className="fa-solid fa-check"></i>
                  Emergency support
                </li>
                <li>
                  <i className="fa-solid fa-check"></i>
                  Individual assistance
                </li>
              </ul>
            </article>

            <article className="support-item">
              <div className="support-number">03</div>

              <div className="support-icon">
                <i className="fa-solid fa-house"></i>
              </div>

              <h3>Homelessness</h3>

              <p>
                Everyone deserves a safe and dignified place to call home. We
                support efforts that help people experiencing homelessness
                access essential resources and opportunities for greater
                stability.
              </p>

              <ul>
                <li>
                  <i className="fa-solid fa-check"></i>
                  Essential resources
                </li>
                <li>
                  <i className="fa-solid fa-check"></i>
                  Stability-focused support
                </li>
              </ul>
            </article>

            <article className="support-item">
              <div className="support-number">04</div>

              <div className="support-icon">
                <i className="fa-solid fa-heart"></i>
              </div>

              <h3>Difficult Times</h3>

              <p>
                Sometimes a person simply needs someone to help them through a
                difficult chapter. Our work extends to individuals facing
                circumstances that may leave them struggling to meet basic
                needs.
              </p>

              <ul>
                <li>
                  <i className="fa-solid fa-check"></i>
                  Compassionate assistance
                </li>
                <li>
                  <i className="fa-solid fa-check"></i>
                  Community support
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ================= IMPACT ================= */}
      <section className="impact-section" data-aos="fade-up">
        <div className="impact-overlay"></div>

        <div className="about-container impact-content">
          <div className="section-label light">
            <span></span>
            <p>Our impact</p>
          </div>

          <h2>
            Every person we support
            <br />
            represents a future worth investing in.
          </h2>

          <p className="impact-description">
            Since 2020, Mdeaver Charity Foundation Ltd. has been dedicated to
            turning compassion into meaningful action. Our goal is not simply to
            provide temporary assistance, but wherever possible, to help people
            move from immediate hardship toward greater stability and
            independence.
          </p>

          <Link to="/donate" className="btn btn-white">
            Support Our Mission
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}
      <section className="statistics-section section-padding" data-aos="zoom-in">
        <div className="about-container">
          <div className="statistics-heading">
            <div className="section-label">
              <span></span>
              <p>Making a difference</p>
            </div>

            <h2>
              Compassion turned
              <br />
              into meaningful action.
            </h2>
          </div>

          <div className="statistics-grid">
            <div className="stat-box">
              <strong>2,000+</strong>
              <h3>People Supported</h3>
              <p>
                Individuals and families reached through our charitable work.
              </p>
            </div>

            <div className="stat-box">
              <strong>2020</strong>
              <h3>Year Founded</h3>
              <p>The year Mdeaver Charity Foundation began its mission.</p>
            </div>

            <div className="stat-box">
              <strong>100%</strong>
              <h3>Commitment</h3>
              <p>Dedicated to serving people and strengthening communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY WE DO IT ================= */}
      <section className="why-section section-padding">
        <div className="about-container why-grid">
          <div className="why-image">
            <img
              src="/assets/community-meal.jpg"
              alt="Volunteers helping the community"
            />

            <div className="why-image-badge">
              <i className="fa-solid fa-heart"></i>
              <span>Giving with purpose</span>
            </div>
          </div>

          <div className="why-content">
            <div className="section-label">
              <span></span>
              <p>Why we do what we do</p>
            </div>

            <h2>
              A difficult circumstance
              <br />
              should not define someone's future.
            </h2>

            <p>
              Life can change unexpectedly. A lost job, an emergency expense,
              rising living costs, housing difficulties, or the responsibility
              of raising children alone can place enormous pressure on an
              individual or family.
            </p>

            <p>
              Mdeaver Charity Foundation Ltd. exists to provide a helping hand
              when it is needed most. By combining compassion with practical
              support, we strive to give people renewed hope and the opportunity
              to take their next step forward.
            </p>

            <div className="why-points">
              <div>
                <i className="fa-solid fa-circle-check"></i>
                <span>Recognizing human dignity</span>
              </div>

              <div>
                <i className="fa-solid fa-circle-check"></i>
                <span>Responding to genuine need</span>
              </div>

              <div>
                <i className="fa-solid fa-circle-check"></i>
                <span>Creating opportunities</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= OUR APPROACH ================= */}
      <section className="approach-section">
        <div className="about-container">
          <div className="approach-heading">
            <div className="section-label">
              <span></span>
              <p>Our approach</p>
            </div>

            <h2>
              How we turn compassion
              <br />
              into meaningful support.
            </h2>
          </div>

          <div className="approach-grid">
            <div className="approach-item">
              <div className="approach-top">
                <span>01</span>
                <i className="fa-solid fa-ear-listen"></i>
              </div>

              <h3>Listen</h3>

              <p>
                We take the time to understand the circumstances and needs of
                the people seeking assistance.
              </p>
            </div>

            <div className="approach-item">
              <div className="approach-top">
                <span>02</span>
                <i className="fa-solid fa-hand-holding-heart"></i>
              </div>

              <h3>Support</h3>

              <p>
                We provide appropriate assistance based on available resources
                and the circumstances presented.
              </p>
            </div>

            <div className="approach-item">
              <div className="approach-top">
                <span>03</span>
                <i className="fa-solid fa-seedling"></i>
              </div>

              <h3>Empower</h3>

              <p>
                Where possible, we encourage pathways toward greater financial,
                personal, and community stability.
              </p>
            </div>

            <div className="approach-item">
              <div className="approach-top">
                <span>04</span>
                <i className="fa-solid fa-hand-holding-dollar"></i>
              </div>

              <h3>Give With Purpose</h3>

              <p>
                We believe charitable giving should be thoughtful, responsible,
                and focused on creating meaningful impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STORIES ================= */}
      <section className="stories-section section-padding">
        <div className="about-container stories-grid">
          <div className="stories-content">
            <div className="section-label">
              <span></span>
              <p>Stories of hope</p>
            </div>

            <h2>
              Behind every request
              <br />
              is a story.
            </h2>

            <p>
              Every individual we support has a different story. For some, our
              assistance has helped them through a difficult financial period.
              For others, it has provided much-needed support while they worked
              toward securing employment, housing, or greater stability for
              their family.
            </p>

            <p>
              We believe these moments matter. A helping hand at the right time
              can give someone the confidence to keep going, the ability to meet
              an urgent need, and the hope to believe that better days are
              ahead.
            </p>

            <Link to="/contact" className="text-link">
              Submit a request for assistance
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div className="stories-images">
            <img
              className="stories-main-image"
              src="/assets/essential-supplies.jpg"
              alt="Community volunteers"
            />

            <div className="stories-small-image">
              <img
                src="/assets/children-relief.jpg"
                alt="Community support"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOUNDER ================= */}
      <section className="founder-section">
        <div className="about-container founder-grid">
          <div className="founder-image">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85"
              alt="Michele Deaver"
            />
          </div>

          <div className="founder-content">
            <div className="section-label">
              <span></span>
              <p>Our founder</p>
            </div>

            <h2>Michele Deaver</h2>

            <span className="founder-role">Founder &amp; Philanthropist</span>

            <p>
              Mdeaver Charity Foundation Ltd. was founded in 2020 by Michele
              Deaver, a philanthropist driven by a commitment to helping people
              experiencing hardship.
            </p>

            <p>
              Michele established the foundation with a belief that philanthropy
              should be more than simply giving. It should be about recognizing
              human dignity, responding to genuine need, and creating
              opportunities for people to move forward.
            </p>

            <p>
              Through the foundation, her vision has grown into an ongoing
              commitment to supporting individuals and families who may
              otherwise struggle to navigate difficult circumstances alone.
            </p>

            <blockquote>
              "When we have the ability to make someone's life a little better,
              we have a responsibility to do so."
              <cite>— Michele Deaver</cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ================= BE PART OF DIFFERENCE ================= */}
      <section className="difference-section">
        <div className="about-container">
          <div className="difference-heading">
            <div className="section-label light">
              <span></span>
              <p>Be part of the difference</p>
            </div>

            <h2>
              Together, we can
              <br />
              do more.
            </h2>

            <p>
              Whether you choose to donate, volunteer, partner with our
              organization, or help spread awareness of our work, your
              involvement can help us reach more people in need.
            </p>
          </div>

          <div className="difference-actions">
            <Link to="/donate" className="difference-action">
              <div>
                <i className="fa-solid fa-hand-holding-dollar"></i>
                <h3>Donate Now</h3>
                <p>
                  Help provide meaningful support to people experiencing
                  hardship.
                </p>
              </div>

              <i className="fa-solid fa-arrow-right"></i>
            </Link>

            <Link to="/contact" className="difference-action">
              <div>
                <i className="fa-solid fa-hands-helping"></i>
                <h3>Request Assistance</h3>
                <p>
                  Learn more about available support for you or someone you
                  know.
                </p>
              </div>

              <i className="fa-solid fa-arrow-right"></i>
            </Link>

            <Link to="/contact" className="difference-action">
              <div>
                <i className="fa-solid fa-handshake"></i>
                <h3>Partner With Us</h3>
                <p>
                  Work with us to expand our reach and create greater impact.
                </p>
              </div>

              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= COMMITMENT ================= */}
      <section className="commitment-section section-padding">
        <div className="about-container commitment-grid">
          <div>
            <div className="section-label">
              <span></span>
              <p>Our commitment</p>
            </div>

            <h2>
              Serving people with
              <br />
              compassion and integrity.
            </h2>
          </div>

          <div className="commitment-content">
            <p>
              Mdeaver Charity Foundation Ltd. is committed to conducting its
              charitable work with compassion, dignity, accountability, and
              integrity.
            </p>

            <p>
              We recognize that people who seek assistance deserve to be treated
              with respect and without judgment.
            </p>

            <div className="commitment-list">
              <div>
                <span>01</span>
                <strong>Serve people.</strong>
              </div>

              <div>
                <span>02</span>
                <strong>Restore hope.</strong>
              </div>

              <div>
                <span>03</span>
                <strong>Strengthen families.</strong>
              </div>

              <div>
                <span>04</span>
                <strong>Create opportunities.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="faq-section section-padding">
        <div className="about-container faq-grid">
          <div className="faq-heading">
            <div className="section-label">
              <span></span>
              <p>Frequently asked questions</p>
            </div>

            <h2>
              Questions?
              <br />
              We can help.
            </h2>

            <p>
              Find answers to some of the most common questions about our
              foundation and assistance programs.
            </p>

            <Link to="/contact" className="btn btn-green">
              Contact Us
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                className={`faq-item ${openFaq === index ? "faq-open" : ""}`}
                key={index}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>

                  <i
                    className={`fa-solid ${
                      openFaq === index ? "fa-minus" : "fa-plus"
                    }`}
                  ></i>
                </button>

                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
};

export default About;
