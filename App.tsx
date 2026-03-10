import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";
import { 
  FileText, 
  Send, 
  Upload, 
  Volume2, 
  X, 
  Loader2, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  Settings,
  Mic,
  MicOff,
  ExternalLink,
  Globe,
  Download,
  Crown,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  collection,
  query,
  where,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type Language = 'en' | 'fr' | 'es' | 'zh' | 'ar' | 'ja' | 'de';

interface Translations {
  welcome: string;
  description: string;
  placeholder: string;
  marketTrend: string;
  riskEval: string;
  synthesizing: string;
  executiveActive: string;
  maxFiles: string;
  error: string;
  settings: string;
  language: string;
  close: string;
  liveTalk: string;
  installApp: string;
  installDesc: string;
  visitWebsite: string;
  upgradePro: string;
  proFeature: string;
  proDesc: string;
  unlockNow: string;
  login: string;
  signup: string;
  logout: string;
  email: string;
  password: string;
  adminPanel: string;
  activateUser: string;
  pendingRequests: string;
  notAuthenticated: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    welcome: "Welcome to Gestion Smart Strategist.",
    description: "Your elite strategic advisor. Operating from the shadows to forge your market dominance. Upload your strategic documents or describe your business challenge.",
    placeholder: "Describe your strategic objective...",
    marketTrend: "Market Trend Analysis",
    riskEval: "Risk Evaluation",
    synthesizing: "Synthesizing Strategy...",
    executiveActive: "Executive Engine Active",
    maxFiles: "Maximum 5 documents allowed for strategic analysis.",
    error: "GOLDEN ERROR: Strategic engine saturation or document access failure.",
    settings: "Settings",
    language: "Language",
    close: "Close",
    liveTalk: "Live Talk",
    installApp: "Install App",
    installDesc: "Add to home screen for a native experience.",
    visitWebsite: "Visit Website",
    upgradePro: "Upgrade to PRO",
    proFeature: "PRO Feature",
    proDesc: "This feature is reserved for our elite members. Unlock full strategic power.",
    unlockNow: "Unlock Now",
    login: "Log In",
    signup: "Sign Up",
    logout: "Log Out",
    email: "Email",
    password: "Password",
    adminPanel: "Admin Panel",
    activateUser: "Activate User",
    pendingRequests: "Pending Requests",
    notAuthenticated: "Please log in to access this feature.",
  },
  fr: {
    welcome: "Bienvenue chez Gestion Smart Strategist.",
    description: "Votre conseiller stratégique d'élite. Opérant dans l'ombre pour forger votre domination du marché. Chargez vos documents stratégiques ou décrivez votre défi commercial.",
    placeholder: "Décrivez votre objectif stratégique...",
    marketTrend: "Analyse des Tendances du Marché",
    riskEval: "Évaluation des Risques",
    synthesizing: "Synthèse de la Stratégie...",
    executiveActive: "Moteur Exécutif Actif",
    maxFiles: "Maximum 5 documents autorisés pour l'analyse stratégique.",
    error: "ERREUR D'OR : Saturation du moteur stratégique ou échec d'accès au document.",
    settings: "Paramètres",
    language: "Langue",
    close: "Fermer",
    liveTalk: "Parler en Direct",
    installApp: "Installer l'App",
    installDesc: "Ajoutez à l'écran d'accueil pour une expérience native.",
    visitWebsite: "Visiter le Site",
    upgradePro: "Passer en PRO",
    proFeature: "Fonctionnalité PRO",
    proDesc: "Cette fonctionnalité est réservée à nos membres d'élite. Débloquez toute la puissance stratégique.",
    unlockNow: "Débloquer Maintenant",
    login: "Connexion",
    signup: "Inscription",
    logout: "Déconnexion",
    email: "Email",
    password: "Mot de passe",
    adminPanel: "Panneau Admin",
    activateUser: "Activer Utilisateur",
    pendingRequests: "Demandes en attente",
    notAuthenticated: "Veuillez vous connecter pour accéder à cette fonctionnalité.",
  },
  es: {
    welcome: "Bienvenido, Ejecutivo.",
    description: "Cargue sus documentos estratégicos o describa su desafío empresarial. Estoy preparado para proporcionar análisis de alto nivel y soluciones prácticas.",
    placeholder: "Describa su objetivo estratégico...",
    marketTrend: "Análisis de Tendencias de Mercado",
    riskEval: "Evaluación de Riesgos",
    synthesizing: "Sintetizando Estrategia...",
    executiveActive: "Motor Ejecutivo Activo",
    maxFiles: "Máximo 5 documentos permitidos para el análisis estratégico.",
    error: "ERROR DE ORO: Saturación del motor estratégico o fallo en el acceso al documento.",
    settings: "Ajustes",
    language: "Idioma",
    close: "Cerrar",
    liveTalk: "Charla en Vivo",
    installApp: "Instalar App",
    installDesc: "Añadir a la pantalla de inicio para una experiencia nativa.",
    visitWebsite: "Visitar Sitio",
    upgradePro: "Actualizar a PRO",
    proFeature: "Función PRO",
    proDesc: "Esta función está reservada para nuestros miembros de élite. Desbloquee todo el poder estratégico.",
    unlockNow: "Desbloquear Ahora",
    login: "Iniciar Sesión",
    signup: "Registrarse",
    logout: "Cerrar Sesión",
    email: "Correo electrónico",
    password: "Contraseña",
    adminPanel: "Panel de Administración",
    activateUser: "Activar Usuario",
    pendingRequests: "Solicitudes Pendientes",
    notAuthenticated: "Inicie sesión para acceder a esta función.",
  },
  zh: {
    welcome: "欢迎，执行官。",
    description: "上传您的战略文件 or 描述您的业务挑战。我已准备好提供高层分析和可行的解决方案。",
    placeholder: "描述您的战略目标...",
    marketTrend: "市场趋势分析",
    riskEval: "风险评估",
    synthesizing: "正在综合战略...",
    executiveActive: "执行引擎已启动",
    maxFiles: "战略分析最多允许 5 份文件。",
    error: "黄金错误：战略引擎饱和或文件访问失败。",
    settings: "设置",
    language: "语言",
    close: "关闭",
    liveTalk: "实时对话",
    installApp: "安装应用",
    installDesc: "添加到主屏幕以获得原生体验。",
    visitWebsite: "访问网站",
    upgradePro: "升级到 PRO",
    proFeature: "PRO 功能",
    proDesc: "此功能仅供我们的精英会员使用。解锁全部战略力量。",
    unlockNow: "立即解锁",
    login: "登录",
    signup: "注册",
    logout: "登出",
    email: "电子邮件",
    password: "密码",
    adminPanel: "管理面板",
    activateUser: "激活用户",
    pendingRequests: "待处理请求",
    notAuthenticated: "请登录以访问此功能。",
  },
  ar: {
    welcome: "أهلاً بك، أيها المدير التنفيذي.",
    description: "قم بتحميل مستنداتك الاستراتيجية أو صف تحدي عملك. أنا مستعد لتقديم تحليل رفيع المستوى وحلول عملية.",
    placeholder: "صف هدفك الاستراتيجي...",
    marketTrend: "تحليل اتجاهات السوق",
    riskEval: "تقييم المخاطر",
    synthesizing: "توليف الاستراتيجية...",
    executiveActive: "المحرك التنفيذي نشط",
    maxFiles: "يسمح بحد أقصى 5 مستندات للتحليل الاستراتيجي.",
    error: "خطأ ذهبي: تشبع المحرك الاستراتيجي أو فشل الوصول إلى المستند.",
    settings: "الإعدادات",
    language: "اللغة",
    close: "إغلاق",
    liveTalk: "تحدث مباشر",
    installApp: "تثبيت التطبيق",
    installDesc: "أضف إلى الشاشة الرئيسية لتجربة أصلية.",
    visitWebsite: "زيارة الموقع",
    upgradePro: "الترقية إلى PRO",
    proFeature: "ميزة PRO",
    proDesc: "هذه الميزة محجوزة لأعضائنا النخبة. إطلاق القوة الاستراتيجية الكاملة.",
    unlockNow: "فتح الآن",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    logout: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    adminPanel: "لوحة التحكم",
    activateUser: "تفعيل المستخدم",
    pendingRequests: "الطلبات المعلقة",
    notAuthenticated: "يرجى تسجيل الدخول للوصول إلى هذه الميزة.",
  },
  ja: {
    welcome: "ようこそ、エグゼクティブ。",
    description: "戦略文書をアップロードするか、ビジネス上の課題を説明してください。ハイレベルな分析と実用的なソリューションを提供します。",
    placeholder: "戦略目標を説明してください...",
    marketTrend: "市場動向分析",
    riskEval: "リスク評価",
    synthesizing: "戦略を統合中...",
    executiveActive: "エグゼクティブエンジン稼働中",
    maxFiles: "戦略分析には最大5つのドキュメントが許可されます。",
    error: "ゴールデンエラー：戦略エンジンの飽和またはドキュメントアクセス失敗。",
    settings: "設定",
    language: "言語",
    close: "閉じる",
    liveTalk: "ライブトーク",
    installApp: "アプリをインストール",
    installDesc: "ネイティブな体験のためにホーム画面に追加してください。",
    visitWebsite: "ウェブサイトに移動",
    upgradePro: "PROにアップグレード",
    proFeature: "PRO機能",
    proDesc: "この機能はエリートメンバー専用です。完全な戦略的パワーを解放してください。",
    unlockNow: "今すぐアンロック",
    login: "ログイン",
    signup: "サインアップ",
    logout: "ログアウト",
    email: "メールアドレス",
    password: "パスワード",
    adminPanel: "管理パネル",
    activateUser: "ユーザーを有効化",
    pendingRequests: "保留中のリクエスト",
    notAuthenticated: "この機能にアクセスするにはログインしてください。",
  },
  de: {
    welcome: "Willkommen, Führungskraft.",
    description: "Laden Sie Ihre Strategiedokumente hoch oder beschreiben Sie Ihre geschäftliche Herausforderung. Ich bin bereit, Analysen auf hohem Niveau und umsetzbare Lösungen anzubieten.",
    placeholder: "Beschreiben Sie Ihr strategisches Ziel...",
    marketTrend: "Markttrendanalyse",
    riskEval: "Risikobewertung",
    synthesizing: "Strategie wird synthetisiert...",
    executiveActive: "Executive Engine Aktiv",
    maxFiles: "Maximal 5 Dokumente für die strategische Analyse erlaubt.",
    error: "GOLDENER FEHLER: Sättigung der Strategie-Engine oder Fehler beim Dokumentenzugriff.",
    settings: "Einstellungen",
    language: "Sprache",
    close: "Schließen",
    liveTalk: "Live-Gespräch",
    installApp: "App installieren",
    installDesc: "Zum Home-Bildschirm hinzufügen für ein natives Erlebnis.",
    visitWebsite: "Webseite besuchen",
    upgradePro: "Auf PRO upgraden",
    proFeature: "PRO-Funktion",
    proDesc: "Diese Funktion ist unseren Elite-Mitgliedern vorbehalten. Schalten Sie die volle strategische Kraft frei.",
    unlockNow: "Jetzt freischalten",
    login: "Anmelden",
    signup: "Registrieren",
    logout: "Abmelden",
    email: "E-Mail",
    password: "Passwort",
    adminPanel: "Admin-Panel",
    activateUser: "Benutzer aktivieren",
    pendingRequests: "Ausstehende Anfragen",
    notAuthenticated: "Bitte melden Sie sich an, um diese Funktion zu nutzen.",
  }
};

