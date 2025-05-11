"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Vote, PlusCircle, User, LogOut, LogIn, Home, Globe, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="w-8"></div> {/* This adds a small space to move the logo slightly right */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative">
            <Shield className="h-6 w-6" />
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-primary"></div>
          </div>
          <span className="hidden font-bold sm:inline-block">Vote Secure</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/">
            <Button variant={isActive("/") ? "default" : "ghost"} size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline-block">Home</span>
            </Button>
          </Link>
          {user && (
            <Link href="/explore">
              <Button variant={isActive("/explore") ? "default" : "ghost"} size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline-block">Explore Polls</span>
              </Button>
            </Link>
          )}
          {user ? (
            <>
              <Link href="/create">
                <Button variant={isActive("/create") ? "default" : "ghost"} size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Create Poll</span>
                </Button>
              </Link>
              <Link href="/my-polls">
                <Button variant={isActive("/my-polls") ? "default" : "ghost"} size="sm" className="gap-2">
                  <Vote className="h-4 w-4" />
                  <span className="hidden sm:inline-block">My Polls</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant={isActive("/login") ? "default" : "ghost"} size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button variant={isActive("/register") ? "default" : "secondary"} size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
