const cards = document.querySelectorAll(".checklist-card");

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const titulo = card.querySelector("h2")?.textContent || "Checklist";

    localStorage.setItem("ultimoChecklistAcessado", titulo);
  });
});