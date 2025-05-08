document.addEventListener('DOMContentLoaded', () => {
    const submitEvent = document.getElementById('submit-event');

    const deleteButtons = document.querySelectorAll('.delete-event-btn');

    deleteButtons.forEach(deleteButton => {
        deleteButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const eventId = e.target.dataset.eventId;
            console.log(eventId);

            if (!eventId) {
                alert('Please provide an event ID to delete.');
                return;
            }
            else {
                const eventData = {
                    id: eventId
                };

                try {
                    const response = await fetch(`/delete-event`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(eventData)
                    });

                    if (response.ok) {
                        alert('Event deleted successfully!');
                        // Optionally refresh the page or remove the element from DOM
                        window.location.reload();
                    } else {
                        alert('Error deleting event. Please try again.');
                    }
                } catch (error) {
                    console.error('Error during deletion:', error);
                }
            }
        });
    });

    submitEvent.addEventListener('click', async (e) => {
        e.preventDefault();

        const eventName = document.getElementById('name').value;
        const eventStartDate = document.getElementById('startDate').value;
        const eventEndDate = document.getElementById('endDate').value;
        const eventLocation = document.getElementById('location').value;
        const eventDescription = document.getElementById('description').value;

        if (!eventName || !eventStartDate || !eventEndDate || !eventLocation || !eventDescription) {
            alert('Please fill in all fields.');
            return;
        } else {
            const eventData = {
                name: eventName,
                startDate: eventStartDate,
                endDate: eventEndDate,
                location: eventLocation,
                description: eventDescription
            };

            try {
                const response = await fetch('/submit-event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(eventData)
                });

                if (response.ok) {
                    alert('Event submitted successfully!');
                } else {
                    alert('Error submitting event. Please try again.');
                }
            } catch (error) {
                console.error('Error during submission:', error);
            }
        }
    });
    // Match deletion script
    const deleteMatchButtons = document.querySelectorAll('.delete-match');

    deleteMatchButtons.forEach(button => {
        button.addEventListener('click', function () {
            const matchId = this.dataset.matchId;
            // Confirm before deleting
            if (confirm('Are you sure you want to delete this match?')) {
                // Send a request to delete the match
                fetch(`/delete-match`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: matchId })
                })
                    .then(response => {
                        if (response.ok) {
                            // If the deletion was successful, remove the match card from the UI
                            this.closest('.match-card').remove();
                        } else {
                            // If there was an error, display an error message
                            alert('Failed to delete match.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while deleting the match.');
                    });
            }
        });
    });

    const submitMatch = document.getElementById('submit-match-btn');

    submitMatch.addEventListener('click', async (e) => {
        e.preventDefault();
        alert('clicked');

        const date = document.getElementById('match-date').value;
        const homeTeam = document.getElementById('homeTeam').value;
        const venue = document.getElementById('venue').value;
        const awayTeam = document.getElementById('awayTeam').value;
        const league = document.getElementById('matchLeague').value;

        if (!date || !homeTeam || !venue || !awayTeam || !league) {
            alert('Please fill in all fields.');
            return;
        } else {
            const matchData = {
                date: date,
                homeTeam: homeTeam,
                venue: venue,
                awayTeam: awayTeam,
                league: league
            };
            console.log(matchData)
            try {
                const response = await fetch('/submit-match', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(matchData)
                });

                if (response.ok) {
                    alert('Match submitted successfully!');
                } else {
                    alert('Error submitting match. Please try again.');
                }
            } catch (error) {
                console.error('Error during submission:', error);
            }
        }
    });

    const updateMatchButtons = document.querySelectorAll('.update-match');

    updateMatchButtons.forEach(button => {
        button.addEventListener('click', function () {
            const matchId = this.dataset.matchId;
            openUpdateResultDialog(matchId);

            console.log('Match ID:', matchId);
        });
    });

    const updateResultBtn = document.getElementById('update-match-results');

    updateResultBtn.addEventListener('click', async (e) => {
        e.preventDefault();


        const matchId = document.getElementById('matchId').value;
        const awayShots = document.getElementById('awayShots').value;
        const homeShots = document.getElementById('homeShots').value;
        const homeFouls = document.getElementById('homeFouls').value;
        const awayFouls = document.getElementById('awayFouls').value;
        const homeGoals = document.getElementById('homeGoals').value;
        const awayGoals = document.getElementById('awayGoals').value;
        const homePasses = document.getElementById('homePasses').value;
        const awayPasses = document.getElementById('awayPasses').value;
        const finalScore = document.getElementById('finalScore').value;

        if (!matchId || !awayShots || !homeShots || !homeFouls || !awayFouls || !homeGoals || !awayGoals || !homePasses || !awayPasses || !finalScore) {
            alert('Please fill in all fields.');
            return;
        } else {
            const updateData = {
                matchId: matchId,
                awayShots: awayShots,
                homeShots: homeShots,
                homeFouls: homeFouls,
                awayFouls: awayFouls,
                homeGoals: homeGoals,
                awayGoals: awayGoals,
                homePasses: homePasses,
                awayPasses: awayPasses,
                finalScore: finalScore,
            };

            try {
                const response = await fetch('/update-results', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    alert('Match result updated successfully!');
                    window.location.reload();
                } else {
                    alert('Error updating match result. Please try again.');
                }
            } catch (error) {
                console.error('Error during update:', error);
            }
        }
    });

    const submitTeam = document.getElementById('submit-team');

    submitTeam.addEventListener('click', async (e) => {
        e.preventDefault();

        const teamName = document.getElementById('team-name').value;
        const season = document.getElementById('season').value;
        const league = document.getElementById('league').value;
        const numberOfPlayers = document.getElementById('number_of_players').value;
        const manager = document.getElementById('manager').value;

        if (!teamName || !season || !league || !numberOfPlayers || !manager) {
            alert('Please fill in all fields.');
            return;
        } else {
            const teamData = {
                name: teamName,
                season: season,
                league: league,
                number_of_players: numberOfPlayers,
                manager: manager
            };

            try {
                const response = await fetch('/submit-team', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(teamData)
                });

                if (response.ok) {
                    alert('Team submitted successfully!');
                } else {
                    alert('Error submitting team. Please try again.');
                }
            } catch (error) {
                console.error('Error during submission:', error);
            }
        }
    });

    const deleteTeamButtons = document.querySelectorAll('.delete-team');
    deleteTeamButtons.forEach(button => {
        button.addEventListener('click', function () {
            const teamId = this.dataset.teamId;
            // Confirm before deleting
            if (confirm('Are you sure you want to delete this team?')) {
                // Send a request to delete the team
                fetch(`/delete-team`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: teamId })
                })
                    .then(response => {
                        if (response.ok) {
                            // If the deletion was successful, remove the team card from the UI
                            this.closest('.team-card').remove();
                        } else {
                            // If there was an error, display an error message
                            alert('Failed to delete team.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while deleting the team.');
                    });
            }
        });
    });

    const submitPlayer = document.getElementById('submit-player');

    submitPlayer.addEventListener('click', async (e) => {
        e.preventDefault();

        const playerName = document.getElementById('player-name').value;
        const playerPosition = document.getElementById('position').value;
        const playerTeam = document.getElementById('player-team').value;
        const playerAge = document.getElementById('player-age').value;
        const playerNumber = document.getElementById('jersey-number').value;
        const playerManager = document.getElementById('player-manager').value;

        if (!playerName || !playerPosition || !playerTeam || !playerAge || !playerNumber || !playerManager) {
            alert('Please fill in all fields.');
            return;
        } else {
            const playerData = {
                name: playerName,
                position: playerPosition,
                team: playerTeam,
                age: playerAge,
                jersey_number: playerNumber,
                manager: playerManager
            }

            try {
                const response = await fetch('/submit-player', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(playerData)
                });

                if (response.ok) {
                    alert('Player submitted successfully!');
                } else {
                    alert('Error submitting player. Please try again.');
                }
            } catch (error) {
                console.error('Error during submission:', error);
            }
        }
    });

    const deletePlayerButtons = document.querySelectorAll('.delete-player');

    deletePlayerButtons.forEach(button => {
        button.addEventListener('click', function () {
            const playerId = this.dataset.playerId;
            // Confirm before deleting
            if (confirm('Are you sure you want to delete this player?')) {
                // Send a request to delete the team
                fetch(`/delete-player`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: playerId })
                })
                    .then(response => {
                        if (response.ok) {
                            // If the deletion was successful, remove the team card from the UI
                            this.closest('.player-card').remove();
                        } else {
                            // If there was an error, display an error message
                            alert('Failed to delete team.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while deleting the team.');
                    });
            }
        });
    });

    const updatePlayerButtons = document.querySelectorAll('.update-player');

    updatePlayerButtons.forEach(button => {
        button.addEventListener('click', function () {
            const playerId = this.dataset.playerId;
            openUpdatePlayerDialog(playerId);

            console.log('Player ID:', playerId);
        });
    });

    const updatePlayerButton = document.getElementById('update-player-btn')

    updatePlayerButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const playerId = document.getElementById('playerId').value.trim();
        const goals = document.getElementById('goals').value.trim();
        const assists = document.getElementById('assists').value.trim();
        const redCards = document.getElementById('red_cards').value.trim();
        const yellowCards = document.getElementById('yellow_cards').value.trim();
        const playerManager = document.getElementById('new_manager').value.trim();

        if (!playerId || !goals ||!assists|| !redCards || !yellowCards || !playerManager) {
            alert('Please fill in all fields.');
            return;
        } else {
            const updateData = {
                id: playerId,
                goals: goals,
                assists: assists,
                red_cards: redCards,
                yellow_cards: yellowCards,
                manager: playerManager
            };

            try {
                const response = await fetch('/update-player', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    alert('Player updated successfully!');
                    window.location.reload();
                } else {
                    alert('Error updating player. Please try again.');
                }
            } catch (error) {
                console.error('Error during update:', error);
            }
        }
    });

    const submitSeason = document.getElementById('submit-season');

    submitSeason.addEventListener('click', async (e) => {
        e.preventDefault();

        const seasonName = document.getElementById('season-name').value;
        const seasonStartDate = document.getElementById('start_date').value;
        const seasonEndDate = document.getElementById('end_date').value;
        const numberOfTeams = document.getElementById('number_of_teams').value;
        const numberOfLeagues = document.getElementById('number_of_leagues').value;
        const status = document.getElementById('status').value;

        if (!seasonName || !seasonStartDate || !seasonEndDate || !numberOfTeams || !status || !numberOfLeagues) {
            alert('Please fill in all fields.');
            return;
        } else {
            const seasonData = {
                name: seasonName,
                start_date: seasonStartDate,
                end_date: seasonEndDate,
                number_of_teams: numberOfTeams,
                number_of_leagues: numberOfLeagues,
                status: status
            };

            try {
                const response = await fetch('/submit-season', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(seasonData)
                });

                if (response.ok) {
                    alert('Season submitted successfully!');
                } else {
                    alert('Error submitting season. Please try again.');
                }
            } catch (error) {
                console.error('Error during submission:', error);
            }
        }
    });

    const deleteSeasonButtons = document.querySelectorAll('.delete-season-btn');
    deleteSeasonButtons.forEach(button => {
        button.addEventListener('click', function () {
            const seasonId = this.dataset.seasonId;
            // Confirm before deleting
            if (confirm('Are you sure you want to delete this season?')) {
                // Send a request to delete the team
                fetch(`/delete-season`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: seasonId })
                })
                    .then(response => {
                        if (response.ok) {
                            // If the deletion was successful, remove the team card from the UI
                            this.closest('.season-card').remove();
                        } else {
                            // If there was an error, display an error message
                            alert('Failed to delete team.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while deleting the team.');
                    });
            }
        });
    });
    const updateSeasonButtons = document.querySelectorAll('.update-season-btn');
    updateSeasonButtons.forEach(button => {
        button.addEventListener('click', function () {
            const seasonId = this.dataset.seasonId;
            openUpdateSeasonDialog(seasonId);

            console.log('Season ID:', seasonId);
        });
    });

    const updateSeasonButton = document.getElementById('update-season')
    updateSeasonButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const seasonId = document.getElementById('seasonId').value.trim();
        const status = document.getElementById('new-season-status').value.trim();
        if (!seasonId || !status) {
            alert('Please fill in all fields.');
            return;
        } else {
            const updateData = {
                id: seasonId,
                status: status
            };

            try {
                const response = await fetch('/update-season', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    alert('Season updated successfully!');
                    window.location.reload();
                } else {
                    alert('Error updating season. Please try again.');
                }
            } catch (error) {
                console.error('Error during update:', error);
            }
        }
    });

    const submitLeague = document.getElementById('submit-league');
    submitLeague.addEventListener('click', async (e) => {
        e.preventDefault();

        const leagueName = document.getElementById('league_name').value;
        const numberOfTeams = document.getElementById('league_number_of_teams').value;
        const leagueStatus = document.getElementById('league_status').value;
        const startDate = document.getElementById('league_start_date').value;
        const endDate = document.getElementById('league_end_date').value;
        const numberOfMatches = document.getElementById('league_number_of_matches').value;
        const leagueSeason = document.getElementById('league_season').value;

        if (!leagueName || !numberOfTeams || !leagueStatus || !startDate || !endDate || !numberOfMatches || !leagueSeason) {
            return;
        } else {
            const leagueData = {
                name: leagueName,
                number_of_teams: numberOfTeams,
                status: leagueStatus,
                start_date: startDate,
                end_date: endDate,
                number_of_matches: numberOfMatches,
                season: leagueSeason
            };

            try {
                const response = await fetch('/submit-league', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(leagueData)
                });

                if (response.ok) {
                    alert('League submitted successfully!');
                } else {
                    alert('Error submitting league. Please try again.');
                }
            } catch (error) {
                console.error('Error during submission:', error);
            }
        }
    });
    const deleteLeagueButtons = document.querySelectorAll('.delete-league-btn');
    deleteLeagueButtons.forEach(button => {
        button.addEventListener('click', function () {
            const leagueId = this.dataset.leagueId;
            // Confirm before deleting
            if (confirm('Are you sure you want to delete this league?')) {
                // Send a request to delete the team
                fetch(`/delete-league`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: leagueId })
                })
                    .then(response => {
                        if (response.ok) {
                            // If the deletion was successful, remove the team card from the UI
                            this.closest('.league-card').remove();
                        } else {
                            // If there was an error, display an error message
                            alert('Failed to delete team.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while deleting the team.');
                    });
            }
        });
    });
    const updateLeagueButtons = document.querySelectorAll('.update-league-btn');
    updateLeagueButtons.forEach(button => {
        button.addEventListener('click', function () {
            const leagueId = this.dataset.leagueId;
            openUpdateLeagueDialog(leagueId);

            console.log('League ID:', leagueId);
        });
    });

    const updateLeagueButton = document.getElementById('update-league');
    updateLeagueButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const leagueId = document.getElementById('leagueId').value.trim();
        const status = document.getElementById('new-league-status').value.trim();
        if (!leagueId || !status) {
            alert('Please fill in all fields.');
            return;
        } else {
            const updateData = {
                id: leagueId,
                status: status,
            };

            try {
                const response = await fetch('/update-league', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    alert('League updated successfully!');
                    window.location.reload();
                } else {
                    alert('Error updating league. Please try again.');
                }
            } catch (error) {
                console.error('Error during update:', error);
            }
        }
    });
});

