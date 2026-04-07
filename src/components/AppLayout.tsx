import { ReactNode } from "react";
import TopNavbar from "./TopNavbar";
import BottomNavbar from "./BottomNavbar";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto relative">
      <TopNavbar notificationCount={3} />
      <main className="pt-14 pb-20 min-h-screen">{children}</main>
      <BottomNavbar />
    </div>
  );
};

export default AppLayout;
