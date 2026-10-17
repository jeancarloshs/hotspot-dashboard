import { getAuthSession } from "@/actions/session";
import { AuthProvider } from "@/app/components/_ui/auth/AuthProvider";

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  return <AuthProvider session={session}>{children}</AuthProvider>;
}
