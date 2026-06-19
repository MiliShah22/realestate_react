export default function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < full; i++) {
    stars.push(<i key={`f${i}`} className="ti ti-star-filled" style={{ color: 'var(--gold)' }}></i>);
  }
  if (half) stars.push(<i key="h" className="ti ti-star-half-filled" style={{ color: 'var(--gold)' }}></i>);
  return <>{stars}</>;
}
