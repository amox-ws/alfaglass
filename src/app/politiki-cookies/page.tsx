import { LegalView, legalMetadata } from "@/components/LegalView";

export const metadata = legalMetadata("politiki-cookies");

export default function Page() {
  return <LegalView slug="politiki-cookies" />;
}