async function openUpdateResultDialog(matchId) {
    try {
        // Fetch match data from the database
        const response = await fetch(`/league-manager/get-match/${matchId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch match data');
        }
        const matchData = await response.json();

        // Pre-fill the form fields with default values of 0 for missing data
        document.getElementById('matchId').value = matchId;
        document.getElementById('awayShots').value = matchData.away_shots || 0;
        document.getElementById('homeShots').value = matchData.home_shots || 0;
        document.getElementById('homeFouls').value = matchData.home_fouls || 0;
        document.getElementById('awayFouls').value = matchData.away_fouls || 0;
        document.getElementById('homeGoals').value = matchData.home_goals || 0;
        document.getElementById('awayGoals').value = matchData.away_goals || 0;
        document.getElementById('homePasses').value = matchData.home_passes || 0;
        document.getElementById('awayPasses').value = matchData.away_passes || 0;
        document.getElementById('finalScore').value = matchData.final_score || '0-0';

        // Show the dialog
        document.getElementById('updateResultDialog').showModal();
    } catch (error) {
        console.error('Error fetching match data:', error);
        alert('Error loading match data. Please try again.');
    }
}

async function openUpdatePlayerDialog(playerId) {
    try {
        // Fetch player data from the database
        const response = await fetch(`/league-manager/get-player/${playerId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch player data');
        }
        const playerData = await response.json();

        // Pre-fill the form fields with default values of 0 for missing data
        document.getElementById('playerId').value = playerId;
        document.getElementById('goals').value = playerData.goals || 0;
        document.getElementById('assists').value = playerData.assists || 0;
        document.getElementById('red_cards').value = playerData.red_cards || 0;
        document.getElementById('yellow_cards').value = playerData.yellow_cards || 0;
        document.getElementById('new_manager').value = playerData.tm || '';

        // Show the dialog
        document.getElementById('updatePlayerDialog').showModal();
    } catch (error) {
        console.error('Error fetching player data:', error);
        alert('Error loading player data. Please try again.');
    }
}

function openUpdateSeasonDialog(seasonId) {
    document.getElementById('seasonId').value = seasonId;
    document.getElementById('updateSeasonDialog').showModal();
}

function openUpdateLeagueDialog(leagueId) {
    document.getElementById('leagueId').value = leagueId;
    document.getElementById('updateLeagueDialog').showModal();
}
