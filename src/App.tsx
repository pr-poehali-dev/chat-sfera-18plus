import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/31457deb-e02e-4825-a18a-ecf359cba65e";
const APP_NAME = "Сфера18+";

// ==================== ТИПЫ ====================
type Page = "home" | "messenger" | "profile" | "account" | "admin";

interface User {
  id: number;
  username: string;
  role: "admin" | "user";
  avatar_url?: string | null;
  display_name?: string | null;
  bio?: string | null;
}

interface AdminUser {
  id: number;
  username: string;
  role: string;
  created_at: string;
  banned: boolean;
  avatar_url?: string | null;
  display_name?: string | null;
}

type ChatType = "dm" | "group" | "channel";
type MediaType = "photo" | "video";

interface ChatMsg {
  id: number;
  from: "me" | "them";
  text?: string;
  author?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
}

interface RoomMember {
  id: number;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

interface ChatRoom {
  id: number;
  name: string;
  type: ChatType;
  avatar: string;
  lastMsg: string;
  time: string;
  color: string;
  members: RoomMember[];
  description?: string;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ====================
function AvatarImg({ src, letter, size = "md", color = "purple", online = false }: {
  src?: string | null; letter: string; size?: "sm" | "md" | "lg" | "xl"; color?: string; online?: boolean;
}) {
  const sizes = { sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl" };
  const colors: Record<string, string> = {
    purple: "from-purple-500 to-pink-500", blue: "from-blue-500 to-cyan-500",
    orange: "from-orange-500 to-red-500", green: "from-green-500 to-emerald-500",
    pink: "from-pink-500 to-rose-500",
  };
  return (
    <div className={`relative inline-flex flex-shrink-0 ${online ? "status-online" : ""}`}>
      {src ? (
        <img src={src} alt={letter} className={`${sizes[size]} rounded-2xl object-cover`} />
      ) : (
        <div className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${colors[color] || colors.purple} flex items-center justify-center font-bold text-white font-montserrat`}>
          {letter.toUpperCase()}
        </div>
      )}
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
    <button onClick={onClick} className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 ${active ? "bg-purple-500/20 text-purple-300" : "text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/5"}`}>
      <div className="relative">
        <Icon name={icon as never} size={22} />
        <NotifBadge count={badge} />
      </div>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
      {active && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />}
    </button>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ==================== 18+ ЗАСТАВКА ====================
function AgeGate({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-sm w-full text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
          <span className="font-montserrat font-black text-white text-2xl">18+</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl text-white mb-3">
          <span className="gradient-text">{APP_NAME}</span>
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
          <button onClick={onAccept} className="btn-gradient text-white font-bold py-4 rounded-2xl text-base w-full">
            Мне 18+ — войти на сайт
          </button>
          <button onClick={() => { window.location.href = "https://yandex.ru"; }} className="glass text-[hsl(var(--muted-foreground))] hover:text-white font-medium py-3.5 rounded-2xl text-sm w-full transition-colors">
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
    if (!username.trim() || !password.trim()) { setError("Введите логин и пароль"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "login", username: username.trim(), password }) });
      const data = await res.json();
      if (res.ok && data.user) { onLogin(data.user); }
      else { setError(data.error || "Ошибка входа"); }
    } catch { setError("Ошибка сети. Попробуйте ещё раз."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-sm w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-montserrat font-black text-3xl mb-2"><span className="gradient-text">{APP_NAME}</span></h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">Войдите в свой аккаунт</p>
        </div>
        <div className="glass rounded-3xl p-6 space-y-4">
          <div>
            <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block">Логин</label>
            <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Введите логин" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block">Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Введите пароль" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50 transition-colors" />
          </div>
          {error && <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2.5"><Icon name="AlertCircle" size={14} />{error}</div>}
          <button onClick={handleLogin} disabled={loading} className="w-full btn-gradient text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-50">{loading ? "Вход..." : "Войти"}</button>
        </div>
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-4">Регистрация только по приглашению администратора</p>
      </div>
    </div>
  );
}

// ==================== ГЛАВНАЯ ====================
function HomePage({ setPage, user }: { setPage: (p: Page) => void; user: User }) {
  const isAdmin = user.role === "admin";
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="relative overflow-hidden noise-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/20 to-orange-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="relative z-10 px-6 pt-12 pb-10 text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Добро пожаловать, {user.display_name || user.username}</span>
          </div>
          <h1 className="font-montserrat font-black text-4xl mb-3">
            <span className="gradient-text">{APP_NAME}</span>
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-base mb-8 leading-relaxed">
            Общайся, делись моментами<br />и находи единомышленников
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setPage("messenger")} className="btn-gradient text-white font-semibold px-6 py-3 rounded-2xl text-sm">Открыть чаты</button>
            <button onClick={() => setPage("profile")} className="glass glass-hover text-white font-semibold px-6 py-3 rounded-2xl text-sm">Мой профиль</button>
          </div>
        </div>
      </div>
      <div className="px-4 py-6 space-y-4">
        <h2 className="font-montserrat font-bold text-lg text-white">Быстрый доступ</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "MessageCircle", label: "Личные чаты", desc: "Диалоги", color: "from-purple-600/30 to-pink-600/20", border: "border-purple-500/20", page: "messenger" as Page, tab: "dm" },
            { icon: "Users", label: "Группы", desc: "Групповые чаты", color: "from-blue-600/30 to-cyan-600/20", border: "border-blue-500/20", page: "messenger" as Page, tab: "group" },
            { icon: "Radio", label: "Каналы", desc: "Новости", color: "from-orange-600/30 to-yellow-600/20", border: "border-orange-500/20", page: "messenger" as Page, tab: "channel" },
            ...(isAdmin ? [{ icon: "Shield", label: "Админка", desc: "Управление", color: "from-red-600/30 to-orange-600/20", border: "border-red-500/20", page: "admin" as Page, tab: "" }] : [
              { icon: "User", label: "Профиль", desc: "Настройки", color: "from-emerald-600/30 to-teal-600/20", border: "border-emerald-500/20", page: "profile" as Page, tab: "" }
            ]),
          ].map((item, i) => (
            <button key={i} onClick={() => setPage(item.page)} className={`glass glass-hover bg-gradient-to-br ${item.color} border ${item.border} rounded-3xl p-4 text-left transition-all duration-200`}>
              <Icon name={item.icon as never} size={24} className="text-white mb-3 opacity-90" />
              <div className="font-montserrat font-bold text-white text-sm">{item.label}</div>
              <div className="text-xs text-white/50 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== МЕССЕНДЖЕР ====================
function MessengerPage({ user }: { user: User }) {
  const isAdmin = user.role === "admin";
  const [tab, setTab] = useState<ChatType>("dm");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [addMemberName, setAddMemberName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const msgEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const createRoom = () => {
    if (!newName.trim()) return;
    const room: ChatRoom = {
      id: Date.now(), name: newName.trim(), type: tab === "dm" ? "group" : tab,
      avatar: newName.trim()[0], lastMsg: newDesc.trim() || "Чат создан", time: "только что",
      color: tab === "group" ? "blue" : "orange", members: [{ id: user.id, username: user.username, display_name: user.display_name, avatar_url: user.avatar_url }],
      description: newDesc.trim(),
    };
    setRooms(prev => [room, ...prev]);
    setNewName(""); setNewDesc(""); setShowCreate(false);
    setActiveRoom(room);
    setMessages([{ id: Date.now(), from: "them", text: tab === "channel" ? "Канал создан. Публикуйте сообщения." : "Группа создана. Добавляйте участников.", author: "Система" }]);
  };

  const sendMessage = () => {
    if (!inputVal.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), from: "me", text: inputVal, author: user.username }]);
    if (activeRoom) {
      setRooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, lastMsg: inputVal, time: "только что" } : r));
    }
    setInputVal("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileData = await fileToBase64(file);
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const res = await fetch(AUTH_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upload_media", user_id: user.id, file_data: fileData, file_ext: ext }),
      });
      const data = await res.json();
      if (data.url) {
        const msg: ChatMsg = { id: Date.now(), from: "me", mediaUrl: data.url, mediaType: data.type, author: user.username };
        setMessages(prev => [...prev, msg]);
        if (activeRoom) setRooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, lastMsg: data.type === "video" ? "🎥 Видео" : "🖼 Фото", time: "только что" } : r));
      }
    } catch (err) { console.error(err); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addMember = () => {
    if (!addMemberName.trim() || !activeRoom) return;
    const alreadyIn = activeRoom.members.some(m => m.username.toLowerCase() === addMemberName.trim().toLowerCase());
    if (alreadyIn) { setAddMemberName(""); return; }
    const newMember: RoomMember = { id: Date.now(), username: addMemberName.trim() };
    const updated = { ...activeRoom, members: [...activeRoom.members, newMember] };
    setActiveRoom(updated);
    setRooms(prev => prev.map(r => r.id === activeRoom.id ? updated : r));
    setMessages(prev => [...prev, { id: Date.now(), from: "them", text: `${addMemberName.trim()} добавлен в ${activeRoom.type === "channel" ? "канал" : "группу"}`, author: "Система" }]);
    setAddMemberName("");
  };

  const removeMember = (memberId: number) => {
    if (!activeRoom) return;
    const member = activeRoom.members.find(m => m.id === memberId);
    const updated = { ...activeRoom, members: activeRoom.members.filter(m => m.id !== memberId) };
    setActiveRoom(updated);
    setRooms(prev => prev.map(r => r.id === activeRoom.id ? updated : r));
    if (member) setMessages(prev => [...prev, { id: Date.now(), from: "them", text: `${member.username} удалён из ${activeRoom.type === "channel" ? "канала" : "группы"}`, author: "Система" }]);
  };

  const tabRooms = rooms.filter(r => r.type === tab);

  // Экран участников
  if (activeRoom && showMembers) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="glass px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setShowMembers(false)} className="text-[hsl(var(--muted-foreground))] hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
          <div className="flex-1">
            <div className="font-semibold text-white text-sm">Участники</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{activeRoom.name} · {activeRoom.members.length} чел.</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isAdmin && (
            <div className="flex gap-2 mb-4">
              <input value={addMemberName} onChange={e => setAddMemberName(e.target.value)} onKeyDown={e => e.key === "Enter" && addMember()} placeholder="Логин пользователя" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50" />
              <button onClick={addMember} className="btn-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold">Добавить</button>
            </div>
          )}
          <div className="space-y-2">
            {activeRoom.members.map((m) => (
              <div key={m.id} className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                <AvatarImg src={m.avatar_url} letter={m.username[0]} size="sm" color="purple" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{m.display_name || m.username}</div>
                  {m.display_name && <div className="text-xs text-[hsl(var(--muted-foreground))]">@{m.username}</div>}
                </div>
                {isAdmin && m.id !== user.id && (
                  <button onClick={() => removeMember(m.id)} className="text-red-400 hover:text-red-300 transition-colors">
                    <Icon name="UserMinus" size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Экран чата
  if (activeRoom) {
    const isChannel = activeRoom.type === "channel";
    const canSend = !isChannel || isAdmin;
    return (
      <div className="flex-1 flex flex-col">
        <div className="glass px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setActiveRoom(null)} className="text-[hsl(var(--muted-foreground))] hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${isChannel ? "from-orange-500 to-red-500" : "from-blue-500 to-cyan-500"} flex items-center justify-center font-bold text-white font-montserrat flex-shrink-0`}>
            {activeRoom.avatar.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm truncate">{activeRoom.name}</div>
            <button onClick={() => setShowMembers(true)} className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1 hover:text-purple-300 transition-colors">
              <Icon name={isChannel ? "Radio" : "Users"} size={10} />
              {isChannel ? "Канал" : "Группа"} · {activeRoom.members.length} участников
            </button>
          </div>
          <button onClick={() => setShowMembers(true)} className="text-[hsl(var(--muted-foreground))] hover:text-white">
            <Icon name="Users" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pt-10">
              <Icon name={isChannel ? "Radio" : "Users"} size={40} className="text-purple-400/30 mb-4" />
              <div className="text-sm font-semibold text-white/50">{isChannel ? "Канал пуст" : "Группа создана"}</div>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} animate-fade-in`}>
              <div className="max-w-[80%]">
                {msg.from === "them" && msg.author && <div className="text-[10px] text-purple-300 mb-1 px-1">{msg.author}</div>}
                {msg.mediaUrl ? (
                  <div className="rounded-2xl overflow-hidden">
                    {msg.mediaType === "video" ? (
                      <video src={msg.mediaUrl} controls className="max-w-full rounded-2xl" style={{ maxHeight: 240 }} />
                    ) : (
                      <img src={msg.mediaUrl} alt="фото" className="max-w-full rounded-2xl object-cover cursor-pointer" style={{ maxHeight: 240 }} onClick={() => window.open(msg.mediaUrl, "_blank")} />
                    )}
                  </div>
                ) : (
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === "me" ? "btn-gradient text-white rounded-br-sm" : "glass text-[hsl(var(--foreground))] rounded-bl-sm"}`}>
                    {msg.text}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={msgEnd} />
        </div>
        {canSend ? (
          <div className="glass px-4 py-3 border-t border-white/5 flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-9 h-9 glass flex items-center justify-center rounded-2xl flex-shrink-0 text-[hsl(var(--muted-foreground))] hover:text-purple-300 transition-colors disabled:opacity-50">
              {uploading ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Paperclip" size={16} />}
            </button>
            <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Написать сообщение..." className="flex-1 bg-white/5 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:bg-white/8 transition-colors" />
            <button onClick={sendMessage} className="btn-gradient text-white p-2.5 rounded-2xl flex-shrink-0"><Icon name="Send" size={18} /></button>
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
      <div className="px-4 pt-4 pb-2">
        <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-3">
          <Icon name="Search" size={16} className="text-[hsl(var(--muted-foreground))]" />
          <input placeholder="Поиск..." className="flex-1 bg-transparent text-sm outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>
      <div className="flex gap-2 px-4 pb-3">
        {([{ key: "dm", label: "Личные", icon: "MessageCircle" }, { key: "group", label: "Группы", icon: "Users" }, { key: "channel", label: "Каналы", icon: "Radio" }] as { key: ChatType; label: string; icon: string }[]).map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setShowCreate(false); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-2xl text-xs font-semibold transition-all ${tab === t.key ? "btn-gradient text-white" : "glass text-[hsl(var(--muted-foreground))] hover:text-white"}`}>
            <Icon name={t.icon as never} size={13} />{t.label}
          </button>
        ))}
      </div>
      {isAdmin && tab !== "dm" && (
        <div className="px-4 mb-3">
          {showCreate ? (
            <div className="glass rounded-3xl p-4 space-y-3 animate-fade-in">
              <div className="text-sm font-semibold text-white">{tab === "group" ? "Новая группа" : "Новый канал"}</div>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={tab === "group" ? "Название группы" : "Название канала"} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50" />
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Описание (необязательно)" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50" />
              <div className="flex gap-2">
                <button onClick={createRoom} disabled={!newName.trim()} className="btn-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex-1 disabled:opacity-50">Создать</button>
                <button onClick={() => setShowCreate(false)} className="glass text-[hsl(var(--muted-foreground))] text-sm px-4 py-2.5 rounded-xl">Отмена</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCreate(true)} className="w-full glass glass-hover border border-dashed border-purple-500/30 rounded-2xl py-3 flex items-center justify-center gap-2 text-sm text-purple-300 hover:text-purple-200">
              <Icon name="Plus" size={16} />{tab === "group" ? "Создать группу" : "Создать канал"}
            </button>
          )}
        </div>
      )}
      <div className="px-4 pb-6 space-y-1">
        {tabRooms.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center animate-fade-in">
            <Icon name={tab === "channel" ? "Radio" : tab === "group" ? "Users" : "MessageCircle"} size={40} className="text-purple-400/30 mx-auto mb-4" />
            <div className="font-montserrat font-bold text-white/60 text-base mb-2">{tab === "dm" ? "Нет сообщений" : tab === "group" ? "Нет групп" : "Нет каналов"}</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">{tab === "dm" ? "Здесь появятся диалоги" : tab === "group" ? (isAdmin ? "Создайте первую группу выше" : "Групп пока нет") : isAdmin ? "Создайте первый канал выше" : "Каналов пока нет"}</div>
          </div>
        ) : tabRooms.map((room, i) => (
          <button key={room.id} onClick={() => { setActiveRoom(room); setMessages([]); }} className="w-full glass glass-hover rounded-3xl p-4 flex items-center gap-3 text-left animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${room.color === "orange" ? "from-orange-500 to-red-500" : "from-blue-500 to-cyan-500"} flex items-center justify-center font-bold text-white font-montserrat flex-shrink-0`}>{room.avatar.toUpperCase()}</div>
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
        ))}
      </div>
    </div>
  );
}

