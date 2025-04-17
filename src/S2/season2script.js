// Ensure we are targeting the right container elements for the pages

document.addEventListener("DOMContentLoaded", function() {
  // Page containers
  const homeContent = document.getElementById("homeContent");
  const ofmContent = document.getElementById("ofmContent");
  const season1Content = document.getElementById("season1Content");
  const rosterContent = document.getElementById("rosterContent");
  const linksContent = document.getElementById("linksContent");
  const week1Content = document.getElementById("week1Content");
  const week2Content = document.getElementById("week2Content");
  const week3Content = document.getElementById("week3Content");
  const standingsContent = document.getElementById("standingsContent");

  // This function will load content into each page
  function loadPageContent(page, contentElement) {
    switch(page) {
      case "home":
        homeContent.innerHTML = "Loading home page content...";
        break;
      case "ofm":
        ofmContent.innerHTML = "Loading OFM page content...";
        break;
      case "season1":
        season1Content.innerHTML = "Loading Season 1 page content...";
        break;
      case "rosters":
        rosterContent.innerHTML = "Loading rosters content...";
        break;
      case "links":
        linksContent.innerHTML = "Loading links content...";
        break;
      case "week1":
        week1Content.innerHTML = "Loading Week 1 content...";
        break;
      case "week2":
        week2Content.innerHTML = "Loading Week 2 content...";
        break;
      case "week3":
        week3Content.innerHTML = "Loading Week 3 content...";
        break;
      case "standings":
        standingsContent.innerHTML = "Loading standings content...";
        break;
      default:
        console.log("Unknown page");
    }
  }

  // Example: You can call `loadPageContent` on a page load or when needed
  loadPageContent("home", homeContent);

  // Here, you'd handle navigation changes dynamically
  document.getElementById("homeLink").addEventListener("click", function() {
    loadPageContent("home", homeContent);
  });

  document.getElementById("standingsLink").addEventListener("click", function() {
    loadPageContent("standings", standingsContent);
  });

  document.getElementById("week1Link").addEventListener("click", function() {
    loadPageContent("week1", week1Content);
  });

  document.getElementById("week2Link").addEventListener("click", function() {
    loadPageContent("week2", week2Content);
  });

  document.getElementById("week3Link").addEventListener("click", function() {
    loadPageContent("week3", week3Content);
  });

  document.getElementById("rostersLink").addEventListener("click", function() {
    loadPageContent("rosters", rosterContent);
  });

  document.getElementById("linksLink").addEventListener("click", function() {
    loadPageContent("links", linksContent);
  });

  // Dropdown logic for Past Seasons
  document.getElementById("season1Link").addEventListener("click", function() {
    loadPageContent("season1", season1Content);
  });
});

function toggleDropdown() {
  const dropdownContent = document.getElementById("dropdownContent");
  dropdownContent.classList.toggle("show");
}
