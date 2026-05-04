const currentPath = window.location.pathname;

document.querySelectorAll('.header_nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
    }
});
