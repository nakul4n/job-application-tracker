export default function WorkspaceLoading() {
  return (
    <div aria-live="polite" aria-busy="true">
      <div className="pageHeader">
        <div>
          <h1>Loading your workspace</h1>
          <p>Gathering your latest applications and next actions.</p>
        </div>
      </div>
      <div className="summaryGrid">
        {[1, 2, 3, 4].map((item) => (
          <div className="metricCard" key={item}>
            <span className="subtle">Loading…</span>
          </div>
        ))}
      </div>
    </div>
  );
}
