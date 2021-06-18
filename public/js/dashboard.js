const hamburger = document.getElementById("hamburger");
const sideMenu = document.getElementById("menu");

hamburger.addEventListener("click", () => {
    sideMenu.classList.toggle("sidebar");
    if (hamburger.innerText === "❌") {
        hamburger.innerText = "☰";
    } else {
        hamburger.innerText = "❌";
    }
});
