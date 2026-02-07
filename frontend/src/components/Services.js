import { Link } from 'react-router-dom';
export default function Services() {
  return (
    <div className="container mt-4">
      <h2>Blog Articles</h2>
      <p className="text-muted">Here are some sample blog entries:</p>
      <div className="list-group">
        <Link to="/articles/1" className="list-group-item list-group-item-action">
          Blog Article #1
        </Link>
        <Link to="/articles/2" className="list-group-item list-group-item-action">
          Blog Article #2
        </Link>
        <Link to="/articles/3" className="list-group-item list-group-item-action">
          Blog Article #3
        </Link>
      </div>
    </div>
  );
}