// ==================== ПРОФИЛЬ + РЕДАКТОР ====================
function ProfilePage({ user, onUpdateUser }: { user: User; onUpdateUser: (u: Partial<User>) => void }) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fileData = await fileToBase64(file);
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const res = await fetch(AUTH_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upload_avatar", user_id: user.id, file_data: fileData, file_ext: ext }),
      });
      const data = await res.json();
      if (data.avatar_url) { onUpdateUser({ avatar_url: data.avatar_url }); setSaveMsg("Аватар обновлён!"); }
    } catch (err) { console.error(err); }
    setAvatarUploading(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await fetch(AUTH_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", user_id: user.id, display_name: displayName, bio }),
      });
      onUpdateUser({ display_name: displayName || null, bio: bio || null });
      setSaveMsg("Профиль сохранён!");
      setEditing(false);
    } catch (err) { console.error(err); }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 opacity-70" />
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <div className="relative">
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <div className="relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
              <AvatarImg src={user.avatar_url} letter={user.username[0]} size="xl" color="purple" />
              <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ring-4 ring-[hsl(var(--background))] rounded-2xl">
                {avatarUploading ? <Icon name="Loader" size={20} className="text-white animate-spin" /> : <Icon name="Camera" size={20} className="text-white" />}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {user.role === "admin" && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 font-medium self-end mb-1">
                <Icon name="Shield" size={11} /> Администратор
              </span>
            )}
            <button onClick={() => setEditing(!editing)} className="glass glass-hover px-3 py-2 rounded-2xl text-sm text-white flex items-center gap-1.5 self-end mb-1">
              <Icon name="Edit3" size={14} />{editing ? "Отмена" : "Редактировать"}
            </button>
          </div>
        </div>
        {saveMsg && <div className="mb-3 text-xs text-emerald-400 bg-emerald-500/10 rounded-xl px-3 py-2 flex items-center gap-2"><Icon name="CheckCircle" size={13} />{saveMsg}</div>}
        {editing ? (
          <div className="space-y-3 mb-4 animate-fade-in">
            <div>
              <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">Отображаемое имя</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={user.username} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">О себе</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Расскажите о себе..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none" />
            </div>
            <button onClick={saveProfile} disabled={saving} className="w-full btn-gradient text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50">
              {saving ? "Сохранение..." : "Сохранить профиль"}
            </button>
            <div className="text-xs text-[hsl(var(--muted-foreground))] text-center">Нажмите на аватар выше, чтобы сменить фото</div>
          </div>
        ) : (
          <>
            <h2 className="font-montserrat font-bold text-white text-xl">{user.display_name || user.username}</h2>
            {user.display_name && <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">@{user.username}</div>}
            {user.bio && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 leading-relaxed">{user.bio}</p>}
          </>
        )}
      </div>
      <div className="divider-gradient mx-4 mb-4" />
      <div className="px-4 pb-6">
        <div className="glass rounded-3xl p-10 text-center">
          <Icon name="FileText" size={36} className="text-purple-400/30 mx-auto mb-3" />
          <div className="text-sm font-semibold text-white/60">Публикаций пока нет</div>
        </div>
      </div>
    </div>
  );
}

