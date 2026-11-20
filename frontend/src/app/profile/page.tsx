import Profile from "@/components/Profile";
import Protected from "@/components/Protected";

export default function ProfilePage() {
  return (
    <Protected>
      <Profile />
    </Protected>
  );
}
