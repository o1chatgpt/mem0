import type React from "react"
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
  ImageIcon as Image,
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

export function getCategoryIcon(iconName: string | null, className = "h-4 w-4"): React.ReactNode {
  const props = { className }

  switch (iconName) {
    case "tag":
      return <Tag {...props} />
    case "file":
      return <File {...props} />
    case "settings":
      return <Settings {...props} />
    case "alert-circle":
      return <AlertCircle {...props} />
    case "message-circle":
      return <MessageCircle {...props} />
    case "code":
      return <Code {...props} />
    case "user":
      return <User {...props} />
    case "briefcase":
      return <Briefcase {...props} />
    case "book":
      return <Book {...props} />
    case "star":
      return <Star {...props} />
    case "heart":
      return <Heart {...props} />
    case "calendar":
      return <Calendar {...props} />
    case "clock":
      return <Clock {...props} />
    case "home":
      return <Home {...props} />
    case "globe":
      return <Globe {...props} />
    case "mail":
      return <Mail {...props} />
    case "phone":
      return <Phone {...props} />
    case "image":
      return <Image {...props} />
    case "music":
      return <Music {...props} />
    case "video":
      return <Video {...props} />
    case "folder":
      return <Folder {...props} />
    case "lock":
      return <Lock {...props} />
    case "shield":
      return <Shield {...props} />
    case "bell":
      return <Bell {...props} />
    case "search":
      return <Search {...props} />
    case "zap":
      return <Zap {...props} />
    case "coffee":
      return <Coffee {...props} />
    case "gift":
      return <Gift {...props} />
    case "bookmark":
      return <Bookmark {...props} />
    case "paperclip":
      return <Paperclip {...props} />
    case "link":
      return <Link {...props} />
    case "map":
      return <Map {...props} />
    case "smile":
      return <Smile {...props} />
    case "award":
      return <Award {...props} />
    case "truck":
      return <Truck {...props} />
    case "shopping-cart":
      return <ShoppingCart {...props} />
    case "credit-card":
      return <CreditCard {...props} />
    case "dollar-sign":
      return <DollarSign {...props} />
    case "percent":
      return <Percent {...props} />
    case "clipboard":
      return <Clipboard {...props} />
    case "trash":
      return <Trash {...props} />
    case "edit":
      return <Edit {...props} />
    case "save":
      return <Save {...props} />
    case "download":
      return <Download {...props} />
    case "upload":
      return <Upload {...props} />
    case "share":
      return <Share {...props} />
    case "send":
      return <Send {...props} />
    case "printer":
      return <Printer {...props} />
    case "wifi":
      return <Wifi {...props} />
    case "bluetooth":
      return <Bluetooth {...props} />
    case "battery":
      return <Battery {...props} />
    case "monitor":
      return <Monitor {...props} />
    case "smartphone":
      return <Smartphone {...props} />
    case "tablet":
      return <Tablet {...props} />
    case "laptop":
      return <Laptop {...props} />
    case "server":
      return <Server {...props} />
    case "cloud":
      return <Cloud {...props} />
    case "database":
      return <Database {...props} />
    case "hard-drive":
      return <HardDrive {...props} />
    case "cpu":
      return <Cpu {...props} />
    case "thermometer":
      return <Thermometer {...props} />
    case "umbrella":
      return <Umbrella {...props} />
    case "sun":
      return <Sun {...props} />
    case "moon":
      return <Moon {...props} />
    case "wind":
      return <Wind {...props} />
    case "droplet":
      return <Droplet {...props} />
    case "feather":
      return <Feather {...props} />
    case "eye":
      return <Eye {...props} />
    case "eye-off":
      return <EyeOff {...props} />
    case "camera":
      return <Camera {...props} />
    case "mic":
      return <Mic {...props} />
    case "speaker":
      return <Speaker {...props} />
    case "headphones":
      return <Headphones {...props} />
    case "radio":
      return <Radio {...props} />
    case "tv":
      return <Tv {...props} />
    case "film":
      return <Film {...props} />
    case "play":
      return <Play {...props} />
    case "pause":
      return <Pause {...props} />
    case "stop":
      return <Stop {...props} />
    case "fast-forward":
      return <FastForward {...props} />
    case "rewind":
      return <Rewind {...props} />
    case "skip-back":
      return <SkipBack {...props} />
    case "skip-forward":
      return <SkipForward {...props} />
    case "shuffle":
      return <Shuffle {...props} />
    case "repeat":
      return <Repeat {...props} />
    case "list":
      return <List {...props} />
    case "grid":
      return <Grid {...props} />
    case "layout":
      return <Layout {...props} />
    case "sidebar":
      return <Sidebar {...props} />
    case "menu":
      return <Menu {...props} />
    case "x":
      return <X {...props} />
    case "check":
      return <Check {...props} />
    case "plus":
      return <Plus {...props} />
    case "minus":
      return <Minus {...props} />
    case "divide":
      return <Divide {...props} />
    case "maximize":
      return <Maximize {...props} />
    case "minimize":
      return <Minimize {...props} />
    case "arrow-up":
      return <ArrowUp {...props} />
    case "arrow-down":
      return <ArrowDown {...props} />
    case "arrow-left":
      return <ArrowLeft {...props} />
    case "arrow-right":
      return <ArrowRight {...props} />
    case "chevron-up":
      return <ChevronUp {...props} />
    case "chevron-down":
      return <ChevronDown {...props} />
    case "chevron-left":
      return <ChevronLeft {...props} />
    case "chevron-right":
      return <ChevronRight {...props} />
    case "corner-up-left":
      return <CornerUpLeft {...props} />
    case "corner-up-right":
      return <CornerUpRight {...props} />
    case "corner-down-left":
      return <CornerDownLeft {...props} />
    case "corner-down-right":
      return <CornerDownRight {...props} />
    case "chevrons-up":
      return <ChevronsUp {...props} />
    case "chevrons-down":
      return <ChevronsDown {...props} />
    case "chevrons-left":
      return <ChevronsLeft {...props} />
    case "chevrons-right":
      return <ChevronsRight {...props} />
    case "rotate-ccw":
      return <RotateCcw {...props} />
    case "rotate-cw":
      return <RotateCw {...props} />
    case "external-link":
      return <ExternalLink {...props} />
    case "info":
      return <Info {...props} />
    case "help-circle":
      return <HelpCircle {...props} />
    case "refresh-cw":
      return <RefreshCw {...props} />
    case "filter":
      return <Filter {...props} />
    case "copy":
      return <Copy {...props} />
    case "scissors":
      return <Scissors {...props} />
    case "type":
      return <Type {...props} />
    case "bold":
      return <Bold {...props} />
    case "italic":
      return <Italic {...props} />
    case "underline":
      return <Underline {...props} />
    case "align-left":
      return <AlignLeft {...props} />
    case "align-center":
      return <AlignCenter {...props} />
    case "align-right":
      return <AlignRight {...props} />
    case "align-justify":
      return <AlignJustify {...props} />
    default:
      return <Tag {...props} />
  }
}

