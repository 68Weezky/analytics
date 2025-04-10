<script>
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input/index.js";
  import { loginSchema} from "@/schema";
  import {
    superForm,
  } from "sveltekit-superforms";

  export let data;

  import { zodClient } from "sveltekit-superforms/adapters";
 
  const form = superForm(data.form, {
    validators: zodClient(loginSchema),
  });
 
  const { form: formData, enhance } = form;
</script>

<div class="grid h-screen place-items-center">
  <Card.Root class="w-[350px]">
    <Card.Header>
      <Card.Title>Login</Card.Title>
      <Card.Description>Login to your analytics account.</Card.Description>
    </Card.Header>
    <Card.Content>
      <form method="POST" use:enhance>
        <div class="grid w-full items-center gap-4">
          <Form.Field {form} name="email">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>Email</Form.Label>
                <Input {...props} bind:value={$formData.email} placeholder="email" />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>
          <Form.Field {form} name="password">
            <Form.Control>
               {#snippet children({ props })}
                  <Form.Label>Username</Form.Label>
                  <Input {...props} bind:value={$formData.password} placeholder="password" type="password"/>
               {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>
        </div>
        <div class="flex justify-between flex-col gap-2">
          <Button variant="outline">Signup</Button>
          <Form.Button>Login</Form.Button>
        </div>
      </form>
    </Card.Content>
  </Card.Root>
</div>
