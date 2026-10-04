document.addEventListener('DOMContentLoaded', () => {
  const pageType = document.body.dataset.page;
  const itemsContainer = document.getElementById('items-list');
  const filterForm = document.getElementById('filter-form');
  const searchInput = document.getElementById('search');
  const statusFilter = document.getElementById('status-filter');
  const categoryFilter = document.getElementById('category-filter');

  if (!pageType || !itemsContainer) {
    return;
  }

  function buildStatusClass(status) {
    return `status-${String(status || 'active').toLowerCase()}`;
  }

  function renderItems(items) {
    if (!items || items.length === 0) {
      itemsContainer.innerHTML = '<div class="empty-state">No items found for this search.</div>';
      return;
    }

    itemsContainer.innerHTML = items.map((item) => {
      const image = item.image_url || 'https://via.placeholder.com/600x400?text=Campus+Item';
      return `
        <article class="item-card">
          <img src="${image}" alt="${item.item_name}" onerror="this.src='https://via.placeholder.com/600x400?text=Campus+Item';" />
          <div class="item-card-body">
            <div class="inline-actions" style="justify-content: space-between; align-items: center;">
              <h3>${item.item_name}</h3>
              <span class="status-badge ${buildStatusClass(item.status)}">${item.status || 'ACTIVE'}</span>
            </div>
            <div class="meta-row">
              <span>${item.category}</span>
              <span>•</span>
              <span>${item.location}</span>
            </div>
            <div class="meta-row">
              <span>${item.date}</span>
              <span>•</span>
              <span>${item.item_type}</span>
            </div>
            <div class="form-actions">
              <a class="btn btn-light" href="item-details.html?id=${item.id}">View Details</a>
              ${pageType === 'found' && item.status !== 'RETURNED' ? `<a class="btn btn-primary" href="item-details.html?id=${item.id}#claim-form">Claim Item</a>` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  async function fetchItems() {
    const params = new URLSearchParams();
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    const selectedStatus = statusFilter ? statusFilter.value : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';

    if (searchTerm) params.set('search', searchTerm);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedCategory) params.set('category', selectedCategory);

    try {
      const data = await apiFetch(`/items/${pageType}?${params.toString()}`);
      renderItems(data.items || []);
    } catch (error) {
      itemsContainer.innerHTML = `<div class="empty-state">${error.message}</div>`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', fetchItems);
  }

  if (filterForm) {
    filterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      fetchItems();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', fetchItems);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', fetchItems);
  }

  fetchItems();
});
