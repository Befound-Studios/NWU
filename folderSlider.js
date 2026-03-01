document.addEventListener("DOMContentLoaded", () => {

    const slidesContainer = document.querySelector(".aboutSlider .slides");

    if (!slidesContainer) return;

    const slides = slidesContainer.querySelectorAll("img");
    const totalSlides = slides.length;

    let index = 0;

    function updateSlider() {
        slidesContainer.style.transform =
            `translateX(-${index * 100}%)`;
    }

    function autoPlay() {
        index++;

        if (index >= totalSlides) {
            index = 0;
        }

        updateSlider();
    }

    // start autoplay
    setInterval(autoPlay, 3500);
});