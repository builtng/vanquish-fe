export function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function abbreviateLastName(name) {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length <= 1) return name;
  
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${firstName} ${lastInitial}.`;
}
