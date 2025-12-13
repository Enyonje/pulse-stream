import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white flex gap-4">
      <Link to="/">Home</Link>
      <Link to="/trades">Trades</Link>
      <Link to="/alerts">Alerts</Link>
      <Link to="/preferences">Preferences</Link>
    </nav>
  );
}