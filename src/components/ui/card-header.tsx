
import { cn } from "@/lib/utils";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const CardHeader = ({ className, children, ...props }: CardHeaderProps) => {
  return (
    <div className={cn("p-4 border-b flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
};
