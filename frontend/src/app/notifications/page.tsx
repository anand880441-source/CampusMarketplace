import NotificationsPage from "@/components/NotificationsPage";
import Protected from "@/components/Protected";

export default function NotificationsRoute() {
  return (
    <Protected>
      <NotificationsPage />
    </Protected>
  );
}