// ==================== КАБИНЕТ ====================
function AccountPage({ user, onLogout, onUpdateUser }: { user: User; onLogout: () => void; onUpdateUser: (u: Partial<User>) => void }) {
  const [showChangePw, setShowChangePw] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const changePassword = async () => {
    if (!newPw.trim() || newPw.length < 4) { setPwErr("Пароль минимум 4 символа"); return; }
    setSavingPw(true); setPwErr(""); setPwMsg("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", admin_id: user.id, target_id: user.id, new_password: newPw }),
      });
      const data = await res.json();
      if (data.ok) { setPwMsg("Пароль изменён!"); setOldPw(""); setNewPw(""); setShowChangePw(false); }
      else { setPwErr(data.error || "Ошибка"); }
    } catch { setPwErr("Ошибка сети"); }
    setSavingPw(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="glass rounded-3xl p-5 flex items-center gap-4 mb-6">
        <AvatarImg src={user.avatar_url} letter={user.username[0]} size="lg" color="purple" online />
        <div className="flex-1 min-w-0">
          <div className="font-montserrat font-bold text-white truncate">{user.display_name || user.username}</div>
          {user.display_name && <div className="text-xs text-[hsl(var(--muted-foreground))]">@{user.username}</div>}
          <div className="mt-1 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
            <Icon name={user.role === "admin" ? "Shield" : "User"} size={10} />
            {user.role === "admin" ? "Администратор" : "Пользователь"}
          </div>
        </div>
      </div>

      {pwMsg && <div className="mb-4 text-xs text-emerald-400 bg-emerald-500/10 rounded-xl px-3 py-2 flex items-center gap-2"><Icon name="CheckCircle" size={13} />{pwMsg}</div>}

      <div className="space-y-2 mb-6">
        <button onClick={() => setShowChangePw(!showChangePw)} className="w-full glass glass-hover rounded-2xl px-4 py-4 flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 flex items-center justify-center"><Icon name="Lock" size={18} className="text-blue-400" /></div>
          <div className="flex-1"><div className="font-semibold text-white text-sm">Сменить пароль</div><div className="text-xs text-[hsl(var(--muted-foreground))]">Обновите пароль аккаунта</div></div>
          <Icon name={showChangePw ? "ChevronUp" : "ChevronRight"} size={16} className="text-[hsl(var(--muted-foreground))]" />
        </button>
        {showChangePw && (
          <div className="glass rounded-2xl px-4 py-4 space-y-3 animate-fade-in">
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Новый пароль (мин. 4 символа)" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50" />
            {pwErr && <div className="text-red-400 text-xs flex items-center gap-1"><Icon name="AlertCircle" size={12} />{pwErr}</div>}
            <button onClick={changePassword} disabled={savingPw} className="w-full btn-gradient text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50">{savingPw ? "Сохранение..." : "Сохранить пароль"}</button>
          </div>
        )}

        {[
          { icon: "Bell", label: "Уведомления", desc: "Настройки уведомлений", color: "text-purple-400", bg: "bg-purple-500/15" },
          { icon: "Eye", label: "Приватность", desc: "Кто видит ваши данные", color: "text-emerald-400", bg: "bg-emerald-500/15" },
          { icon: "Palette", label: "Внешний вид", desc: "Тема, размер шрифта", color: "text-pink-400", bg: "bg-pink-500/15" },
        ].map(s => (
          <button key={s.label} className="w-full glass glass-hover rounded-2xl px-4 py-4 flex items-center gap-4 text-left">
            <div className={`w-10 h-10 rounded-2xl ${s.bg} flex items-center justify-center`}><Icon name={s.icon as never} size={18} className={s.color} /></div>
            <div className="flex-1"><div className="font-semibold text-white text-sm">{s.label}</div><div className="text-xs text-[hsl(var(--muted-foreground))]">{s.desc}</div></div>
            <Icon name="ChevronRight" size={16} className="text-[hsl(var(--muted-foreground))]" />
          </button>
        ))}
      </div>

      <button onClick={onLogout} className="w-full glass rounded-2xl px-4 py-4 flex items-center gap-4 text-left hover:bg-red-500/10 transition-colors">
        <div className="w-10 h-10 rounded-2xl bg-red-500/15 flex items-center justify-center"><Icon name="LogOut" size={18} className="text-red-400" /></div>
        <span className="font-semibold text-red-400 text-sm">Выйти из аккаунта</span>
      </button>
    </div>
  );
}

