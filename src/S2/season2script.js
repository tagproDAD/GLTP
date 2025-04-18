// Define navigation items - keep this structure as it's useful
const navItems = {
  home: { linkId: 'homeLink', pageId: 'homePage' },
  standings: { linkId: 'standingsLink', pageId: 'standingsPage' },
  ofm: { linkId: 'ofmLink', pageId: 'ofmPage' },
  links: { linkId: 'linksLink', pageId: 'linksPage' },
  week1: { linkId: 'week1Link', pageId: 'week1Page' },
  week2: { linkId: 'week2Link', pageId: 'week2Page' },
  week3: { linkId: 'week3Link', pageId: 'week3Page' },
  rosters: { linkId: 'rostersLink', pageId: 'rostersPage' },
  season1: { linkId: 'season1Link', pageId: 'season1Page' },
};

// Data storage for all loaded content
let seasonData = null;

// Set up navigation event listeners
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

// Show/hide pages and update active state for navigation
function showPage(pageId, linkId) {
  // Hide all pages and remove active class from all links
  Object.values(navItems).forEach(({ pageId }) => {
    const page = document.getElementById(pageId);
    if (page) page.classList.remove('active');
  });

  Object.values(navItems).forEach(({ linkId }) => {
    const link = document.getElementById(linkId);
    if (link) link.classList.remove('active');
  });

  // Show selected page and mark link as active
  const page = document.getElementById(pageId);
  const link = document.getElementById(linkId);
  if (page) page.classList.add('active');
  if (link) link.classList.add('active');
}

async function loadStaticContent(elementId, htmlPath) {
  const response = await fetch(htmlPath);
  const html = await response.text();
  document.getElementById(elementId).innerHTML = html;
}

// Main function to fetch and parse JSON data
function fetchSeasonData() {
  fetch(`season2data.json?v=${window.BUILD_VERSION}`)
    .then(res => res.json())
    .then(data => {
      seasonData = data;

      // Render content for each page based on JSON data
      loadPageContent('homeContent', data.pages?.home?.content || "Home content not found.");
      loadPageContent('season1Content', data.pages?.season1?.content || "Season 1 content not found.");

      // Load static content
      loadStaticContent('ofmContent', 'ofm.html');
      loadStaticContent('linksContent', 'gltp_links.html');

      // Handle week content - check if data exists first
      if (data.week1 && data.week1.length > 0) {
        renderWeekContent('week1Content', data.week1);
      } else {
        loadPageContent('week1Content', "Week 1 content not yet available.");
      }

      if (data.week2 && data.week2.length > 0) {
        renderWeekContent('week2Content', data.week2);
      } else {
        loadPageContent('week2Content', "Week 2 content not yet available.");
      }

      if (data.week3 && data.week3.length > 0) {
        renderWeekContent('week3Content', data.week3);
      } else {
        loadPageContent('week3Content', "Week 3 content not yet available.");
      }

      // Render standings and rosters
      renderStandings('standingsContent', data.teams);
      renderRosters('rosterContent', data.teams);

      // Add event listeners after content is loaded
      enableToggleListeners();
    })
    .catch(err => {
      console.error("Error loading season2data.json:", err);
      document.getElementById('standingsContent').innerHTML = "Failed to load season data.";
    });
}

// Helper function to load simple page content
function loadPageContent(containerId, content) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = content;
  }
}

function getValidSortedSpeedruns(speedruns) {
  return speedruns
    .filter(run => run.includeOnSpeedrun === "yes")
    .sort((a, b) => timeStringToSeconds(a.time) - timeStringToSeconds(b.time));
}

