
<script>
    import { onMount } from 'svelte';
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    
    let menuVisible = false;
    let mounted = false;

    const toggleMenu = (e) => {
        e.stopPropagation();
        menuVisible = !menuVisible;
    };

    const closeMenu = () => {
        menuVisible = false;
    };

    // Add keyboard support for menu toggle
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
</script>

<svelte:head>
    <title>Hockey K.E - Home</title>
    <meta name="description" content="Welcome to Hockey K.E - Kenya's premier field hockey community" />
</svelte:head>

<header class="bg-primary text-white py-4 sticky top-0 z-50">
    <div class="container mx-auto px-8 flex justify-between items-center">
        <div class="text-xl font-bold tracking-wide">Welcome to Hockey K.E</div>
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
                    </Card.Content>
                </Card.Root>
            {/if}
        </button>
    </div>
</header>

<main class="container mx-auto px-8 my-8">
    <Card.Root class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card.Content>
            <img 
                src="/hockey-action.jpg" 
                alt="Field hockey players in competitive match" 
                class="w-full h-auto rounded-lg shadow-xl"
                width="800"
                height="450"
            />
        </Card.Content>
        <Card.Content>
            <Card.Title class="text-primary text-3xl mb-4">Experience the Thrill of Field Hockey</Card.Title>
            <Card.Description class="text-lg mb-6">
                Hockey K.E is Kenya's fastest-growing field hockey community, dedicated to promoting the sport at all levels. Our programs cater to beginners, school teams, and competitive players alike.
            </Card.Description>

            <div class="mt-8 text-center">
                <Button href="/aboutus" class="px-8 py-4 text-lg">
                    Learn More About Us
                </Button>
            </div>
        </Card.Content>
    </Card.Root>
</main>
