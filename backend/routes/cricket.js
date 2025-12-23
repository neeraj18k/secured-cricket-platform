const express = require('express');
const router = express.Router();

// 1. LIVE MATCH STATUS
router.get('/match-status', (req, res) => {
  res.json({
    match: "IND vs AUS",
    venue: "Narendra Modi Stadium, Ahmedabad",
    status: "Live",
    homeTeam: { name: "India", score: "324/4", overs: "48.2" },
    awayTeam: { name: "Australia", score: "Yet to Bat", overs: "" },
    stats: {
      projected: "355",
      crr: "6.72",
      winProb: "88%",
      lastWicket: "KL Rahul (Catch out)",
      partnership: "54 runs (32 balls)"
    }
  });
});

// 2. PLAYERS LIST
router.get('/players', (req, res) => {
  res.json([
    { id: 1, name: "Virat Kohli", role: "Batsman", stats: { runs: "117*", balls: 98 }, img: "https://i.pinimg.com/736x/05/67/92/056792c336f138afb8b4d2137396a672.jpg" },
    { id: 2, name: "Shreyas Iyer", role: "Batsman", stats: { runs: "64", balls: 45 }, img: "https://i.pinimg.com/736x/b7/2c/4e/b72c4e0f84ce192bb4c72c8644adf31b.jpg" },
    { id: 3, name: "M. Shami", role: "Bowler", stats: { wickets: 2, economy: 4.1 }, img: "https://i.pinimg.com/1200x/31/e1/52/31e152671f2d0390ce303396cac70bdd.jpg" },
    { id: 4, name: "Ravindra Jadeja", role: "All-Rounder", stats: { runs: 22, wickets: 1 }, img: "https://i.pinimg.com/736x/90/0a/95/900a95de84d01f06782f51859e4743af.jpg" }
  ]);
});

// 3. EXPANDED NEWS FEED (8 ITEMS)
router.get('/news', (req, res) => {
  res.json([
    { 
      id: 1, 
      title: "HISTORIC: Virat Kohli breaks Sachin's Record!", 
      time: "Just Now", 
      type: "HOT", 
      img: "https://i.pinimg.com/736x/6d/e3/c6/6de3c655a5c47fa7f6b35577619408ab.jpg", 
      details: "In a stunning display of mastery, Virat Kohli has surpassed the legendary Sachin Tendulkar to score his 50th ODI Century. The stadium erupted in joy as he bowed to the Master Blaster in the stands." 
    },
    { 
      id: 2, 
      title: "IPL 2025: Rohit Sharma in talks with CSK?", 
      time: "15 mins ago", 
      type: "RUMOR", 
      img: "https://i.pinimg.com/1200x/a7/e6/17/a7e6179145629d4f03cd25bddf2802b3.jpg", 
      details: "Shocking reports emerging from the trade window suggest that the 5-time winning captain might be looking for a new home. Chennai Super Kings have reportedly approached Mumbai Indians."
    },
    { 
      id: 3, 
      title: "Weather Report: Heavy Rain expected in 2nd Innings.", 
      time: "35 mins ago", 
      type: "UPDATE", 
      img: "https://i.pinimg.com/736x/40/7d/9e/407d9ef11611c20ecc7ddc42763254b7.jpg", 
      details: "Meteorological department predicts heavy showers post 8 PM. DLS par scores are being calculated by both dressing rooms. The pitch covers are ready."
    },
    { 
      id: 4, 
      title: "ICC Rankings: Suryakumar Yadav retains No.1 Spot", 
      time: "1 hour ago", 
      type: "RANKING", 
      img: "https://i.pinimg.com/736x/42/bd/03/42bd03c7d30dee36f51f8cc5f4e93ddd.jpg", 
      details: "The Indian 360-degree player continues his dominance in T20 Internationals, extending his lead over Rizwan and Babar Azam with a stunning strike rate of 175."
    },
    { 
      id: 5, 
      title: "Hardik Pandya returns to the squad for T20s.", 
      time: "2 hours ago", 
      type: "SQUAD", 
      img: "https://i.pinimg.com/1200x/ef/d3/61/efd361ee5884d4491069628e11f17915.jpg", 
      details: "After a long injury layoff, the star all-rounder is back in the nets. He was seen bowling at full pace today and looks ready for the upcoming series against South Africa." 
    },
    { 
      id: 6, 
      title: "WPL: Smriti Mandhana scores fastest fifty!", 
      time: "3 hours ago", 
      type: "WPL", 
      img: "https://i.pinimg.com/736x/9a/55/77/9a5577db0fdb21a127f8f132d74c8ca0.jpg", 
      details: "RCB Captain Smriti Mandhana lit up the Chinnaswamy stadium with a 18-ball fifty against Mumbai Indians, setting a new record for the fastest fifty in Women's Premier League history."
    },
    { 
      id: 7, 
      title: "BCCI announces new strict fitness test 'Yo-Yo 2.0'", 
      time: "5 hours ago", 
      type: "BCCI", 
      img: "https://i.pinimg.com/1200x/41/b6/5f/41b65f4724c3fff5c59f1a5dda416b6e.jpg", 
      details: "To ensure peak athleticism, BCCI has introduced a tougher version of the Yo-Yo test. Players failing this will not be eligible for national selection, regardless of form."
    },
    { 
      id: 8, 
      title: "Ben Stokes reverses retirement for World Cup", 
      time: "1 day ago", 
      type: "GLOBAL", 
      img: "https://i.pinimg.com/736x/f9/e5/f5/f9e5f5da02cb6c1f2a4e0fc628ba0cfa.jpg", 
      details: "England's test captain has decided to unretire from ODIs to help defend their title in India. 'It was a tough call, but the team needs me,' Stokes said in a press conference."
    }
  ]);
});

