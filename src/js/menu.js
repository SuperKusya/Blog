window.addEventListener('DOMContentLoaded', function() {    
    let mask = document.querySelector('.mask'),
        navList = document.querySelector('.nav__list'),
        menu = document.querySelector('.nav__menu');

    menu.addEventListener('click', function() {
        navList.classList.toggle('active');
        mask.classList.toggle('visible');
    });

    mask.addEventListener('click', function() {
        navList.classList.remove('active');
        mask.classList.remove('visible');
    });
});