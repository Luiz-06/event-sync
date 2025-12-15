import { Home, Ticket, PlusCircle, User, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/tickets', icon: Ticket, label: 'Ingressos' },
  { path: '/create-event', icon: PlusCircle, label: 'Criar' },
  { path: '/social', icon: MessageCircle, label: 'Social' },
  { path: '/profile', icon: User, label: 'Perfil' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                isActive && "gradient-primary shadow-glow"
              )}>
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive && "text-primary-foreground scale-110"
                  )} 
                />
              </div>
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive && "text-primary"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}