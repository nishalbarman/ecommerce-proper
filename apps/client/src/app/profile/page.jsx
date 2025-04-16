import { cookies } from "next/headers";

export default async function () {
  const cookiesStore = await cookies();
  const token = cookiesStore?.get("token")?.value;

  if (!token) {
    redirect("/auth/login?redirect=cart");
  }
  return (
    <>
      <div>Hi, I am Nishal</div>
    </>
  );
}
