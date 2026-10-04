document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const user = getCurrentUser();
  if (!user) return;

  const myReportsTable = document.getElementById('my-reports-table');
  const myClaimsTable = document.getElementById('my-claims-table');
  const reportStats = document.getElementById('report-stats');

  try {
    const reportsResponse = await apiFetch('/items/my');
    const claimsResponse = await apiFetch('/claims/my');
    const reports = reportsResponse.items || [];
    const claims = claimsResponse.claims || [];

    if (reportStats) {
      reportStats.innerHTML = `
        <div class="dashboard-card">
          <h3>Total Reports</h3>
          <strong>${reports.length}</strong>
        </div>
        <div class="dashboard-card">
          <h3>Active Reports</h3>
          <strong>${reports.filter((item) => item.status === 'ACTIVE').length}</strong>
        </div>
        <div class="dashboard-card">
          <h3>Resolved Items</h3>
          <strong>${reports.filter((item) => ['RETURNED', 'RESOLVED'].includes(item.status)).length}</strong>
        </div>
        <div class="dashboard-card">
          <h3>Pending Claims</h3>
          <strong>${claims.filter((claim) => claim.status === 'PENDING').length}</strong>
        </div>
      `;
    }

    if (myReportsTable) {
      if (reports.length === 0) {
        myReportsTable.innerHTML = '<tr><td colspan="7" class="empty-state">No reports found.</td></tr>';
      } else {
        myReportsTable.innerHTML = reports.map((item) => `
          <tr>
            <td>${item.id}</td>
            <td>${item.item_name}</td>
            <td>${item.item_type}</td>
            <td>${item.date}</td>
            <td>${item.location}</td>
            <td><span class="status-badge status-${String(item.status || 'active').toLowerCase()}">${item.status || 'ACTIVE'}</span></td>
            <td><a href="item-details.html?id=${item.id}" class="btn btn-light">View</a></td>
          </tr>
        `).join('');
      }
    }

    if (myClaimsTable) {
      if (claims.length === 0) {
        myClaimsTable.innerHTML = '<tr><td colspan="4" class="empty-state">No claims found.</td></tr>';
      } else {
        myClaimsTable.innerHTML = claims.map((claim) => `
          <tr>
            <td>${claim.id}</td>
            <td>${claim.item_name}</td>
            <td>${claim.created_at ? new Date(claim.created_at).toLocaleDateString() : 'N/A'}</td>
            <td><span class="status-badge status-${String(claim.status || 'pending').toLowerCase()}">${claim.status || 'PENDING'}</span></td>
          </tr>
        `).join('');
      }
    }
  } catch (error) {
    console.error(error);
    const message = error.message || 'Could not load dashboard.';
    const container = document.getElementById('dashboard-message');
    if (container) {
      container.innerHTML = `<div class="empty-state">${message}</div>`;
    }
  }
});
