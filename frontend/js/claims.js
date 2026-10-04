document.addEventListener('DOMContentLoaded', () => {
  const claimForm = document.getElementById('claim-form');
  if (!claimForm) return;

  const itemId = document.getElementById('claim-item-id')?.value;
  if (!itemId) return;

  claimForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!requireAuth()) return;

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
});
