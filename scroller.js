const slider = document.getElementById("carousel");

let down = false;
let startX = 0;
let startScroll = 0;

slider.addEventListener("mousedown", (e) => {
    down = true;
    startX = e.pageX;
    startScroll = slider.scrollLeft;
});

window.addEventListener("mouseup", () => (down = false));

slider.addEventListener("mousemove", (e) => {
    if (!down) return;
    e.preventDefault();
    slider.scrollLeft = startScroll - (e.pageX - startX);
});
