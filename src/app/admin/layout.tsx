import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  console.log("ADMIN USER:", user);

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return <>{children}</>;
}