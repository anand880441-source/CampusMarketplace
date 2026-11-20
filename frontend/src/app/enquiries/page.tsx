import EnquiriesPage from "@/components/EnquiriesPage";
import Protected from "@/components/Protected";

export default function EnquiriesRoute() {
  return (
    <Protected>
      <EnquiriesPage />
    </Protected>
  );
}
