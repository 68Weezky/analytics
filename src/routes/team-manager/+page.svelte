<script context="module">
    export const prerender = true;
    export const ssr = true;
    export const csr = false;
</script>

<script>
    import { onMount } from 'svelte';
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    
    let menuVisible = false;
    let mounted = false;
    let drawerOpen = false; // State for the sidebar drawer

    const toggleMenu = (e) => {
        e.stopPropagation();
        menuVisible = !menuVisible;
    };

    const closeMenu = () => {
        menuVisible = false;
    };

    const toggleDrawer = () => {
        drawerOpen = !drawerOpen; // Toggle the sidebar drawer
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu(e);
        }
    };

    onMount(() => {
        mounted = true;
        document.addEventListener('click', closeMenu);
        return () => {
            document.removeEventListener('click', closeMenu);
        };
    });

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
</script>

<svelte:head>
    <title>Hockey K.E - Dashboard</title>
    <meta name="description" content="Current league standings for Hockey K.E" />
</svelte:head>

<div class="min-h-screen grid grid-cols-1 lg:grid-cols-[auto,1fr]">
    <!-- Sidebar Drawer -->
    <div class={`fixed lg:static inset-y-0 left-0 transform ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} bg-primary text-white w-64 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div class="flex items-center justify-between p-4 border-b border-white/20">
            <h2 class="text-xl font-bold">Menu</h2>
            <button 
                on:click={toggleDrawer} 
                class="p-1 rounded-md hover:bg-white/10 lg:hidden"
                aria-label="Close menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <nav class="p-4">
            <ul class="space-y-2">
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/team-manager"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        Home
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/standings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        League Standings
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/team-management"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                        </svg>
                        Teams
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/player-stats"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        Player Stats
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/events"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                        </svg>
                        Upcoming Events
                    </Button>
                </li>
                <div class="flex items-center justify-between p-4 border-b border-white/20">
                    <li class="text-l font-bold">User management</li>
                </div>
            </ul>
        </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1">
        <header class="bg-primary text-white py-4 sticky top-0 z-40">
            <div class="container mx-auto px-4 md:px-8 flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <button 
                        on:click={toggleDrawer}
                        class="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white lg:hidden"
                        aria-label="Toggle menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <div class="text-xl font-bold tracking-wide">Dashboard</div>
                </div>
                <button
                    type="button"
                    on:click={toggleMenu}
                    on:keydown={handleKeyDown}
                    class="relative focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary rounded-full"
                    aria-label="User menu"
                    aria-expanded={menuVisible}
                    aria-haspopup="true"
                >
                    <Button variant="ghost" size="icon" class="rounded-full bg-white/10 hover:bg-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </Button>
                    {#if menuVisible && mounted}
                        <Card.Root 
                            class="absolute right-0 top-12 min-w-[180px] shadow-lg"
                            role="menu"
                        >
                            <Card.Content class="p-0">
                                <Button 
                                    variant="ghost" 
                                    class="w-full justify-start" 
                                    href="/profile"
                                    role="menuitem"
                                >
                                    Profile
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    class="w-full justify-start" 
                                    href="/logout"
                                    role="menuitem"
                                >
                                    Log Out
                                </Button>
                            </Card.Content>
                        </Card.Root>
                    {/if}
                </button>
            </div>
        </header>

        <main class="container mx-auto px-4 md:px-8 my-8">
            <Card.Root>
                <Card.Content>
                                         
                </Card.Content>
            </Card.Root>
        </main>
    </div>
</div>
