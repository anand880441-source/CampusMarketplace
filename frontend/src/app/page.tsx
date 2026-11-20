import { Suspense } from "react";
import MarketplaceHome from "@/components/MarketplaceHome";
import PageLoader from "@/components/PageLoader";

export default function Home() {
  return (
    <Suspense fallback={<PageLoader label="Loading marketplace..." />}>
      <MarketplaceHome />
    </Suspense>
  );
}
