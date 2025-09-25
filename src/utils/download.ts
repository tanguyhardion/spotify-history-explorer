export const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadCsv = (rows: string[][], filename: string) => {
  const csvContent = rows.map((cols) => cols.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const escapeCsv = (value: string) => {
  const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n');
  let escaped = value.replace(/"/g, '""');
  if (needsQuotes) {
    escaped = `"${escaped}"`;
  }
  return escaped;
};
