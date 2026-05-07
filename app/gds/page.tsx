import { Nav } from "@/components/shared/Nav";
import { GdsClient } from "@/components/gds/GdsClient";

export const metadata = {
  title: "GDS Field App · DRISHTI",
};

export default function GdsPage() {
  return (
    <div className="min-h-screen bg-ink-950">
      <Nav />
      <GdsClient />
    </div>
  );
}
