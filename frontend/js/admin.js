document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdmin()) return;

  const adminStats = document.getElementById('admin-stats');
  const claimsTable = document.getElementById('admin-claims-table');
  const itemsTable = document.getElementById('admin-items-table');
  const usersTable = document.getElementById('admin-users-table');

  async function loadAdminData() {
    try {
      const [summary, usersResponse, itemsResponse, claimsResponse] = await Promise.all([
        apiFetch('/analytics/summary'),
        apiFetch('/admin/users'),
        apiFetch('/admin/items'),
        apiFetch('/admin/claims'),
      ]);

      const stats = summary.summary || {};
      adminStats.innerHTML = `
        <div class="dashboard-card">
          <h3>Total Users</h3>
          <strong>${stats.totalUsers || 0}</strong>
        </div>
        <div class="dashboard-card">
          <h3>Total Lost Items</h3>
          <strong>${stats.totalLostItems || 0}</strong>
        </div>
        <div class="dashboard-card">
          <h3>Total Found Items</h3>
          <strong>${stats.totalFoundItems || 0}</strong>
        </div>
        <div class="dashboard-card">
          <h3>Pending Claims</h3>
          <strong>${stats.activeClaims || 0}</strong>
        </div>
      `;

      usersTable.innerHTML = (usersResponse.users || []).map((user) => `
        <tr>
          <td>${user.id}</td>
          <td>${user.full_name}</td>
          <td>${user.student_id}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
        </tr>
      `).join('');

      itemsTable.innerHTML = (itemsResponse.items || []).map((item) => `
        <tr>
          <td>${item.id}</td>
          <td>${item.item_name}</td>
          <td>${item.item_type}</td>
          <td><span class="status-badge status-${String(item.status || 'active').toLowerCase()}">${item.status || 'ACTIVE'}</span></td>
          <td>
            <button class="btn btn-light" data-action="resolve-item" data-id="${item.id}">Resolve</button>
            <button class="btn btn-danger" data-action="delete-item" data-id="${item.id}">Delete</button>
          </td>
        </tr>
      `).join('');

      claimsTable.innerHTML = (claimsResponse.claims || []).map((claim) => `
        <tr>
          <td>${claim.id}</td>
          <td>${claim.item_name}</td>
          <td>${claim.claimant_name}</td>
          <td><span class="status-badge status-${String(claim.status || 'pending').toLowerCase()}">${claim.status || 'PENDING'}</span></td>
          <td>
            <button class="btn btn-primary" data-action="approve-claim" data-id="${claim.id}">Approve</button>
            <button class="btn btn-danger" data-action="reject-claim" data-id="${claim.id}">Reject</button>
          </td>
        </tr>
      `).join('');

      bindAdminActions();
    } catch (error) {
      adminStats.innerHTML = `<div class="empty-state">${error.message}</div>`;
    }
  }

  function bindAdminActions() {
    document.querySelectorAll('[data-action="approve-claim"]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        const result = await apiFetch(`/admin/claims/${id}/approve`, { method: 'PUT' });
        showMessage(result.message || 'Claim approved.', 'success');
        loadAdminData();
      });
    });

    document.querySelectorAll('[data-action="reject-claim"]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        const result = await apiFetch(`/admin/claims/${id}/reject`, { method: 'PUT' });
        showMessage(result.message || 'Claim rejected.', 'success');
        loadAdminData();
      });
    });

    document.querySelectorAll('[data-action="resolve-item"]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        const result = await apiFetch(`/admin/items/${id}/resolve`, { method: 'PUT' });
        showMessage(result.message || 'Item marked as returned/resolved.', 'success');
        loadAdminData();
      });
    });

    document.querySelectorAll('[data-action="delete-item"]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        const result = await apiFetch(`/admin/items/${id}`, { method: 'DELETE' });
        showMessage(result.message || 'Item deleted.', 'success');
        loadAdminData();
      });
    });
  }

  loadAdminData();
});
