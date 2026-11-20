import { Suspense } from "react";
import PageLoader from "@/components/PageLoader";
import SellerProfile from "@/components/SellerProfile";

export default function SellerProfilePage({
  params,
}: PageProps<"/sellers/[id]">) {
  return (
    <Suspense fallback={<PageLoader label="Loading seller profile..." />}>
      {params.then(({ id }) => (
        <SellerProfile id={id} />
      ))}
    </Suspense>
  );
}
