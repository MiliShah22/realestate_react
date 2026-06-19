import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo">
            Esta<span>tiq</span>
          </div>
          <p className="footer-desc">
            India's most trusted platform to buy, sell, and rent properties. Verified listings across 30+ cities.
          </p>
        </div>
        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/search">Buy Property</Link>
          <Link to="/search?type=rent">Rent Property</Link>
          <Link to="/search?type=projects">New Projects</Link>
          <Link to="/search?type=commercial">Commercial</Link>
          <Link to="/map">Map Search</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link to="#">About Us</Link>
          <Link to="#">Careers</Link>
          <Link to="#">Press</Link>
          <Link to="#">Blog</Link>
          <Link to="#">Contact</Link>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <Link to="#">Help Centre</Link>
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms of Use</Link>
          <Link to="#">RERA</Link>
          <Link to="/dashboard?section=post">Post Property</Link>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Estatiq Technologies Pvt Ltd · CIN: U74999DL2020PTC000000 · All rights reserved
      </div>
    </footer>
  );
}
