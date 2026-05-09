import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/31457deb-e02e-4825-a18a-ecf359cba65e";

// ==================== ТИПЫ ====================
type Page = "home" | "feed" | "messenger" | "profile" | "account" | "admin";

interface User {
  id: number;
  username: string;
  role: "admin" | "user";
}

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

const POSTS: Post[] = [];
const MESSAGES: Message[] = [];

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
        {letter.toUpperCase()}
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

// ==================== 18+ ЗАСТАВКА ====================
function AgeGate({ onAccept }: { onAccept: () => void }) {
  const decline = () => {
    window.location.href = "https://yandex.ru";
  };
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-sm w-full text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6 glow-orange">
          <span className="font-montserrat font-black text-white text-2xl">18+</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl text-white mb-3">
          <span className="gradient-text">ЧатСфера 18+</span>
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed mb-8">
          Данный сайт предназначен <span className="text-white font-semibold">строго для лиц старше 18 лет</span>. Продолжая, вы подтверждаете своё совершеннолетие.
        </p>
        <div className="glass rounded-3xl p-5 mb-6 text-left">
          <div className="flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              На сайте могут содержаться материалы для взрослых. Вход для лиц младше 18 лет запрещён законодательством.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={onAccept}
            className="btn-gradient text-white font-bold py-4 rounded-2xl text-base w-full"
          >
            Мне 18+ — войти на сайт
          </button>
          <button
            onClick={decline}
            className="glass text-[hsl(var(--muted-foreground))] hover:text-white font-medium py-3.5 rounded-2xl text-sm w-full transition-colors"
          >
            Мне меньше 18 лет — покинуть сайт
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== ФОРМА ВХОДА ====================
function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Введите логин и пароль");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username: username.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onLogin(data.user);
      } else {
        setError(data.error || "Ошибка входа");
      }
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-sm w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-montserrat font-black text-3xl mb-2">
            <span className="gradient-text">ЧатСфера 18+</span>
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">Войдите в свой аккаунт</p>
        </div>
        <div className="glass rounded-3xl p-6 space-y-4">
          <div>
            <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block">Логин</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Введите логин"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Введите пароль"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2.5">
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full btn-gradient text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-50 transition-opacity"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </div>
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-4">
          Регистрация доступна только по приглашению администратора
        </p>
      </div>
    </div>
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
            <span className="text-xs text-green-400 font-medium">Добро пожаловать</span>
          </div>
          <h1 className="font-montserrat font-black text-4xl mb-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="gradient-text">ЧатСфера 18+</span>
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
            { icon: "MessageCircle", label: "Мессенджер", desc: "Личные чаты", color: "from-blue-600/30 to-cyan-600/20", border: "border-blue-500/20", page: "messenger" as Page },
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
        <div className="glass rounded-3xl p-5 text-center">
          <Icon name="TrendingUp" size={32} className="text-purple-400/40 mx-auto mb-3" />
          <div className="text-sm font-semibold text-white/60">Тренды появятся по мере роста аудитории</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Здесь будут популярные темы и хэштеги</div>
        </div>
      </div>
    </div>
  );
}

