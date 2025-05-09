"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Tag,
  File,
  Settings,
  AlertCircle,
  MessageCircle,
  Code,
  User,
  Briefcase,
  Book,
  Star,
  Heart,
  Calendar,
  Clock,
  Home,
  Globe,
  Mail,
  Phone,
  ImageIcon,
  Music,
  Video,
  Folder,
  Lock,
  Shield,
  Bell,
  Search,
  Zap,
  Coffee,
  Gift,
  Bookmark,
  Paperclip,
  Link,
  Map,
  Smile,
  Award,
  Truck,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Percent,
  Clipboard,
  Trash,
  Edit,
  Save,
  Download,
  Upload,
  Share,
  Send,
  Printer,
  Wifi,
  Bluetooth,
  Battery,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Cloud,
  Database,
  HardDrive,
  Cpu,
  Thermometer,
  Umbrella,
  Sun,
  Moon,
  Wind,
  Droplet,
  Feather,
  Eye,
  EyeOff,
  Camera,
  Mic,
  Speaker,
  Headphones,
  Radio,
  Tv,
  Film,
  Play,
  Pause,
  CircleStopIcon as Stop,
  FastForward,
  Rewind,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  List,
  Grid,
  Layout,
  Sidebar,
  Menu,
  X,
  Check,
  Plus,
  Minus,
  Divide,
  Maximize,
  Minimize,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  RotateCw,
  ExternalLink,
  Info,
  HelpCircle,
  RefreshCw,
  Filter,
  Copy,
  Scissors,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface IconSelectorProps {
  selectedIcon: string
  onSelectIcon: (icon: string) => void
}