interface Message {
  role: 'user' | 'model';
  text: string;
  audio?: string;
  groundingLinks?: { title: string; uri: string }[];
  chartData?: {
    type: 'bar' | 'line' | 'pie';
    data: any[];
    title: string;
  };
}

interface AttachedFile {
  name: string;
  data: string; // base64
  mimeType: string;
}

// --- Constants ---
const GOLD = "#D4AF37";
const BLACK = "#000000";

const getSystemInstruction = (lang: Language) => `You are the GESTION SMART AI STRATEGIST, a Senior Executive Advisor representing the elite strategic vision of Gestion Smart. 

Your personality:
- Authoritative, direct, and concise.
- No fluff, no filler. Provide high-impact solutions.
- Focus on ROI, strategic positioning, and risk mitigation.
- You operate with total discretion and strategic depth.
- You represent the excellence and strategic vision of Gestion Smart.

When providing data that can be visualized, include a JSON block at the end of your message in this format:
\`\`\`chart
{
  "type": "bar" | "line" | "pie",
  "title": "Chart Title",
  "data": [{"name": "Label", "value": 123}, ...]
}
\`\`\`
Only use this for meaningful strategic data.

IMPORTANT: You must respond in ${lang === 'fr' ? 'French' : lang === 'es' ? 'Spanish' : lang === 'zh' ? 'Chinese' : lang === 'ar' ? 'Arabic' : lang === 'ja' ? 'Japanese' : lang === 'de' ? 'German' : 'English'}.
Your goal is to empower the user's business vision with actionable intelligence.`;

