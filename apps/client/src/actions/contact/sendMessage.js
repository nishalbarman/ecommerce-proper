"use server";

import { redirect } from "next/navigation";

export default async function submitContactMessage(formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  try {
    const response = await fetch(`/contact/create`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        message,
      }),
    });

    if (response.ok) {
      return redirect("/contact?status=success");
    }
    return redirect("/contact?status=failed");
  } catch (error) {
    console.error(error);
    return redirect("/contact?status=failed");
  }
}
