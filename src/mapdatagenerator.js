function medal(rank) {
  const medals = ["🥇", "🥈", "🥉"];
  return rank <= 3 ? `${medals[rank - 1]} ${rank}` : rank;
}

function generatePage(data) {
  const container = document.getElementById("content");

  container.innerHTML = `<h1>${data.title}</h1>`;

  const mapTable = document.createElement("table");
  mapTable.style.width = "100%";
  mapTable.style.tableLayout = "fixed";
  mapTable.innerHTML = `
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
      <th>Points for Fastest Time</th>
      <th>Difficulty <br> Rank</th>
    </tr>
  `;

  data.maps.forEach(map => {
    mapTable.innerHTML += `
      <tr>
        <td><a href="${map.mapUrl}" target="_blank">${map.name} <br> by ${map.author}</a><br><br>${map.playersRecommended} balls recommended</td>
        <td>
          <span class="map-id">${map.groupPreset}</span><br><br>
          <button class="copy-button" onclick="copyMapID(this)">Copy Preset</button>
          <button class="open-button" onclick="openMap(this)">Launch Group</button>
        </td>
        <td>
          <span class="map-id">${map.speedrunPreset}</span><br><br>
          <button class="copy-button" onclick="copyMapID(this)">Copy Preset</button>
          <button class="open-button" onclick="openMap(this)">Launch Group</button>
        </td>
        <td>${map.settings.join("<br>")}</td>
        <td>${map.points}</td>
        <td>${map.bonusPoints}</td>
        <td>${map.difficulty}</td>
      </tr>
    `;
  });

  container.appendChild(mapTable);

  data.maps.forEach(map => {
    const srTable = document.createElement("table");
    srTable.innerHTML = `
      <tr><th colspan="6">${map.name}</th></tr>
      <tr>
        <th>Rank</th>
        <th>Time</th>
        <th>Players</th>
        <th>Team</th>
        <th>Replay</th>
        <th>Points</th>
      </tr>
    `;

    if (map.speedruns.length > 0) {
      map.speedruns.forEach(run => {
        srTable.innerHTML += `
          <tr>
            <td>${medal(run.rank)}</td>
            <td>${run.time}</td>
            <td>${run.players.join("<br>")}</td>
            <td>${run.team}</td>
            <td><a href="${run.replay}" target="_blank">Link</a></td>
            <td>${run.points}</td>
          </tr>
        `;
      });
    }

    srTable.innerHTML += `
      <tr>
        <td></td><td></td><td></td><td></td><td><a href="#">Link</a></td><td></td>
      </tr>
      <tr>
        <td></td><td></td><td></td><td></td><td><a href="#">Link</a></td><td></td>
      </tr>
    `;

    container.appendChild(srTable);
  });
}

function copyMapID(button) {
  const text = button.parentElement.querySelector(".map-id").textContent;
  navigator.clipboard.writeText(text);
  alert("Copied preset: " + text);
}

function openMap(button) {
  const preset = button.parentElement.querySelector(".map-id").textContent;
  const url = `https://tagpro.koalabeast.com/groups/#${preset}`;
  window.open(url, "_blank");
}

// Fetch JSON on page load
window.onload = () => {
  fetch(`season2Data.json?v=${Date.now()}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => generatePage(data))
    .catch(err => {
      document.getElementById("content").innerHTML = `<p>Error loading data: ${err}</p>`;
      console.error(err);
    });
};
