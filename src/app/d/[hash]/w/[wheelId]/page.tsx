import { redirect } from "next/navigation";
import { findDashboardByHash } from "@/lib/db/dashboards";
import { findWheelById, resetWheelSession } from "@/lib/db/wheels";
import { isDashboardUnlocked } from "@/lib/session";
import { WheelScreen } from "@/components/wheel/WheelScreen";

type WheelPageProps = {
  params: Promise<{ hash: string; wheelId: string }>;
};

export default async function WheelPage({ params }: WheelPageProps) {
  const { hash, wheelId } = await params;
  const dashboard = await findDashboardByHash(hash.toLowerCase());

  if (!dashboard) {
    redirect("/?error=not-found");
  }

  if (dashboard.passwordHash && !(await isDashboardUnlocked(dashboard.id))) {
    redirect(`/?hash=${dashboard.hash}`);
  }

  let wheel = await findWheelById(Number(wheelId));
  if (!wheel || wheel.dashboardId !== dashboard.id) {
    redirect(`/d/${dashboard.hash}`);
  }

  // First-ever visit to this wheel starts its first session and seeds the
  // current list from the template — every later visit leaves it as-is.
  if (wheel.data.historyBucket.length === 0) {
    wheel = await resetWheelSession(wheel.id);
  }

  return <WheelScreen hash={dashboard.hash} wheel={wheel} />;
}
