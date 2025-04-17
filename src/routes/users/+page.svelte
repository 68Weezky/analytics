<script>
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    
</script>

<svelte:head>
    <title>Hockey K.E - Dashboard</title>
    <meta name="description" content="Your Hockey K.E dashboard - Kenya's premier field hockey community" />
</svelte:head>
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
            <Card.Title class="text-primary text-3xl mb-4">Welcome to Your Dashboard</Card.Title>
            <Card.Description class="text-lg mb-6">
                Hockey K.E is Kenya's fastest-growing field hockey community, dedicated to promoting the sport at all levels. 
                From here you can access league standings, match schedules, team information and more.
            </Card.Description>

            <div class="mt-8 text-center">
                <Button href="/matches" class="px-8 py-4 text-lg">
                    View Upcoming Matches
                </Button>
            </div>
        </Card.Content>
    </Card.Root>
</main>
