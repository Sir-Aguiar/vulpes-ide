import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vulpes IDE",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