// ==================== АДМИНКА ====================
function AdminPage({ user }: { user: User }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newLogin, setNewLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [createErr, setCreateErr] = useState("");
  const [createOk, setCreateOk] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPw, setEditPw] = useState("");
  const [editPwMsg, setEditPwMsg] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const flash = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000); };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "get_users", admin_id: user.id }) });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const createUser = async () => {
    if (!newLogin.trim() || !newPassword.trim()) { setCreateErr("Заполните все поля"); return; }
    setCreating(true); setCreateErr(""); setCreateOk("");
    try {
      const res = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create_user", admin_id: user.id, new_username: newLogin.trim(), new_password: newPassword.trim(), role: newRole }) });
      const data = await res.json();
      if (res.ok) { setCreateOk(`Пользователь «${newLogin}» создан`); setNewLogin(""); setNewPassword(""); loadUsers(); }
      else { setCreateErr(data.error || "Ошибка"); }
    } catch { setCreateErr("Ошибка сети"); }
    setCreating(false);
  };

  const banUser = async (id: number, banned: boolean) => {
    await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "ban_user", admin_id: user.id, target_id: id, banned }) });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, banned } : u));
    flash(banned ? "Пользователь заблокирован" : "Блокировка снята");
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Удалить пользователя? Это действие необратимо.")) return;
    await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_user", admin_id: user.id, target_id: id }) });
    setUsers(prev => prev.filter(u => u.id !== id));
    flash("Пользователь удалён");
  };

  const changeRole = async (id: number, role: string) => {
    await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "change_role", admin_id: user.id, target_id: id, role }) });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    flash("Роль изменена");
  };

  const changePassword = async (id: number) => {
    if (!editPw.trim() || editPw.length < 4) { setEditPwMsg("Мин. 4 символа"); return; }
    await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "change_password", admin_id: user.id, target_id: id, new_password: editPw }) });
    setEditPw(""); setEditingId(null); flash("Пароль изменён");
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Icon name="Shield" size={16} className="text-white" />
        </div>
        <h2 className="font-montserrat font-bold text-white text-lg">Панель администратора</h2>
      </div>

      {actionMsg && <div className="mb-4 text-xs text-emerald-400 bg-emerald-500/10 rounded-xl px-3 py-2 flex items-center gap-2"><Icon name="CheckCircle" size={13} />{actionMsg}</div>}

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: "Users", label: "Всего", value: String(users.length), color: "text-purple-400", bg: "bg-purple-500/15" },
          { icon: "ShieldOff", label: "Заблокировано", value: String(users.filter(u => u.banned).length), color: "text-red-400", bg: "bg-red-500/15" },
          { icon: "Shield", label: "Админов", value: String(users.filter(u => u.role === "admin").length), color: "text-orange-400", bg: "bg-orange-500/15" },
        ].map(s => (
          <div key={s.label} className="glass rounded-3xl p-4">
            <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-2`}><Icon name={s.icon as never} size={16} className={s.color} /></div>
            <div className="font-montserrat font-black text-white text-xl">{s.value}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Создать пользователя */}
      <div className="glass rounded-3xl p-4 mb-4">
        <button onClick={() => setShowCreate(!showCreate)} className="w-full flex items-center justify-between">
          <span className="font-montserrat font-bold text-white text-sm">Создать пользователя</span>
          <Icon name={showCreate ? "ChevronUp" : "ChevronDown"} size={18} className="text-purple-400" />
        </button>
        {showCreate && (
          <div className="space-y-3 mt-4 animate-fade-in">
            <input value={newLogin} onChange={e => setNewLogin(e.target.value)} placeholder="Логин" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50" />
            <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Пароль" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-purple-500/50" />
            <div className="flex gap-2">
              <button onClick={() => setNewRole("user")} className={`flex-1 py-2 rounded-xl text-xs font-semibold ${newRole === "user" ? "btn-gradient text-white" : "glass text-[hsl(var(--muted-foreground))]"}`}>Пользователь</button>
              <button onClick={() => setNewRole("admin")} className={`flex-1 py-2 rounded-xl text-xs font-semibold ${newRole === "admin" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" : "glass text-[hsl(var(--muted-foreground))]"}`}>Администратор</button>
            </div>
            {createErr && <div className="text-red-400 text-xs flex items-center gap-1"><Icon name="AlertCircle" size={12} />{createErr}</div>}
            {createOk && <div className="text-emerald-400 text-xs flex items-center gap-1"><Icon name="CheckCircle" size={12} />{createOk}</div>}
            <button onClick={createUser} disabled={creating} className="w-full btn-gradient text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-50">{creating ? "Создание..." : "Создать"}</button>
          </div>
        )}
      </div>

      {/* Список пользователей */}
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat font-bold text-white text-sm">Пользователи</h3>
          <button onClick={loadUsers} className="text-purple-400 hover:text-purple-300 transition-colors"><Icon name="RefreshCw" size={14} /></button>
        </div>
        {loading ? (
          <div className="text-center py-6 text-sm text-[hsl(var(--muted-foreground))]">Загрузка...</div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className={`glass rounded-2xl p-3 ${u.banned ? "border border-red-500/20" : ""}`}>
                <div className="flex items-center gap-3 mb-2">
                  <AvatarImg src={u.avatar_url} letter={u.username[0]} size="sm" color={u.role === "admin" ? "orange" : "purple"} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{u.display_name || u.username}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">@{u.username} · {new Date(u.created_at).toLocaleDateString("ru")}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {u.banned && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400">БАН</span>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-orange-500/15 text-orange-300" : "bg-blue-500/15 text-blue-300"}`}>
                      {u.role === "admin" ? "Админ" : "Юзер"}
                    </span>
                  </div>
                </div>
                {u.id !== user.id && (
                  <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => banUser(u.id, !u.banned)} className={`text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all ${u.banned ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" : "bg-red-500/15 text-red-400 hover:bg-red-500/25"}`}>
                      <Icon name={u.banned ? "ShieldCheck" : "ShieldOff"} size={11} />
                      {u.banned ? "Разблокировать" : "Заблокировать"}
                    </button>
                    <button onClick={() => changeRole(u.id, u.role === "admin" ? "user" : "admin")} className="text-xs px-2.5 py-1.5 rounded-xl bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 flex items-center gap-1 transition-all">
                      <Icon name="ArrowLeftRight" size={11} />
                      {u.role === "admin" ? "→ Юзер" : "→ Админ"}
                    </button>
                    <button onClick={() => { setEditingId(editingId === u.id ? null : u.id); setEditPw(""); setEditPwMsg(""); }} className="text-xs px-2.5 py-1.5 rounded-xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 flex items-center gap-1 transition-all">
                      <Icon name="Key" size={11} />Пароль
                    </button>
                    <button onClick={() => deleteUser(u.id)} className="text-xs px-2.5 py-1.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 flex items-center gap-1 transition-all">
                      <Icon name="Trash2" size={11} />Удалить
                    </button>
                  </div>
                )}
                {editingId === u.id && (
                  <div className="flex gap-2 mt-2 animate-fade-in">
                    <input type="password" value={editPw} onChange={e => setEditPw(e.target.value)} placeholder="Новый пароль" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50 placeholder:text-[hsl(var(--muted-foreground))]" />
                    <button onClick={() => changePassword(u.id)} className="text-xs px-3 py-2 btn-gradient text-white rounded-xl font-semibold">Ок</button>
                  </div>
                )}
                {editingId === u.id && editPwMsg && <div className="text-red-400 text-xs mt-1">{editPwMsg}</div>}
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
  return (
    <div className="absolute inset-0 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div className="w-80 h-full glass border-l border-white/10 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-montserrat font-bold text-white">Уведомления</h3>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-white"><Icon name="X" size={18} /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <Icon name="Bell" size={40} className="text-purple-400/30 mb-4" />
          <div className="text-sm font-semibold text-white/60">Нет уведомлений</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Здесь будут ваши уведомления</div>
        </div>
      </div>
    </div>
  );
}

// ==================== ГЛАВНЫЙ КОМПОНЕНТ ====================
export default function App() {
  const [ageConfirmed, setAgeConfirmed] = useState(() => sessionStorage.getItem("age_ok") === "1");
  const [user, setUser] = useState<User | null>(() => {
    const s = sessionStorage.getItem("s18_user");
    return s ? JSON.parse(s) : null;
  });
  const [page, setPage] = useState<Page>("home");
  const [showNotifs, setShowNotifs] = useState(false);

  const handleAgeAccept = () => { sessionStorage.setItem("age_ok", "1"); setAgeConfirmed(true); };

  const handleLogin = (u: User) => { sessionStorage.setItem("s18_user", JSON.stringify(u)); setUser(u); };

  const handleLogout = () => { sessionStorage.removeItem("s18_user"); setUser(null); setPage("home"); };

  const handleUpdateUser = (upd: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...upd };
    setUser(updated);
    sessionStorage.setItem("s18_user", JSON.stringify(updated));
  };

  if (!ageConfirmed) return <AgeGate onAccept={handleAgeAccept} />;
  if (!user) return <LoginPage onLogin={handleLogin} />;

  const isAdmin = user.role === "admin";
  if (page === "admin" && !isAdmin) setPage("home");

  const navItems: { icon: string; label: string; page: Page }[] = [
    { icon: "Home", label: "Главная", page: "home" },
    { icon: "MessageCircle", label: "Чаты", page: "messenger" },
    { icon: "User", label: "Профиль", page: "profile" },
    { icon: "Settings", label: "Кабинет", page: "account" },
    ...(isAdmin ? [{ icon: "Shield", label: "Админка", page: "admin" as Page }] : []),
  ];

  const pageTitles: Record<Page, string> = {
    home: APP_NAME, messenger: "Сообщения", profile: "Мой профиль", account: "Кабинет", admin: "Администрирование",
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
          <button onClick={() => setShowNotifs(true)} className="relative w-9 h-9 rounded-2xl glass glass-hover flex items-center justify-center">
            <Icon name="Bell" size={18} className="text-white" />
          </button>
          <button onClick={() => setPage("profile")} className="w-9 h-9 rounded-2xl overflow-hidden flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm font-montserrat">
                {user.username[0].toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10" key={page}>
        {page === "home" && <HomePage setPage={setPage} user={user} />}
        {page === "messenger" && <MessengerPage user={user} />}
        {page === "profile" && <ProfilePage user={user} onUpdateUser={handleUpdateUser} />}
        {page === "account" && <AccountPage user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />}
        {page === "admin" && isAdmin && <AdminPage user={user} />}
      </main>

      <nav className="relative z-10 glass border-t border-white/5 px-2 py-1 flex items-center justify-around flex-shrink-0">
        {navItems.map(item => (
          <NavItem key={item.page} icon={item.icon} label={item.label} active={page === item.page} onClick={() => setPage(item.page)} />
        ))}
      </nav>

      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
    </div>
  );
}
