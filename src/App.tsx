import { useState } from "react";
import Icon from "@/components/ui/icon";

// ==================== ТИПЫ ====================
type Page = "home" | "feed" | "messenger" | "profile" | "account" | "admin";

interface Notification {
  id: number;
  type: "message" | "comment" | "reaction" | "follow";
  text: string;
  time: string;
  read: boolean;
  avatar: string;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  liked: boolean;
  tag: string;
}

interface Message {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
  online: boolean;
  unread: number;
}

// ==================== ДАННЫЕ ====================
const NOTIFICATIONS: Notification[] = [
  { id: 1, type: "message", text: "Алекс написал вам сообщение", time: "2 мин", read: false, avatar: "А" },
  { id: 2, type: "reaction", text: "Мария поставила 🔥 на ваш пост", time: "15 мин", read: false, avatar: "М" },
  { id: 3, type: "comment", text: "Дима прокомментировал: «Супер!»", time: "1 ч", read: false, avatar: "Д" },
  { id: 4, type: "follow", text: "Катя начала на вас подписку", time: "3 ч", read: true, avatar: "К" },
  { id: 5, type: "reaction", text: "Иван поставил ❤️ на ваш пост", time: "5 ч", read: true, avatar: "И" },
];

const POSTS: Post[] = [
  { id: 1, author: "Александра Миронова", avatar: "А", content: "Запустили новую версию проекта 🚀 Три месяца работы и наконец-то это в продакшне. Спасибо всей команде за терпение и ночные сессии!", likes: 234, comments: 47, time: "5 мин назад", liked: false, tag: "Разработка" },
  { id: 2, author: "Максим Орлов", avatar: "М", content: "Кто-нибудь пробовал новые нейросети для генерации UI? Поделитесь впечатлениями — ищу что-то стоящее для рабочих задач.", likes: 89, comments: 23, time: "32 мин назад", liked: true, tag: "AI/ML" },
  { id: 3, author: "Полина Звезда", avatar: "П", content: "Утренняя пробежка в 5:30 AM — лучшее что я сделала этим летом. Советую всем попробовать хотя бы неделю. Энергия зашкаливает весь день ✨", likes: 412, comments: 68, time: "1 ч назад", liked: false, tag: "Лайфстайл" },
  { id: 4, author: "Кирилл Власов", avatar: "К", content: "Открытие месяца: TypeScript дженерики это не страшно, если потратить 2 часа на нормальный туториал. Всем кто боится — дерзайте!", likes: 156, comments: 34, time: "2 ч назад", liked: false, tag: "Разработка" },
];

const MESSAGES: Message[] = [
  { id: 1, author: "Алекс Новиков", avatar: "А", text: "Привет! Как дела с проектом?", time: "только что", online: true, unread: 3 },
  { id: 2, author: "Мария Светлова", avatar: "М", text: "Посмотри мой последний пост!", time: "5 мин", online: true, unread: 1 },
  { id: 3, author: "Команда ЧатСферы", avatar: "Ч", text: "Добро пожаловать на платформу!", time: "1 ч", online: false, unread: 0 },
  { id: 4, author: "Дима Ковалёв", avatar: "Д", text: "Встреча в среду в 15:00?", time: "3 ч", online: false, unread: 0 },
  { id: 5, author: "Катя Романова", avatar: "К", text: "Спасибо за реакцию на пост 🔥", time: "вчера", online: true, unread: 0 },
];

// ==================== КОМПОНЕНТЫ ====================

function Avatar({ letter, size = "md", color = "purple", online = false }: {
  letter: string; size?: "sm" | "md" | "lg" | "xl"; color?: string; online?: boolean;
}) {
  const sizes = { sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-12 h-12 text-lg", xl: "w-16 h-16 text-2xl" };
  const colors: Record<string, string> = {
    purple: "from-purple-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    orange: "from-orange-500 to-red-500",
    green: "from-green-500 to-emerald-500",
    pink: "from-pink-500 to-rose-500",
  };
  return (
    <div className={`relative inline-flex ${online ? "status-online" : ""}`}>
      <div className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${colors[color] || colors.purple} flex items-center justify-center font-bold text-white font-montserrat flex-shrink-0`}>
        {letter}
      </div>
    </div>
  );
}

function NotifBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NavItem({ icon, label, active, onClick, badge = 0 }: {
  icon: string; label: string; active: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200
        ${active ? "bg-purple-500/20 text-purple-300" : "text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/5"}`}
    >
      <div className="relative">
        <Icon name={icon as never} size={22} />
        <NotifBadge count={badge} />
      </div>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
      {active && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />}
    </button>
  );
}

