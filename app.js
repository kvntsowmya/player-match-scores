const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    select *
    from player_details;`;
  const player = await db.all(getPlayerQuery);
  console.log(player);
  response.send(player);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const specificPlayerQuery = `
  select * 
  from player_details
  where player_id = ${playerId};`;

  const specPlayer = await db.get(specificPlayerQuery);
  response.send(specPlayer);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const { playerName } = request.body;
  const updatePlayerQuery = `
  update player_details
  set player_name = ${playerName}
  where player_id = ${playerId};`;

  const updatedPlayer = await db.run(updatePlayerQuery);
  console.log(updatedPlayer);
  response.send("Player details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const specificMatchQuery = `
  select *
  from match_details
  where match_id = ${matchId};`;

  const specificMatch = await db.get(specificMatchQuery);
  response.send(specificMatch);
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;

  const playerMatchesQuery = `
  select match_details.match_id as matchId,match,year 
  from player_match_score inner join match_details
  on player_match_score.match_id = match_details.match_id
  where player_id = ${playerId};`;

  const result = await db.all(playerMatchesQuery);
  response.send(result);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const MatchPlayersQuery = `
  select player_details.player_id as playerId,player_name as playerName
  from player_details inner join player_match_score
  on player_details.player_id = player_match_score.player_id
  where match_id = ${matchId};`;

  const matches = await db.all(MatchPlayersQuery);
  response.send(matches);
});
