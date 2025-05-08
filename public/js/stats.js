// stats.js - Comprehensive Statistics Dashboard with League Filtering for Players
const StatsApp = {
  // Data storage
  data: {
      standings: {},
      players: [],
      stats: {},
      leagues: [],
      teamMatchStats: {},
      playerStats: [],
      matches: []
  },
  
  // Current state
  state: {
      currentView: 'teams',
      currentLeague: 'all',
      filteredTeams: [],
      filteredPlayers: [],
      sortField: 'points',
      sortDirection: 'desc',
      selectedTeam: null,
      selectedPlayer: null
  },
  
  // Initialize the app
  init: function() {
    this.data.standings = window.appData.standings || {};
    this.data.players = window.appData.players || [];
    this.data.stats = window.appData.stats || {};
    this.data.matches = window.appData.matches || [];
    this.data.teamMatchStats = this.data.stats.teamMatchStats || {};
    this.data.playerStats = this.data.stats.playerStats || [];
    this.data.leagues = Object.keys(this.data.standings).map(leagueId => ({
        id: leagueId,
        name: `League ${leagueId}`
    }));
    
    this.state.filteredTeams = this.getAllTeams();
    this.state.filteredPlayers = this.getPlayersInLeague(this.state.currentLeague);
    
    this.createLeagueFilter();
    this.createStatsHighlights();
    this.showTeamsView();
    this.setupEventListeners();
  },
  
  // Setup event listeners
  setupEventListeners: function() {
      // Add debounce to search inputs
      document.getElementById('team-search')?.addEventListener('input', 
          this.debounce(() => this.filterTeams(), 300));
      document.getElementById('player-search')?.addEventListener('input', 
          this.debounce(() => this.filterPlayers(), 300));
  },
  
  // Utility function for debouncing
  debounce: function(func, wait) {
      let timeout;
      return function() {
          const context = this, args = arguments;
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(context, args), wait);
      };
  },
  
  // Get all players in a specific league (based on team name)
  getPlayersInLeague: function(leagueId) {
      if (leagueId === 'all') return this.data.players;
      
      // Get all teams in the league
      const leagueTeams = this.data.standings[leagueId] || [];
      const leagueTeamNames = leagueTeams.map(team => 
          team.name?.toLowerCase().trim()
      );
      
      console.log('League teams:', {
          leagueId,
          leagueTeamNames,
          totalTeams: leagueTeams.length,
          allPlayers: this.data.players.map(p => ({
              name: p.name,
              team: p.team?.toLowerCase().trim()
          }))
      });
      
      // Filter players whose team is in this league
      const filteredPlayers = this.data.players.filter(player => {
          const playerTeam = player.team?.toLowerCase().trim();
          const isInLeague = leagueTeamNames.includes(playerTeam);
          
          console.log('Checking player:', {
              playerName: player.name,
              playerTeam,
              isInLeague,
              leagueTeamNames
          });
          
          return isInLeague;
      });
      
      console.log('Players in league:', {
          leagueId,
          totalPlayers: this.data.players.length,
          filteredPlayers: filteredPlayers.length,
          filteredPlayersList: filteredPlayers.map(p => ({
              name: p.name,
              team: p.team
          }))
      });
      
      return filteredPlayers;
  },
  
  // Create league filter dropdown
  createLeagueFilter: function() {
      const filter = document.getElementById('league-filter');
      if (!filter) return;

      // Clear existing options
      filter.innerHTML = '';

      // Add 'All Leagues' option
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = 'All Leagues';
      filter.appendChild(allOption);

      // Add league options
      this.data.leagues.forEach(league => {
          const option = document.createElement('option');
          option.value = league.id || league._id || league.leagueId;
          option.textContent = league.name || 'Unknown League';
          filter.appendChild(option);
      });

      // Add event listener
      filter.addEventListener('change', (e) => {
          this.state.currentLeague = e.target.value;
          this.filterTeams();
          this.filterPlayers();
          this.renderStandings();
      });
  },

  // Create statistical highlights section
  createStatsHighlights: function() {
      const highlightsContainer = document.getElementById('stats-highlights');
      if (!highlightsContainer) return;
      
      // Default stats if not provided
      const stats = this.data.stats || {};
      const topScorers = stats.topScorers || this.getPlayersInLeague(this.state.currentLeague)
          .sort((a, b) => (b.goals || 0) - (a.goals || 0))
          .slice(0, 5);
      
      const topTeams = stats.topTeams || this.getAllTeams()
          .sort((a, b) => (b.points || 0) - (a.points || 0))
          .slice(0, 5);
      
      highlightsContainer.innerHTML = `
          <div class="stats-highlight">
              <h3><i class="fas fa-crown"></i> Top Scorers</h3>
              ${topScorers.map(player => `
                  <div class="player-card">
                      <span class="player-name">${player.name || 'Unknown'}</span>
                      <span class="player-stat">${player.goals || 0} <small>goals</small></span>
                  </div>
              `).join('')}
          </div>
          <div class="stats-highlight">
              <h3><i class="fas fa-trophy"></i> Top Teams</h3>
              ${topTeams.map(team => `
                  <div class="team-card">
                      <span class="team-name">${team.name || 'Unknown'}</span>
                      <span class="team-stat">${team.points || 0} <small>pts</small></span>
                  </div>
              `).join('')}
          </div>
      `;
  },
  
  // Get all teams from all leagues or filtered by league
  getAllTeams: function() {
      let allTeams = [];
      
      if (this.state.currentLeague === 'all') {
          Object.values(this.data.standings).forEach(leagueTeams => {
              if (Array.isArray(leagueTeams)) {
                  allTeams = allTeams.concat(leagueTeams);
              }
          });
      } else {
          allTeams = Array.isArray(this.data.standings[this.state.currentLeague]) 
              ? this.data.standings[this.state.currentLeague] 
              : [];
      }
      
      return allTeams;
  },
  
  // View switching functions
  showTeamsView: function() {
      this.state.currentView = 'teams';
      document.getElementById('teams-view').style.display = 'block';
      document.getElementById('players-view').style.display = 'none';
      this.renderStandings();
      this.updateActiveMenu();
  },
  
  showPlayersView: function() {
      this.state.currentView = 'players';
      document.getElementById('players-view').style.display = 'block';
      document.getElementById('teams-view').style.display = 'none';
      this.renderPlayers();
      this.updateActiveMenu();
  },
  
  // Sort teams by specified field
  sortTeams: function(field) {
      if (this.state.sortField === field) {
          this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
          this.state.sortField = field;
          this.state.sortDirection = 'desc';
      }
      this.renderStandings();
  },
  
  // Filter functions
  filterTeams: function() {
      const searchTerm = document.getElementById('team-search')?.value?.toLowerCase() || '';
      this.state.filteredTeams = this.getAllTeams().filter(team => 
          team.name?.toLowerCase().includes(searchTerm)
      );
      this.renderStandings();
  },
  
  filterPlayers: function() {
      const searchTerm = document.getElementById('player-search')?.value?.toLowerCase() || '';
      
      // Start with all players in current league
      const leaguePlayers = this.getPlayersInLeague(this.state.currentLeague);
      
      // Filter by search term
      this.state.filteredPlayers = leaguePlayers.filter(player => {
          const playerName = player.name?.toLowerCase() || '';
          const playerTeam = player.team?.toLowerCase() || '';
          return playerName.includes(searchTerm) || playerTeam.includes(searchTerm);
      });
      
      console.log('Filtered players:', {
          currentLeague: this.state.currentLeague,
          searchTerm,
          totalPlayers: this.data.players.length,
          leaguePlayers: leaguePlayers.length,
          filteredPlayers: this.state.filteredPlayers.length,
          players: this.state.filteredPlayers.map(p => ({
              name: p.name,
              team: p.team
          }))
      });
      
      this.renderPlayers();
  },
  
  // Rendering functions
  renderStandings: function() {
      const container = document.getElementById('standings-chart');
      if (!container) return;
      
      container.innerHTML = '';
      
      if (this.state.filteredTeams.length === 0) {
          container.innerHTML = '<div class="no-data">No team data available</div>';
          return;
      }
      
      // Sort teams
      const sortedTeams = [...this.state.filteredTeams].sort((a, b) => {
          const valA = a[this.state.sortField] || 0;
          const valB = b[this.state.sortField] || 0;
          return this.state.sortDirection === 'desc' ? valB - valA : valA - valB;
      });
      
      // Chart dimensions
      const margin = {top: 20, right: 100, bottom: 40, left: 200};
      const width = 1000 - margin.left - margin.right;
      const height = Math.max(600, sortedTeams.length * 40);
      
      // Create SVG
      const svg = d3.select(container)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Create scales
      const x = d3.scaleLinear()
          .domain([0, d3.max(sortedTeams, d => d[this.state.sortField] || 0) * 1.1])
          .range([0, width]);
      
      const y = d3.scaleBand()
          .domain(sortedTeams.map(d => d.name || 'Unknown Team'))
          .range([0, height])
          .padding(0.1);
      
      // Add bars
      svg.selectAll('.bar')
          .data(sortedTeams)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', 0)
          .attr('y', d => y(d.name))
          .attr('width', d => x(d[this.state.sortField] || 0))
          .attr('height', y.bandwidth())
          .attr('fill', (d, i) => d3.schemeTableau10[i % 10]);
      
      // Add value labels
      svg.selectAll('.value-label')
          .data(sortedTeams)
          .enter()
          .append('text')
          .attr('class', 'value-label')
          .attr('x', d => x(d[this.state.sortField] || 0) + 5)
          .attr('y', d => y(d.name) + y.bandwidth() / 2)
          .attr('dy', '.35em')
          .text(d => d[this.state.sortField] || 0);
      
      // Add axes
      svg.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x));
      
      // Add y-axis with team names
      svg.append('g')
          .attr('class', 'y-axis')
          .call(d3.axisLeft(y).tickSize(0));

      // Add click handler for team selection
      svg.selectAll('.bar')
          .on('click', (event, d) => {
              this.state.selectedTeam = d.name;
              this.renderTeamMetrics(d.name);
          });
  },
  
  renderPlayers: function() {
      const container = document.getElementById('players-chart');
      if (!container) return;
      
      container.innerHTML = '';
      
      if (this.state.filteredPlayers.length === 0) {
          container.innerHTML = '<div class="no-data">No player data available for this league</div>';
          return;
      }
      
      // Sort players by goals
      const sortedPlayers = [...this.state.filteredPlayers].sort((a, b) => 
          (b.goals || 0) - (a.goals || 0)
      );
      
      // Chart dimensions
      const margin = {top: 20, right: 100, bottom: 40, left: 200};
      const width = 1000 - margin.left - margin.right;
      const height = Math.max(600, sortedPlayers.length * 40);
      
      // Create SVG
      const svg = d3.select(container)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Create scales
      const x = d3.scaleLinear()
          .domain([0, d3.max(sortedPlayers, d => d.goals || 0) * 1.1])
          .range([0, width]);
      
      const y = d3.scaleBand()
          .domain(sortedPlayers.map(d => `${d.name} (${d.team?.toLowerCase().trim() || 'N/A'})`))
          .range([0, height])
          .padding(0.1);
      
      // Add bars
      svg.selectAll('.bar')
          .data(sortedPlayers)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', 0)
          .attr('y', d => y(`${d.name} (${d.team?.toLowerCase().trim() || 'N/A'})`))
          .attr('width', d => x(d.goals || 0))
          .attr('height', y.bandwidth())
          .attr('fill', (d, i) => d3.schemeTableau10[i % 10]);
      
      // Add value labels
      svg.selectAll('.value-label')
          .data(sortedPlayers)
          .enter()
          .append('text')
          .attr('class', 'value-label')
          .attr('x', d => x(d.goals || 0) + 5)
          .attr('y', d => y(`${d.name} (${d.team?.toLowerCase().trim() || 'N/A'})`) + y.bandwidth() / 2)
          .attr('dy', '.35em')
          .text(d => d.goals || 0);
      
      // Add axes
      svg.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x));
      
      // Add y-axis with player names
      svg.append('g')
          .attr('class', 'y-axis')
          .call(d3.axisLeft(y).tickSize(0));

      // Add click handler for player selection
      svg.selectAll('.bar')
          .on('click', (event, d) => {
              this.state.selectedPlayer = d.name;
              this.renderPlayerMetrics(d.name);
          });
  },
  
  updateActiveMenu: function() {
      document.querySelectorAll('.horizontal-menu a').forEach(link => {
          link.classList.toggle('active', 
              (this.state.currentView === 'teams' && link.textContent === 'Teams') ||
              (this.state.currentView === 'players' && link.textContent === 'Players')
          );
      });
  },

  renderTeamMetrics: function(teamName) {
      const container = document.getElementById('team-metrics');
      if (!container) return;

      console.log('Rendering metrics for team:', teamName);
      console.log('Available team stats:', this.data.stats.teamMatchStats);
      console.log('Available standings:', window.appData.standings);

      // Get team's stats from teamMatchStats
      const teamStats = this.data.stats.teamMatchStats[teamName];
      
      // Get team's standings
      const teamStandings = Object.values(window.appData.standings)
          .flat()
          .find(team => team.name === teamName);

      console.log('Found team stats:', teamStats);
      console.log('Found team standings:', teamStandings);

      if (!teamStats && !teamStandings) {
          container.innerHTML = '<div class="no-data">No detailed statistics available for this team</div>';
          return;
      }

      // If we have either stats or standings, we can show some data
      container.innerHTML = `
          <div class="metrics-grid">
              <div class="metric-card">
                  <h3>Goals Distribution</h3>
                  <div id="goals-chart" class="chart"></div>
              </div>
              <div class="metric-card">
                  <h3>Match Performance</h3>
                  <div id="performance-chart" class="chart"></div>
              </div>
              <div class="metric-card">
                  <h3>Team Statistics</h3>
                  <div id="team-stats-chart" class="chart"></div>
              </div>
          </div>
      `;

      // Render Goals Distribution (Bar Chart)
      if (teamStandings) {
          this.renderGoalsDistribution(teamName, teamStandings);
      } else {
          document.getElementById('goals-chart').innerHTML = '<div class="no-data">No standings data available</div>';
      }
      
      // Render Match Performance (Bar Chart)
      if (teamStats) {
          this.renderMatchPerformance(teamName, teamStats);
      } else {
          document.getElementById('performance-chart').innerHTML = '<div class="no-data">No match data available</div>';
      }
      
      // Render Team Statistics (Bar Chart)
      if (teamStandings) {
          this.renderTeamStatistics(teamName, teamStandings);
      } else {
          document.getElementById('team-stats-chart').innerHTML = '<div class="no-data">No standings data available</div>';
      }
  },

  renderGoalsDistribution: function(teamName, teamStandings) {
      const container = document.getElementById('goals-chart');
      if (!container) return;
      
      // Get goals from standings
      const goalsScored = parseInt(teamStandings.goals_for) || 0;
      const goalsConceded = parseInt(teamStandings.goals_against) || 0;
      const totalMatches = parseInt(teamStandings.games_played) || 0;

      console.log('Goals from standings:', { goalsScored, goalsConceded, totalMatches });

      const data = [
          { metric: 'Goals Scored', value: goalsScored },
          { metric: 'Goals Conceded', value: goalsConceded }
      ];

      const margin = {top: 40, right: 30, bottom: 50, left: 60};
      const width = 400 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3.select(container)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

      // Create scales
      const x = d3.scaleBand()
          .domain(data.map(d => d.metric))
          .range([0, width])
          .padding(0.2);

      const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.value)])
          .range([height, 0]);

      // Add x-axis
      svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x));

      // Add y-axis
      svg.append('g')
          .call(d3.axisLeft(y));

      // Add bars
      svg.selectAll('.bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => x(d.metric))
          .attr('y', d => y(d.value))
          .attr('width', x.bandwidth())
          .attr('height', d => height - y(d.value))
          .attr('fill', (d, i) => i === 0 ? '#4CAF50' : '#f44336')
          .append('title')
          .text(d => `${d.metric}: ${d.value}`);

      // Add value labels on top of bars
      svg.selectAll('.value-label')
          .data(data)
          .enter()
          .append('text')
          .attr('class', 'value-label')
          .attr('x', d => x(d.metric) + x.bandwidth() / 2)
          .attr('y', d => y(d.value) - 5)
          .attr('text-anchor', 'middle')
          .text(d => d.value);

      // Add total matches text
      svg.append('text')
          .attr('x', width / 2)
          .attr('y', -10)
          .attr('text-anchor', 'middle')
          .text(`Total Matches: ${totalMatches}`);

      // Add goal difference text
      const goalDifference = goalsScored - goalsConceded;
      svg.append('text')
          .attr('x', width / 2)
          .attr('y', height + 30)
          .attr('text-anchor', 'middle')
          .text(`Goal Difference: ${goalDifference > 0 ? '+' : ''}${goalDifference}`);
  },

  renderMatchPerformance: function(teamName, teamStats) {
      const container = document.getElementById('performance-chart');
      if (!container) return;

      console.log('Rendering match performance for:', teamName);
      console.log('Available matches:', this.data.matches);

      // Get all matches for this team
      const teamMatches = this.data.matches.filter(match => 
          match.home_team === teamName || match.away_team === teamName
      );

      if (teamMatches.length === 0) {
          container.innerHTML = '<div class="no-data">No match data available</div>';
          return;
      }

      console.log('Filtered team matches:', teamMatches);

      // Calculate team's total passes, fouls, and shots
      let teamPasses = 0;
      let teamFouls = 0;
      let teamShots = 0;
      let totalMatches = teamMatches.length;

      // Calculate match totals and team's contribution
      teamMatches.forEach(match => {
          const isHomeTeam = match.home_team === teamName;
          
          // Add team's stats
          if (isHomeTeam) {
              teamPasses += parseInt(match.home_passes) || 0;
              teamFouls += parseInt(match.home_fouls) || 0;
              teamShots += parseInt(match.home_shots) || 0;
          } else {
              teamPasses += parseInt(match.away_passes) || 0;
              teamFouls += parseInt(match.away_fouls) || 0;
              teamShots += parseInt(match.away_shots) || 0;
          }
      });

      // Calculate total match stats (sum of both teams)
      const matchTotals = teamMatches.reduce((totals, match) => ({
          passes: totals.passes + (parseInt(match.home_passes) || 0) + (parseInt(match.away_passes) || 0),
          fouls: totals.fouls + (parseInt(match.home_fouls) || 0) + (parseInt(match.away_fouls) || 0),
          shots: totals.shots + (parseInt(match.home_shots) || 0) + (parseInt(match.away_shots) || 0)
      }), { passes: 0, fouls: 0, shots: 0 });

      console.log('Performance calculated:', { 
          team: { teamPasses, teamFouls, teamShots },
          totals: matchTotals,
          totalMatches 
      });

      const data = [
          {
              metric: 'Passes',
              team: teamPasses,
              total: matchTotals.passes
          },
          {
              metric: 'Fouls',
              team: teamFouls,
              total: matchTotals.fouls
          },
          {
              metric: 'Shots',
              team: teamShots,
              total: matchTotals.shots
          }
      ];

      const margin = {top: 40, right: 30, bottom: 50, left: 60};
      const width = 400 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3.select(container)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

      // Create scales
      const x0 = d3.scaleBand()
          .domain(data.map(d => d.metric))
          .range([0, width])
          .padding(0.2);

      const x1 = d3.scaleBand()
          .domain(['team', 'total'])
          .range([0, x0.bandwidth()])
          .padding(0.05);

      const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.total)])
          .range([height, 0]);

      // Add x-axis
      svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x0));

      // Add y-axis
      svg.append('g')
          .call(d3.axisLeft(y));

      // Add bars for each metric
      const metricGroup = svg.selectAll('.metric-group')
          .data(data)
          .enter()
          .append('g')
          .attr('class', 'metric-group')
          .attr('transform', d => `translate(${x0(d.metric)},0)`);

      // Add team bars
      metricGroup.selectAll('.team-bar')
          .data(d => [d])
          .enter()
          .append('rect')
          .attr('class', 'team-bar')
          .attr('x', x1('team'))
          .attr('y', d => y(d.team))
          .attr('width', x1.bandwidth())
          .attr('height', d => height - y(d.team))
          .attr('fill', '#4CAF50')
          .append('title')
          .text(d => `${d.metric}: ${d.team}`);

      // Add total bars
      metricGroup.selectAll('.total-bar')
          .data(d => [d])
          .enter()
          .append('rect')
          .attr('class', 'total-bar')
          .attr('x', x1('total'))
          .attr('y', d => y(d.total))
          .attr('width', x1.bandwidth())
          .attr('height', d => height - y(d.total))
          .attr('fill', '#2196F3')
          .append('title')
          .text(d => `Total ${d.metric}: ${d.total}`);

      // Add value labels
      metricGroup.selectAll('.team-label')
          .data(d => [d])
          .enter()
          .append('text')
          .attr('class', 'team-label')
          .attr('x', x1('team') + x1.bandwidth() / 2)
          .attr('y', d => y(d.team) - 5)
          .attr('text-anchor', 'middle')
          .text(d => d.team);

      metricGroup.selectAll('.total-label')
          .data(d => [d])
          .enter()
          .append('text')
          .attr('class', 'total-label')
          .attr('x', x1('total') + x1.bandwidth() / 2)
          .attr('y', d => y(d.total) - 5)
          .attr('text-anchor', 'middle')
          .text(d => d.total);

      // Add legend
      const legend = svg.append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(0, -10)`);

      legend.append('rect')
          .attr('x', 0)
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', '#4CAF50');

      legend.append('text')
          .attr('x', 15)
          .attr('y', 10)
          .text('Team');

      legend.append('rect')
          .attr('x', 60)
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', '#2196F3');

      legend.append('text')
          .attr('x', 75)
          .attr('y', 10)
          .text('Match Total');

      // Add total matches text
      svg.append('text')
          .attr('x', width / 2)
          .attr('y', -20)
          .attr('text-anchor', 'middle')
          .text(`Total Matches: ${totalMatches}`);
  },

  renderTeamStatistics: function(teamName, teamStandings) {
      const container = document.getElementById('team-stats-chart');
      if (!container) return;
      
      console.log('Rendering team statistics for:', teamName, 'with standings:', teamStandings);

      const data = [
          { metric: 'Games Played', value: parseInt(teamStandings.games_played) || 0 },
          { metric: 'Wins', value: parseInt(teamStandings.wins) || 0 },
          { metric: 'Draws', value: parseInt(teamStandings.draws) || 0 },
          { metric: 'Losses', value: parseInt(teamStandings.losses) || 0 }
      ];

      console.log('Team statistics data:', data);

      const margin = {top: 40, right: 30, bottom: 50, left: 60};
      const width = 400 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3.select(container)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand()
          .domain(data.map(d => d.metric))
          .range([0, width])
          .padding(0.1);

      const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.value)])
          .range([height, 0]);

      svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x));

      svg.append('g')
          .call(d3.axisLeft(y));

      svg.selectAll('.bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => x(d.metric))
          .attr('y', d => y(d.value))
          .attr('width', x.bandwidth())
          .attr('height', d => height - y(d.value))
          .attr('fill', (d, i) => d3.schemeCategory10[i]);
  },

  renderPlayerMetrics: function(playerName) {
      const container = document.getElementById('player-metrics');
      if (!container) return;

      const playerStats = this.data.playerStats.find(p => p.name === playerName);
      if (!playerStats) {
          container.innerHTML = '<div class="no-data">No detailed statistics available for this player</div>';
          return;
      }

      container.innerHTML = `
          <div class="metrics-grid">
              <div class="metric-card">
                  <h3>Goals & Assists</h3>
                  <div id="goals-assists-chart" class="chart"></div>
              </div>
              <div class="metric-card">
                  <h3>Disciplinary Record</h3>
                  <div id="disciplinary-chart" class="chart"></div>
              </div>
          </div>
      `;

      // Render Goals & Assists
      this.renderGoalsAssists(playerStats);
      
      // Render Disciplinary Record
      this.renderDisciplinaryRecord(playerStats);
  },

  renderGoalsAssists: function(playerStats) {
      const container = document.getElementById('goals-assists-chart');
      
      const data = [
          { metric: 'Goals', value: playerStats.goals },
          { metric: 'Assists', value: playerStats.assists }
      ];

      const width = 300;
      const height = 300;
      const radius = Math.min(width, height) / 2;

      const svg = d3.select(container)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', `translate(${width/2},${height/2})`);

      const color = d3.scaleOrdinal()
          .domain(data.map(d => d.metric))
          .range(d3.schemeCategory10);

      const pie = d3.pie()
          .value(d => d.value);

      const arc = d3.arc()
          .innerRadius(0)
          .outerRadius(radius);

      const arcs = svg.selectAll('arc')
          .data(pie(data))
          .enter()
          .append('g');

      arcs.append('path')
          .attr('d', arc)
          .attr('fill', d => color(d.data.metric));

      arcs.append('text')
          .attr('transform', d => `translate(${arc.centroid(d)})`)
          .attr('text-anchor', 'middle')
          .text(d => `${d.data.metric}: ${d.data.value}`);
  },

  renderDisciplinaryRecord: function(playerStats) {
      const container = document.getElementById('disciplinary-chart');
      
      const data = [
          { metric: 'Yellow Cards', value: playerStats.yellowCards },
          { metric: 'Red Cards', value: playerStats.redCards }
      ];

      const margin = {top: 20, right: 20, bottom: 30, left: 40};
      const width = 300 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const svg = d3.select(container)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand()
          .domain(data.map(d => d.metric))
          .range([0, width])
          .padding(0.1);

      const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.value)])
          .range([height, 0]);

      svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x));

      svg.append('g')
          .call(d3.axisLeft(y));

      svg.selectAll('.bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => x(d.metric))
          .attr('y', d => y(d.value))
          .attr('width', x.bandwidth())
          .attr('height', d => height - y(d.value))
          .attr('fill', (d, i) => d3.schemeCategory10[i]);
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  StatsApp.init();
});

// Global functions for HTML event handlers
window.showTeamsView = function() { StatsApp.showTeamsView(); };
window.showPlayersView = function() { StatsApp.showPlayersView(); };
window.filterTeams = function() { StatsApp.filterTeams(); };
window.filterPlayers = function() { StatsApp.filterPlayers(); };
window.sortTeams = function(field) { StatsApp.sortTeams(field); };

// Add openTab function
window.openTab = function(evt, tabName) {
    // Hide all tabs
    const tabs = document.getElementsByClassName("tab");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }

    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // Show the selected tab
    document.getElementById(tabName).style.display = "block";

    // Add active class to the clicked button
    evt.currentTarget.classList.add("active");

    // If opening stats tab, initialize the stats view
    if (tabName === 'stats') {
        StatsApp.init();
    }
};