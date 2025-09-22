"use client";
import MainLayout from "@/components/MainLayout";
import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const pathname = usePathname();
  const Tag = pathname !== "/dashboard" ? MainLayout : "div";
  return <Tag>{children}</Tag>;
}