// 4. ANALYTICS (Charts Data)
router.get('/analytics', (req, res) => {
  res.json({
    runProgression: [
      { over: 5, runs: 42 }, { over: 10, runs: 85 }, { over: 15, runs: 110 },
      { over: 20, runs: 145 }, { over: 25, runs: 180 }, { over: 30, runs: 215 },
      { over: 35, runs: 250 }, { over: 40, runs: 290 }, { over: 45, runs: 324 }
    ],
    phaseAnalysis: [
      { name: 'Powerplay 1', runs: 65, wickets: 1 },
      { name: 'Middle Overs', runs: 180, wickets: 2 },
      { name: 'Death Overs', runs: 79, wickets: 1 }
    ],
    recentOvers: [
      { ball: 1, score: "1", type: "run" },
      { ball: 2, score: "4", type: "boundary" },
      { ball: 3, score: "0", type: "dot" },
      { ball: 4, score: "6", type: "six" },
      { ball: 5, score: "W", type: "wicket" },
      { ball: 6, score: "1", type: "run" }
    ],
    commentary: [
      { over: "48.2", text: "FOUR! Beautiful cover drive by Kohli." },
      { over: "48.1", text: "1 run, pushed to long on." },
      { over: "47.6", text: "0 run, beaten outside off." }
    ]
  });
});

// 5. UPCOMING MATCHES
router.get('/upcoming', (req, res) => {
  res.json([
    { id: 1, match: "ENG vs PAK", date: "Tomorrow, 2:00 PM", venue: "Eden Gardens" },
    { id: 2, match: "AUS vs BAN", date: "Nov 12, 10:30 AM", venue: "Pune" },
    { id: 3, match: "IND vs NED", date: "Nov 14, 2:00 PM", venue: "Bengaluru" }
  ]);
});

// 6. STANDINGS
router.get('/standings', (req, res) => {
  res.json([
    { rank: 1, team: "India", played: 8, won: 8, points: 16, nrr: "+2.45" },
    { rank: 2, team: "South Africa", played: 8, won: 6, points: 12, nrr: "+1.30" },
    { rank: 3, team: "Australia", played: 8, won: 6, points: 12, nrr: "+0.90" },
    { rank: 4, team: "New Zealand", played: 8, won: 4, points: 8, nrr: "+0.40" },
    { rank: 5, team: "Pakistan", played: 8, won: 4, points: 8, nrr: "-0.10" }
  ]);
});

module.exports = router;