// Week 4 · Practice 1 — Campus Explorer
// Switches the visible place section and the Google Maps iframe together.

const places = {
  canteen: {
    embed: "https://maps.google.com/maps?q=37.4865,126.8011&z=17&hl=en&output=embed"
  },
  classroom: {
    embed: "https://maps.google.com/maps?q=37.4864,126.8012&z=17&hl=en&output=embed"
  },
  teaching: {
    embed: "https://maps.google.com/maps?q=37.4868,126.7999&z=17&hl=en&output=embed"
  }
};

const buttons = document.querySelectorAll(".place-btn");
const mapFrame = document.querySelector("#map");

function showPlace(id) {
  // Show only the chosen place section; hide the rest.
  document.querySelectorAll(".place").forEach((section) => {
    section.hidden = section.id !== id;
  });

  // Swap the map to the chosen place.
  if (mapFrame && places[id]) {
    mapFrame.src = places[id].embed;
  }

  // Tell assistive tech and CSS which button is selected.
  buttons.forEach((button) => {
    const selected = button.dataset.place === id;
    button.setAttribute("aria-pressed", String(selected));
  });
}

buttons.forEach((button) => {
  button.addEventListener("click", () => showPlace(button.dataset.place));
});

// First visit: a place is already selected in the HTML, so just load its map.
showPlace("canteen");