// Render weekly content (maps and speedruns)
function renderWeekContent(containerId, weekData) {
  const container = document.getElementById(containerId);
  if (!container || !weekData) return;

  let weekNumber = containerId.replace('week', '').replace('Content', '');
  let html = `<h1>GLTP Season 2 Week ${weekNumber} Maps</h1>`;

  // Create maps table
  html += `
  <table style="width: 100%; table-layout: fixed;">
    <colgroup>
      <col style="width: 15%;">
      <col style="width: 23%;">
      <col style="width: 25%;">
      <col style="width: 15%;">
      <col style="width: 5%;">
      <col style="width: 9%;">
      <col style="width: 8%;">
    </colgroup>
    <tr>
      <th>Map</th>
      <th>Group Preset</th>
      <th>Speedrun Group Preset</th>
      <th>Settings</th>
      <th>Points</th>
      <th>Fastest Time <br> points</th>
      <th>Difficulty <br> Rank</th>
    </tr>
  `;

  // Add each map to the table
  weekData.forEach(map => {
    html += `
    <tr>
      <td><a href="${map.link}" target="_blank">${map.mapName} <br> by ${map.author} </a> <br><br> ${map.recommendedBalls} balls recommended</td>
      <td>
        <span class="map-id">${map.preset}</span> <br> <br>
        <button class="copy-button" onclick="copyMapID(this)">Copy Preset</button>
        <button class="open-button" onclick="openMap(this)">Launch Group</button>
      </td>
      <td>
        <span class="map-id">${map.speedrunPreset}</span> <br> <br>
        <button class="copy-button" onclick="copyMapID(this)">Copy Preset</button>
        <button class="open-button" onclick="openMap(this)">Launch Group</button>
      </td>
      <td>${map.settings}</td>
      <td>${map.points}</td>
      <td>${map.fastestPoints}</td>
      <td>${map.difficulty}</td>
    </tr>
    `;
  });

  html += `</table><h1>Speedruns</h1>`;

  // Add speedrun tables for each map
  weekData.forEach(map => {
    html += `
    <table>
      <tr>
        <th colspan="6">${map.mapName}</th>
      </tr>
      <tr>
        <th>Rank</th>
        <th>Time</th>
        <th>Players</th>
        <th>Team</th>
        <th>Replay</th>
        <th>Points</th>
      </tr>
    `;

    // Add speedrun entries if they exist
    if (map.speedruns && map.speedruns.length > 0) {
      const validRuns = getValidSortedSpeedruns(map.speedruns);

      validRuns.forEach((run, index) => {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td>${run.time}</td>
            <td>${Array.isArray(run.players) ? run.players.join('<br>') : run.players}</td>
            <td>${run.team}</td>
            <td><a href="${run.replay}" target="_blank">Link</a></td>
            <td>${run.points}</td>
          </tr>
        `;
      });
    }


    // Add an empty row for aesthetics
    html += `
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td><a href="#">Link</a></td>
        <td></td>
      </tr>
    </table>
    `;
  });

  container.innerHTML = html;
}

// Render standings table and team details
function renderStandings(containerId, teamsData) {
  const container = document.getElementById(containerId);
  if (!container || !teamsData) return;

  // Sort teams by total points descending
  const sortedTeams = [...teamsData].sort((a, b) =>
    b["Total\nPoints"] - a["Total\nPoints"]
  );

  let html = `<h2>GLTP Season 2 Standings</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Team</th>
        <th>Total Points</th>
        <th>Completion Points</th>
        <th>Speedrun Points</th>
        <th>Week1 Points</th>
        <th>Week2 Points</th>
        <th>Week3 Points</th>
      </tr>
    </thead>
    <tbody>`;

  // Add each team's standings
  sortedTeams.forEach((team, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${team.name}</td>
        <td>${team["Total\nPoints"]}</td>
        <td>${team["Completion\nPoints"]}</td>
        <td>${team["Speedrun\nPoints"]}</td>
        <td>${team["Week1\nPoints"]}</td>
        <td>${team["Week2\nPoints"]}</td>
        <td>${team["Week3\nPoints"]}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  // Add collapsible sections for each team's points
  teamsData.forEach(team => {
    const teamIdSafe = team.name.toLowerCase().replace(/\s+/g, '-');

    html += `
    <h2 class="toggle-header" data-toggle-target="${teamIdSafe}-points-table">
      <span class="arrow">▶</span>${team.name} Points
    </h2>
    <div id="${teamIdSafe}-points-table" class="toggle-section" style="display: none;">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Map</th>
            <th>Completion</th>
            <th>Speedrun</th>
            <th>CPoints</th>
            <th>SPoints</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Loop through each week's maps
    if (seasonData && seasonData.week1) {
      seasonData.week1.forEach((map, idx) => {
        // Check if team completed this map (has a speedrun entry)
        const hasCompleted = teamCompletedMap(team.name, map);
        const speedrunRank = teamSpeedrunRank(team.name, map);

        html += `
        <tr>
          <td>1</td>
          <td><a href="${map.link}" target="_blank">${map.mapName}</a></td>
          <td>${hasCompleted ?
            '<i class="fas fa-check green-icon" aria-label="Yes"></i>' :
            '<i class="fas fa-times red-icon" aria-label="No"></i>'}</td>
          <td>${speedrunRank ? getMedalForRank(speedrunRank) :
            '<i class="fas fa-times red-icon" aria-label="No"></i>'}</td>
          <td>${hasCompleted ? map.points : '0'}</td>
          <td>${speedrunRank ? getPointsForRank(speedrunRank) : '0'}</td>
        </tr>
        `;
      });
    }

    html += `</tbody></table></div>`;
  });

  container.innerHTML = html;
}

// Helper function to check if a team completed a map
function teamCompletedMap(teamName, map) {
  // Check if the team has a speedrun entry for this map
  return map.speedruns && map.speedruns.some(run => run.team === teamName);
}

function timeStringToSeconds(timeStr) {
  if (timeStr.includes(':')) {
    const [minPart, secPart] = timeStr.split(':');
    return parseInt(minPart, 10) * 60 + parseFloat(secPart);
  } else {
    // Format is just seconds (e.g. "40.123")
    return parseFloat(timeStr);
  }
}

// Helper function to get a team's speedrun rank on a map
function teamSpeedrunRank(teamName, map) {
  if (!map.speedruns) return null;

  const validRuns = getValidSortedSpeedruns(map.speedruns);

  const teamRuns = validRuns.filter(run => run.team === teamName);
  if (teamRuns.length === 0) return null;

  const bestRun = teamRuns.reduce((best, current) =>
    timeStringToSeconds(current.time) < timeStringToSeconds(best.time) ? current : best
  );

  const rank = validRuns.findIndex(run => run === bestRun) + 1;
  return rank;
}

// Helper function to get medal emoji based on rank
function getMedalForRank(rank) {
  const medals = ['🥇', '🥈', '🥉'];
  return rank <= 3 ? medals[rank - 1] : rank;
}

// Helper function to get points based on rank
function getPointsForRank(rank) {
  // Assuming 1st = 2 points, 2nd = 1 point, others = 0
  return rank === 1 ? 2 : rank === 2 ? 1 : 0;
}

// Render team rosters
function renderRosters(containerId, teamsData) {
  const container = document.getElementById(containerId);
  if (!container || !teamsData) return;

  let html = `
  <table>
    <tr>
      <th class="title" colspan="${teamsData.length}">Season 2 GLTP Rosters</th>
    </tr>
    <tr>
  `;

  // Add team names as headers
  teamsData.forEach(team => {
    html += `<th>${team.name}</th>`;
  });

  html += `</tr>`;

  // Determine the maximum roster size
  const maxRosterSize = Math.max(...teamsData.map(team => team.roster.length));

  // Create rows for each player position
  for (let i = 0; i < maxRosterSize; i++) {
    html += `<tr>`;

    teamsData.forEach(team => {
      if (i === 0) {
        // First player is captain (with gold icon)
        html += team.roster[i] ?
          `<td><img src="http://i.imgur.com/U3KTppv.png" alt="icon" style="height: 1em; vertical-align: middle; margin-right: 5px;">${team.roster[i]}</td>` :
          `<td></td>`;
      } else if (i < team.roster.length) {
        // Regular players with silver icon
        html += `<td><img src="http://i.imgur.com/Qw987lA.png" alt="icon" style="height: 1em; vertical-align: middle; margin-right: 5px;">${team.roster[i]}</td>`;
      } else {
        // Empty cells for teams with fewer players
        html += `<td></td>`;
      }
    });

    html += `</tr>`;
  }

  html += `</table>`;

  container.innerHTML = html;
}

// Event listener setup for collapsible sections
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

// Copy map ID to clipboard
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

// Open map in a new tab
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

// Toggle dropdown menu
function toggleDropdown() {
  document.getElementById("dropdownContent").classList.toggle("show");
}

// Close dropdown when clicking outside
window.addEventListener("click", function (e) {
  if (!e.target.matches('.dropbtn')) {
    const dropdown = document.getElementById("dropdownContent");
    if (dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
    }
  }
});

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
  // Determine which page to show based on URL hash
  const hash = window.location.hash.slice(1);
  if (navItems[hash]) {
    const { pageId, linkId } = navItems[hash];
    showPage(pageId, linkId);
  } else {
    const { pageId, linkId } = navItems['standings'];
    showPage(pageId, linkId);
  }

  // Fetch all data from JSON and render pages
  fetchSeasonData();
});
