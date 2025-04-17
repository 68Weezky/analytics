<script>
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
</script>

<svelte:head>
    <title>Hockey K.E - About Us</title>
    <meta name="description" content="Learn about Hockey K.E - Kenya's premier field hockey organization" />
</svelte:head>

<main class="container mx-auto px-8 my-8 space-y-8">
    <Card.Root class="p-8">
        <Card.Header>
            <Card.Title class="text-3xl text-primary">About Hockey K.E</Card.Title>
            <Card.Description class="text-lg">
                Our journey, mission, and commitment to field hockey in Kenya
            </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
            <section>
                <h2 class="text-2xl font-semibold mb-4 text-primary">Our Story</h2>
                <p class="text-gray-700">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.
                </p>
                <p class="text-gray-700 mt-4">
                    Curabitur suscipit suscipit tellus. Phasellus consectetuer vestibulum elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas egestas arcu quis ligula mattis placerat.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold mb-4 text-primary">Our Mission</h2>
                <p class="text-gray-700">
                    Donec interdum, metus et hendrerit aliquet, dolor diam sagittis ligula, eget egestas libero turpis vel mi. Nunc nulla. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Donec venenatis vulputate lorem.
                </p>
                <ul class="list-disc pl-6 mt-4 space-y-2 text-gray-700">
                    <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit</li>
                    <li>Aliquam tincidunt mauris eu risus</li>
                    <li>Vestibulum auctor dapibus neque</li>
                    <li>Nunc dignissim risus id metus</li>
                </ul>
            </section>

            <section>
                <h2 class="text-2xl font-semibold mb-4 text-primary">Our Team</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card.Root class="p-6">
                        <Card.Header>
                            <div class="w-24 h-24 rounded-full bg-gray-200 mb-4 mx-auto"></div>
                            <Card.Title class="text-center">John Doe</Card.Title>
                            <Card.Description class="text-center">Founder & CEO</Card.Description>
                        </Card.Header>
                        <Card.Content class="text-center text-gray-700">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ornare in neque rutrum imperdiet.
                        </Card.Content>
                    </Card.Root>

                    <Card.Root class="p-6">
                        <Card.Header>
                            <div class="w-24 h-24 rounded-full bg-gray-200 mb-4 mx-auto"></div>
                            <Card.Title class="text-center">Jane Smith</Card.Title>
                            <Card.Description class="text-center">Head Coach</Card.Description>
                        </Card.Header>
                        <Card.Content class="text-center text-gray-700">
                            Nullam eu ante vel est convallis dignissim. Fusce suscipit, leo a semper venenatis, felis urna.
                        </Card.Content>
                    </Card.Root>

                    <Card.Root class="p-6">
                        <Card.Header>
                            <div class="w-24 h-24 rounded-full bg-gray-200 mb-4 mx-auto"></div>
                            <Card.Title class="text-center">Michael Johnson</Card.Title>
                            <Card.Description class="text-center">Operations Manager</Card.Description>
                        </Card.Header>
                        <Card.Content class="text-center text-gray-700">
                            Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi.
                        </Card.Content>
                    </Card.Root>
                </div>
            </section>

            <section>
                <h2 class="text-2xl font-semibold mb-4 text-primary">Join Our Community</h2>
                <p class="text-gray-700 mb-6">
                    Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna.
                </p>
                <div class="flex flex-wrap gap-4">
                    <Button>Become a Member</Button>
                    <Button variant="outline">Contact Us</Button>
                </div>
            </section>
        </Card.Content>
    </Card.Root>
</main>
