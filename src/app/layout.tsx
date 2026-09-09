import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ConditionalFooter } from "@/components/conditional-footer";
import { AuthProvider } from "@/components/providers/auth-provider";

export const metadata: Metadata = {
  title: "百草 | Baicao Blog",
  description: "一个以奶牛猫为品牌的私人社交博客",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
            {modal}
          </main>
          <ConditionalFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
