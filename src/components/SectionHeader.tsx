import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
}

const SectionHeader = ({ title, onViewAll }: SectionHeaderProps) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-base font-bold text-foreground">{title}</h2>
    {onViewAll && (
      <button onClick={onViewAll} className="text-xs font-semibold text-primary flex items-center gap-0.5">
        View All <ChevronRight className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

export default SectionHeader;
