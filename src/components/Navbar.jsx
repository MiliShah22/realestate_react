import { Link, useLocation } from 'react-router-dom';

const PAGES = [
  { label: 'Buy', href: '/search' },
  { label: 'Rent', href: '/search?type=rent' },
  { label: 'New Projects', href: '/search?type=projects' },
  { label: 'Commercial', href: '/search?type=commercial' },
  { label: 'Map View', href: '/map' },
  { label: 'Agents', href: '/dashboard' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Esta<span>tiq</span>
      </Link>
      <div className="nav-links">
        {PAGES.map((p) => {
          const base = p.href.split('?')[0];
          const active = location.pathname === base;
          return (
            <Link key={p.label} to={p.href} className={`nav-link ${active ? 'active' : ''}`}>
              {p.label}
            </Link>
          );
        })}
      </div>
      <div className="nav-right">
        <Link to="/dashboard?section=post" className="btn-post">
          + Post Property
        </Link>
        <Link to="/dashboard" className="btn-signin">
          My Account
        </Link>
      </div>
    </nav>
  );
}
