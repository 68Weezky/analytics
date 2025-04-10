import { fail, superValidate } from "sveltekit-superforms";


import { loginSchema } from "@/schema";
import { zod } from "sveltekit-superforms/adapters";

export const actions = {
  default: async (event) => {
    const form = await superValidate(event, zod(loginSchema));
    if (!form.valid) {
      return fail(400, {
        form
      });
    }

    return {
      form,
    };
  }
}


// load function or GET request. Add data here that is to be shown in the frontend
export const load = async () => {
 return {
  form: await superValidate(zod(loginSchema)),
 };
};