export function getIconNames(): string[] {
  return [
    "tag",
    "file",
    "settings",
    "alert-circle",
    "message-circle",
    "code",
    "user",
    "briefcase",
    "book",
    "star",
    "heart",
    "calendar",
    "clock",
    "home",
    "globe",
    "mail",
    "phone",
    "image",
    "music",
    "video",
    "folder",
    "lock",
    "shield",
    "bell",
    "search",
    "zap",
    "coffee",
    "gift",
    "bookmark",
    "paperclip",
    "link",
    "map",
    "smile",
    "award",
    "truck",
    "shopping-cart",
    "credit-card",
    "dollar-sign",
    "percent",
    "clipboard",
    "trash",
    "edit",
    "save",
    "download",
    "upload",
    "share",
    "send",
    "printer",
    "wifi",
    "bluetooth",
    "battery",
    "monitor",
    "smartphone",
    "tablet",
    "laptop",
    "server",
    "cloud",
    "database",
    "hard-drive",
    "cpu",
    "thermometer",
    "umbrella",
    "sun",
    "moon",
    "wind",
    "droplet",
    "feather",
    "eye",
    "eye-off",
    "camera",
    "mic",
    "speaker",
    "headphones",
    "radio",
    "tv",
    "film",
    "play",
    "pause",
    "stop",
    "fast-forward",
    "rewind",
    "skip-back",
    "skip-forward",
    "shuffle",
    "repeat",
    "list",
    "grid",
    "layout",
    "sidebar",
    "menu",
    "x",
    "check",
    "plus",
    "minus",
    "divide",
    "maximize",
    "minimize",
    "arrow-up",
    "arrow-down",
    "arrow-left",
    "arrow-right",
    "chevron-up",
    "chevron-down",
    "chevron-left",
    "chevron-right",
    "corner-up-left",
    "corner-up-right",
    "corner-down-left",
    "corner-down-right",
    "chevrons-up",
    "chevrons-down",
    "chevrons-left",
    "chevrons-right",
    "rotate-ccw",
    "rotate-cw",
    "external-link",
    "info",
    "help-circle",
    "refresh-cw",
    "filter",
    "copy",
    "scissors",
    "type",
    "bold",
    "italic",
    "underline",
    "align-left",
    "align-center",
    "align-right",
    "align-justify",
  ]
}
