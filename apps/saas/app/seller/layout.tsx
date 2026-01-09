import "./seller.css";
import SellerShell from "./_components/SellerShell";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <SellerShell>{children}</SellerShell>;
}
