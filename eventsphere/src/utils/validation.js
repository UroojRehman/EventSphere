export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEventFields(formData) {
  const title = formData.title.trim();
  const location = formData.location.trim();
  const description = formData.description.trim();
  const capacity = Number(formData.capacity);
  const errors = {};

  if (!title) errors.title = "Event title is required.";
  else if (title.length < 3 || title.length > 120) errors.title = "Title must be 3-120 characters.";
  if (!formData.category) errors.category = "Category is required.";
  if ("department" in formData && !formData.department) errors.department = "Department is required.";
  if ("eventType" in formData && !formData.eventType) errors.eventType = "Event type is required.";
  if (!formData.date) errors.date = "Event date is required.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) errors.date = "Enter a valid event date.";
  if (!formData.time) errors.time = "Start time is required.";
  if (!formData.endTime) errors.endTime = "End time is required.";

  if (formData.date) {
    const eventDate = new Date(`${formData.date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(eventDate.getTime()) || eventDate < today) errors.date = "Event date cannot be in the past.";
  }
  if (formData.time && formData.endTime && formData.endTime <= formData.time) errors.endTime = "End time must be later than the start time.";
  if (!formData.timezone) errors.timezone = "Time zone is required.";
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100000) errors.capacity = "Capacity must be a whole number between 1 and 100,000.";
  if (!location) errors.location = "Venue or location is required.";
  else if (location.length < 2 || location.length > 200) errors.location = "Venue must be 2-200 characters.";
  if (!description) errors.description = "Description is required.";
  else if (description.length < 10 || description.length > 5000) errors.description = "Description must be 10-5,000 characters.";

  if (formData.image instanceof File) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(formData.image.type)) errors.image = "Event image must be JPG, PNG, or WebP.";
    else if (formData.image.size > 5 * 1024 * 1024) errors.image = "Event image must be smaller than 5 MB.";
  }

  return errors;
}

export function validateEventForm(formData) {
  const errors = validateEventFields(formData);
  return Object.values(errors)[0] || "";
}