<script>
    import * as Card from "$lib/components/ui/card/index.js";
    
    export let data;
    let matches = data.matches;
    
</script>

<svelte:head>
    <title>Hockey K.E - Matches</title>
    <meta name="description" content="Current league standings for Hockey K.E" />
</svelte:head>
<main class="container mx-auto px-4 md:px-8 my-8">
    <Card.Root>
        <Card.Content>
            <h2 class="text-3xl font-bold mb-6 text-center text-white">Upcoming Matches</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each matches as match}
                    <div class="bg-gray-800 rounded-lg shadow-lg p-4 transition-transform transform hover:scale-105">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-lg font-semibold text-blue-400">{match.date}</span>
                            <span class="text-lg font-semibold text-blue-400">{match.time}</span>
                        </div>
                        <div class="text-xl font-bold text-white mb-2">
                            {match.teamA} vs {match.teamB}
                        </div>
                        <div class="text-gray-300">
                            Venue: <span class="font-semibold">{match.venue}</span>
                        </div>
                    </div>
                {/each}
            </div>                       
        </Card.Content>
    </Card.Root>
</main>
