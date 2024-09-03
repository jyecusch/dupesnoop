import Header from "../components/Header";
import { Link } from "react-router-dom";
import Button from "../components/Button";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const Nav = () => {
  return (
    <section className="w-80 flex flex-col gap-2 items-stretch">
      <Link to={"/"}>
        <Button className="w-full">Find Duplicates</Button>
      </Link>
      <Link to={"/analyzer"}>
        <Button className="w-full">Disk Analyzer</Button>
      </Link>
    </section>
  )
}

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <div className="bg-[#F8F8F6] min-h-screen w-full px-6 flex flex-row py-8 overflow-visible gap-10">
      {/* <Nav /> */}
      <section className="w-full min-h-full flex-auto flex flex-col overflow-visible">{children}</section>
    </div>
  );
};

export default DefaultLayout;
