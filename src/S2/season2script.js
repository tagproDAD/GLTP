const navItems = {
  home: { linkId: 'homeLink', pageId: 'homePage' },
  standings: { linkId: 'standingsLink', pageId: 'standingsPage' },
  ofm: { linkId: 'ofmLink', pageId: 'ofmPage' },
  info: { linkId: 'linksLink', pageId: 'linksPage' },
  week1: { linkId: 'week1Link', pageId: 'week1Page' },
  week2: { linkId: 'week2Link', pageId: 'week2Page' },
  week3: { linkId: 'week3Link', pageId: 'week3Page' },
  rosters: { linkId: 'rostersLink', pageId: 'rostersPage' },
  season1: { linkId: 'season1Link', pageId: 'season1Page' },
};

Object.entries(navItems).forEach(([key, { linkId, pageId }]) => {
  document.getElementById(linkId).addEventListener('click', () => {
    if (key === 'home') {
      window.location.href = '/GLTP/';
      return;
    }
    if (key === 'season1') {
      window.location.href = '/GLTP/S1/home.html';
      return;
    }
    window.location.hash = key;
    showPage(pageId, linkId);
  });
});

function showPage(pageId, linkId) {
  Object.values(navItems).forEach(({ pageId }) => {
    const page = document.getElementById(pageId);
    if (page) page.classList.remove('active');
  });

  Object.values(navItems).forEach(({ linkId }) => {
    const link = document.getElementById(linkId);
    if (link) link.classList.remove('active');
  });

  const page = document.getElementById(pageId);
  const link = document.getElementById(linkId);
  if (page) page.classList.add('active');
  if (link) link.classList.add('active');
}

function loadPageContent(filename, elementId) {
  fetch(`${filename}?v=${window.BUILD_VERSION}`)
    .then(res => res.text())
    .then(html => {
      document.getElementById(elementId).innerHTML = html;
      if (filename === 'standings.html') {
        enableToggleListeners();
        fetchStandingsData();
      }
    })
    .catch(err => {
      document.getElementById(elementId).innerHTML = `Failed to load ${filename}.`;
      console.error(`Error loading ${filename}:`, err);
    });
}

function fetchStandingsData() {
  fetch(`season2Data.json?v=${window.BUILD_VERSION}`)
    .then(res => res.json())
    .then(data => renderStandings(data))
    .catch(err => console.error("Error loading season2Data.json:", err));
}

function renderStandings(data) {
  const container = document.getElementById("standingsContent");
  if (!container) return;

  const teams = data.teams.slice().sort((a, b) => b.points - a.points);
  const medals = ['🥇', '🥈', '🥉'];

  let html = `<table class="standings-table"><tr><th>#</th><th>Team</th><th>Pts</th><th>W-L-T</th></tr>`;
  teams.forEach((team, i) => {
    const medal = medals[i] || '';
    html += `<tr>
      <td>${i + 1}</td>
      <td>${medal} ${team.name}</td>
      <td>${team.points}</td>
      <td>${team.wins}-${team.losses}-${team.ties}</td>
    </tr>`;
  });
  html += `</table>`;

  container.innerHTML += html;
}

function enableToggleListeners() {
  document.querySelectorAll('.toggle-header').forEach(header => {
    header.addEventListener('click', () => {
      const targetId = header.getAttribute('data-toggle-target');
      const target = document.getElementById(targetId);
      const arrow = header.querySelector('.arrow');

      if (target) {
        const isHidden = target.style.display === 'none' || getComputedStyle(target).display === 'none';
        target.style.display = isHidden ? 'block' : 'none';
        if (arrow) arrow.textContent = isHidden ? '▼' : '▶';
      }
    });
  });
}

function copyMapID(button) {
  const span = button.parentElement.querySelector('.map-id');
  const mapId = span.textContent;
  if (mapId && mapId !== "N/A") {
    navigator.clipboard.writeText(mapId).then(() => {
      button.textContent = "✅";
      button.classList.add("copied");
      setTimeout(() => {
        button.textContent = "Copy Preset";
        button.classList.remove("copied");
      }, 1500);
    }).catch(err => console.error("Error copying map:", err));
  }
}

function openMap(button) {
  const span = button.parentElement.querySelector('.map-id');
  const mapId = span.textContent;
  if (mapId && mapId !== "N/A") {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://tagpro.koalabeast.com/groups/create";
    form.target = "_blank";

    const nameInput = document.createElement("input");
    nameInput.type = "hidden";
    nameInput.name = "name";
    nameInput.value = "GLTP IS THE BEST";

    const privateInput = document.createElement("input");
    privateInput.type = "hidden";
    privateInput.name = "private";
    privateInput.value = "on";

    const presetInput = document.createElement("input");
    presetInput.type = "hidden";
    presetInput.name = "preset";
    presetInput.value = mapId;

    form.appendChild(nameInput);
    form.appendChild(privateInput);
    form.appendChild(presetInput);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }
}

function toggleDropdown() {
  document.getElementById("dropdownContent").classList.toggle("show");
}

window.addEventListener("click", function (e) {
  if (!e.target.matches('.dropbtn')) {
    const dropdown = document.getElementById("dropdownContent");
    if (dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1);
  if (navItems[hash]) {
    const { pageId, linkId } = navItems[hash];
    showPage(pageId, linkId);
  } else {
    const { pageId, linkId } = navItems['standings'];
    showPage(pageId, linkId);
  }

  loadPageContent('gltpRosters.html', 'rosterContent');
  loadPageContent('S2W1.html', 'week1Content');
  loadPageContent('S2W2.html', 'week2Content');
  loadPageContent('S2W3.html', 'week3Content');
  loadPageContent('gltp_links.html', 'linksContent');
  loadPageContent('ofm.html', 'ofmContent');
  loadPageContent('standings.html', 'standingsContent');
});
