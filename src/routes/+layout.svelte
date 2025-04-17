<script>
	import '../app.css';
	let { children } = $props();

	import { User, UserPlus, UserRoundX, CalendarDays, Menu, Home, Network, Clock3, UsersRound, ChartArea } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { buttonVariants, Button } from "$lib/components/ui/button/index.js";
  import * as Popover from "$lib/components/ui/popover";
  import * as Card from "$lib/components/ui/card/index.js";
  
  let menuVisible = $state(false);
  let mounted = $state(false);
  let drawerOpen = $state(false); // State for the sidebar drawer

  const toggleMenu = () => {
      menuVisible = !menuVisible;
  };

  const closeMenu = () => {
      menuVisible = false;
  };

  const toggleDrawer = () => {
      drawerOpen = !drawerOpen; // Toggle the sidebar drawer
  };

 //  const handleKeyDown = (e) => {
 //      if (e.key === 'Enter' || e.key === ' ') {
 //          e.preventDefault();
 //          toggleMenu(e);
 //      }
 //  };

  // onMount(() => {
  //     mounted = true;
  //     document.addEventListener('click', closeMenu);
  //     return () => {
  //         document.removeEventListener('click', closeMenu);
  //     };
  // });
</script>

<div class="grid grid-cols-1 lg:grid-cols-[auto,1fr]">
    <!-- Sidebar Drawer -->
    <div class={`fixed lg:static inset-y-0 left-0 transform ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} bg-primary text-white w-64 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div class="flex items-center justify-between p-4 border-b border-white/20">
            <h2 class="text-xl font-bold">Menu</h2>
            <Button 
                onclick={toggleDrawer} 
                class="p-1 rounded-md hover:bg-white/10 lg:hidden"
                aria-label="Close menu"
            >
            	<Menu />
            </Button>
        </div>
        <nav class="p-4">
            <ul class="space-y-2">
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/users"
                    >
                    	  <Home />
                        Home
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/standings"
                    >
		                    <Network />
                        League Standings
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/matches"
                    >
                    		<Clock3/>
                        Matches
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/teams"
                    >
                    		<UsersRound />
                        Teams
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/stats"
                    >
                    		<ChartArea />
                        Player Stats
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/events"
                    >
                    		<CalendarDays />
                        Upcoming Events
                    </Button>
                </li>
                <div class="flex items-center justify-between p-4 border-b border-white/20">
                    <li class="text-l font-bold">User management</li>
                </div>
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/add-user"
                    >
                    		<UserPlus />
                        Add User
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="ghost" 
                        class="w-full justify-start text-white hover:bg-white/10 py-3 px-4 text-base md:text-sm"
                        href="/delete-user"
                    >
                    		<UserRoundX />
                        Delete User
                    </Button>
                </li>
            </ul>
        </nav>
    </div>
    <!-- Main Content -->
    <div class="flex-1">
        <header class="bg-primary text-white py-4 sticky top-0 z-40">
            <div class="container mx-auto px-4 md:px-8 flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <Button 
                        onclick={toggleDrawer}
                        class="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white lg:hidden"
                        aria-label="Toggle menu"
                    >
                    	<Menu />
                    </Button>
                    <div class="text-xl font-bold tracking-wide">Dashboard</div>
                </div>
                <Popover.Root>
                    <Popover.Trigger><User /></Popover.Trigger>
                    <Popover.Content>
                        <div class="p-0">
                            <Button 
                                variant="ghost" 
                                class="w-full justify-start" 
                                href="signup"
                                role="menuitem"
                            >
                                Sign Up
                            </Button>
                            <Button 
                                variant="ghost" 
                                class="w-full justify-start" 
                                href="login"
                                role="menuitem"
                            >
                                Sign In
                            </Button>
                        </div>
                    </Popover.Content>
                </Popover.Root>
            </div>
        </header>
</div>
</div>
{@render children()}
