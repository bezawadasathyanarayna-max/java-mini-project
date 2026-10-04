document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('report-found-form');
  if (!form) return;

  if (!requireAuth()) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      item_name: formData.get('item_name'),
      category: formData.get('category'),
      description: formData.get('description'),
      date: formData.get('date'),
      time: formData.get('time'),
      location: formData.get('location'),
      color: formData.get('color'),
      brand: formData.get('brand'),
      unique_details: formData.get('unique_details'),
      contact_info: formData.get('contact_info'),
      image_url: formData.get('image_url'),
    };

    try {
      const result = await apiFetch('/items/found', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showMessage(result.message || 'Found item reported successfully.', 'success');
      setTimeout(() => {
        window.location.href = 'my-reports.html';
      }, 700);
    } catch (error) {
      showMessage(error.message || 'Unable to save item.', 'error');
    }
  });
});
