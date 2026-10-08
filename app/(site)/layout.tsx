import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

// Marco de toda la parte publica: header fijo arriba y footer abajo.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
