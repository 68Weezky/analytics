document.addEventListener('DOMContentLoaded', () => {
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
});