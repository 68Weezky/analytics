<script>
    import * as Card from "$lib/components/ui/card/index.js";
    export let data;

    let standings = data.standings;
    let matches = data.matches;

</script>

<svelte:head>
    <title>Hockey K.E - Teams</title>
    <meta name="description" content="Current league standings for Hockey K.E" />
</svelte:head>
<main class="mx-auto px-4 md:px-8 my-8">
    <Card.Root>
        <Card.Content>
            <!-- Add your teams content here -->
            {standings[0].team}
        </Card.Content>
    </Card.Root>
</main>
