import { Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface EventFiltersProps {
  showFreeOnly: boolean;
  setShowFreeOnly: (value: boolean) => void;
  showPaidOnly: boolean;
  setShowPaidOnly: (value: boolean) => void;
  dateFilter: 'all' | 'today' | 'week' | 'month';
  setDateFilter: (value: 'all' | 'today' | 'week' | 'month') => void;
}

export function EventFilters({
  showFreeOnly,
  setShowFreeOnly,
  showPaidOnly,
  setShowPaidOnly,
  dateFilter,
  setDateFilter,
}: EventFiltersProps) {
  const hasActiveFilters = showFreeOnly || showPaidOnly || dateFilter !== 'all';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={hasActiveFilters ? "default" : "outline"} 
          size="sm" 
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary-foreground text-primary">
              {[showFreeOnly, showPaidOnly, dateFilter !== 'all'].filter(Boolean).length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Preço
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={showFreeOnly}
          onCheckedChange={(checked) => {
            setShowFreeOnly(checked);
            if (checked) setShowPaidOnly(false);
          }}
        >
          Apenas gratuitos
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showPaidOnly}
          onCheckedChange={(checked) => {
            setShowPaidOnly(checked);
            if (checked) setShowFreeOnly(false);
          }}
        >
          Apenas pagos
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Data
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={dateFilter === 'all'}
          onCheckedChange={() => setDateFilter('all')}
        >
          Todos
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={dateFilter === 'today'}
          onCheckedChange={() => setDateFilter('today')}
        >
          Hoje
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={dateFilter === 'week'}
          onCheckedChange={() => setDateFilter('week')}
        >
          Esta semana
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={dateFilter === 'month'}
          onCheckedChange={() => setDateFilter('month')}
        >
          Este mês
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
