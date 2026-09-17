import { redirect } from "next/navigation";
import { findDashboardByHash } from "@/lib/db/dashboards";
import { listWheelsForDashboard } from "@/lib/db/wheels";
import { isDashboardUnlocked } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

type DashboardPageProps = {
  params: Promise<{ hash: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { hash } = await params;
  const dashboard = await findDashboardByHash(hash.toLowerCase());

  if (!dashboard) {
    redirect("/?error=not-found");
  }

  if (dashboard.passwordHash && !(await isDashboardUnlocked(dashboard.id))) {
    redirect(`/?hash=${dashboard.hash}`);
  }

  const wheels = await listWheelsForDashboard(dashboard.id);

  return (
    <DashboardShell
      hash={dashboard.hash}
      initialName={dashboard.name}
      hasPassword={dashboard.passwordHash !== null}
      initialWheels={wheels}
    />
  );
}
