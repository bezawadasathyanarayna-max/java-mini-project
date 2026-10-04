document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('item-details-content');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('id');

  if (!itemId) {
    container.innerHTML = '<div class="empty-state">No item was selected.</div>';
    return;
  }

  try {
    const response = await apiFetch(`/items/${itemId}`);
    const item = response.item;

    const reporterInfo = item.reporter_name ? `${item.reporter_name} (${item.reporter_student_id})` : 'Campus user';

    const claimFormMarkup = item.item_type === 'FOUND' && item.status !== 'RETURNED'
      ? `
        <div class="form-shell" style="margin-top: 1.5rem;">
          <h2 id="claim-form">Submit Claim</h2>
          <form id="claim-form">
            <input type="hidden" name="item_id" value="${item.id}" id="claim-item-id" />
            <div class="form-grid">
              <div class="form-field">
                <label for="claimant_name">Claimant Name</label>
                <input id="claimant_name" name="claimant_name" type="text" required />
              </div>
              <div class="form-field">
                <label for="student_id">Student ID</label>
                <input id="student_id" name="student_id" type="text" required />
              </div>
              <div class="form-field">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" required />
              </div>
              <div class="form-field">
                <label for="phone">Phone</label>
                <input id="phone" name="phone" type="tel" required />
              </div>
              <div class="form-field full-width">
                <label for="proof_details">Proof / Identification Details</label>
                <textarea id="proof_details" name="proof_details" required></textarea>
              </div>
              <div class="form-field full-width">
                <label for="message">Additional Message</label>
                <textarea id="message" name="message"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Submit Claim</button>
            </div>
          </form>
        </div>
      ` : '';

    container.innerHTML = `
      <div class="item-card" style="overflow: visible; border: none; box-shadow: none; background: transparent;">
        <div class="form-shell">
          <div class="inline-actions" style="justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h1 style="margin: 0;">${item.item_name}</h1>
            <span class="status-badge status-${String(item.status || 'active').toLowerCase()}">${item.status || 'ACTIVE'}</span>
          </div>
          <div class="items-grid" style="grid-template-columns: 1.1fr 0.9fr;">
            <div>
              <img src="${item.image_url || 'https://via.placeholder.com/600x400?text=Campus+Item'}" alt="${item.item_name}" style="border-radius: 14px; height: 320px; object-fit: cover; background: #edf3ff;" onerror="this.src='https://via.placeholder.com/600x400?text=Campus+Item'" />
            </div>
            <div>
              <p><strong>Category:</strong> ${item.category}</p>
              <p><strong>Location:</strong> ${item.location}</p>
              <p><strong>Date:</strong> ${item.date}</p>
              <p><strong>Time:</strong> ${item.time || 'Not provided'}</p>
              <p><strong>Brand:</strong> ${item.brand || 'Not provided'}</p>
              <p><strong>Color:</strong> ${item.color || 'Not provided'}</p>
              <p><strong>Reporter:</strong> ${reporterInfo}</p>
              <p><strong>Status:</strong> ${item.status || 'ACTIVE'}</p>
            </div>
          </div>
          <div style="margin-top: 1.5rem;">
            <h3>Description</h3>
            <p>${item.description}</p>
            <h3>Unique Details</h3>
            <p>${item.unique_details || 'No extra details provided.'}</p>
          </div>
        </div>
      </div>
      ${claimFormMarkup}
    `;

    if (document.getElementById('claim-form')) {
      const claimForm = document.getElementById('claim-form');
      claimForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(claimForm);
        const payload = {
          item_id: Number(formData.get('item_id')),
          claimant_name: formData.get('claimant_name'),
          student_id: formData.get('student_id'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          proof_details: formData.get('proof_details'),
          message: formData.get('message'),
        };

        try {
          const result = await apiFetch('/claims', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          showMessage(result.message || 'Claim submitted successfully.', 'success');
          claimForm.reset();
        } catch (error) {
          showMessage(error.message || 'Claim could not be submitted.', 'error');
        }
      });
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
});
