import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <section className="flex-1">
        <Header />

        <div className="p-6">
          {children}
        </div>
      </section>
    </main>
  );
}