function FeedPage({ user }: { user: User }) {
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [activeFilter, setActiveFilter] = useState("Все");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState("Разработка");
  const filters = ["Все", "Разработка", "AI/ML", "Лайфстайл"];
  const isAdmin = user.role === "admin";

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const addPost = () => {
    if (!newContent.trim()) return;
    const post: Post = {
      id: Date.now(),
      author: user.username,
      avatar: user.username[0],
      content: newContent,
      likes: 0,
      comments: 0,
      time: "только что",
      liked: false,
      tag: newTag,
    };
    setPosts(prev => [post, ...prev]);
    setNewContent("");
    setShowNewPost(false);
  };

  const filtered = activeFilter === "Все" ? posts : posts.filter(p => p.tag === activeFilter);

  return (
    <div className="flex-1 overflow-y-auto">
      {isAdmin && (
        <div className="px-4 pt-4 pb-2">
          {showNewPost ? (
            <div className="glass rounded-3xl p-4 space-y-3 animate-fade-in">
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Что нового?"
                rows={3}
                className="w-full bg-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none resize-none focus:bg-white/8 transition-colors"
              />
              <div className="flex gap-2 flex-wrap">
                {filters.slice(1).map(f => (
                  <button
                    key={f}
                    onClick={() => setNewTag(f)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${newTag === f ? "btn-gradient text-white" : "glass text-[hsl(var(--muted-foreground))]"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={addPost} className="btn-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-2xl flex-1">Опубликовать</button>
                <button onClick={() => setShowNewPost(false)} className="glass text-[hsl(var(--muted-foreground))] text-sm px-4 py-2.5 rounded-2xl">Отмена</button>
              </div>
            </div>
          ) : (
            <div className="glass rounded-3xl p-4 flex items-center gap-3">
              <Avatar letter={user.username[0]} size="md" color="purple" />
              <div
                onClick={() => setShowNewPost(true)}
                className="flex-1 bg-white/5 rounded-2xl px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] cursor-pointer hover:bg-white/8 transition-colors"
              >
                Что нового?
              </div>
              <button onClick={() => setShowNewPost(true)} className="btn-gradient text-white p-2.5 rounded-2xl">
                <Icon name="Plus" size={18} />
              </button>
            </div>
          )}
        </div>
      )}

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

      <div className="px-4 pb-6">
        {filtered.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center animate-fade-in">
            <Icon name="Rss" size={40} className="text-purple-400/30 mx-auto mb-4" />
            <div className="font-montserrat font-bold text-white/60 text-base mb-2">Лента пуста</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              {isAdmin ? "Напишите первый пост выше" : "Публикации ещё не появились"}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post, i) => (
              <div key={post.id} className="glass rounded-3xl p-5 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="flex items-start gap-3 mb-3">
                  <Avatar letter={post.avatar} size="md" color={["purple", "blue", "pink", "orange"][i % 4]} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{post.author}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{post.time}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/15 text-purple-300 font-medium">{post.tag}</span>
                </div>
                <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed mb-4 opacity-90">{post.content}</p>
                <div className="divider-gradient mb-4" />
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${post.liked ? "text-pink-400" : "text-[hsl(var(--muted-foreground))] hover:text-pink-400"}`}>
                    <Icon name="Heart" size={16} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-blue-400 transition-colors">
                    <Icon name="MessageCircle" size={16} /> {post.comments}
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
        )}
      </div>
    </div>
  );
}

type ChatType = "dm" | "group" | "channel";
interface ChatRoom {
  id: number;
  name: string;
  type: ChatType;
  avatar: string;
  lastMsg: string;
  time: string;
  color: string;
  members?: number;
}
type ChatMsg = { from: "me" | "them"; text: string; author?: string };

function MessengerPage({ user }: { user: User }) {
  const isAdmin = user.role === "admin";
  const [tab, setTab] = useState<ChatType>("dm");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const createRoom = () => {
    if (!newName.trim()) return;
    setCreating(true);
    const room: ChatRoom = {
      id: Date.now(),
      name: newName.trim(),
      type: tab === "dm" ? "group" : tab,
      avatar: newName.trim()[0],
      lastMsg: newDesc.trim() || "Чат создан",
      time: "только что",
      color: tab === "group" ? "blue" : "orange",
      members: 1,
    };
    setRooms(prev => [room, ...prev]);
    setNewName("");
    setNewDesc("");
    setShowCreate(false);
    setCreating(false);
    setActiveRoom(room);
    setChatMessages([{ from: "them", text: tab === "channel" ? "Канал создан. Публикуйте сообщения для подписчиков." : "Группа создана. Добавьте участников.", author: "Система" }]);
  };

  const sendMessage = () => {
    if (!inputVal.trim()) return;
    setChatMessages(prev => [...prev, { from: "me", text: inputVal, author: user.username }]);
    setInputVal("");
  };

  const tabRooms = rooms.filter(r => tab === "dm" ? r.type === "dm" : r.type === tab);

  // Экран чата
  if (activeRoom) {
    const isChannel = activeRoom.type === "channel";
    const canSend = !isChannel || isAdmin;
    return (
      <div className="flex-1 flex flex-col">
        <div className="glass px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setActiveRoom(null)} className="text-[hsl(var(--muted-foreground))] hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${activeRoom.type === "channel" ? "from-orange-500 to-red-500" : "from-blue-500 to-cyan-500"} flex items-center justify-center font-bold text-white font-montserrat flex-shrink-0`}>
            {activeRoom.avatar.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white text-sm">{activeRoom.name}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
              {activeRoom.type === "channel" ? <><Icon name="Radio" size={10} /> Канал</> : <><Icon name="Users" size={10} /> Группа · {activeRoom.members} участник</>}
            </div>
          </div>
          {isAdmin && <button className="text-[hsl(var(--muted-foreground))] hover:text-white"><Icon name="Settings" size={18} /></button>}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pt-10">
              <Icon name={isChannel ? "Radio" : "Users"} size={40} className="text-purple-400/30 mb-4" />
              <div className="text-sm font-semibold text-white/50">{isChannel ? "Канал пуст" : "Группа создана"}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{isChannel ? "Публикуйте первое сообщение" : "Начните общение"}</div>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} animate-fade-in`}>
              <div>
                {msg.from === "them" && msg.author && (
                  <div className="text-[10px] text-purple-300 mb-1 px-1">{msg.author}</div>
                )}
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${msg.from === "me" ? "btn-gradient text-white rounded-br-sm" : "glass text-[hsl(var(--foreground))] rounded-bl-sm"}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        {canSend ? (
          <div className="glass px-4 py-3 border-t border-white/5 flex items-center gap-3">
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder={isChannel ? "Написать в канал..." : "Написать сообщение..."}
              className="flex-1 bg-white/5 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:bg-white/8 transition-colors"
            />
            <button onClick={sendMessage} className="btn-gradient text-white p-2.5 rounded-2xl">
              <Icon name="Send" size={18} />
            </button>
          </div>
        ) : (
          <div className="glass px-4 py-3 border-t border-white/5 text-center text-xs text-[hsl(var(--muted-foreground))]">
            Только администраторы могут писать в этот канал
          </div>
        )}
      </div>
    );
  }

  // Список чатов
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Поиск */}
      <div className="px-4 pt-4 pb-2">
        <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-3">
          <Icon name="Search" size={16} className="text-[hsl(var(--muted-foreground))]" />
          <input placeholder="Поиск..." className="flex-1 bg-transparent text-sm outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2 px-4 pb-3">
        {([
          { key: "dm", label: "Личные", icon: "MessageCircle" },
          { key: "group", label: "Группы", icon: "Users" },
          { key: "channel", label: "Каналы", icon: "Radio" },
        ] as { key: ChatType; label: string; icon: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setShowCreate(false); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-2xl text-xs font-semibold transition-all
              ${tab === t.key ? "btn-gradient text-white" : "glass text-[hsl(var(--muted-foreground))] hover:text-white"}`}
          >
            <Icon name={t.icon as never} size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Кнопка создать (только для админов и только в группах/каналах) */}
      {isAdmin && tab !== "dm" && (
        <div className="px-4 mb-3">
          {showCreate ? (
            <div className="glass rounded-3xl p-4 space-y-3 animate-fade-in">
              <div className="text-sm font-semibold text-white">
                {tab === "group" ? "Новая группа" : "Новый канал"}
              </div>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={tab === "group" ? "Название группы" : "Название канала"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50 transition-colors"
              />
              <input
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Описание (необязательно)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50 transition-colors"
              />
              <div className="flex gap-2">
                <button onClick={createRoom} disabled={creating || !newName.trim()} className="btn-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex-1 disabled:opacity-50">
                  Создать
                </button>
                <button onClick={() => setShowCreate(false)} className="glass text-[hsl(var(--muted-foreground))] text-sm px-4 py-2.5 rounded-xl">
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full glass glass-hover border border-dashed border-purple-500/30 rounded-2xl py-3 flex items-center justify-center gap-2 text-sm text-purple-300 hover:text-purple-200 transition-colors"
            >
              <Icon name="Plus" size={16} />
              {tab === "group" ? "Создать группу" : "Создать канал"}
            </button>
          )}
        </div>
      )}

      {/* Список */}
      <div className="px-4 pb-6 space-y-1">
        {tabRooms.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center animate-fade-in">
            <Icon name={tab === "channel" ? "Radio" : tab === "group" ? "Users" : "MessageCircle"} size={40} className="text-purple-400/30 mx-auto mb-4" />
            <div className="font-montserrat font-bold text-white/60 text-base mb-2">
              {tab === "dm" ? "Нет сообщений" : tab === "group" ? "Нет групп" : "Нет каналов"}
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              {tab === "dm" ? "Здесь появятся ваши диалоги" :
               tab === "group" ? (isAdmin ? "Создайте первую группу выше" : "Групп пока нет") :
               isAdmin ? "Создайте первый канал выше" : "Каналов пока нет"}
            </div>
          </div>
        ) : (
          tabRooms.map((room, i) => (
            <button
              key={room.id}
              onClick={() => { setActiveRoom(room); setChatMessages([]); }}
              className="w-full glass glass-hover rounded-3xl p-4 flex items-center gap-3 text-left animate-fade-in"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${room.color === "orange" ? "from-orange-500 to-red-500" : "from-blue-500 to-cyan-500"} flex items-center justify-center font-bold text-white font-montserrat flex-shrink-0`}>
                {room.avatar.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-white text-sm truncate flex items-center gap-1.5">
                    {room.type === "channel" && <Icon name="Radio" size={11} className="text-orange-400 flex-shrink-0" />}
                    {room.type === "group" && <Icon name="Users" size={11} className="text-blue-400 flex-shrink-0" />}
                    {room.name}
                  </span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] flex-shrink-0 ml-2">{room.time}</span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{room.lastMsg}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function ProfilePage({ user }: { user: User }) {
  const stats = [
    { label: "Постов", value: "0" },
    { label: "Подписчики", value: "0" },
    { label: "Подписки", value: "0" },
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
            {user.username[0].toUpperCase()}
          </div>
          {user.role === "admin" && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 font-medium">
              <Icon name="Shield" size={11} /> Администратор
            </span>
          )}
        </div>
        <h2 className="font-montserrat font-bold text-white text-xl">{user.username}</h2>
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
      <div className="px-4 pt-4 pb-6">
        <h3 className="font-montserrat font-bold text-white mb-3">Мои публикации</h3>
        <div className="glass rounded-3xl p-10 text-center animate-fade-in">
          <Icon name="FileText" size={36} className="text-purple-400/30 mx-auto mb-3" />
          <div className="text-sm font-semibold text-white/60">Публикаций пока нет</div>
          {user.role === "admin" && <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Перейдите в Ленту и напишите первый пост</div>}
        </div>
      </div>
    </div>
  );
}

function AccountPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const sections = [
    { icon: "User", label: "Личные данные", desc: "Имя, фото, контакты" },
    { icon: "Bell", label: "Уведомления", desc: "Сообщения, реакции, комментарии" },
    { icon: "Lock", label: "Безопасность", desc: "Пароль, сессии" },
    { icon: "Eye", label: "Приватность", desc: "Кто видит ваши данные" },
    { icon: "Palette", label: "Внешний вид", desc: "Тема, размер шрифта" },
  ];
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="glass rounded-3xl p-5 flex items-center gap-4 mb-6">
        <Avatar letter={user.username[0]} size="lg" color="purple" online />
        <div className="flex-1">
          <div className="font-montserrat font-bold text-white">{user.username}</div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
            <Icon name={user.role === "admin" ? "Shield" : "User"} size={10} />
            {user.role === "admin" ? "Администратор" : "Пользователь"}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {sections.map((s, i) => (
          <button key={s.label} className="w-full glass glass-hover rounded-2xl px-4 py-4 flex items-center gap-4 text-left animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
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
        <button onClick={onLogout} className="w-full glass rounded-2xl px-4 py-4 flex items-center gap-4 text-left hover:bg-red-500/10 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-red-500/15 flex items-center justify-center">
            <Icon name="LogOut" size={18} className="text-red-400" />
          </div>
          <span className="font-semibold text-red-400 text-sm">Выйти из аккаунта</span>
        </button>
      </div>
    </div>
  );
}

// ==================== АДМИНКА ====================
function AdminPage({ user }: { user: User }) {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newLogin, setNewLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState<{ id: number; username: string; role: string; created_at: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_users", admin_id: user.id }),
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) { console.error(e); }
    setLoadingUsers(false);
  };

  useEffect(() => { loadUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const createUser = async () => {
    if (!newLogin.trim() || !newPassword.trim()) { setCreateError("Заполните все поля"); return; }
    setCreating(true);
    setCreateError("");
    setCreateSuccess("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_user",
          admin_id: user.id,
          new_username: newLogin.trim(),
          new_password: newPassword.trim(),
          role: newRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateSuccess(`Пользователь «${newLogin}» создан! Пароль: ${newPassword}`);
        setNewLogin("");
        setNewPassword("");
        loadUsers();
      } else {
        setCreateError(data.error || "Ошибка создания");
      }
    } catch {
      setCreateError("Ошибка сети");
    }
    setCreating(false);
  };

  const stats = [
    { icon: "Users", label: "Всего пользователей", value: String(users.length), color: "text-purple-400", bg: "bg-purple-500/15" },
    { icon: "Rss", label: "Постов за день", value: "0", color: "text-blue-400", bg: "bg-blue-500/15" },
    { icon: "MessageCircle", label: "Сообщений сегодня", value: "0", color: "text-pink-400", bg: "bg-pink-500/15" },
    { icon: "TrendingUp", label: "Активность", value: "—", color: "text-emerald-400", bg: "bg-emerald-500/15" },
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
          </div>
        ))}
      </div>

      {/* Создать пользователя */}
      <div className="glass rounded-3xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat font-bold text-white text-sm">Создать пользователя</h3>
          <button onClick={() => setShowCreateUser(!showCreateUser)} className="text-purple-400 hover:text-purple-300 transition-colors">
            <Icon name={showCreateUser ? "ChevronUp" : "ChevronDown"} size={18} />
          </button>
        </div>
        {showCreateUser && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">Логин</label>
              <input
                value={newLogin}
                onChange={e => setNewLogin(e.target.value)}
                placeholder="Введите логин"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">Пароль</label>
              <input
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setNewRole("user")}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${newRole === "user" ? "btn-gradient text-white" : "glass text-[hsl(var(--muted-foreground))]"}`}
              >
                Пользователь
              </button>
              <button
                onClick={() => setNewRole("admin")}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${newRole === "admin" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" : "glass text-[hsl(var(--muted-foreground))]"}`}
              >
                Администратор
              </button>
            </div>
            {createError && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2">
                <Icon name="AlertCircle" size={13} /> {createError}
              </div>
            )}
            {createSuccess && (
              <div className="flex items-start gap-2 text-emerald-400 text-xs bg-emerald-500/10 rounded-xl px-3 py-2">
                <Icon name="CheckCircle" size={13} className="mt-0.5 flex-shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}
            <button onClick={createUser} disabled={creating} className="w-full btn-gradient text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-50">
              {creating ? "Создание..." : "Создать пользователя"}
            </button>
          </div>
        )}
      </div>

      {/* Список пользователей */}
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat font-bold text-white text-sm">Пользователи</h3>
          <button onClick={loadUsers} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
            <Icon name="RefreshCw" size={14} />
          </button>
        </div>
        {loadingUsers ? (
          <div className="text-center py-4 text-sm text-[hsl(var(--muted-foreground))]">Загрузка...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="Users" size={32} className="text-purple-400/30 mx-auto mb-3" />
            <div className="text-sm text-white/50">Пользователей пока нет</div>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                <Avatar letter={u.username[0]} size="sm" color={u.role === "admin" ? "orange" : "purple"} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{u.username}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{new Date(u.created_at).toLocaleDateString("ru")}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-orange-500/15 text-orange-300" : "bg-blue-500/15 text-blue-300"}`}>
                  {u.role === "admin" ? "Админ" : "Юзер"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== УВЕДОМЛЕНИЯ ====================
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [notifs] = useState<Notification[]>([]);
  return (
    <div className="absolute inset-0 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div className="w-80 h-full glass border-l border-white/10 flex flex-col animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-montserrat font-bold text-white">Уведомления</h3>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-white transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Icon name="Bell" size={40} className="text-purple-400/30 mb-4" />
              <div className="text-sm font-semibold text-white/60">Нет уведомлений</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Здесь будут уведомления о сообщениях, реакциях и комментариях</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ==================== ГЛАВНЫЙ КОМПОНЕНТ ====================
export default function App() {
  const [ageConfirmed, setAgeConfirmed] = useState(() => sessionStorage.getItem("age_ok") === "1");
  const [user, setUser] = useState<User | null>(() => {
    const s = sessionStorage.getItem("cs_user");
    return s ? JSON.parse(s) : null;
  });
  const [page, setPage] = useState<Page>("home");
  const [showNotifs, setShowNotifs] = useState(false);

  const handleAgeAccept = () => {
    sessionStorage.setItem("age_ok", "1");
    setAgeConfirmed(true);
  };

  const handleLogin = (u: User) => {
    sessionStorage.setItem("cs_user", JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("cs_user");
    setUser(null);
    setPage("home");
  };

  if (!ageConfirmed) return <AgeGate onAccept={handleAgeAccept} />;
  if (!user) return <LoginPage onLogin={handleLogin} />;

  const isAdmin = user.role === "admin";

  const navItems: { icon: string; label: string; page: Page }[] = [
    { icon: "Home", label: "Главная", page: "home" },
    { icon: "Rss", label: "Лента", page: "feed" },
    { icon: "MessageCircle", label: "Чаты", page: "messenger" },
    { icon: "User", label: "Профиль", page: "profile" },
    { icon: "Settings", label: "Кабинет", page: "account" },
    ...(isAdmin ? [{ icon: "Shield", label: "Админка", page: "admin" as Page }] : []),
  ];

  const pageTitles: Record<Page, string> = {
    home: "ЧатСфера 18+",
    feed: "Лента",
    messenger: "Сообщения",
    profile: "Мой профиль",
    account: "Личный кабинет",
    admin: "Администрирование",
  };

  // Если обычный пользователь попал на admin — редирект
  if (page === "admin" && !isAdmin) setPage("home");

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col max-w-md mx-auto relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-700/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-700/8 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 glass border-b border-white/5 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h1 className="font-montserrat font-black text-xl gradient-text">{pageTitles[page]}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotifs(true)} className="relative w-9 h-9 rounded-2xl glass glass-hover flex items-center justify-center">
            <Icon name="Bell" size={18} className="text-white" />
          </button>
          <button onClick={() => setPage("profile")} className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm font-montserrat">
            {user.username[0].toUpperCase()}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10" key={page}>
        {page === "home" && <HomePage setPage={setPage} />}
        {page === "feed" && <FeedPage user={user} />}
        {page === "messenger" && <MessengerPage user={user} />}
        {page === "profile" && <ProfilePage user={user} />}
        {page === "account" && <AccountPage user={user} onLogout={handleLogout} />}
        {page === "admin" && isAdmin && <AdminPage user={user} />}
      </main>

      <nav className="relative z-10 glass border-t border-white/5 px-2 py-1 flex items-center justify-around flex-shrink-0">
        {navItems.map(item => (
          <NavItem
            key={item.page}
            icon={item.icon}
            label={item.label}
            active={page === item.page}
            onClick={() => setPage(item.page)}
          />
        ))}
      </nav>

      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
    </div>
  );
}