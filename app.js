const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log(
        "server started successfully and connected to database at 3001"
      );
    });
  } catch (error) {
    console.log("Detected error at 3001");
    process.exit(1);
  }
};

initializeDBandServer();

//Api1 to get all players
app.get("/players/", async (request, response) => {
  const playersQuery = `
    SELECT * FROM cricket_team
    `;
  const playersArray = await db.all(playersQuery);
  const updatedData = playersArray.map((eachItem) => ({
    playerId: eachItem.player_id,
    playerName: eachItem.player_name,
    jerseyNumber: eachItem.jersey_number,
    role: eachItem.role,
  }));
  response.send(updatedData);
});

//Api2 to create players
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createPlayerQuery = `
  INSERT INTO cricket_team(
      player_name,jersey_number,role
  )
  VALUES(
      '${playerName}',
        '${jerseyNumber}',
        '${role}'
  );
  `;
  const dbResponse = await db.run(createPlayerQuery);
  const playerId = dbResponse.lastID;
  //response.send({ playerId: playerId });
  response.send("Player Added to Team");
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSinglePlayer = `
    SELECT 
        * 
    FROM 
    cricket_team
    WHERE 
    player_id=${playerId};
    `;
  const singleItem = await db.get(getSinglePlayer);
  const { player_id, player_name, jersey_number, role } = singleItem;
  const updatedItem = {
    playerId: player_id,
    playerName: player_name,
    jerseyNumber: jersey_number,
    role: role,
  };
  response.send(updatedItem);
});

//API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const PlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = PlayerDetails;
  const updateBookQuery = `
    UPDATE cricket_team
    SET player_name='${playerName}',jersey_number='${jerseyNumber}',role='${role}'
    WHERE player_id=${playerId};
    `;
  await db.run(updateBookQuery);
  response.send("Player Details Updated");
});

//API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE FROM cricket_team 
    WHERE player_id=${playerId};
    `;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
