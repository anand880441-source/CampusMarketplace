import Dashboard from "@/components/Dashboard";
import Protected from "@/components/Protected";

export default function DashboardPage() {
  return (
    <Protected>
      <Dashboard />
    </Protected>
  );
}
