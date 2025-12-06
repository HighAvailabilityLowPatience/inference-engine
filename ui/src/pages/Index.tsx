import { ThemeProvider } from "@/lib/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SystemStatusBar } from "@/components/SystemStatusBar";
import { NodeTelemetryGrid } from "@/components/NodeTelemetryGrid";
import { QuickPredictPanel } from "@/components/QuickPredictPanel";
import { EventLogTable } from "@/components/EventLogTable";
import { AggregateAnalytics } from "@/components/AggregateAnalytics";
import { SystemControl } from "@/components/SystemControl";
import { MetricsViewer } from "@/components/MetricsViewer";

const Index = () => {
  return (
    <ThemeProvider defaultTheme="dark">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />

          <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 items-center gap-4 px-4">
                <SidebarTrigger />
                <div className="flex-1" />
              </div>
            </header>

            <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
              <div id="overview">
                <SystemStatusBar />
              </div>

              <div id="nodes">
                <NodeTelemetryGrid />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div id="predict">
                  <QuickPredictPanel />
                </div>
                <div id="control">
                  <SystemControl />
                </div>
              </div>

              <div id="events">
                <EventLogTable />
              </div>

              <div id="analytics">
                <AggregateAnalytics />
              </div>

              <div id="metrics">
                <MetricsViewer />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Index;
