export let load = async () => {  
    let standings = [
        {
            position: 1,
            team: "Team A",
            played: 20,
            won: 15,
            drawn: 3,
            lost: 2,
            goalsFor: 45,
            goalsAgainst: 15,
            goalDifference: 30,
            points: 48
        },
        // Add more teams here
    ];

    let matches = [
        { date: "2025-04-15", time: "14:00", teamA: "Team A", teamB: "Team B", venue: "Stadium 1" },
        { date: "2025-04-16", time: "16:00", teamA: "Team C", teamB: "Team D", venue: "Stadium 2" },
        { date: "2025-04-17", time: "18:00", teamA: "Team E", teamB: "Team F", venue: "Stadium 3" },
        { date: "2025-04-18", time: "20:00", teamA: "Team G", teamB: "Team H", venue: "Stadium 4" },
    ];

    return {standings, matches}
}
