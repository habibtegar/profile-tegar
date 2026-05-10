const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".navbar ul");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navMenu.classList.toggle("open");
});