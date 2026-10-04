document.addEventListener('DOMContentLoaded', async () => {
  try {
    const summary = await apiFetch('/analytics/summary');
    const data = summary.summary;

    document.getElementById('total-lost').textContent = data.totalLostItems || 0;
    document.getElementById('total-found').textContent = data.totalFoundItems || 0;
    document.getElementById('items-returned').textContent = data.itemsReturned || 0;
    document.getElementById('active-claims').textContent = data.activeClaims || 0;
  } catch (error) {
    console.error('Failed to load home stats', error);
  }
});
