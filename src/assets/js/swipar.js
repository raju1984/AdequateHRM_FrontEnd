var swiper = new Swiper(".testi-slider", {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    pagination: {
    el: ".swiper-pagination",
    clickable: true,
    },
    breakpoints: {
    768: {
        slidesPerView: 1
    },
    992: {
        slidesPerView: 2
    }
    }
});
