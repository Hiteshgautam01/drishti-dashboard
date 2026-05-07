import { Nav } from "@/components/shared/Nav";
import { SetuClient } from "@/components/setu/SetuClient";

export const metadata = {
  title: "SETU Marketplace · DRISHTI",
};

export default function SetuPage() {
  return (
    <div className="min-h-screen bg-ink-950">
      <Nav />
      <SetuClient />
    </div>
  );
}
