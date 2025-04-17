<script>
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input/index.js";
  import { signupSchema} from "@/schema";
  import {
    superForm,
  } from "sveltekit-superforms";

  export let data;

  import { zodClient } from "sveltekit-superforms/adapters";
 
  const form = superForm(data.form, {
    validators: zodClient(signupSchema),
  });
 
  const { form: formData, enhance, submitting, errors, constraints } = form;
</script>

<div class="grid h-screen place-items-center">
  <Card.Root class="w-[350px]">
    <Card.Header>
      <Card.Title>Signup</Card.Title>
      <Card.Description>Create an analytics account.</Card.Description>
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
            {#if $errors.email}
              <div class="text-red-500 text-sm mt-1">{$errors.email}</div>
            {/if}
          </Form.Field>
          <Form.Field {form} name="password">
            <Form.Control>
               {#snippet children({ props })}
                  <Form.Label>Password</Form.Label>
                  <Input {...props} bind:value={$formData.password} placeholder="password" type="password"/>
               {/snippet}
            </Form.Control>
            {#if $errors.password}
              <div class="text-red-500 text-sm mt-1">{$errors.password}</div>
            {/if}
          </Form.Field>
          <Form.Field {form} name="confirmPassword">
            <Form.Control>
               {#snippet children({ props: any })}
                  <Form.Label>Confirm Password</Form.Label>
                  <Input {...props} bind:value={$formData.confirmPassword} placeholder="Confirm Password" type="password"/>
               {/snippet}
            </Form.Control>
             {#if $errors.confirmPassword}
              <div class="text-red-500 text-sm mt-1">{$errors.confirmPassword}</div>
            {/if}
          </Form.Field>
        </div>
        <div class="flex justify-between flex-col gap-2">
          <Form.Button disabled={$submitting}>
            {#if $submitting}
              Creating account...
            {:else}
              Signup
            {/if}
          </Form.Button>
          <Button variant="outline" href="/login" >Login</Button>
        </div>
      </form>
    </Card.Content>
  </Card.Root>
  {#if $form.errors?.length}
    <div class="mt-4 text-red-500">
      {#each $form.errors as error}
        <p>{error}</p>
      {/each}
    </div>
  {/if}
</div>
