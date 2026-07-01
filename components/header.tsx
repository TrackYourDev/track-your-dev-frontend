"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/ui/logo";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogoPng } from "./ui/logo-png";
import { AppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { startGithubLogin } from "@/lib/auth";

const navItems = [
  { name: "Discord", href: "https://discord.gg/rtGrJ2n2Gz" },
  { name: "How It Works", href: "https://medium.com/@hs913271/whats-broken-with-today-s-agile-tools-and-how-trackyourdev-fixes-them-6386106d14b3" },
  { name: "GitHub", href: "https://github.com/TrackYourDev" },
  { name: "Twitter/X", href: "https://x.com/trackyourdev" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const isAuthenticated = AppStore.useState(s => s.isAuthenticated);
  const router = useRouter();
  // Track scroll position to change header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 my-3",
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b" : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <LogoPng />
            {/* <span className="font-bold text-xl">KnowYourDev</span> */}
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* <Button variant="ghost" className="hidden md:flex">
            Sign In
          </Button>
          <Button>Get Started</Button> */}
          {isAuthenticated ? (
            <Button variant="outline" className="bg-white text-black" onClick={() => router.push('/dashboard')}>
              Open app
            </Button>
          ) : (
            <Button variant="outline" className="bg-white text-black" onClick={startGithubLogin}>
              Login
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                ))}
                <Button
                  className="mt-4"
                  onClick={() =>
                    isAuthenticated ? router.push("/dashboard") : startGithubLogin()
                  }
                >
                  {isAuthenticated ? "Open app" : "Sign In"}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}