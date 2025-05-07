// stats.js - Comprehensive Statistics Dashboard with League Filtering for Players
const StatsApp = {
  // Data storage
  data: {
      standings: {},
      players: [],
      stats: {},
      leagues: []
  },
  
  // Current state
  state: {
      currentView: 'teams',
      currentLeague: 'all',
      filteredTeams: [],
      filteredPlayers: [],
      sortField: 'points',
      sortDirection: 'desc'
  },
  
  // Initialize the app
  init: function() {
    this.data.standings = window.appData.standings || {};
    this.data.players = window.appData.players || [];
    this.data.leagues = Object.keys(this.data.standings).map(leagueId => ({
        id: leagueId,
        name: `League ${leagueId}` // Default name if not provided
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
      
      return this.data.players.filter(player => 
          leagueTeamNames.includes(player.team_name?.toLowerCase().trim())
      );
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
      
      this.state.filteredPlayers = leaguePlayers.filter(player => 
          player.name?.toLowerCase().includes(searchTerm)
      );
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
      const margin = {top: 20, right: 30, bottom: 40, left: 150};
      const width = 800 - margin.left - margin.right;
      const height = Math.max(400, sortedTeams.length * 30);
      
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
      
      // Add team names
      svg.selectAll('.team-label')
          .data(sortedTeams)
          .enter()
          .append('text')
          .attr('class', 'team-label')
          .attr('x', -5)
          .attr('y', d => y(d.name) + y.bandwidth() / 2)
          .attr('dy', '.35em')
          .attr('text-anchor', 'end')
          .text(d => d.name || 'Unknown Team');
      
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
      
      svg.append('g')
          .attr('class', 'y-axis')
          .call(d3.axisLeft(y).tickSize(0));
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
      const margin = {top: 20, right: 30, bottom: 40, left: 150};
      const width = 800 - margin.left - margin.right;
      const height = Math.max(400, sortedPlayers.length * 30);
      
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
          .domain(sortedPlayers.map(d => `${d.name} (${d.team_name || 'N/A'})`))
          .range([0, height])
          .padding(0.1);
      
      // Add bars
      svg.selectAll('.bar')
          .data(sortedPlayers)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', 0)
          .attr('y', d => y(`${d.name} (${d.team_name || 'N/A'})`))
          .attr('width', d => x(d.goals || 0))
          .attr('height', y.bandwidth())
          .attr('fill', (d, i) => d3.schemeTableau10[i % 10]);
      
      // Add player names
      svg.selectAll('.player-label')
          .data(sortedPlayers)
          .enter()
          .append('text')
          .attr('class', 'player-label')
          .attr('x', -5)
          .attr('y', d => y(`${d.name} (${d.team_name || 'N/A'})`) + y.bandwidth() / 2)
          .attr('dy', '.35em')
          .attr('text-anchor', 'end')
          .text(d => `${d.name} (${d.team_name || 'N/A'})`);
      
      // Add value labels
      svg.selectAll('.value-label')
          .data(sortedPlayers)
          .enter()
          .append('text')
          .attr('class', 'value-label')
          .attr('x', d => x(d.goals || 0) + 5)
          .attr('y', d => y(`${d.name} (${d.team_name || 'N/A'})`) + y.bandwidth() / 2)
          .attr('dy', '.35em')
          .text(d => d.goals || 0);
      
      // Add axes
      svg.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x));
      
      svg.append('g')
          .attr('class', 'y-axis')
          .call(d3.axisLeft(y).tickSize(0));
  },
  
  updateActiveMenu: function() {
      document.querySelectorAll('.horizontal-menu a').forEach(link => {
          link.classList.toggle('active', 
              (this.state.currentView === 'teams' && link.textContent === 'Teams') ||
              (this.state.currentView === 'players' && link.textContent === 'Players')
          );
      });
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