import { fail, superValidate } from "sveltekit-superforms";


import { signupSchema } from "@/schema";
import { zod } from "sveltekit-superforms/adapters";

export const actions = {
  default: async (event) => {
    const form = await superValidate(event, zod(signupSchema));
    if (!form.valid) {
      return fail(400, {
        form
      });
    }

    console.log(form)

    return {
      form,
    };
  }
}


// load function or GET request. Add data here that is to be shown in the frontend
export const load = async () => {
 return {
  form: await superValidate(zod(signupSchema)),
 };
};
