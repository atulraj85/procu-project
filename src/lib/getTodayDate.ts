export function getTodayDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
    const year = today.getFullYear(); // Get the full year
  
    return `${day}/${month}/${year}`;
  }