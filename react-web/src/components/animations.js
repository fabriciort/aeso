document.addEventListener("DOMContentLoaded", () => {
  const astroviewToggle = document.querySelector(".astroview-toggle");
  const astroviewOverlay = document.querySelector(".astroview-overlay");

  astroviewToggle.addEventListener("click", () => {
    astroviewOverlay.classList.toggle("active");
  });

  astroviewOverlay.addEventListener("click", (e) => {
    if (e.target === astroviewOverlay) {
      astroviewOverlay.classList.remove("active");
    }
  });

  const floatingButtons = document.querySelectorAll(".floating-button");
  floatingButtons.forEach((button) => {
    button.addEventListener("mousemove", (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      button.style.setProperty("--x", `${x}px`);
      button.style.setProperty("--y", `${y}px`);
    });
  });
});
