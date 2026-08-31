import { Link } from "react-router-dom";
import "./Causes.css";

const supportImage = "/assets/children-community.jpeg";
const familyImage = "/assets/community-children.jpeg";
const communityImage = "/assets/food-distribution.jpg";
const housingImage = "/assets/homeless-tents.jpg";
const hardshipImage = "/assets/individual-support.jpg";

function CauseItem({ image, title, description, color = "green" }) {
  return (
    <div className="cause-item">
      <div className="cause-item-image">
        <img src={image} alt={title} />
      </div>

      <div className="cause-item-content">
        <h3>{title}</h3>

        <p>{description}</p>

        <Link
          to="/donate"
          className={`cause-button cause-button-${color}`}
        >
          VIEW DETAILS
        </Link>
      </div>
    </div>
  );
}

function FeaturedCause({ image, title, description }) {
  return (
    <div className="featured-cause">
      <img src={image} alt={title} />

      <div className="featured-cause-overlay"></div>

      <div className="featured-cause-content">
        <h3>{title}</h3>

        <p>{description}</p>
      </div>
    </div>
  );
}

function Causes() {
  return (
    <section className="causes-section" id="causes">

      {/* =========================================
          SECTION HEADER
      ========================================== */}

      <div className="causes-header">

        <div className="causes-eyebrow">
          <span></span>
          <p>WHO WE SUPPORT</p>
        </div>

        <h2>
          A helping hand for people
          <br />
          facing difficult circumstances
        </h2>

      </div>


      {/* =========================================
          CAUSES GRID
      ========================================== */}

      <div className="causes-container">

        {/* =====================================
            LEFT GROUP
        ====================================== */}

        <div className="causes-group">

          <FeaturedCause
            image={supportImage}
            title="Support for Families"
            description="Helping individuals and families move toward greater stability."
          />

          <div className="cause-list">

            <CauseItem
              image={familyImage}
              title="Single Mothers"
              description="Support for single mothers and their children during difficult periods."
              color="orange"
            />

            <CauseItem
              image={communityImage}
              title="Financial Hardship"
              description="Practical assistance for people facing genuine financial difficulties."
            />

            <CauseItem
              image={housingImage}
              title="Housing Support"
              description="Helping people experiencing homelessness access essential resources."
            />

          </div>

        </div>


        {/* =====================================
            RIGHT GROUP
        ====================================== */}

        <div className="causes-group">

          <FeaturedCause
            image={hardshipImage}
            title="A Helping Hand"
            description="Providing meaningful support when people need it most."
          />

          <div className="cause-list">

            <CauseItem
              image={supportImage}
              title="Single Mothers"
              description="Helping mothers create more stable circumstances for themselves and their children."
              color="orange"
            />

            <CauseItem
              image={communityImage}
              title="Families in Need"
              description="Supporting families affected by unexpected expenses and emergencies."
            />

            <CauseItem
  image={supportImage}
  title="Difficult Times"
  description="Standing with individuals going through challenging chapters in life."
/>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Causes;