import { Nav } from "@/components/shared/Nav";
import { OperatorClient } from "@/components/operator/OperatorClient";

export const metadata = {
  title: "Operator Dashboard · DRISHTI",
};

export default function OperatorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950">
      <Nav />
      <OperatorClient />
    </div>
  );
}
