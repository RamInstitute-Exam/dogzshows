export function calculateAgeInMonths(dob: Date | string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();
  
  // Adjust if the birth day hasn't occurred yet in the current month
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }
  
  return months;
}

export function determineAgeClass(dob: Date | string | null): string {
  if (!dob) return 'Unknown';
  
  const months = calculateAgeInMonths(dob);
  
  if (months < 4) return 'Too Young';
  if (months >= 4 && months < 6) return 'Minor Puppy';
  if (months >= 6 && months < 12) return 'Puppy';
  if (months >= 12 && months < 18) return 'Junior';
  if (months >= 15 && months < 24) return 'Intermediate'; // Note: Open/Intermediate overlaps often depend on specific show rules
  if (months >= 15 && months < 96) return 'Open';
  if (months >= 96) return 'Veteran';
  
  return 'Unknown';
}
