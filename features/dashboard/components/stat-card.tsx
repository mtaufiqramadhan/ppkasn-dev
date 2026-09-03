import type { ComponentType, SVGProps, JSX } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface StatCardProps {
  title: string;
  value: string | number;
  Icon: IconComponent;
}

export function StatCard({ title, value, Icon }: StatCardProps): JSX.Element {
  return (
    <Card className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-dashed border-black shadow-sm h-full">
      <CardHeader className="flex w-full items-center justify-between p-0">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2 bg-primary/10 ring-1 ring-primary/20">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-muted-foreground tracking-tight">
            {title}
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </div>
      </CardHeader>
      <CardContent className="hidden" />
    </Card>
  );
}
