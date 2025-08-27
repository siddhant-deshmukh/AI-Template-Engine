import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "./ThemeToggle"
// import { LoginDialog } from "./LoginDialog"
import { User, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"


export function Navbar() {

  const { user } = useAuth();

  const onLogout = () => {

  }

  // const [showLoginDialog, setShowLoginDialog] = useState(false)

  // const handleLoginClick = () => {
  //   setShowLoginDialog(true)
  // }

  // const handleLoginSuccess = () => {
  //   setShowLoginDialog(false)
  //   onLogin()
  // }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">FileShare</h1>
            </div>

            {/* Right side - Theme toggle and user menu */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/placeholder.svg" alt={user.name} />
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // <Button onClick={handleLoginClick} className="bg-primary text-primary-foreground hover:bg-primary/90">
                //   Sign In
                // </Button>
                <div></div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} onLoginSuccess={handleLoginSuccess} /> */}
    </>
  )
}