// --- Components ---
// --- Components ---
const ChartRenderer = ({ chartData }: { chartData: Message['chartData'] }) => {
  if (!chartData) return null;

  const COLORS = ['#D4AF37', '#8B7355', '#C0C0C0', '#4B4B4B', '#2F4F4F'];

  return (
    <div className="mt-4 p-4 bg-black/40 border border-[#D4AF37]/20 rounded-sm w-full h-[300px]">
      <h4 className="text-[10px] text-[#D4AF37] uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
        {chartData.type === 'bar' && <BarChart3 className="w-3 h-3" />}
        {chartData.type === 'line' && <LineChartIcon className="w-3 h-3" />}
        {chartData.type === 'pie' && <PieChartIcon className="w-3 h-3" />}
        {chartData.title}
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        {chartData.type === 'bar' ? (
          <BarChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#666" fontSize={10} />
            <YAxis stroke="#666" fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', border: '1px solid #D4AF37', fontSize: '10px' }}
              itemStyle={{ color: '#D4AF37' }}
            />
            <Bar dataKey="value" fill="#D4AF37" />
          </BarChart>
        ) : chartData.type === 'line' ? (
          <LineChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#666" fontSize={10} />
            <YAxis stroke="#666" fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', border: '1px solid #D4AF37', fontSize: '10px' }}
              itemStyle={{ color: '#D4AF37' }}
            />
            <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} />
          </LineChart>
        ) : (
          <PieChart>
            <Pie
              data={chartData.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', border: '1px solid #D4AF37', fontSize: '10px' }}
              itemStyle={{ color: '#D4AF37' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', color: '#666' }} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

const GestionSmartLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 400 120" className={className} fill="currentColor">
    {/* Stylized GS Monogram */}
    <path d="M40 30c-15 0-25 10-25 25v10c0 15 10 25 25 25h10V80h-10c-8 0-10-2-10-10V55c0-8 2-10 10-10h15v-15H40z" />
    <path d="M60 60c0-15 10-25 25-25h15v15H85c-8 0-10 2-10 10v5c0 8 2 10 10 10h10v-10h-10v-15h25v40H60V60z" />
    
    {/* AI STRATEGIST Text */}
    <text x="120" y="65" fontSize="32" fontFamily="serif" fontWeight="bold" letterSpacing="1">GESTION SMART</text>
    <text x="120" y="95" fontSize="18" fontFamily="sans-serif" letterSpacing="6" opacity="0.8">AI STRATEGIST</text>
    
    {/* Decorative Line */}
    <rect x="120" y="72" width="240" height="1" opacity="0.3" />
  </svg>
);

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (!isPro) {
      setShowPaywall(true);
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };
  const [language, setLanguage] = useState<Language>('fr');
  const [showSettings, setShowSettings] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auth & Profile State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Admin State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  const isPro = profile?.isPro || false;
  const t = TRANSLATIONS[language];

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            const newProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: firebaseUser.email === 'gsgestionsmart@gmail.com' ? 'admin' : 'user',
              isPro: false,
              createdAt: new Date().toISOString()
            };
            setDoc(profileRef, newProfile);
            setProfile(newProfile);
          }
          setIsAuthLoading(false);
        });
        return () => unsubProfile();
      } else {
        setProfile(null);
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Admin: Listen to all users
  useEffect(() => {
    if (profile?.role === 'admin' && showAdminPanel) {
      const q = query(collection(db, 'users'), where('isPro', '==', false));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingUsers(users);
      });
      return () => unsubscribe();
    }
  }, [profile, showAdminPanel]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      }
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowSettings(false);
  };

  const activateUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isPro: true });
    } catch (err) {
      console.error("Error activating user:", err);
    }
  };

  // Initialize AI
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    if (files.length + uploadedFiles.length > 5) {
      alert(t.maxFiles);
      return;
    }

    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const base64 = await fileToBase64(file);
      newFiles.push({
        name: file.name,
        data: base64.split(',')[1],
        mimeType: file.type
      });
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportPDF = async () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (!isPro) {
      setShowPaywall(true);
      return;
    }
    const element = document.getElementById('chat-container');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`GS-Strategic-Report-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    }
  };

  const handleSend = async () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (!inputText.trim() && files.length === 0) return;

    const userMessage: Message = { role: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    const currentFiles = [...files];
    
    setInputText('');
    setFiles([]);
    setIsLoading(true);

    try {
      const parts = [
        { text: currentInput || "Analyze these documents and provide a strategic summary." },
        ...currentFiles.map(f => ({
          inlineData: {
            data: f.data,
            mimeType: f.mimeType
          }
        }))
      ];

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: [{ parts }],
        config: {
          systemInstruction: getSystemInstruction(language),
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          tools: [{ googleSearch: {} }]
        }
      });

      let fullText = "";
      let groundingLinks: { title: string; uri: string }[] = [];
      // Add an empty model message to start streaming into
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of responseStream) {
        const chunkText = chunk.text || "";
        fullText += chunkText;
        
        // Extract grounding links if available
        const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          chunks.forEach((c: any) => {
            if (c.web && c.web.uri && !groundingLinks.find(l => l.uri === c.web.uri)) {
              groundingLinks.push({ title: c.web.title || 'Source', uri: c.web.uri });
            }
          });
        }

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.text = fullText;
            lastMessage.groundingLinks = groundingLinks.length > 0 ? groundingLinks : undefined;
          }
          return newMessages;
        });
      }

      // After stream ends, check for chart data
      const chartMatch = fullText.match(/```chart\n([\s\S]*?)\n```/);
      if (chartMatch) {
        try {
          const chartData = JSON.parse(chartMatch[1]);
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'model') {
              lastMessage.chartData = chartData;
              // Remove the JSON block from the text for cleaner display
              lastMessage.text = fullText.replace(/```chart\n[\s\S]*?\n```/, '').trim();
            }
            return newMessages;
          });
        } catch (e) {
          console.error("Failed to parse chart data", e);
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: t.error 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    
    try {
      // Re-initialize AI to ensure fresh session
      const aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read this strategically and authoritatively: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        // Decode base64 to binary
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Gemini TTS returns raw 16-bit PCM at 24kHz
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const pcmData = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(pcmData.length);
        
        // Normalize 16-bit PCM to Float32
        for (let i = 0; i < pcmData.length; i++) {
          float32Data[i] = pcmData[i] / 32768.0;
        }

        const audioBuffer = audioContext.createBuffer(1, float32Data.length, 24000);
        audioBuffer.getChannelData(0).set(float32Data);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => {
          setIsSpeaking(false);
          audioContext.close();
        };
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("TTS Strategic Engine Error:", error);
      setIsSpeaking(false);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative flex flex-col items-center"
        >
          <GestionSmartLogo className="w-80 h-auto text-[#D4AF37]" />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "80%" }}
            transition={{ delay: 1, duration: 1 }}
            className="h-px bg-[#D4AF37] mt-2"
          />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="text-center mt-4"
        >
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">Empowering Your Business Vision</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans selection:bg-[#D4AF37]/30">
      {/* Header */}
      <header className="border-b border-[#D4AF37]/20 p-4 flex items-center justify-between bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <GestionSmartLogo className="h-8 w-auto text-[#D4AF37]" />
          <div className="border-l border-[#D4AF37]/30 pl-3">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{t.executiveActive}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-4">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest">{user.email}</span>
              <span className={cn(
                "text-[8px] uppercase tracking-widest font-bold",
                isPro ? "text-[#D4AF37]" : "text-gray-600"
              )}>
                {isPro ? "ELITE MEMBER" : "BASIC ACCOUNT"}
              </span>
            </div>
          ) : (
            <button 
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="text-[10px] text-[#D4AF37] uppercase tracking-widest border border-[#D4AF37]/30 px-3 py-1.5 hover:bg-[#D4AF37]/10 transition-all"
            >
              {t.login}
            </button>
          )}
          <a 
            href="https://sites.google.com/view/gestionsmart-gs/accueil" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-[#D4AF37]/30 rounded-sm text-[10px] text-[#D4AF37] uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            {t.visitWebsite}
          </a>
          <button 
            onClick={handleExportPDF}
            className="p-2 text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors flex items-center gap-2"
            title="Export Strategic Report"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          {!isPro && (
            <button
              onClick={() => setShowPaywall(true)}
              className="px-3 py-1 text-[10px] bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm"
            >
              PRO
            </button>
          )}
          <TrendingUp className="w-5 h-5 text-[#D4AF37]/50" />
        </div>
      </header>

      {/* Main Chat Area */}
      <main id="chat-container" className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto">
            <Briefcase className="w-16 h-16 text-[#D4AF37]/20" />
            <div className="space-y-4">
              <h3 className="text-[#D4AF37] text-xl font-serif">{t.welcome}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t.description}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full">
              <button 
                onClick={() => {
                  if (!isPro) setShowPaywall(true);
                  else setInputText(t.marketTrend);
                }}
                className="p-3 border border-[#D4AF37]/20 rounded-sm text-xs text-left hover:bg-[#D4AF37]/5 transition-colors flex justify-between items-center group"
              >
                <span className="flex items-center gap-2">
                  {t.marketTrend}
                  {!isPro && <Crown className="w-3 h-3 text-[#D4AF37]" />}
                </span>
                <ChevronRight className="w-4 h-4 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => {
                  if (!isPro) setShowPaywall(true);
                  else setInputText(t.riskEval);
                }}
                className="p-3 border border-[#D4AF37]/20 rounded-sm text-xs text-left hover:bg-[#D4AF37]/5 transition-colors flex justify-between items-center group"
              >
                <span className="flex items-center gap-2">
                  {t.riskEval}
                  {!isPro && <Crown className="w-3 h-3 text-[#D4AF37]" />}
                </span>
                <ChevronRight className="w-4 h-4 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "p-4 rounded-sm text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-[#D4AF37] text-black font-medium" 
                  : "bg-[#111] border-l-2 border-[#D4AF37] text-gray-200"
              )}>
                {msg.text}
                
                {msg.chartData && <ChartRenderer chartData={msg.chartData} />}
                
                {msg.groundingLinks && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold">
                      <Globe className="w-3 h-3" />
                      Sources Stratégiques
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingLinks.map((link, idx) => (
                        <a 
                          key={idx} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-sm text-[10px] text-gray-400 transition-colors border border-white/5"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === 'model' && (
                <button 
                  onClick={() => speakMessage(msg.text)}
                  disabled={isSpeaking}
                  className="mt-2 text-[#D4AF37] flex items-center gap-2 text-[10px] uppercase tracking-widest hover:opacity-80 disabled:opacity-30"
                >
                  {isSpeaking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                  {t.liveTalk}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex items-center gap-3 text-[#D4AF37] text-xs uppercase tracking-widest">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t.synthesizing}
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-[#D4AF37] p-8 max-w-md w-full text-center relative"
            >
              <button
                onClick={() => setShowPaywall(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-8 h-8 text-[#D4AF37]" />
              </div>
              
              <h2 className="text-2xl font-serif font-bold text-[#D4AF37] mb-2 uppercase tracking-widest">
                {t.proFeature}
              </h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                {t.proDesc}
              </p>
              
              <div className="space-y-4 mb-8 text-left">
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                  <span>Exportation PDF Illimitée</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                  <span>Analyse Vocale en Direct (Live Talk)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                  <span>Analyses de Marché Profondes</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                  <span>Accès Prioritaire au Moteur Stratégique</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  window.open('https://wa.me/261340000000', '_blank'); // Replace with your number
                }}
                className="w-full py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-opacity"
              >
                {t.unlockNow} (Mvola / PayPal)
              </button>
              
              <p className="mt-4 text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">
                {language === 'fr' 
                  ? "Paiement local par Mvola ou International par PayPal. Contactez-nous sur WhatsApp pour recevoir les instructions et activer votre compte."
                  : "Local payment via Mvola or International via PayPal. Contact us on WhatsApp for instructions and account activation."}
              </p>
              
              <p className="mt-4 text-[10px] text-gray-600 uppercase tracking-widest">
                Gestion Smart • Elite Membership
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-[#D4AF37]/30 p-8 rounded-sm max-w-sm w-full space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-[#D4AF37] text-lg font-serif uppercase tracking-widest">{t.settings}</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 block">{t.language}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['en', 'fr', 'es', 'zh', 'ar', 'ja', 'de'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setShowSettings(false);
                        }}
                        className={cn(
                          "p-3 text-left text-xs border transition-all rounded-sm",
                          language === lang 
                            ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]" 
                            : "border-white/5 hover:border-white/20 text-gray-400"
                        )}
                      >
                        {lang === 'en' ? 'English' : 
                         lang === 'fr' ? 'Français' : 
                         lang === 'es' ? 'Español' :
                         lang === 'zh' ? '中文' :
                         lang === 'ar' ? 'العربية' :
                         lang === 'ja' ? '日本語' : 'Deutsch'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  {profile?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setShowAdminPanel(true);
                        setShowSettings(false);
                      }}
                      className="w-full py-3 border border-[#D4AF37] text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold hover:bg-[#D4AF37]/10 transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {t.adminPanel}
                    </button>
                  )}
                  
                  {user && (
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 border border-red-500/30 text-red-500 text-[10px] uppercase tracking-widest font-bold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      {t.logout}
                    </button>
                  )}

                  <h4 className="text-[10px] text-[#D4AF37] uppercase tracking-widest mb-4">{t.installApp}</h4>
                  <div className="bg-black/40 p-4 border border-white/5 rounded-sm">
                    <p className="text-[10px] text-gray-400 mb-4">{t.installDesc}</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white">1</div>
                        <span>{language === 'fr' ? "Sur iOS : Appuyez sur 'Partager' puis 'Sur l'écran d'accueil'" : "On iOS: Tap 'Share' then 'Add to Home Screen'"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white">2</div>
                        <span>{language === 'fr' ? "Sur Android : Appuyez sur les 3 points puis 'Installer l'application'" : "On Android: Tap menu then 'Install App'"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-3 bg-[#D4AF37] text-black text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity"
              >
                {t.close}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 border-t border-[#D4AF37]/20 bg-black">
        {/* File Preview */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#111] border border-[#D4AF37]/30 px-2 py-1 rounded-sm text-[10px]">
                <FileText className="w-3 h-3 text-[#D4AF37]" />
                <span className="max-w-[100px] truncate">{file.name}</span>
                <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3 bg-[#111] border border-[#D4AF37]/20 p-2 rounded-sm">
          <label className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-sm cursor-pointer transition-colors">
            <Upload className="w-5 h-5" />
            <input 
              type="file" 
              multiple 
              accept=".pdf,.txt" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32 scrollbar-hide"
            rows={1}
          />
          <button
            onClick={toggleRecording}
            className={cn(
              "p-2 transition-colors rounded-sm",
              isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "text-[#D4AF37] hover:bg-[#D4AF37]/10"
            )}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || (!inputText.trim() && files.length === 0)}
            className="p-2 bg-[#D4AF37] text-black rounded-sm hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[9px] text-center text-gray-600 mt-3 uppercase tracking-widest">
          Gestion Smart AI Strategist v1.5 PRO • SECURE EXECUTIVE CHANNEL
        </p>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-[#D4AF37]/30 p-8 rounded-sm max-w-sm w-full space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-[#D4AF37] text-lg font-serif uppercase tracking-widest">
                  {authMode === 'login' ? t.login : t.signup}
                </h3>
                <button onClick={() => setShowAuthModal(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block">{t.email}</label>
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    className="w-full bg-black border border-white/10 p-3 text-sm focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block">{t.password}</label>
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    className="w-full bg-black border border-white/10 p-3 text-sm focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                {authError && <p className="text-red-500 text-[10px] uppercase tracking-widest">{authError}</p>}
                
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#D4AF37] text-black text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity"
                >
                  {authMode === 'login' ? t.login : t.signup}
                </button>
              </form>

              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="w-full text-[10px] text-gray-500 uppercase tracking-widest hover:text-[#D4AF37] transition-colors"
              >
                {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-[#D4AF37]/30 p-8 rounded-sm max-w-2xl w-full space-y-6 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                  <h3 className="text-[#D4AF37] text-lg font-serif uppercase tracking-widest">{t.adminPanel}</h3>
                </div>
                <button onClick={() => setShowAdminPanel(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest">{t.pendingRequests} ({pendingUsers.length})</h4>
                {pendingUsers.length === 0 ? (
                  <p className="text-gray-600 text-xs italic">No pending activations.</p>
                ) : (
                  <div className="space-y-2">
                    {pendingUsers.map((u) => (
                      <div key={u.id} className="bg-black/40 border border-white/5 p-4 flex items-center justify-between rounded-sm">
                        <div>
                          <p className="text-sm font-medium text-gray-200">{u.email}</p>
                          <p className="text-[9px] text-gray-500 uppercase tracking-widest">ID: {u.id}</p>
                        </div>
                        <button 
                          onClick={() => activateUser(u.id)}
                          className="px-4 py-2 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm"
                        >
                          {t.activateUser}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
