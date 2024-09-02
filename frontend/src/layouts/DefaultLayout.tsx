import Header from "../components/Header";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <div className="bg-[#F8F8F6] min-h-screen w-full px-6 flex flex-col place-items-center justify-items-center py-8 overflow-visible">
      <section className="w-full min-h-full flex-auto flex flex-col overflow-visible">{children}</section>
    </div>
  );
};

export default DefaultLayout;