// ==================== СТРАНИЦЫ ====================

function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="relative overflow-hidden noise-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/20 to-orange-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="relative z-10 px-6 pt-12 pb-10 text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 animate-fade-in">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-neon" />
            <span className="text-xs text-green-400 font-medium">2 847 онлайн прямо сейчас</span>
          </div>
          <h1 className="font-montserrat font-black text-4xl mb-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="gradient-text">ЧатСфера</span>
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-base mb-8 animate-fade-in leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Общайся, делись моментами<br />и находи единомышленников
          </p>
          <div className="flex gap-3 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <button onClick={() => setPage("feed")} className="btn-gradient text-white font-semibold px-6 py-3 rounded-2xl text-sm">
              Открыть ленту
            </button>
            <button onClick={() => setPage("messenger")} className="glass glass-hover text-white font-semibold px-6 py-3 rounded-2xl text-sm">
              Сообщения
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <h2 className="font-montserrat font-bold text-lg text-white">Быстрый доступ</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "Rss", label: "Лента", desc: "Новые посты", color: "from-purple-600/30 to-pink-600/20", border: "border-purple-500/20", page: "feed" as Page },
            { icon: "MessageCircle", label: "Мессенджер", desc: "3 новых", color: "from-blue-600/30 to-cyan-600/20", border: "border-blue-500/20", page: "messenger" as Page },
            { icon: "User", label: "Профиль", desc: "Мои публикации", color: "from-orange-600/30 to-yellow-600/20", border: "border-orange-500/20", page: "profile" as Page },
            { icon: "Settings", label: "Кабинет", desc: "Настройки", color: "from-emerald-600/30 to-teal-600/20", border: "border-emerald-500/20", page: "account" as Page },
          ].map((item, i) => (
            <button
              key={item.page}
              onClick={() => setPage(item.page)}
              className={`glass glass-hover bg-gradient-to-br ${item.color} border ${item.border} rounded-3xl p-4 text-left transition-all duration-200 animate-scale-in`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <Icon name={item.icon as never} size={24} className="text-white mb-3 opacity-90" />
              <div className="font-montserrat font-bold text-white text-sm">{item.label}</div>
              <div className="text-xs text-white/50 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>

        <div className="glass rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="TrendingUp" size={18} className="text-purple-400" />
            <h3 className="font-montserrat font-bold text-white text-sm">В тренде</h3>
          </div>
          <div className="space-y-3">
            {["#разработка", "#AI_ML", "#лайфстайл", "#стартапы"].map((tag, i) => (
              <div key={tag} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-purple-300">{tag}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{[234, 189, 156, 98][i]} публикаций</div>
                </div>
                <div className="text-xs text-emerald-400 font-medium">+{[12, 8, 5, 3][i]}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [activeFilter, setActiveFilter] = useState("Все");
  const filters = ["Все", "Разработка", "AI/ML", "Лайфстайл"];

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const filtered = activeFilter === "Все" ? posts : posts.filter(p => p.tag === activeFilter);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <div className="glass rounded-3xl p-4 flex items-center gap-3">
          <Avatar letter="Я" size="md" color="purple" />
          <div className="flex-1 bg-white/5 rounded-2xl px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] cursor-pointer hover:bg-white/8 transition-colors">
            Что нового?
          </div>
          <button className="btn-gradient text-white p-2.5 rounded-2xl">
            <Icon name="Plus" size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${activeFilter === f ? "btn-gradient text-white" : "glass text-[hsl(var(--muted-foreground))] hover:text-white"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="px-4 pb-6 space-y-4">
        {filtered.map((post, i) => (
          <div key={post.id} className="glass rounded-3xl p-5 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-start gap-3 mb-3">
              <Avatar letter={post.avatar} size="md" color={["purple", "blue", "pink", "orange"][i % 4]} online={i < 2} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">{post.author}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{post.time}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/15 text-purple-300 font-medium">{post.tag}</span>
            </div>
            <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed mb-4 opacity-90">{post.content}</p>
            <div className="divider-gradient mb-4" />
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${post.liked ? "text-pink-400" : "text-[hsl(var(--muted-foreground))] hover:text-pink-400"}`}
              >
                <Icon name="Heart" size={16} />
                {post.likes}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-blue-400 transition-colors">
                <Icon name="MessageCircle" size={16} />
                {post.comments}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-purple-400 transition-colors ml-auto">
                <Icon name="Share2" size={16} />
              </button>
              <button className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-yellow-400 transition-colors">
                <Icon name="Bookmark" size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessengerPage() {
  const [active, setActive] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState("");
  type ChatMsg = { from: "me" | "them"; text: string };
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { from: "them", text: "Привет! Как дела с проектом?" },
    { from: "me", text: "Привет! Всё отлично, почти закончили!" },
    { from: "them", text: "Здорово, жду результата 🚀" },
  ]);

  const sendMessage = () => {
    if (!inputVal.trim()) return;
    setChatMessages(prev => [...prev, { from: "me", text: inputVal }]);
    setInputVal("");
  };

  if (active !== null) {
    const contact = MESSAGES.find(m => m.id === active)!;
    return (
      <div className="flex-1 flex flex-col">
        <div className="glass px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setActive(null)} className="text-[hsl(var(--muted-foreground))] hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <Avatar letter={contact.avatar} size="md" color="purple" online={contact.online} />
          <div className="flex-1">
            <div className="font-semibold text-white text-sm">{contact.author}</div>
            <div className={`text-xs ${contact.online ? "text-emerald-400" : "text-[hsl(var(--muted-foreground))]"}`}>
              {contact.online ? "онлайн" : "не в сети"}
            </div>
          </div>
          <button className="text-[hsl(var(--muted-foreground))] hover:text-white">
            <Icon name="MoreVertical" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} animate-fade-in`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${msg.from === "me" ? "btn-gradient text-white rounded-br-sm" : "glass text-[hsl(var(--foreground))] rounded-bl-sm"}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="glass px-4 py-3 border-t border-white/5 flex items-center gap-3">
          <button className="text-[hsl(var(--muted-foreground))] hover:text-purple-400 transition-colors">
            <Icon name="Paperclip" size={20} />
          </button>
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Написать сообщение..."
            className="flex-1 bg-white/5 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:bg-white/8 transition-colors"
          />
          <button onClick={sendMessage} className="btn-gradient text-white p-2.5 rounded-2xl">
            <Icon name="Send" size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-3">
          <Icon name="Search" size={16} className="text-[hsl(var(--muted-foreground))]" />
          <input placeholder="Поиск по сообщениям..." className="flex-1 bg-transparent text-sm outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>
      <div className="px-4 py-2 space-y-1">
        {MESSAGES.map((msg, i) => (
          <button
            key={msg.id}
            onClick={() => setActive(msg.id)}
            className="w-full glass glass-hover rounded-3xl p-4 flex items-center gap-3 text-left animate-fade-in"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <Avatar letter={msg.avatar} size="md" color={["purple", "pink", "blue", "orange", "green"][i % 5]} online={msg.online} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-white text-sm truncate">{msg.author}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] flex-shrink-0 ml-2">{msg.time}</span>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{msg.text}</p>
            </div>
            {msg.unread > 0 && (
              <span className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {msg.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  const stats = [
    { label: "Постов", value: "47" },
    { label: "Подписчики", value: "1.2K" },
    { label: "Подписки", value: "234" },
  ];
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.3)_0%,transparent_70%)]" />
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-8 mb-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white font-montserrat ring-4 ring-[hsl(var(--background))]">
            Я
          </div>
          <button className="glass glass-hover px-4 py-2 rounded-2xl text-sm font-medium text-white">
            Редактировать
          </button>
        </div>
        <h2 className="font-montserrat font-bold text-white text-xl">Иван Иванов</h2>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">Разработчик · Москва</p>
        <p className="text-sm text-[hsl(var(--foreground))] mt-3 opacity-80 leading-relaxed">Создаю продукты, которые меняют жизнь к лучшему 🚀 Люблю чистый код и хороший кофе.</p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {stats.map(s => (
            <div key={s.label} className="glass rounded-2xl p-3 text-center">
              <div className="font-montserrat font-black text-white text-xl gradient-text">{s.value}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="divider-gradient mx-4" />
      <div className="px-4 pt-4 pb-6 space-y-3">
        <h3 className="font-montserrat font-bold text-white">Мои публикации</h3>
        {POSTS.slice(0, 2).map((post, i) => (
          <div key={post.id} className="glass rounded-3xl p-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <p className="text-sm text-[hsl(var(--foreground))] opacity-90 leading-relaxed mb-3">{post.content}</p>
            <div className="flex gap-4 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1"><Icon name="Heart" size={12} /> {post.likes}</span>
              <span className="flex items-center gap-1"><Icon name="MessageCircle" size={12} /> {post.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountPage() {
  const sections = [
    { icon: "User", label: "Личные данные", desc: "Имя, фото, контакты" },
    { icon: "Bell", label: "Уведомления", desc: "Сообщения, реакции, комментарии" },
    { icon: "Lock", label: "Безопасность", desc: "Пароль, 2FA, сессии" },
    { icon: "Eye", label: "Приватность", desc: "Кто видит ваши данные" },
    { icon: "Palette", label: "Внешний вид", desc: "Тема, размер шрифта" },
    { icon: "CreditCard", label: "Подписка", desc: "ЧатСфера Pro — активна" },
  ];
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="glass rounded-3xl p-5 flex items-center gap-4 mb-6">
        <Avatar letter="Я" size="lg" color="purple" online />
        <div className="flex-1">
          <div className="font-montserrat font-bold text-white">Иван Иванов</div>
          <div className="text-sm text-[hsl(var(--muted-foreground))]">ivan@example.com</div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
            <Icon name="Star" size={10} />
            Pro аккаунт
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {sections.map((s, i) => (
          <button
            key={s.label}
            className="w-full glass glass-hover rounded-2xl px-4 py-4 flex items-center gap-4 text-left animate-fade-in"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 flex items-center justify-center">
              <Icon name={s.icon as never} size={18} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white text-sm">{s.label}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.desc}</div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-[hsl(var(--muted-foreground))]" />
          </button>
        ))}
      </div>
      <div className="mt-6">
        <button className="w-full glass rounded-2xl px-4 py-4 flex items-center gap-4 text-left hover:bg-red-500/10 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-red-500/15 flex items-center justify-center">
            <Icon name="LogOut" size={18} className="text-red-400" />
          </div>
          <span className="font-semibold text-red-400 text-sm">Выйти из аккаунта</span>
        </button>
      </div>
    </div>
  );
}

function AdminPage() {
  const stats = [
    { icon: "Users", label: "Всего пользователей", value: "12 847", change: "+127 сегодня", color: "text-purple-400", bg: "bg-purple-500/15" },
    { icon: "Rss", label: "Постов за день", value: "3 421", change: "+8.3%", color: "text-blue-400", bg: "bg-blue-500/15" },
    { icon: "MessageCircle", label: "Сообщений сегодня", value: "48 923", change: "+15.2%", color: "text-pink-400", bg: "bg-pink-500/15" },
    { icon: "TrendingUp", label: "Активность", value: "94.2%", change: "Высокая", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  ];
  const users = [
    { name: "Александра М.", email: "alex@ex.com", status: "active", role: "Пользователь" },
    { name: "Максим О.", email: "max@ex.com", status: "active", role: "Модератор" },
    { name: "Полина З.", email: "pol@ex.com", status: "banned", role: "Пользователь" },
  ];
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Icon name="Shield" size={16} className="text-white" />
        </div>
        <h2 className="font-montserrat font-bold text-white text-lg">Панель администратора</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={s.label} className="glass rounded-3xl p-4 animate-scale-in" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className={`w-9 h-9 ${s.bg} rounded-2xl flex items-center justify-center mb-3`}>
              <Icon name={s.icon as never} size={18} className={s.color} />
            </div>
            <div className="font-montserrat font-black text-white text-xl">{s.value}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
            <div className="text-xs text-emerald-400 mt-1 font-medium">{s.change}</div>
          </div>
        ))}
      </div>
      <div className="glass rounded-3xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat font-bold text-white text-sm">Пользователи</h3>
          <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Все →</button>
        </div>
        <div className="space-y-3">
          {users.map((u, i) => (
            <div key={u.name} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <Avatar letter={u.name[0]} size="sm" color={["purple", "blue", "orange"][i]} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{u.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">{u.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300">{u.role}</span>
                <span className={`w-2 h-2 rounded-full ${u.status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: "UserPlus", label: "Добавить пользователя", bg: "bg-purple-500/15", color: "text-purple-300" },
          { icon: "Flag", label: "Жалобы (3)", bg: "bg-red-500/15", color: "text-red-300" },
          { icon: "BarChart2", label: "Статистика", bg: "bg-blue-500/15", color: "text-blue-300" },
          { icon: "Settings", label: "Настройки сайта", bg: "bg-emerald-500/15", color: "text-emerald-300" },
        ].map(a => (
          <button key={a.label} className="glass glass-hover rounded-2xl p-3 flex items-center gap-2 text-left">
            <div className={`w-8 h-8 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={a.icon as never} size={16} className={a.color} />
            </div>
            <span className="text-xs font-medium text-white leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== УВЕДОМЛЕНИЯ ====================
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState<Notification[]>(NOTIFICATIONS);
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const typeIcon: Record<string, string> = { message: "MessageCircle", comment: "MessageSquare", reaction: "Heart", follow: "UserPlus" };
  const typeColor: Record<string, string> = { message: "text-blue-400", comment: "text-purple-400", reaction: "text-pink-400", follow: "text-emerald-400" };

  return (
    <div className="absolute inset-0 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div className="w-80 h-full glass border-l border-white/10 flex flex-col animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-montserrat font-bold text-white">Уведомления</h3>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Прочитать все</button>
            <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-white transition-colors">
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifs.map((n, i) => (
            <div
              key={n.id}
              className={`px-4 py-4 border-b border-white/5 flex items-start gap-3 transition-colors hover:bg-white/5 cursor-pointer animate-fade-in ${!n.read ? "bg-purple-500/5" : ""}`}
              style={{ animationDelay: `${i * 0.06}s` }}
              onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
            >
              <div className="relative">
                <Avatar letter={n.avatar} size="sm" color={["purple", "pink", "blue", "green", "orange"][i % 5]} />
                {!n.read && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-400 rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[hsl(var(--foreground))] leading-snug opacity-90">{n.text}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Icon name={typeIcon[n.type] as never} size={11} className={typeColor[n.type]} />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{n.time} назад</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== ГЛАВНЫЙ КОМПОНЕНТ ====================
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;
  const unreadMessages = MESSAGES.reduce((acc, m) => acc + m.unread, 0);

  const navItems: { icon: string; label: string; page: Page; badge?: number }[] = [
    { icon: "Home", label: "Главная", page: "home" },
    { icon: "Rss", label: "Лента", page: "feed" },
    { icon: "MessageCircle", label: "Чаты", page: "messenger", badge: unreadMessages },
    { icon: "User", label: "Профиль", page: "profile" },
    { icon: "Settings", label: "Кабинет", page: "account" },
    { icon: "Shield", label: "Админка", page: "admin" },
  ];

  const pageTitles: Record<Page, string> = {
    home: "ЧатСфера",
    feed: "Лента",
    messenger: "Сообщения",
    profile: "Мой профиль",
    account: "Личный кабинет",
    admin: "Администрирование",
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col max-w-md mx-auto relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-700/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-700/8 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 glass border-b border-white/5 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h1 className="font-montserrat font-black text-xl gradient-text">{pageTitles[page]}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifs(true)}
            className="relative w-9 h-9 rounded-2xl glass glass-hover flex items-center justify-center"
          >
            <Icon name="Bell" size={18} className="text-white" />
            <NotifBadge count={unreadCount} />
          </button>
          <button
            onClick={() => setPage("profile")}
            className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm font-montserrat"
          >
            Я
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10" key={page}>
        {page === "home" && <HomePage setPage={setPage} />}
        {page === "feed" && <FeedPage />}
        {page === "messenger" && <MessengerPage />}
        {page === "profile" && <ProfilePage />}
        {page === "account" && <AccountPage />}
        {page === "admin" && <AdminPage />}
      </main>

      <nav className="relative z-10 glass border-t border-white/5 px-2 py-1 flex items-center justify-around flex-shrink-0">
        {navItems.map(item => (
          <NavItem
            key={item.page}
            icon={item.icon}
            label={item.label}
            active={page === item.page}
            onClick={() => setPage(item.page)}
            badge={item.badge}
          />
        ))}
      </nav>

      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
    </div>
  );
}
