
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ConfigPage } from './pages/config-page';
import { SchedulePage } from './pages/schedule-page';
import { HistoricalDataPage } from './pages/historical-data-page';
import { HistoricalAnalysisPage } from './pages/historical-analysis-page';
import { SurgicalBriefingPage } from './pages/surgical-briefing-page';
import { EvaluationsPage } from './pages/evaluations-page';
import { AnalyticsPage } from './pages/analytics-page';
import { DocsPage } from './pages/docs-page';
import { evalEPAs } from '@/data/evaluations';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BackgroundVideo } from "@/components/background-video"
import { Banner } from "@/components/banner"
import { Blockquote } from "@/components/blockquote"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Checkbox } from "@/components/ui/checkbox"
import { CircleLoader } from "@/components/circle-loader"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Combobox } from "@/components/ui/combobox"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Countdown } from "@/components/countdown"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/empty-state"
import { FileUploader } from "@/components/file-uploader"
import { FloatButton } from "@/components/float-button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Gallery } from "@/components/gallery"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LinkCard } from "@/components/link-card"
import { List, ListItem } from "@/components/list"
import { Loader } from "@/components/loader"
import { Marquee } from "@/components/marquee"
import { MobileNavigation } from "@/components/mobile-navigation"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuLink, NavigationMenuTrigger, navigation } from "@/components/ui/navigation-menu"
import { OnlineBadge } from "@/components/online-badge"
import { Pagination } from "@/components/pagination"
import { Paragraph } from "@/components/paragraph"
import { PartyPopper } from "@/components/party-popper"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Section } from "@/components/section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Sonner } from "@/components/ui/sonner"
import { Sparkles } from "@/components/sparkles"
import { Status } from "@/components/status"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TreeView } from "@/components/tree-view"

import { AppState } from './lib/types';
import { getInitialAppState } from './lib/config-helpers';

function App() {
  const [appState, setAppState] = useState<AppState | null>(null);

  useEffect(() => {
    const initialState = getInitialAppState();
    setAppState(initialState);
  }, []);

  return (
    <Router>
      <div className="container mx-auto py-4">
        <h1 className="text-2xl font-bold mb-4">Neurosurgery Residency Scheduling Tool</h1>

        <nav className="mb-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:underline">Configuration</Link>
            </li>
            <li>
              <Link to="/schedule" className="hover:underline">Schedule</Link>
            </li>
             <li>
              <Link to="/evaluations" className="hover:underline">Evaluations</Link>
            </li>
            <li>
              <Link to="/analytics" className="hover:underline">Analytics</Link>
            </li>
            <li>
              <Link to="/historical-data" className="hover:underline">Historical Data</Link>
            </li>
            <li>
              <Link to="/historical-analysis" className="hover:underline">Historical Analysis</Link>
            </li>
            <li>
              <Link to="/surgical-briefing" className="hover:underline">Surgical Briefing</Link>
            </li>
            <li>
              <Link to="/docs" className="hover:underline">Docs</Link>
            </li>
          </ul>
        </nav>

        {appState ? (
          <Routes>
            <Route path="/" element={<ConfigPage appState={appState} setAppState={setAppState} />} />
            <Route path="/schedule" element={<SchedulePage appState={appState} setAppState={setAppState} />} />
            <Route path="/evaluations" element={<EvaluationsPage appState={appState} setAppState={setAppState} />} />
            <Route path="/analytics" element={<AnalyticsPage appState={appState} setAppState={setAppState} />} />
            <Route path="/historical-data" element={<HistoricalDataPage />} />
            <Route path="/historical-analysis" element={<HistoricalAnalysisPage />} />
            <Route path="/surgical-briefing" element={<SurgicalBriefingPage />} />
             <Route path="/docs" element={<DocsPage />} />
          </Routes>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </Router>
  );
}

export default App;
