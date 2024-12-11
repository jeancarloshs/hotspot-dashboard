"use server";

import { cookies } from "next/headers";

export async function userLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("token"); // Exclui o cookie 'token'
  // O redirecionamento será feito em um componente React ou hook
}