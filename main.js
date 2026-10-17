// Tema Değiştirme Mantığı
const themeToggleBtn = document.getElementById('theme-toggle');

// Kullanıcının kayıtlı temasını kontrol et (localStorage)
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (currentTheme === 'light') {
    themeToggleBtn.textContent = '☀️';
  }
}

themeToggleBtn.addEventListener('click', () => {
  let theme = document.documentElement.getAttribute('data-theme');
  
  if (theme === 'light') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'dark');
    themeToggleBtn.textContent = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    themeToggleBtn.textContent = '☀️';
  }
});
