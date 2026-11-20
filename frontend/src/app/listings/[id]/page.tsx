import { Suspense } from "react";
import ListingDetail from "@/components/ListingDetail";
import PageLoader from "@/components/PageLoader";

export default function ListingDetailPage({
  params,
}: PageProps<"/listings/[id]">) {
  return (
    <Suspense fallback={<PageLoader label="Loading listing..." />}>
      {params.then(({ id }) => (
        <ListingDetail id={id} />
      ))}
    </Suspense>
  );
}
