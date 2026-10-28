// Mark JS as available and apply a saved theme before first paint to avoid a flash.
document.documentElement.classList.add('js');
try {
  const theme = localStorage.getItem('lio-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch {}
