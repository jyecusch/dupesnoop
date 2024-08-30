import Header from "../components/Header";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <div className="min-h-screen w-full px-6 bg-white flex flex-col place-items-center justify-items-center py-8">
      <Header title="Pete's DupeSnoop"></Header>
      <section className="w-full min-h-full flex-auto flex flex-col">{children}</section>
    </div>
  );
};

export default DefaultLayout;
