import { Link } from "react-router-dom";
import "./DonationHighlights.css";

const solarImage = "/assets/children-community.jpeg";
const plantImage = "/assets/food-distribution.jpg";

function DonationHighlights() {
  const items = [
    {
      number: "1",
      title: "Give With Purpose",
      text: "Your support helps provide meaningful assistance to individuals and families facing financial hardship, housing instability, and difficult circumstances.",
    },
    {
      number: "2",
      title: "Together, We Can Do More",
      text: "Every contribution helps us reach more people, provide practical support, and create opportunities for greater stability and independence.",
    },
  ];

  return (
    <section className="donation-highlights">

      {/* =================================================
          SECTION HEADING
      ================================================= */}

      <div className="donation-heading">

        <div className="section-label">
          <span></span>
          A helping hand when it matters most
        </div>

        <h2>
          Every act of kindness can help
          <br />
          someone build a better future
        </h2>

      </div>


      {/* =================================================
          SUPPORT AREAS
      ================================================= */}

      <div className="donation-feature-grid">

        {/* =================================================
            LEFT FEATURE
        ================================================= */}

        <div className="donation-feature">

          <div className="feature-image">

            <img
              src={solarImage}
              alt="Support for individuals and families"
            />

            <div className="feature-overlay">

              <h3>
                Single Mothers
              </h3>

              <p>
                FAMILY SUPPORT
              </p>

            </div>

          </div>


          <div className="feature-list">

            {/* SINGLE MOTHERS */}

            <div className="feature-item">

              <img
                src={solarImage}
                alt=""
              />

              <div>

                <h3>
                  Single Mothers
                </h3>

                <p>
                  Support for mothers working to create
                  more stable circumstances for themselves
                  and their children.
                </p>

                <Link to="/about" className="feature-item-button">
                  LEARN MORE
                </Link>

              </div>

            </div>


            {/* FINANCIAL HARDSHIP */}

            <div className="feature-item">

              <img
                src={plantImage}
                alt=""
              />

              <div>

                <h3>
                  Financial Hardship
                </h3>

                <p>
                  Assistance for individuals and families
                  experiencing genuine financial difficulties.
                </p>

                <Link to="/about" className="feature-item-button green-button">
                  LEARN MORE
                </Link>

              </div>

            </div>


            {/* DIFFICULT TIMES */}

            <div className="feature-item">

              <img
                src={plantImage}
                alt=""
              />

              <div>

                <h3>
                  Difficult Times
                </h3>

                <p>
                  A helping hand for people facing challenges
                  that make it difficult to meet basic needs.
                </p>

                <Link to="/about" className="feature-item-button green-button">
                  LEARN MORE
                </Link>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            RIGHT FEATURE
        ================================================= */}

        <div className="donation-feature">

          <div className="feature-image">

            <img
              src={plantImage}
              alt="Support for people experiencing homelessness"
            />

            <div className="feature-overlay">

              <h3>
                People Experiencing Homelessness
              </h3>

              <p>
                HOPE &amp; STABILITY
              </p>

            </div>

          </div>


          <div className="feature-list">

            {/* HOMELESSNESS */}

            <div className="feature-item">

              <img
                src={solarImage}
                alt=""
              />

              <div>

                <h3>
                  Homelessness Support
                </h3>

                <p>
                  Helping people experiencing homelessness
                  access essential resources and opportunities.
                </p>

                <Link to="/impact" className="feature-item-button">
                  LEARN MORE
                </Link>

              </div>

            </div>


            {/* INDIVIDUALS & FAMILIES */}

            <div className="feature-item">

              <img
                src={plantImage}
                alt=""
              />

              <div>

                <h3>
                  Individuals &amp; Families
                </h3>

                <p>
                  Practical assistance for people navigating
                  unexpected challenges and financial pressure.
                </p>

                <Link to="/impact" className="feature-item-button green-button">
                  LEARN MORE
                </Link>

              </div>

            </div>


            {/* OPPORTUNITY */}

            <div className="feature-item">

              <img
                src={plantImage}
                alt=""
              />

              <div>

                <h3>
                  A Better Future
                </h3>

                <p>
                  Supporting people as they work toward
                  greater stability, dignity, and opportunity.
                </p>

                <Link to="/impact" className="feature-item-button green-button">
                  LEARN MORE
                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          TWO INFO BOXES
      ================================================= */}

      <div className="donation-info-row">

        {items.map((item) => (

          <div
            className="donation-info-card"
            key={item.number}
          >

            <div className="info-number">
              {item.number}
            </div>

            <div>

              <h3>
                {item.title}
              </h3>

              <p>
                {item.text}
              </p>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default DonationHighlights;