export function IconSelector({ selectedIcon, onSelectIcon }: IconSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const icons = [
    { name: "tag", component: <Tag /> },
    { name: "file", component: <File /> },
    { name: "settings", component: <Settings /> },
    { name: "alert-circle", component: <AlertCircle /> },
    { name: "message-circle", component: <MessageCircle /> },
    { name: "code", component: <Code /> },
    { name: "user", component: <User /> },
    { name: "briefcase", component: <Briefcase /> },
    { name: "book", component: <Book /> },
    { name: "star", component: <Star /> },
    { name: "heart", component: <Heart /> },
    { name: "calendar", component: <Calendar /> },
    { name: "clock", component: <Clock /> },
    { name: "home", component: <Home /> },
    { name: "globe", component: <Globe /> },
    { name: "mail", component: <Mail /> },
    { name: "phone", component: <Phone /> },
    { name: "image", component: <ImageIcon /> },
    { name: "music", component: <Music /> },
    { name: "video", component: <Video /> },
    { name: "folder", component: <Folder /> },
    { name: "lock", component: <Lock /> },
    { name: "shield", component: <Shield /> },
    { name: "bell", component: <Bell /> },
    { name: "search", component: <Search /> },
    { name: "zap", component: <Zap /> },
    { name: "coffee", component: <Coffee /> },
    { name: "gift", component: <Gift /> },
    { name: "bookmark", component: <Bookmark /> },
    { name: "paperclip", component: <Paperclip /> },
    { name: "link", component: <Link /> },
    { name: "map", component: <Map /> },
    { name: "smile", component: <Smile /> },
    { name: "award", component: <Award /> },
    { name: "truck", component: <Truck /> },
    { name: "shopping-cart", component: <ShoppingCart /> },
    { name: "credit-card", component: <CreditCard /> },
    { name: "dollar-sign", component: <DollarSign /> },
    { name: "percent", component: <Percent /> },
    { name: "clipboard", component: <Clipboard /> },
    { name: "trash", component: <Trash /> },
    { name: "edit", component: <Edit /> },
    { name: "save", component: <Save /> },
    { name: "download", component: <Download /> },
    { name: "upload", component: <Upload /> },
    { name: "share", component: <Share /> },
    { name: "send", component: <Send /> },
    { name: "printer", component: <Printer /> },
    { name: "wifi", component: <Wifi /> },
    { name: "bluetooth", component: <Bluetooth /> },
    { name: "battery", component: <Battery /> },
    { name: "monitor", component: <Monitor /> },
    { name: "smartphone", component: <Smartphone /> },
    { name: "tablet", component: <Tablet /> },
    { name: "laptop", component: <Laptop /> },
    { name: "server", component: <Server /> },
    { name: "cloud", component: <Cloud /> },
    { name: "database", component: <Database /> },
    { name: "hard-drive", component: <HardDrive /> },
    { name: "cpu", component: <Cpu /> },
    { name: "thermometer", component: <Thermometer /> },
    { name: "umbrella", component: <Umbrella /> },
    { name: "sun", component: <Sun /> },
    { name: "moon", component: <Moon /> },
    { name: "wind", component: <Wind /> },
    { name: "droplet", component: <Droplet /> },
    { name: "feather", component: <Feather /> },
    { name: "eye", component: <Eye /> },
    { name: "eye-off", component: <EyeOff /> },
    { name: "camera", component: <Camera /> },
    { name: "mic", component: <Mic /> },
    { name: "speaker", component: <Speaker /> },
    { name: "headphones", component: <Headphones /> },
    { name: "radio", component: <Radio /> },
    { name: "tv", component: <Tv /> },
    { name: "film", component: <Film /> },
    { name: "play", component: <Play /> },
    { name: "pause", component: <Pause /> },
    { name: "stop", component: <Stop /> },
    { name: "fast-forward", component: <FastForward /> },
    { name: "rewind", component: <Rewind /> },
    { name: "skip-back", component: <SkipBack /> },
    { name: "skip-forward", component: <SkipForward /> },
    { name: "shuffle", component: <Shuffle /> },
    { name: "repeat", component: <Repeat /> },
    { name: "list", component: <List /> },
    { name: "grid", component: <Grid /> },
    { name: "layout", component: <Layout /> },
    { name: "sidebar", component: <Sidebar /> },
    { name: "menu", component: <Menu /> },
    { name: "x", component: <X /> },
    { name: "check", component: <Check /> },
    { name: "plus", component: <Plus /> },
    { name: "minus", component: <Minus /> },
    { name: "divide", component: <Divide /> },
    { name: "maximize", component: <Maximize /> },
    { name: "minimize", component: <Minimize /> },
    { name: "arrow-up", component: <ArrowUp /> },
    { name: "arrow-down", component: <ArrowDown /> },
    { name: "arrow-left", component: <ArrowLeft /> },
    { name: "arrow-right", component: <ArrowRight /> },
    { name: "chevron-up", component: <ChevronUp /> },
    { name: "chevron-down", component: <ChevronDown /> },
    { name: "chevron-left", component: <ChevronLeft /> },
    { name: "chevron-right", component: <ChevronRight /> },
    { name: "corner-up-left", component: <CornerUpLeft /> },
    { name: "corner-up-right", component: <CornerUpRight /> },
    { name: "corner-down-left", component: <CornerDownLeft /> },
    { name: "corner-down-right", component: <CornerDownRight /> },
    { name: "chevrons-up", component: <ChevronsUp /> },
    { name: "chevrons-down", component: <ChevronsDown /> },
    { name: "chevrons-left", component: <ChevronsLeft /> },
    { name: "chevrons-right", component: <ChevronsRight /> },
    { name: "rotate-ccw", component: <RotateCcw /> },
    { name: "rotate-cw", component: <RotateCw /> },
    { name: "external-link", component: <ExternalLink /> },
    { name: "info", component: <Info /> },
    { name: "help-circle", component: <HelpCircle /> },
    { name: "refresh-cw", component: <RefreshCw /> },
    { name: "filter", component: <Filter /> },
    { name: "copy", component: <Copy /> },
    { name: "scissors", component: <Scissors /> },
    { name: "type", component: <Type /> },
    { name: "bold", component: <Bold /> },
    { name: "italic", component: <Italic /> },
    { name: "underline", component: <Underline /> },
    { name: "align-left", component: <AlignLeft /> },
    { name: "align-center", component: <AlignCenter /> },
    { name: "align-right", component: <AlignRight /> },
    { name: "align-justify", component: <AlignJustify /> },
  ]

  const filteredIcons = searchTerm
    ? icons.filter((icon) => icon.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : icons

  const getIconComponent = (iconName: string) => {
    const icon = icons.find((i) => i.name === iconName)
    return icon ? icon.component : <Tag />
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-10 h-10 p-0">
          {getIconComponent(selectedIcon)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <div className="p-2">
          <input
            className="w-full p-2 text-sm border rounded mb-2"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-6 gap-2 p-2">
              {filteredIcons.map((icon) => (
                <Button
                  key={icon.name}
                  variant={selectedIcon === icon.name ? "default" : "outline"}
                  className="h-10 w-10 p-0"
                  onClick={() => {
                    onSelectIcon(icon.name)
                    setOpen(false)
                  }}
                  title={icon.name}
                >
                  {icon.component}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
