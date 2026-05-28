import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { auth, db, onAuthStateChanged, signInWithPopup, googleProvider, signOut, doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, addDoc, serverTimestamp, updateDoc, arrayUnion, deleteDoc } from './firebase';
import { UserProfile, ClassRoom, Group, Application, Message, RPGStat, ForumTopic, ForumReply, AcademicSummary, SummaryComment } from './types';
import { LogIn, LogOut, User as UserIcon, Users, MessageSquare, Plus, Search, Check, X, Send, ArrowLeft, BookOpen, AlertCircle, Flame, Zap, Wind, Brain, Smile, Dices, Code, Palette, PenTool, Hash, Shield, Sword, Trophy, Star, Skull, Crown, Map, Sun, Moon, Trash2, QrCode, ThumbsUp, MessageCircle, ThumbsDown, FileText, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Sidebar = ({ user, profile, isDark, toggleTheme }: { user: any, profile: UserProfile | null, isDark: boolean, toggleTheme: () => void }) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('unisohub_guest_uid');
    localStorage.removeItem('unisohub_guest_name');
    localStorage.removeItem('unisohub_profile');
    try {
      signOut(auth);
    } catch (e) {}
    navigate('/');
    window.location.reload();
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold group",
        "text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
      )}
    >
      <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 h-screen sticky top-0 flex flex-col p-6 transition-colors">
      <Link to="/" className="flex items-center space-x-3 mb-10">
        <div className="bg-yellow-400 p-2 rounded-xl shadow-lg shadow-yellow-100 dark:shadow-yellow-900/20">
          <Flame className="h-6 w-6 text-black" />
        </div>
        <span className="text-2xl font-black text-black dark:text-white tracking-tighter">UnisoHub</span>
      </Link>

      <div className="flex-1 space-y-2">
        <NavItem to="/" icon={Search} label="Explorar" />
        {user && (
          <>
            <NavItem to="/classes" icon={BookOpen} label="Minhas Salas" />
            <NavItem to="/my-groups" icon={Users} label="Meus Grupos" />
            <NavItem to="/quizzes" icon={Brain} label="Quizzes & Desafios" />
            <NavItem to="/forum" icon={MessageCircle} label="Dúvidas & Fórum" />
            <NavItem to="/summaries" icon={FileText} label="Resumos da Galera" />
            <NavItem to="/profile" icon={UserIcon} label="Meu Perfil" />
          </>
        )}
      </div>

      <div className="space-y-4">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 hover:border-blue-400 transition-all group"
        >
          <div className="flex items-center gap-3">
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-blue-600" />
            )}
            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
              Tema {isDark ? 'Luz' : 'Sombra'}
            </span>
          </div>
          <div className={cn(
            "w-10 h-6 rounded-full p-1 transition-colors relative",
            isDark ? "bg-blue-600" : "bg-gray-300"
          )}>
            <div className={cn(
              "w-4 h-4 rounded-full bg-white transition-transform",
              isDark ? "translate-x-4" : "translate-x-0"
            )} />
          </div>
        </button>

        {user ? (
          <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
            <Link 
              to="/profile" 
              className="flex items-center space-x-3 mb-4 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group/profile"
            >
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="h-10 w-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-gray-400 group-hover/profile:text-blue-600 transition-colors" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-black dark:text-white truncate group-hover/profile:text-blue-600 transition-colors">{profile?.name || 'Aluno'}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ver Perfil</p>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bold"
            >
              <LogOut className="h-5 w-5" />
              <span>Reiniciar Perfil</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => signInWithPopup(auth, googleProvider)}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-blue-900/20 font-black"
          >
            <LogIn className="h-5 w-5" />
            <span>Entrar</span>
          </button>
        )}
      </div>
    </div>
  );
};

// --- RPG Constants ---

const RPG_CLASSES = [
  { name: 'Engenheiro (Frontend)', icon: Code, desc: 'Especialista em interfaces e experiência do usuário.' },
  { name: 'Arquiteto (Backend)', icon: Shield, desc: 'Mestre em lógica, dados e infraestrutura.' },
  { name: 'Mestre (Fullstack)', icon: Zap, desc: 'Versátil e capaz de atuar em todas as frentes.' },
  { name: 'Estrategista (Product)', icon: Brain, desc: 'Focado em planejamento, pesquisa e visão de produto.' },
  { name: 'Explorador (QA)', icon: Search, desc: 'Especialista em encontrar falhas e garantir qualidade.' },
];

const MAX_ATTR_POINTS = 25;
const MAX_SKILL_POINTS = 15;

const DEFAULT_STATS: RPGStat[] = [
  { name: 'Foco e Estudo', value: 1, icon: 'BookOpen' },
  { name: 'Gestão de Tempo', value: 1, icon: 'Zap' },
  { name: 'Raciocínio Crítico', value: 1, icon: 'Brain' },
  { name: 'Trabalho em Equipe', value: 1, icon: 'Users' },
  { name: 'Resiliência (Café)', value: 1, icon: 'Flame' },
];

const DEFAULT_SKILLS: RPGStat[] = [
  { name: 'Programação de Sistemas', value: 1, icon: 'Code' },
  { name: 'Criatividade e Design', value: 1, icon: 'Palette' },
  { name: 'Escrita Acadêmica', value: 1, icon: 'PenTool' },
  { name: 'Cálculo e Estatística', value: 1, icon: 'Hash' },
  { name: 'Pesquisa Científica', value: 1, icon: 'Search' },
];

interface StatBarProps {
  stat: RPGStat;
  onUpdate?: (val: number) => void;
  onNameUpdate?: (name: string) => void;
  onRemove?: () => void;
  editing: boolean;
  max?: number;
}

const StatBar: React.FC<StatBarProps> = ({ stat, onUpdate, onNameUpdate, onRemove, editing, max = 10 }) => {
  const icons: any = { Zap, Wind, Brain, Smile, Dices, Code, Palette, PenTool, Hash, Shield, Sword, Trophy, Star, Search, Flame, BookOpen, Users };
  const Icon = icons[stat.icon] || Star;
  
  return (
    <div className="space-y-2 group/stat">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 flex-1">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
            <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          {editing ? (
            <input
              type="text"
              value={stat.name}
              onChange={(e) => onNameUpdate?.(e.target.value)}
              className="text-sm font-bold text-black dark:text-white bg-transparent border-b border-blue-200 dark:border-blue-800 focus:border-blue-500 outline-none w-full"
              placeholder="Nome do atributo"
            />
          ) : (
            <span className="text-sm font-bold text-black dark:text-gray-200">{stat.name}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nível</span>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400">{stat.value}</span>
          </div>
          {editing && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover/stat:opacity-100"
              title="Remover"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center relative group border border-gray-200 dark:border-zinc-700">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(stat.value / max) * 100}%` }}
          className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-r-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
        />
        {editing && (
          <div className="absolute inset-0 flex">
            {[...Array(max)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onUpdate?.(i + 1)}
                className={cn(
                  "flex-1 h-full transition-all border-r border-black/5 dark:border-white/5 last:border-0",
                  stat.value > i ? "bg-transparent" : "hover:bg-blue-200/30 dark:hover:bg-blue-400/10"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Profile = ({ user, profile, setProfile }: { user: any, profile: UserProfile | null, setProfile: any }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        rpgStats: profile.rpgStats || DEFAULT_STATS,
        rpgSkills: profile.rpgSkills || DEFAULT_SKILLS
      });
    }
  }, [profile]);

  const attrPointsUsed = (formData.rpgStats || DEFAULT_STATS).reduce((acc, s) => acc + s.value, 0);
  const skillPointsUsed = (formData.rpgSkills || DEFAULT_SKILLS).reduce((acc, s) => acc + s.value, 0);
  const attrPointsLeft = MAX_ATTR_POINTS - attrPointsUsed;
  const skillPointsLeft = MAX_SKILL_POINTS - skillPointsUsed;

  const updateRPGStat = (type: 'stats' | 'skills', index: number, value: number) => {
    if (type === 'stats') {
      const newStats = [...(formData.rpgStats || DEFAULT_STATS)];
      const diff = value - newStats[index].value;
      if (attrPointsLeft - diff < 0) return;
      newStats[index] = { ...newStats[index], value };
      setFormData({ ...formData, rpgStats: newStats });
    } else {
      const newSkills = [...(formData.rpgSkills || DEFAULT_SKILLS)];
      const diff = value - newSkills[index].value;
      if (skillPointsLeft - diff < 0) return;
      newSkills[index] = { ...newSkills[index], value };
      setFormData({ ...formData, rpgSkills: newSkills });
    }
  };

  const updateRPGStatName = (type: 'stats' | 'skills', index: number, name: string) => {
    if (type === 'stats') {
      const newStats = [...(formData.rpgStats || DEFAULT_STATS)];
      newStats[index] = { ...newStats[index], name };
      setFormData({ ...formData, rpgStats: newStats });
    } else {
      const newSkills = [...(formData.rpgSkills || DEFAULT_SKILLS)];
      newSkills[index] = { ...newSkills[index], name };
      setFormData({ ...formData, rpgSkills: newSkills });
    }
  };

  const removeRPGStat = (type: 'stats' | 'skills', index: number) => {
    if (type === 'stats') {
      const newStats = [...(formData.rpgStats || DEFAULT_STATS)];
      newStats.splice(index, 1);
      setFormData({ ...formData, rpgStats: newStats });
    } else {
      const newSkills = [...(formData.rpgSkills || DEFAULT_SKILLS)];
      newSkills.splice(index, 1);
      setFormData({ ...formData, rpgSkills: newSkills });
    }
  };

  const addRPGStat = (type: 'stats' | 'skills') => {
    if (type === 'stats') {
      const newStats = [...(formData.rpgStats || DEFAULT_STATS)];
      newStats.push({ name: 'Novo Atributo', value: 1, icon: 'Shield' });
      setFormData({ ...formData, rpgStats: newStats });
    } else {
      const newSkills = [...(formData.rpgSkills || DEFAULT_SKILLS)];
      newSkills.push({ name: 'Nova Habilidade', value: 1, icon: 'Star' });
      setFormData({ ...formData, rpgSkills: newSkills });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = { ...profile, ...formData, uid: user.uid, email: user.email };
    localStorage.setItem('unisohub_profile', JSON.stringify(updated));
    localStorage.setItem('unisohub_guest_name', updated.name);
    try {
      await setDoc(doc(db, 'users', user.uid), updated);
    } catch (err) {
      console.warn("Soft Firestore registration skipped (expected offline/local):", err);
    }
    setProfile(updated);
    setEditing(false);
  };

  if (!profile && !editing) return <div className="p-8 text-center text-gray-500">Carregando perfil...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden"
      >
        <div className="bg-blue-600 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="" className="h-24 w-24 rounded-2xl border-4 border-white dark:border-zinc-900 shadow-lg object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-24 w-24 rounded-2xl border-4 border-white dark:border-zinc-900 shadow-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-2">Bio / Sobre mim</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-2">Tipo de Membro</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isProfessor: false })}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-3",
                      !formData.isProfessor
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                        : "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:border-blue-200"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl",
                      !formData.isProfessor ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-zinc-700 text-gray-500"
                    )}>
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-black dark:text-white">Estudante</p>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 leading-tight mt-1">Participa de salas, equipes e responde Quizzes.</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isProfessor: true })}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-3",
                      formData.isProfessor
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md"
                        : "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:border-purple-200"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl",
                      formData.isProfessor ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-zinc-700 text-gray-500"
                    )}>
                      <Crown className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-black dark:text-white">Professor(a)</p>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 leading-tight mt-1">Cria salas, novos Quizzes e visualiza notas dos alunos.</p>
                    </div>
                  </button>
                </div>
              </div>

              {!formData.isProfessor && (
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-2">Classe / Especialidade</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {RPG_CLASSES.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: c.name })}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-3",
                          formData.role === c.name 
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md" 
                            : "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:border-blue-200"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-xl",
                          formData.role === c.name ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-zinc-700 text-gray-500"
                        )}>
                          <c.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-black dark:text-white">{c.name}</p>
                          <p className="text-[10px] font-bold text-gray-500 leading-tight mt-1">{c.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="block text-sm font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Atributos
                    </label>
                    <span className={cn(
                      "text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
                      attrPointsLeft === 0 ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    )}>
                      {attrPointsLeft} Pontos Restantes
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 space-y-6">
                    {(formData.rpgStats || DEFAULT_STATS).map((s, i) => (
                      <StatBar 
                        key={i} 
                        stat={s} 
                        editing={true} 
                        onUpdate={(val) => updateRPGStat('stats', i, val)}
                        onNameUpdate={(name) => updateRPGStatName('stats', i, name)}
                        onRemove={() => removeRPGStat('stats', i)}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => addRPGStat('stats')}
                      className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Plus className="h-3 w-3" /> Adicionar Atributo
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="block text-sm font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Habilidades
                    </label>
                    <span className={cn(
                      "text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
                      skillPointsLeft === 0 ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    )}>
                      {skillPointsLeft} Pontos Restantes
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 space-y-6">
                    {(formData.rpgSkills || DEFAULT_SKILLS).map((s, i) => (
                      <StatBar 
                        key={i} 
                        stat={s} 
                        editing={true} 
                        onUpdate={(val) => updateRPGStat('skills', i, val)}
                        onNameUpdate={(name) => updateRPGStatName('skills', i, name)}
                        onRemove={() => removeRPGStat('skills', i)}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => addRPGStat('skills')}
                      className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Plus className="h-3 w-3" /> Adicionar Habilidade
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                  Salvar Perfil
                </button>
                <button type="button" onClick={() => setEditing(false)} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-extrabold text-black dark:text-white uppercase tracking-tighter">{profile?.name}</h1>
                    {profile?.isProfessor ? (
                      <span className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                        <Crown className="h-3 w-3" /> Professor(a)
                      </span>
                    ) : (
                      profile?.role && (
                        <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                          {profile.role}
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-gray-500 font-medium">{profile?.email}</p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-all"
                >
                  Editar Perfil
                </button>
              </div>

              {profile?.bio && (
                <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
                  <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Sobre</h3>
                  <p className="text-black dark:text-gray-200 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="h-3 w-3" /> Atributos
                  </h3>
                  <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
                    {(profile?.rpgStats || DEFAULT_STATS).map((s, i) => (
                      <StatBar key={i} stat={s} editing={false} />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="h-3 w-3" /> Habilidades
                  </h3>
                  <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
                    {(profile?.rpgSkills || DEFAULT_SKILLS).map((s, i) => (
                      <StatBar key={i} stat={s} editing={false} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  classId: string;
  creatorId: string;
  creatorName: string;
  questions: QuizQuestion[];
  createdAt: any;
}

interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  submittedAt: any;
}

const Quizzes = ({ user, profile }: { user: any; profile: UserProfile | null }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  
  // Creation Form states
  const [showCreate, setShowCreate] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizClassId, setQuizClassId] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // Single question form states
  const [questionText, setQuestionText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);

  // Active quiz states (Student)
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<number[]>([]);
  const [currentQuestIndex, setCurrentQuestIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number } | null>(null);

  // Expanded panel state
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const quizIdParam = searchParams.get('quizId');
  const [qrModalQuiz, setQrModalQuiz] = useState<Quiz | null>(null);

  // Auto-open quiz from URL parameter
  useEffect(() => {
    if (quizIdParam && quizzes.length > 0) {
      const found = quizzes.find(q => q.id === quizIdParam);
      if (found && (!activeQuiz || activeQuiz.id !== quizIdParam)) {
        setActiveQuiz(found);
        setCurrentQuestIndex(0);
        setCurrentAnswers([]);
        setSelectedOpt(null);
        setQuizResult(null);
      }
    }
  }, [quizIdParam, quizzes]);

  const handleCloseQuiz = () => {
    setActiveQuiz(null);
    setQuizResult(null);
    if (searchParams.has('quizId')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('quizId');
      setSearchParams(newParams);
    }
  };

  useEffect(() => {
    // Read classrooms
    const qClasses = query(collection(db, 'classes'));
    const unsubClasses = onSnapshot(qClasses, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassRoom));
      list.sort((a, b) => {
        const timeA = a.createdAt ? (typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0;
        const timeB = b.createdAt ? (typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0;
        return timeB - timeA;
      });
      setClasses(list);
    });

    // Read quizzes
    const qQuizzes = query(collection(db, 'quizzes'));
    const unsubQuizzes = onSnapshot(qQuizzes, snap => {
      setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Quiz)));
    });

    // Read submissions
    const qSubs = query(collection(db, 'quizSubmissions'));
    const unsubSubs = onSnapshot(qSubs, snap => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as QuizSubmission)));
    });

    return () => {
      unsubClasses();
      unsubQuizzes();
      unsubSubs();
    };
  }, []);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText || !opt0 || !opt1 || !opt2 || !opt3) {
      alert('Por favor, preencha a pergunta e todas as 4 alternativas!');
      return;
    }
    const newQ: QuizQuestion = {
      questionText,
      options: [opt0, opt1, opt2, opt3],
      correctOptionIndex: correctIdx
    };
    setQuestions([...questions, newQ]);
    // reset question form
    setQuestionText('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setCorrectIdx(0);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle || !quizClassId) {
      alert('Por favor, digite o título e selecione uma matéria!');
      return;
    }
    if (questions.length === 0) {
      alert('Adicione pelo menos uma pergunta para salvar o quiz!');
      return;
    }

    try {
      await addDoc(collection(db, 'quizzes'), {
        title: quizTitle,
        description: quizDescription,
        classId: quizClassId,
        creatorId: user.uid,
        creatorName: profile?.name || 'Professor',
        questions: questions,
        createdAt: new Date()
      });

      // Reset everything
      setQuizTitle('');
      setQuizDescription('');
      setQuizClassId('');
      setQuestions([]);
      setShowCreate(false);
      alert('Quiz criado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar quiz. Tente novamente.');
    }
  };

  const handleStartQuiz = (q: Quiz) => {
    setActiveQuiz(q);
    setCurrentQuestIndex(0);
    setCurrentAnswers([]);
    setSelectedOpt(null);
    setQuizResult(null);
  };

  const handleNextQuestion = () => {
    if (selectedOpt === null) {
      alert('Selecione uma alternativa antes de prosseguir!');
      return;
    }
    const updatedAnswers = [...currentAnswers, selectedOpt];
    setCurrentAnswers(updatedAnswers);
    setSelectedOpt(null);

    if (currentQuestIndex + 1 < (activeQuiz?.questions.length || 0)) {
      setCurrentQuestIndex(currentQuestIndex + 1);
    } else {
      // Finished! Calculate score and submit
      let correctCount = 0;
      activeQuiz?.questions.forEach((q, idx) => {
        if (updatedAnswers[idx] === q.correctOptionIndex) {
          correctCount++;
        }
      });

      const total = activeQuiz?.questions.length || 0;
      
      // Submit submission to Firestore
      addDoc(collection(db, 'quizSubmissions'), {
        quizId: activeQuiz?.id,
        studentId: user.uid,
        studentName: profile?.name || 'Estudante',
        answers: updatedAnswers,
        score: correctCount,
        totalQuestions: total,
        submittedAt: serverTimestamp()
      }).catch(err => console.error(err));

      setQuizResult({ score: correctCount, total });
    }
  };

  const userSubmissions = submissions.filter(s => s.studentId === user.uid);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 relative z-10 transition-colors">
      
      {/* Quiz Active Execution Portal */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-2xl w-full border border-gray-100 dark:border-zinc-800 shadow-2xl relative"
          >
            <button
              onClick={() => {
                if (confirm('Deseja realmente sair do Quiz? Seu progresso será perdido.')) {
                  handleCloseQuiz();
                }
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {!quizResult ? (
              <div>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Questão {currentQuestIndex + 1} de {activeQuiz.questions.length}
                </span>

                <h2 className="text-2xl font-black mt-4 text-black dark:text-white leading-tight">
                  {activeQuiz.questions[currentQuestIndex].questionText}
                </h2>

                <div className="grid grid-cols-1 gap-3 mt-6">
                  {activeQuiz.questions[currentQuestIndex].options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setSelectedOpt(oIdx)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left font-bold transition-all relative flex items-center justify-between",
                        selectedOpt === oIdx 
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 shadow-md"
                          : "border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/80 hover:border-gray-200"
                      )}
                    >
                      <span>{opt}</span>
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center",
                        selectedOpt === oIdx ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 dark:border-zinc-700"
                      )}>
                        {selectedOpt === oIdx && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="bg-blue-600 text-white font-black px-8 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 dark:shadow-blue-900/30 transition-all flex items-center gap-2"
                  >
                    <span>
                      {currentQuestIndex + 1 === activeQuiz.questions.length ? "Finalizar Desafio" : "Responder & Avançar"}
                    </span>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-6">
                <div className="flex justify-center">
                  <div className="bg-yellow-400 p-5 rounded-full shadow-lg shadow-yellow-105 dark:shadow-yellow-900/20">
                    <Trophy className="h-12 w-12 text-black" />
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">Desafio Concluído!</h2>
                  <p className="text-gray-500 font-medium font-bold">Você concluiu: {activeQuiz.title}</p>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-2xl max-w-sm mx-auto border border-gray-100 dark:border-zinc-800">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Seu resultado</p>
                  <p className="text-4xl font-black text-blue-600 dark:text-blue-400">
                    {quizResult.score} / {quizResult.total}
                  </p>
                  <p className="text-xs font-bold text-gray-400 mt-2">
                    Aproveitamento de {Math.round((quizResult.score / quizResult.total) * 100)}%
                  </p>
                </div>

                <button
                  onClick={handleCloseQuiz}
                  className="bg-black dark:bg-white text-white dark:text-black font-black px-10 py-4 rounded-xl hover:opacity-90 transition-all"
                >
                  Voltar para Desafios
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Primary Top View Container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-4xl font-black text-black dark:text-white uppercase tracking-tighter">
              📜 Quizzes & Desafios
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Atividades de fixação criadas por mestre / professores. Responda e ganhe pontuação!
          </p>
        </div>

        {profile?.isProfessor && !showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-purple-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-purple-200 dark:shadow-purple-900/30 hover:bg-purple-700 transition-all flex items-center gap-2 animate-pulse"
          >
            <Plus className="h-5 w-5" /> Criar Novo Quiz
          </button>
        )}
      </div>

      {/* Professor Creation Block */}
      {showCreate && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border border-purple-100 dark:border-purple-950/40 p-8 rounded-3xl mb-8 shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <Crown className="h-6 w-6" /> Módulo de Criação de Quiz
            </h2>
            <button
              onClick={() => {
                setShowCreate(false);
                setQuestions([]);
              }}
              className="text-gray-405 hover:text-gray-600 dark:hover:text-white font-bold text-sm"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSaveQuiz} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Título do Quiz</label>
                <input
                  type="text"
                  placeholder="Ex: Introdução a Algoritmos"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white font-bold"
                  value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Sala de Aula Vinculada</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white font-bold"
                  value={quizClassId}
                  onChange={e => setQuizClassId(e.target.value)}
                  required
                >
                  <option value="">Selecione uma matéria...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Breve Descrição</label>
              <textarea
                placeholder="Questões extras preparatórias para o trabalho prático."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white font-medium h-20"
                value={quizDescription}
                onChange={e => setQuizDescription(e.target.value)}
              />
            </div>

            {/* Questions created preview */}
            {questions.length > 0 && (
              <div className="bg-purple-50/50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/20 space-y-4">
                <h3 className="text-sm font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                  Perguntas Adicionadas ({questions.length})
                </h3>
                <div className="space-y-2">
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-100 dark:border-zinc-700 flex justify-between items-center text-sm font-bold">
                      <div>
                        <p className="text-gray-900 dark:text-white">#{qIdx+1}: {q.questionText}</p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Correta: {q.options[q.correctOptionIndex]}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuestions(questions.filter((_, idx) => idx !== qIdx))}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Question creation Form block */}
            <div className="bg-gray-50 dark:bg-zinc-800/40 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-wider">
                Adicionar Pergunta de Múltipla Escolha
              </h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Enunciado / Pergunta</label>
                <input
                  type="text"
                  placeholder="Qual a complexidade de tempo de busca em uma hash table balanceada?"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white text-sm"
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { state: opt0, set: setOpt0, label: "Alternativa A", idx: 0 },
                  { state: opt1, set: setOpt1, label: "Alternativa B", idx: 1 },
                  { state: opt2, set: setOpt2, label: "Alternativa C", idx: 2 },
                  { state: opt3, set: setOpt3, label: "Alternativa D", idx: 3 }
                ].map((item) => (
                  <div key={item.idx}>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">{item.label}</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white text-xs"
                      value={item.state}
                      onChange={e => item.set(e.target.value)}
                      placeholder={`Escreva a sua ${item.label}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Escolha a Alternativa Correta</label>
                  <select
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white font-bold text-xs"
                    value={correctIdx}
                    onChange={e => setCorrectIdx(Number(e.target.value))}
                  >
                    <option value={0}>Alternativa A</option>
                    <option value={1}>Alternativa B</option>
                    <option value={2}>Alternativa C</option>
                    <option value={3}>Alternativa D</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-6 py-2.5 rounded-xl hover:bg-purple-200 text-xs font-black transition-all"
                >
                  + Inserir na Lista
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-black py-4 rounded-xl hover:bg-purple-700 shadow-xl shadow-purple-200 dark:shadow-purple-900/40"
            >
              Publicar Quiz ({questions.length} Questões)
            </button>
          </form>
        </motion.div>
      )}

      {/* Main listings */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Quizzes Disponíveis
        </h2>

        {quizzes.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 text-center py-12 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 text-gray-500">
            Nenhum quiz publicado ainda nesta masmorra de conhecimento. 
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map(q => {
              const quizClassDoc = classes.find(c => c.id === q.classId);
              const hasTaken = userSubmissions.find(sub => sub.quizId === q.id);

              return (
                <div 
                  key={q.id}
                  className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        {quizClassDoc?.name || 'Geral'}
                      </span>
                      {hasTaken ? (
                        <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Check className="h-2.5 w-2.5" /> Nota: {hasTaken.score}/{hasTaken.totalQuestions}
                        </span>
                      ) : (
                        <span className="bg-yellow-105 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                          Pendente
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-black dark:text-white leading-tight">{q.title}</h3>
                      <p className="text-gray-400 text-[11px] font-bold mt-1 uppercase tracking-wider">
                        Criado por: {q.creatorName} ({q.questions?.length || 0} desafios)
                      </p>
                    </div>

                    {q.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        {q.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-2">
                    {!profile?.isProfessor ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleStartQuiz(q)}
                          className={cn(
                            "w-full text-center py-3 rounded-xl font-black text-sm transition-all shadow-md shadow-blue-105 dark:shadow-none",
                            hasTaken 
                              ? "bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 dark:border-zinc-700"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          )}
                        >
                          {hasTaken ? "Responder Novamente" : "Resolver Desafio"}
                        </button>
                        <button
                          onClick={() => setQrModalQuiz(q)}
                          className="w-full text-center py-2.5 rounded-xl text-xs font-black bg-gray-50 dark:bg-zinc-800/80 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-650 dark:text-gray-350 border border-gray-200 dark:border-zinc-700/60 transition-all flex items-center justify-center gap-1.5"
                        >
                          <QrCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span>Gerar QR Code de Acesso</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setExpandedQuizId(expandedQuizId === q.id ? null : q.id)}
                            className="w-full text-center py-2.5 rounded-xl text-xs font-black bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:opacity-90 transition-all block"
                          >
                            {expandedQuizId === q.id ? "Fechar Notas" : "Ver Notas"}
                          </button>
                          <button
                            onClick={() => setQrModalQuiz(q)}
                            className="w-full text-center py-2.5 rounded-xl text-xs font-black bg-gray-50 dark:bg-zinc-800/80 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-650 dark:text-gray-350 border border-gray-200 dark:border-zinc-700/60 transition-all flex items-center justify-center gap-1.5"
                          >
                            <QrCode className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span>QR Code</span>
                          </button>
                        </div>

                        {expandedQuizId === q.id && (
                          <div className="bg-purple-50/30 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-100/50 dark:border-purple-900/20 mt-2 space-y-2 text-xs">
                            <p className="font-black text-purple-600 uppercase tracking-widest text-[9px]">Histórico de Submissões</p>
                            {submissions.filter(s => s.quizId === q.id).length === 0 ? (
                              <p className="text-gray-404 font-bold py-1">Nenhum aluno submeteu ainda.</p>
                            ) : (
                              <div className="space-y-1.5 pt-1.5">
                                {submissions.filter(s => s.quizId === q.id).map(s => (
                                  <div key={s.id} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-zinc-800 last:border-0">
                                    <span className="font-extrabold text-black dark:text-gray-200">{s.studentName}</span>
                                    <span className="font-black bg-purple-100/50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded">
                                      {s.score} / {s.totalQuestions}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Sharing Modal */}
      {qrModalQuiz && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-md w-full border border-gray-100 dark:border-zinc-800 shadow-2xl relative text-center"
          >
            <button
              onClick={() => setQrModalQuiz(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-black dark:hover:text-white transition-all"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-6 mt-2">
              <div className="bg-blue-50 dark:bg-blue-900/15 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter leading-tight">
                Acessar Quiz
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1 px-4 leading-normal">
                {qrModalQuiz.title}
              </p>
            </div>

            {/* Generated QR Code Container */}
            <div className="bg-gray-50 dark:bg-zinc-950 p-6 rounded-3xl inline-block border border-gray-100 dark:border-zinc-800/80 shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  window.location.origin + "/quizzes?quizId=" + qrModalQuiz.id
                )}`} 
                alt="QR Code do Quiz" 
                className="w-48 h-48 rounded-xl block mx-auto bg-white p-2"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-widest mt-5 mb-5">
              Escaneie com a câmera do celular para responder!
            </p>

            <div className="text-center space-y-3">
              <div className="bg-gray-50 dark:bg-zinc-800/50 p-3.5 rounded-xl flex items-center justify-between gap-3 text-left border border-gray-100 dark:border-zinc-800/60 w-full min-w-0">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate flex-1 block">
                  {window.location.origin + "/quizzes?quizId=" + qrModalQuiz.id}
                </span>
                <button
                  onClick={() => {
                    const quizUrl = window.location.origin + "/quizzes?quizId=" + qrModalQuiz.id;
                    navigator.clipboard.writeText(quizUrl);
                    alert("Link do quiz copiado para a área de transferência!");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  Copiar Link
                </button>
              </div>

              <button
                onClick={() => setQrModalQuiz(null)}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-black py-3.5 rounded-2xl hover:opacity-95 transition-all text-sm uppercase tracking-wider cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

const MyGroups = ({ user }: { user: any }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Read all classrooms
    const qClasses = query(collection(db, 'classes'));
    const unsubClasses = onSnapshot(qClasses, snap => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassRoom)));
    });

    // Read groups that are containing our UID in members list
    const qGroups = query(collection(db, 'groups'), where('members', 'array-contains', user.uid));
    const unsubGroups = onSnapshot(qGroups, snap => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)));
      setLoading(false);
    });

    return () => {
      unsubClasses();
      unsubGroups();
    };
  }, [user.uid]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight mb-2 uppercase leading-none">⚔️ Meus Grupos</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Equipes e grupos que você faz parte nas masmorras de conhecimento.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500 font-black text-lg animate-pulse">Buscando equipes...</div>
      ) : groups.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 text-center py-16 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm max-w-2xl mx-auto">
          <div className="bg-blue-50 dark:bg-zinc-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-black text-black dark:text-white mb-2 uppercase">Nenhum Grupo Encontrado</h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">Você ainda não entrou e nem criou nenhum grupo de trabalho.</p>
          <button 
            onClick={() => navigate('/classes')} 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all inline-flex items-center gap-2"
          >
            Navegar pelas Salas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {groups.map(g => {
            const matchedClass = classes.find(c => c.id === g.classId);
            return (
              <motion.div
                key={g.id}
                whileHover={{ y: -6, scale: 1.01 }}
                onClick={() => navigate(`/group/${g.id}`)}
                className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 p-8 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-blue-50 dark:bg-zinc-800 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                    </div>
                    {matchedClass && (
                      <span className="bg-blue-105 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        {matchedClass.name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-black dark:text-white leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {g.name}
                  </h3>
                  {g.description && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
                      {g.description}
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 dark:border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block leading-none">Membros</span>
                    <span className="font-bold text-sm text-black dark:text-white">
                      {g.members?.length || 0} / {g.maxMembers || 4}
                    </span>
                  </div>

                  <button className="bg-gray-55 dark:bg-zinc-800 group-hover:bg-blue-600 p-2.5 rounded-xl group-hover:text-white text-blue-600 dark:text-blue-400 transition-all">
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Classes = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [code, setCode] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newBossName, setNewBossName] = useState('');
  const [newDifficulty, setNewDifficulty] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'classes'));
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassRoom));
      list.sort((a, b) => {
        const timeA = a.createdAt ? (typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0;
        const timeB = b.createdAt ? (typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0;
        return timeB - timeA;
      });
      setClasses(list);
    });
  }, []);

  const handleDeleteClass = async (classId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza de que deseja destruir esta masmorra? Todos os grupos nela criados também serão perdidos.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'classes', classId));
      setClasses(prev => prev.filter(c => c.id !== classId));
    } catch (err) {
      console.error("Erro ao deletar sala:", err);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = classes.find(c => c.code.toLowerCase() === code.toLowerCase());
    if (found) {
      navigate(`/class/${found.id}`);
    } else {
      alert('Código de sala não encontrado.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newClassData = {
      name: newClassName,
      code: newCode,
      bossName: newBossName || 'Mestre Desconhecido',
      difficulty: newDifficulty,
      creatorId: user.uid,
      createdAt: new Date()
    };
    
    try {
      const docRef = await addDoc(collection(db, 'classes'), newClassData);
      
      // Optimistic state insertion
      setClasses(prev => [{ id: docRef.id, ...newClassData } as ClassRoom, ...prev]);
      
      setNewClassName('');
      setNewBossName('');
      setNewDifficulty(1);
      setShowCreate(false);
      navigate(`/class/${docRef.id}`);
    } catch (err) {
      console.error("Erro ao criar masmorra:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tight mb-2 uppercase leading-none">Masmorras de Conhecimento</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Explore as masmorras (salas) ou crie um novo desafio para seus alunos.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <form onSubmit={handleJoin} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Código da masmorra"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full sm:w-48 font-bold"
            />
            <button type="submit" className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all flex items-center gap-2 group shadow-lg shadow-blue-100 dark:shadow-blue-900/20">
              <Search className="h-4 w-4 group-hover:scale-110 transition-transform" /> Explorar
            </button>
          </form>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Nova Masmorra
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="bg-blue-50 dark:bg-zinc-900 p-8 rounded-3xl border-2 border-blue-100 dark:border-zinc-800 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Map className="h-40 w-40 text-blue-600" />
              </div>
              <h2 className="text-xl font-black text-blue-900 dark:text-blue-400 mb-6 flex items-center gap-2 relative z-10">
                <Map className="h-6 w-6" /> Forjar Nova Masmorra
              </h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">Nome da Masmorra (Matéria)</label>
                  <input
                    type="text"
                    placeholder="Ex: Alquimia de Dados I"
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white dark:border-zinc-800 bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">Nome do Chefão (Professor)</label>
                  <input
                    type="text"
                    placeholder="Ex: Prof. Dr. Arcanista"
                    value={newBossName}
                    onChange={e => setNewBossName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white dark:border-zinc-800 bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest flex justify-between">
                    Nível de Dificuldade
                    <span className="text-blue-600 dark:text-blue-400">{newDifficulty} / 5</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewDifficulty(lvl)}
                        className={cn(
                          "flex-1 py-3 rounded-xl font-black transition-all border-2",
                          newDifficulty >= lvl 
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20" 
                            : "bg-white dark:bg-zinc-800 border-blue-100 dark:border-zinc-700 text-blue-200 dark:text-zinc-600 hover:border-blue-300"
                        )}
                      >
                        <Skull className={cn("h-5 w-5 mx-auto", newDifficulty >= lvl ? "opacity-100" : "opacity-30")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="w-full bg-blue-600 dark:bg-blue-500 text-white px-8 py-4 rounded-xl font-black hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                    Abrir Portais da Masmorra
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {classes.map(c => (
          <motion.div
            key={c.id}
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-2xl transition-all group cursor-pointer overflow-hidden flex flex-col"
            onClick={() => navigate(`/class/${c.id}`)}
          >
            <div className="h-3 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600" />
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-50 dark:bg-zinc-800 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Skull className="h-7 w-7 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Skull 
                        key={i} 
                        className={cn(
                          "h-4 w-4",
                          i < (c.difficulty || 1) ? "text-red-500 fill-red-500" : "text-gray-200 dark:text-zinc-800"
                        )} 
                      />
                    ))}
                  </div>
                  {(c.creatorId === user.uid || profile?.isProfessor) && (
                    <button
                      onClick={(e) => handleDeleteClass(c.id, e)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 p-1.5 rounded-xl transition-all"
                      title="Destruir Masmorra (Mestre)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-black dark:text-white mb-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.name}</h3>
              <p className="text-gray-400 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Código: {c.code}</p>
              
              <div className="mt-auto pt-6 border-t border-gray-50 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20">
                    <Crown className="h-4 w-4 text-black" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Chefão</span>
                    <span className="text-xs font-black text-black dark:text-white">{c.bossName || 'Mestre Desconhecido'}</span>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-zinc-800 p-2 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors rotate-180" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ClassDetail = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const { classId } = useParams();
  const [classroom, setClassroom] = useState<ClassRoom | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', maxMembers: 4 });
  const navigate = useNavigate();

  useEffect(() => {
    if (!classId) return;
    getDoc(doc(db, 'classes', classId)).then(s => setClassroom({ id: s.id, ...s.data() } as ClassRoom));

    const q = query(collection(db, 'groups'), where('classId', '==', classId));
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Group));
      list.sort((a, b) => {
        const timeA = a.createdAt ? (typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0;
        const timeB = b.createdAt ? (typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0;
        return timeB - timeA;
      });
      setGroups(list);
    });
  }, [classId]);

  const handleDeleteClass = async () => {
    if (!classId) return;
    if (!window.confirm('Tem certeza de que deseja destruir esta masmorra? Todos os grupos nela criados também serão perdidos.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'classes', classId));
      navigate('/classes');
    } catch (err) {
      console.error("Erro ao deletar masmorra:", err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !classId) return;
    const docRef = await addDoc(collection(db, 'groups'), {
      ...newGroup,
      classId,
      creatorId: user.uid,
      members: [user.uid],
      createdAt: new Date()
    });
    setShowCreate(false);
    navigate(`/group/${docRef.id}`);
  };

  if (!classroom) return <div className="p-8 text-center text-gray-500">Carregando sala...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-12">
        <button onClick={() => navigate('/classes')} className="flex items-center text-blue-600 dark:text-blue-400 font-bold mb-6 hover:translate-x-[-4px] transition-transform">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para masmorras
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-2xl shadow-lg shadow-blue-100 dark:shadow-blue-900/20">
                <Skull className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">{classroom.name}</h1>
                <p className="text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">Masmorra: {classroom.code}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-yellow-400 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-yellow-400/20">
                <Crown className="h-5 w-5 text-black" />
                <div>
                  <p className="text-[10px] font-black text-black/50 uppercase tracking-widest leading-none">Chefão da Área</p>
                  <p className="text-lg font-black text-black leading-tight">{classroom.bossName || 'Mestre Desconhecido'}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Skull 
                      key={i} 
                      className={cn(
                        "h-5 w-5",
                        i < (classroom.difficulty || 1) ? "text-red-500 fill-red-500" : "text-gray-200 dark:text-zinc-800"
                      )} 
                    />
                  ))}
                </div>
                <div className="border-l border-gray-100 dark:border-zinc-800 pl-3">
                  <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Dificuldade</p>
                  <p className="text-lg font-black text-black dark:text-white leading-tight">{classroom.difficulty || 1} / 5</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {(classroom.creatorId === user.uid || profile?.isProfessor) && (
              <button
                onClick={handleDeleteClass}
                className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-900/40 border-2 border-red-200 dark:border-red-900/40 px-6 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-sm"
                title="Derrubar Masmorra (Mestre)"
              >
                <Trash2 className="h-5 w-5" /> Destruir Masmorra {profile?.isProfessor && "(Mestre)"}
              </button>
            )}
            <button
              onClick={() => setShowCreate(true)}
              className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 dark:shadow-blue-900/40 flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" /> Formar Nova Guilda (Grupo)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {groups.map(g => (
          <motion.div
            key={g.id}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl dark:hover:shadow-blue-900/10 transition-all flex flex-col relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Shield className="h-24 w-24 text-blue-600" />
            </div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <h3 className="text-2xl font-black text-black dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase">{g.name}</h3>
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-yellow-400/20">
                {g.members.length} / {g.maxMembers} Heróis
              </span>
            </div>
            <p className="text-gray-600 dark:text-zinc-400 font-medium mb-8 flex-grow line-clamp-3 relative z-10 leading-relaxed">{g.description}</p>
            <div className="flex flex-col gap-3 relative z-10">
              {g.members.includes(user.uid) ? (
                <button
                  onClick={() => navigate(`/group/${g.id}`)}
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-black hover:bg-blue-700 dark:hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
                >
                  <MessageSquare className="h-5 w-5" /> Chat da Guilda
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/group/${g.id}`)}
                  className="w-full bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 py-4 rounded-2xl font-black hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                >
                  Ver Detalhes / Alistar-se
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {groups.length === 0 && (
          <div className="col-span-full py-24 text-center bg-gray-50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-zinc-800">
            <Users className="h-16 w-16 text-gray-300 dark:text-zinc-700 mx-auto mb-6 opacity-50" />
            <p className="text-gray-500 dark:text-zinc-500 font-black text-xl uppercase tracking-widest leading-none">Nenhuma guilda formada</p>
            <p className="text-gray-400 dark:text-zinc-600 mt-2 font-medium">Reúna seus heróis para enfrentar os desafios!</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-zinc-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Shield className="h-40 w-40 text-blue-600" />
              </div>
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-2xl shadow-lg shadow-blue-900/20">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-black dark:text-white uppercase leading-none">Fundar Guilda</h2>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-2 leading-none">Nome da Guilda</label>
                  <input
                    type="text"
                    placeholder="Ex: Os Cavaleiros do Frontend"
                    value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-4 py-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all font-bold placeholder:text-gray-300 dark:placeholder:text-zinc-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-2 leading-none">Missão da Guilda (Descrição)</label>
                  <textarea
                    placeholder="Qual o objetivo desta guilda na masmorra?"
                    value={newGroup.description}
                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="w-full px-4 py-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all font-bold h-32 placeholder:text-gray-300 dark:placeholder:text-zinc-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-2 leading-none">Limite de Heróis</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={newGroup.maxMembers}
                    onChange={e => setNewGroup({ ...newGroup, maxMembers: parseInt(e.target.value) })}
                    className="w-full px-4 py-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all font-bold"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="submit" className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-black hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                    Fundar Guilda
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="px-8 py-4 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">
                    Recuar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GroupDetail = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const { groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [appMessage, setAppMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!groupId) return;
    const unsubGroup = onSnapshot(doc(db, 'groups', groupId), async snap => {
      const g = { id: snap.id, ...snap.data() } as Group;
      setGroup(g);

      // Fetch member profiles
      const memberProfiles = await Promise.all(g.members.map(async mId => {
        const s = await getDoc(doc(db, 'users', mId));
        return { uid: s.id, ...s.data() } as UserProfile;
      }));
      setMembers(memberProfiles);
    });

    const qMsg = query(collection(db, 'messages'), where('groupId', '==', groupId), orderBy('createdAt', 'asc'));
    const unsubMsg = onSnapshot(qMsg, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });

    const qApp = query(collection(db, 'applications'), where('groupId', '==', groupId));
    const unsubApp = onSnapshot(qApp, snap => {
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() } as Application));
      setApplications(apps);
      setHasApplied(apps.some(a => a.applicantId === user.uid));
    });

    return () => { unsubGroup(); unsubMsg(); unsubApp(); };
  }, [groupId, user.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !groupId) return;
    await addDoc(collection(db, 'messages'), {
      groupId,
      senderId: user.uid,
      senderName: profile?.name || 'Aluno',
      text: newMessage,
      createdAt: new Date()
    });
    setNewMessage('');
  };

  const handleApply = async () => {
    if (!user || !groupId) return;
    await addDoc(collection(db, 'applications'), {
      groupId,
      applicantId: user.uid,
      status: 'pending',
      message: appMessage,
      createdAt: new Date()
    });
    setAppMessage('');
  };

  const handleApprove = async (app: Application) => {
    if (!group) return;
    await updateDoc(doc(db, 'applications', app.id), { status: 'accepted' });
    await updateDoc(doc(db, 'groups', group.id), {
      members: arrayUnion(app.applicantId)
    });
  };

  const handleReject = async (app: Application) => {
    await updateDoc(doc(db, 'applications', app.id), { status: 'rejected' });
  };

  if (!group) return <div className="p-8 text-center text-gray-500">Carregando grupo...</div>;

  const isMember = group.members.includes(user.uid);
  const isCreator = group.creatorId === user.uid;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Info & Members */}
        <div className="lg:w-1/3 space-y-8">
          <button onClick={() => navigate(`/class/${group.classId}`)} className="flex items-center text-blue-600 dark:text-blue-400 font-bold hover:translate-x-[-4px] transition-transform">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para sala
          </button>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Shield className="h-40 w-40 text-blue-600" />
            </div>
            <h1 className="text-4xl font-black text-black dark:text-white leading-tight mb-4 relative z-10 uppercase">{group.name}</h1>
            <p className="text-gray-600 dark:text-zinc-400 font-medium mb-6 relative z-10">{group.description}</p>
            <div className="flex items-center space-x-2 mb-8 relative z-10">
              <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-xs font-black shadow-lg shadow-yellow-400/20">
                {group.members.length} / {group.maxMembers} Heróis
              </span>
            </div>

            <h3 className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4 leading-none">Membros da Guilda</h3>
            <div className="space-y-3 relative z-10">
              {members.map(m => (
                <div key={m.uid} className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 transition-colors">
                  {m.photoURL ? (
                    <img src={m.photoURL} alt="" className="h-10 w-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-black dark:text-white text-sm truncate">{m.name} {m.uid === group.creatorId && <span className="text-[9px] bg-yellow-400 text-black px-1.5 py-0.5 rounded ml-1 uppercase shadow-sm">Líder</span>}</p>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-wider truncate">{m.role || 'Guerreiro Solitário'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isMember && (
            <div className="bg-blue-600 dark:bg-blue-500 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/40 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sword className="h-20 w-20" />
              </div>
              <h3 className="text-2xl font-black mb-4 relative z-10 uppercase tracking-tighter">Quer se alistar?</h3>
              {hasApplied ? (
                <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm relative z-10">
                  <p className="font-bold flex items-center gap-2">
                    <Check className="h-5 w-5" /> Inscrição enviada!
                  </p>
                  <p className="text-sm text-blue-100 mt-1">Aguarde o líder da guilda aceitar seu juramento.</p>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  <p className="text-blue-100 font-medium leading-relaxed">Envie sua mensagem para o líder da guilda. Demonstre seu valor!</p>
                  <textarea
                    placeholder="Saudações! Gostaria de me juntar à guilda pois..."
                    value={appMessage}
                    onChange={e => setAppMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-white transition-all font-medium h-24"
                  />
                  <button
                    onClick={handleApply}
                    className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-900/20"
                  >
                    Enviar Pedido de Alistamento
                  </button>
                </div>
              )}
            </div>
          )}

          {isCreator && applications.filter(a => a.status === 'pending').length > 0 && (
            <div className="bg-yellow-50 dark:bg-zinc-900/50 rounded-3xl p-8 border border-yellow-100 dark:border-zinc-800 shadow-sm">
              <h3 className="text-xl font-black text-black dark:text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-tighter leading-none">
                <Plus className="h-5 w-5" /> Recrutas Pendentes
              </h3>
              <div className="space-y-4">
                {applications.filter(a => a.status === 'pending').map(app => (
                  <div key={app.id} className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-yellow-200 dark:border-zinc-700">
                    <p className="text-sm text-gray-600 dark:text-zinc-400 font-medium mb-3 italic">"{app.message}"</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(app)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-black hover:bg-blue-700 transition-all"
                      >
                        Recrutar
                      </button>
                      <button
                        onClick={() => handleReject(app)}
                        className="flex-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-2 rounded-xl text-xs font-black hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <div className="lg:w-2/3 flex flex-col h-[700px] bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 dark:bg-blue-500 p-2.5 rounded-xl shadow-lg shadow-blue-900/20">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-black text-black dark:text-white uppercase leading-none">Canal de Chat</h3>
            </div>
            {!isMember && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full border border-red-100 dark:border-red-900/30">Área Restrita</span>}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/10 dark:bg-zinc-950/20">
            {messages.map((m, i) => (
              <div key={m.id} className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-2", m.senderId === user.uid ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-3xl shadow-sm relative group/msg",
                  m.senderId === user.uid
                    ? "bg-blue-600 text-white rounded-tr-none shadow-blue-900/10"
                    : "bg-white dark:bg-zinc-800 text-black dark:text-white border border-gray-100 dark:border-zinc-700 rounded-tl-none shadow-zinc-900/10"
                )}>
                  {m.senderId !== user.uid && <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-blue-600 dark:text-blue-400">{m.senderName}</p>}
                  <p className="font-medium leading-relaxed">{m.text}</p>
                  <div className={cn(
                    "absolute top-0 w-2 h-2",
                    m.senderId === user.uid ? "-right-1 bg-blue-600 rounded-sm rotate-45" : "-left-1 bg-white dark:bg-zinc-800 border-l border-t border-gray-100 dark:border-zinc-700 rounded-sm rotate-45"
                  )} />
                </div>
                <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-600 mt-1 px-2 uppercase">
                  {m.createdAt ? (typeof m.createdAt.toDate === 'function' ? format(m.createdAt.toDate(), 'HH:mm', { locale: ptBR }) : format(new Date(m.createdAt), 'HH:mm', { locale: ptBR })) : '...'}
                </span>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-zinc-700">
                <div className="bg-gray-100 dark:bg-zinc-900 p-8 rounded-full mb-4">
                  <MessageSquare className="h-12 w-12 opacity-20" />
                </div>
                <p className="font-black uppercase tracking-widest text-sm">O silêncio ecoa na guilda...</p>
              </div>
            )}
          </div>

          {isMember ? (
            <form onSubmit={handleSendMessage} className="p-6 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex gap-3">
              <input
                type="text"
                placeholder="Compartilhe seus planos..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all font-bold text-black dark:text-white"
              />
              <button type="submit" className="bg-blue-600 dark:bg-blue-500 text-white p-4 rounded-2xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 dark:shadow-blue-900/40">
                <Send className="h-6 w-6" />
              </button>
            </form>
          ) : (
            <div className="p-8 bg-gray-50 dark:bg-zinc-900/50 text-center border-t border-gray-100 dark:border-zinc-800">
              <p className="text-gray-500 dark:text-zinc-600 font-bold">Você deve ser um herói desta guilda para sussurrar nestas paredes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ACADEMIC_TOPICS = [
  { id: 'provas_trabalhos', name: 'Provas & Trabalhos', icon: '📝' },
  { id: 'tcc_monografia', name: 'TCC & Monografia', icon: '🎓' },
  { id: 'estagio_carreira', name: 'Estágios & Carreira', icon: '💼' },
  { id: 'pesquisa_cientifica', name: 'Iniciação Científica', icon: '🔬' },
  { id: 'vida_academica', name: 'Vida Universitária', icon: '🏛️' },
  { id: 'duvida_geral', name: 'Dúvidas Gerais', icon: '💡' }
];

const Forum = ({ user, profile }: { user: any; profile: UserProfile | null }) => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'likes' | 'recent'>('likes'); // default is likes (destaque)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTopic, setActiveTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newClassId, setNewClassId] = useState('duvida_geral');
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const qTopics = query(collection(db, 'forumTopics'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(qTopics, (snapshot) => {
      const list: ForumTopic[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ForumTopic);
      });
      setTopics(list);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!activeTopic) {
      setReplies([]);
      return;
    }
    const qReplies = query(
      collection(db, 'forumReplies'),
      where('topicId', '==', activeTopic.id),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(qReplies, (snapshot) => {
      const list: ForumReply[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ForumReply);
      });
      setReplies(list);
    }, (error) => {
      console.error("Replies listener failed:", error);
    });
    return unsubscribe;
  }, [activeTopic]);

  const liveActiveTopic = activeTopic ? topics.find(t => t.id === activeTopic.id) || activeTopic : null;

  const handleLikeTopic = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const topicDocRef = doc(db, 'forumTopics', topicId);
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    const alreadyLiked = topic.likedBy?.includes(user.uid);
    const newLikedBy = alreadyLiked 
      ? topic.likedBy.filter(uid => uid !== user.uid)
      : [...(topic.likedBy || []), user.uid];
    const newLikesCount = alreadyLiked ? (topic.likesCount - 1) : (topic.likesCount + 1);

    try {
      await updateDoc(topicDocRef, {
        likedBy: newLikedBy,
        likesCount: Math.max(0, newLikesCount)
      });
    } catch (err) {
      console.error("Erro ao curtir dúvida:", err);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newDesc.trim()) return;

    const matchedTopic = ACADEMIC_TOPICS.find(t => t.id === newClassId);

    const topicData: Omit<ForumTopic, 'id'> = {
      title: newTitle.trim(),
      description: newDesc.trim(),
      creatorId: user.uid,
      creatorName: profile?.name || user.displayName || 'Estudante',
      creatorPhoto: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`,
      classId: newClassId || 'duvida_geral',
      className: matchedTopic ? `${matchedTopic.icon} ${matchedTopic.name}` : '💡 Dúvidas Gerais',
      likesCount: 0,
      likedBy: [],
      replyCount: 0,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'forumTopics'), topicData);
      setNewTitle('');
      setNewDesc('');
      setNewClassId('duvida_geral');
      setShowCreateModal(false);
    } catch (err) {
      console.error("Erro ao postar dúvida:", err);
    }
  };

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeTopic || !replyText.trim()) return;

    try {
      const repliesColRef = collection(db, 'forumReplies');
      const newReply = {
        topicId: activeTopic.id,
        senderId: user.uid,
        senderName: profile?.name || user.displayName || 'Estudante',
        senderPhoto: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`,
        text: replyText.trim(),
        createdAt: serverTimestamp()
      };
      await addDoc(repliesColRef, newReply);

      // Increment replyCount
      const topicDocRef = doc(db, 'forumTopics', activeTopic.id);
      await updateDoc(topicDocRef, {
        replyCount: (liveActiveTopic?.replyCount || 0) + 1
      });

      setReplyText('');
    } catch (err) {
      console.error("Erro ao responder dúvida:", err);
    }
  };

  const handleDeleteTopic = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente excluir esta dúvida? Todas as respostas serão perdidas.')) return;
    try {
      await deleteDoc(doc(db, 'forumTopics', topicId));
      if (activeTopic?.id === topicId) {
        setActiveTopic(null);
      }
    } catch (err) {
      console.error("Erro ao excluir dúvida:", err);
    }
  };

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassId === 'all' || t.classId === selectedClassId;
    return matchesSearch && matchesClass;
  }).sort((a, b) => {
    if (sortBy === 'likes') {
      return (b.likesCount || 0) - (a.likesCount || 0); // upvotes (destaque)
    } else {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime; // recent
    }
  });

  const formatTopicDate = (createdAt: any) => {
    if (!createdAt) return 'Agora mesmo';
    try {
      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      return format(date, "d 'de' MMMM, HH:mm", { locale: ptBR });
    } catch (e) {
      return 'Recentemente';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AnimatePresence mode="wait">
        {!liveActiveTopic ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header section with university-themed layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div>
                <span className="bg-blue-105/10 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest block w-max mb-3">
                  Espaço Acadêmico
                </span>
                <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-2">
                  Dúvidas & Fórum
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-xl text-sm leading-relaxed">
                  Tire dúvidas sobre matérias, colabore com as respostas de outros estudantes e apoie os posts de maior relevância!
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white min-w-[200px] py-4 rounded-2xl font-black transition-all shadow-lg hover:shadow-blue-300 dark:hover:shadow-none flex items-center justify-center gap-2 text-sm shrink-0 uppercase tracking-wider"
              >
                <Plus className="h-5 w-5" /> Mandar uma Dúvida
              </button>
            </div>

            {/* Quick Filters, Search & Categories layout */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm space-y-5">
              {/* Search & Sort controllers */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar por assunto ou palavra-chave..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-55 dark:bg-zinc-950/80 border border-gray-100 dark:border-zinc-850 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold text-sm text-black dark:text-white"
                  />
                </div>
                {/* Sorting controllers */}
                <div className="flex bg-gray-55 dark:bg-zinc-950 p-1.5 rounded-2xl border border-gray-100 dark:border-zinc-850 shrink-0">
                  <button
                    onClick={() => setSortBy('likes')}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-wider",
                      sortBy === 'likes'
                        ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-450 hover:text-black dark:hover:text-white"
                    )}
                  >
                    <Flame className="h-4 w-4" /> Em Destaque (Likes)
                  </button>
                  <button
                    onClick={() => setSortBy('recent')}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-wider",
                      sortBy === 'recent'
                        ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-455 hover:text-black dark:hover:text-white"
                    )}
                  >
                    <Zap className="h-4 w-4" /> Recentes
                  </button>
                </div>
              </div>

              {/* Classroom categories list */}
              <div className="pt-2 border-t border-gray-50 dark:border-zinc-800">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2.5">
                  Filtrar por Tópico da Faculdade
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedClassId('all')}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-bold transition-all border",
                      selectedClassId === 'all'
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-gray-55 dark:bg-zinc-950 border-gray-100 dark:border-zinc-850 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-zinc-700"
                    )}
                  >
                    🌟 Todos os Tópicos
                  </button>
                  {ACADEMIC_TOPICS.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedClassId(topic.id)}
                      className={cn(
                        "px-5 py-2 rounded-xl text-xs font-bold transition-all border max-w-xs truncate",
                        selectedClassId === topic.id
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-gray-55 dark:bg-zinc-950 border-gray-100 dark:border-zinc-850 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-zinc-700"
                      )}
                    >
                      {topic.icon} {topic.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List of doubts/topics */}
            <div className="space-y-4">
              {filteredTopics.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] py-16 px-4 text-center">
                  <div className="bg-blue-50 dark:bg-blue-950/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">Nenhuma Dúvida Encontrada</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1 max-w-sm mx-auto">
                    Não encontramos dúvidas para o filtro selecionado. Mande sua dúvida para inaugurar este espaço!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredTopics.map((t) => {
                    const isLiked = t.likedBy?.includes(user?.uid);
                    return (
                      <motion.div
                        key={t.id}
                        layout
                        onClick={() => setActiveTopic(t)}
                        className="bg-white dark:bg-zinc-900 hover:bg-gray-50/55 dark:hover:bg-zinc-900/60 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col md:flex-row gap-5 items-start justify-between group"
                      >
                        <div className="space-y-2.5 flex-1 min-w-0">
                          {/* Subject category tag */}
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                              {t.className || 'Dúvidas Gerais'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">
                              • Postado em {formatTopicDate(t.createdAt)}
                            </span>
                          </div>

                          <h2 className="text-xl font-black text-black dark:text-white tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {t.title}
                          </h2>

                          <p className="text-gray-550 dark:text-gray-400 text-sm font-bold line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>

                          {/* Creator item card inside list */}
                          <div className="flex items-center gap-2.5 pt-2">
                            {t.creatorPhoto ? (
                              <img src={t.creatorPhoto} alt="" className="w-5.5 h-5.5 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-5.5 h-5.5 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                <UserIcon className="h-3 w-3 text-gray-400" />
                              </div>
                            )}
                            <span className="text-xs font-semibold text-gray-650 dark:text-gray-350">
                              Aluno {t.creatorName}
                            </span>
                          </div>
                        </div>

                        {/* Interactive upvotes indicator and replies count */}
                        <div className="flex md:flex-col items-center gap-2 self-stretch justify-end shrink-0">
                          {/* Likes (Destaque) Button */}
                          <button
                            onClick={(e) => handleLikeTopic(t.id, e)}
                            className={cn(
                              "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all border w-full",
                              isLiked
                                ? "bg-red-500 hover:bg-red-650 border-red-500 text-white shadow-md shadow-red-100 dark:shadow-none"
                                : "bg-gray-55 dark:bg-zinc-950 border-gray-100 dark:border-zinc-850 text-gray-700 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-750"
                            )}
                          >
                            <ThumbsUp className={cn("h-4 w-4", isLiked ? "fill-white" : "")} />
                            <span>{t.likesCount || 0}</span>
                          </button>

                          {/* Reply Count Indicator */}
                          <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black bg-blue-50 dark:bg-blue-900/15 text-blue-600 dark:text-blue-400 border border-blue-105/10 dark:border-none w-full">
                            <MessageCircle className="h-4 w-4" />
                            <span>{t.replyCount || 0}</span>
                          </div>

                          {/* Delete option for creator */}
                          {t.creatorId === user?.uid && (
                            <button
                              onClick={(e) => handleDeleteTopic(t.id, e)}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all self-center md:self-end"
                              title="Excluir Dúvida"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Doubt Detail View with discussion and replies list */
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            {/* Back to list button */}
            <button
              onClick={() => setActiveTopic(null)}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-sm uppercase tracking-wider hover:translate-x-[-4px] transition-transform"
            >
              <ArrowLeft className="h-5 w-5" /> Voltar para o Fórum
            </button>

            {/* Main Topic Question Card */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    {liveActiveTopic.className || 'Dúvidas Gerais'}
                  </span>
                  <span className="text-xs font-bold text-gray-450 dark:text-gray-500">
                    Postado em {formatTopicDate(liveActiveTopic.createdAt)}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight uppercase">
                  {liveActiveTopic.title}
                </h1>
              </div>

              {/* Description Body */}
              <div className="bg-gray-55 dark:bg-zinc-950/80 p-6 rounded-2xl border border-gray-100 dark:border-zinc-850/50">
                <p className="text-black dark:text-gray-105 font-semibold text-base leading-relaxed whitespace-pre-wrap">
                  {liveActiveTopic.description}
                </p>
              </div>

              {/* Creator details & upvoting button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-50 dark:border-zinc-850">
                <div className="flex items-center gap-3">
                  {liveActiveTopic.creatorPhoto ? (
                    <img src={liveActiveTopic.creatorPhoto} alt="" className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-black text-black dark:text-white leading-none">
                      {liveActiveTopic.creatorName}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 lowercase tracking-widest mt-1">
                      Autor da pergunta
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Upvote controller */}
                  <button
                    onClick={(e) => handleLikeTopic(liveActiveTopic.id, e)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all border",
                      liveActiveTopic.likedBy?.includes(user?.uid)
                        ? "bg-red-500 border-red-500 text-white hover:bg-red-650"
                        : "bg-gray-55 dark:bg-zinc-950 border-gray-100 dark:border-zinc-850 text-gray-700 dark:text-gray-400 hover:border-gray-350 dark:hover:border-zinc-750"
                    )}
                  >
                    <ThumbsUp className={cn("h-4 w-4", liveActiveTopic.likedBy?.includes(user?.uid) ? "fill-white" : "")} />
                    <span>Curtir Dúvida ({liveActiveTopic.likesCount || 0})</span>
                  </button>

                  {liveActiveTopic.creatorId === user?.uid && (
                    <button
                      onClick={(e) => handleDeleteTopic(liveActiveTopic.id, e)}
                      className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/40 text-red-600 p-3.5 rounded-xl transition-all"
                      title="Excluir Dúvida"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Discussion Replies List */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-black dark:text-white uppercase tracking-tight flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Respostas ({replies.length})</span>
              </h3>

              <div className="space-y-4">
                {replies.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] py-12 px-4 text-center">
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">
                      Nenhuma resposta enviada ainda. Seja o primeiro a responder esta dúvida!
                    </p>
                  </div>
                ) : (
                  replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm space-y-3.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {reply.senderPhoto ? (
                            <img src={reply.senderPhoto} alt="" className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-black text-black dark:text-white leading-tight">
                              {reply.senderName}
                            </p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                              Membro da guilda
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">
                          {formatTopicDate(reply.createdAt)}
                        </span>
                      </div>

                      <div className="pl-1 pt-1">
                        <p className="text-gray-800 dark:text-gray-200 text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                          {reply.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Answer Write Area */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm col-span-3">
              <form onSubmit={handleAddReply} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1.5">
                    Envie sua Resposta
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Responda e ajude o seu colega herói com as melhores instruções!"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-gray-55 dark:bg-zinc-950/80 border border-gray-100 dark:border-zinc-850 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold text-sm text-black dark:text-white leading-relaxed resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black transition-all shadow-lg hover:shadow-blue-350 dark:hover:shadow-none text-xs uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Send className="h-4 w-4" /> Enviar Resposta
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Topic Modal overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-xl w-full border border-gray-100 dark:border-zinc-800 shadow-2xl relative animate-in fade-in"
          >
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-black dark:hover:text-white transition-all overflow-hidden"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter mb-1 select-none">
              Mandar Nova Dúvida
            </h2>
            <p className="text-xs font-bold text-gray-450 uppercase tracking-wider mb-6">
              Inicie uma discussão de guilda no fórum de estudos!
            </p>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              {/* Select Category */}
              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1.5">
                  Tópico / Categoria
                </label>
                <select
                  value={newClassId}
                  onChange={e => setNewClassId(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-55 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:bg-white font-bold text-sm outline-none"
                >
                  {ACADEMIC_TOPICS.map(topic => (
                    <option key={topic.id} value={topic.id}>{topic.icon} {topic.name}</option>
                  ))}
                </select>
              </div>

              {/* Title input */}
              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1.5">
                  Título da Dúvida
                </label>
                <input
                  type="text"
                  placeholder="Ex: Como funciona herança múltipla em C++?"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-55 dark:bg-zinc-950/80 border border-gray-150 dark:border-zinc-850 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold text-sm text-black dark:text-white"
                />
              </div>

              {/* Description textarea */}
              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1.5">
                  Descreva seu problema com detalhes
                </label>
                <textarea
                  rows={5}
                  placeholder="Descreva detalhadamente qual erro você está encontrando ou quais tópicos acadêmicos deseja discutir..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-55 dark:bg-zinc-950/80 border border-gray-150 dark:border-zinc-850 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold text-sm text-black dark:text-white leading-relaxed resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-gray-300 font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-md text-xs uppercase tracking-wider"
                >
                  Publicar Dúvida
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const Summaries = ({ user, profile }: { user: any; profile: UserProfile | null }) => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<AcademicSummary[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeSummary, setActiveSummary] = useState<AcademicSummary | null>(null);
  const [comments, setComments] = useState<SummaryComment[]>([]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newClassId, setNewClassId] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const qSummaries = query(collection(db, 'academicSummaries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(qSummaries, (snapshot) => {
      const list: AcademicSummary[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as AcademicSummary);
      });
      setSummaries(list);
    });

    const qClasses = query(collection(db, 'classes'));
    const unsubscribeClasses = onSnapshot(qClasses, (snapshot) => {
      const list: ClassRoom[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ClassRoom);
      });
      setClasses(list);
    });

    return () => {
      unsubscribe();
      unsubscribeClasses();
    };
  }, []);

  useEffect(() => {
    if (!activeSummary) {
      setComments([]);
      return;
    }
    const qComments = query(
      collection(db, 'summaryComments'),
      where('summaryId', '==', activeSummary.id),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(qComments, (snapshot) => {
      const list: SummaryComment[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as SummaryComment);
      });
      setComments(list);
    }, (error) => {
      console.error("Comments listener failed:", error);
    });
    return unsubscribe;
  }, [activeSummary]);

  const liveActiveSummary = activeSummary ? summaries.find(s => s.id === activeSummary.id) || activeSummary : null;

  const handleVote = async (summaryId: string, type: 'like' | 'dislike', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const summaryDocRef = doc(db, 'academicSummaries', summaryId);
    const summary = summaries.find(s => s.id === summaryId);
    if (!summary) return;

    let likedBy = summary.likedBy || [];
    let dislikedBy = summary.dislikedBy || [];

    const alreadyLiked = likedBy.includes(user.uid);
    const alreadyDisliked = dislikedBy.includes(user.uid);

    if (type === 'like') {
      if (alreadyLiked) {
        likedBy = likedBy.filter(uid => uid !== user.uid);
      } else {
        likedBy = [...likedBy, user.uid];
        dislikedBy = dislikedBy.filter(uid => uid !== user.uid);
      }
    } else {
      if (alreadyDisliked) {
        dislikedBy = dislikedBy.filter(uid => uid !== user.uid);
      } else {
        dislikedBy = [...dislikedBy, user.uid];
        likedBy = likedBy.filter(uid => uid !== user.uid);
      }
    }

    try {
      await updateDoc(summaryDocRef, {
        likedBy,
        dislikedBy,
        likesCount: likedBy.length,
        dislikesCount: dislikedBy.length
      });
    } catch (err) {
      console.error("Erro ao votar no resumo:", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const sizeStr = file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${(file.size / 1024).toFixed(0)} KB`;
        setSelectedFile({ name: file.name, size: sizeStr });
      } else {
        alert("Por favor, selecione apenas arquivos PDF!");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;
      setSelectedFile({ name: file.name, size: sizeStr });
    }
  };

  const handleUploadSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newDesc.trim()) return;

    const matchedClass = classes.find(c => c.id === newClassId);

    const summaryData: Omit<AcademicSummary, 'id'> = {
      title: newTitle.trim(),
      description: newDesc.trim(),
      pdfUrl: '#',
      pdfName: selectedFile ? selectedFile.name : 'resumo_da_materia.pdf',
      pdfSize: selectedFile ? selectedFile.size : '1.4 MB',
      subjectId: newClassId || 'general',
      subjectName: matchedClass ? matchedClass.name : 'Geral & Transversais',
      likesCount: 0,
      dislikesCount: 0,
      likedBy: [],
      dislikedBy: [],
      creatorId: user.uid,
      creatorName: profile?.name || user.displayName || 'Estudante',
      creatorPhoto: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`,
      commentCount: 0,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'academicSummaries'), summaryData);
      setNewTitle('');
      setNewDesc('');
      setNewClassId('');
      setSelectedFile(null);
      setShowUploadModal(false);
    } catch (err) {
      console.error("Erro ao publicar resumo:", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeSummary || !commentText.trim()) return;

    try {
      const commentsColRef = collection(db, 'summaryComments');
      const newComment = {
        summaryId: activeSummary.id,
        senderId: user.uid,
        senderName: profile?.name || user.displayName || 'Estudante',
        senderPhoto: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`,
        text: commentText.trim(),
        createdAt: serverTimestamp()
      };
      await addDoc(commentsColRef, newComment);

      const summaryDocRef = doc(db, 'academicSummaries', activeSummary.id);
      await updateDoc(summaryDocRef, {
        commentCount: (liveActiveSummary?.commentCount || 0) + 1
      });

      setCommentText('');
    } catch (err) {
      console.error("Erro ao comentar resumo:", err);
    }
  };

  const handleDeleteSummary = async (summaryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente deletar este resumo acadêmico? Todas as avaliações e comentários serão perdidos.')) return;
    try {
      await deleteDoc(doc(db, 'academicSummaries', summaryId));
      if (activeSummary?.id === summaryId) {
        setActiveSummary(null);
      }
    } catch (err) {
      console.error("Erro ao excluir resumo:", err);
    }
  };

  const filteredSummaries = summaries.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassId === 'all' || s.subjectId === selectedClassId;
    return matchesSearch && matchesClass;
  }).sort((a, b) => {
    if (sortBy === 'votes') {
      const aBalance = (a.likesCount || 0) - (a.dislikesCount || 0);
      const bBalance = (b.likesCount || 0) - (b.dislikesCount || 0);
      return bBalance - aBalance;
    } else {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    }
  });

  const formatSummaryDate = (createdAt: any) => {
    if (!createdAt) return 'Agora mesmo';
    try {
      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      return format(date, "d 'de' MMMM, HH:mm", { locale: ptBR });
    } catch (e) {
      return 'Recentemente';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AnimatePresence mode="wait">
        {!liveActiveSummary ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header section with university-themed layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm animate-in fade-in duration-300">
              <div>
                <span className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest block w-max mb-3">
                  Biblioteca Coletiva
                </span>
                <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-2">
                  Resumos & PDF da Galera
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-xl text-sm leading-relaxed">
                  Suba seus próprios arquivos PDF de resumos, organize por matéria específica e colabore votando como Bom 👍 ou Ruim 👎!
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white min-w-[220px] py-4 rounded-2xl font-black transition-all shadow-lg hover:shadow-emerald-300 dark:hover:shadow-none flex items-center justify-center gap-2 text-sm shrink-0 uppercase tracking-wider"
              >
                <Upload className="h-5 w-5" /> Compartilhar Resumo
              </button>
            </div>

            {/* Quick Filters, Search & Categories layout */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm space-y-5">
              {/* Search & Sort controllers */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar por resumo, assunto..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-55 dark:bg-zinc-950/80 border border-gray-100 dark:border-zinc-850 focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold text-sm text-black dark:text-white"
                  />
                </div>
                {/* Sorting controllers */}
                <div className="flex bg-gray-55 dark:bg-zinc-950 p-1.5 rounded-2xl border border-gray-100 dark:border-zinc-850 shrink-0">
                  <button
                    onClick={() => setSortBy('votes')}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-wider",
                      sortBy === 'votes'
                        ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-450 hover:text-black dark:hover:text-white"
                    )}
                  >
                    <Flame className="h-4 w-4" /> Top Votados
                  </button>
                  <button
                    onClick={() => setSortBy('recent')}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-wider",
                      sortBy === 'recent'
                        ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-455 hover:text-black dark:hover:text-white"
                    )}
                  >
                    <Zap className="h-4 w-4" /> Mais Recentes
                  </button>
                </div>
              </div>

              {/* Classroom categories/subject list */}
              <div className="pt-2 border-t border-gray-50 dark:border-zinc-800">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2.5">
                  Filtrar por Matéria Específica
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedClassId('all')}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-bold transition-all border",
                      selectedClassId === 'all'
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-gray-55 dark:bg-zinc-950 border-gray-100 dark:border-zinc-850 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-zinc-700"
                    )}
                  >
                    Ver Todas
                  </button>
                  <button
                    onClick={() => setSelectedClassId('general')}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-bold transition-all border",
                      selectedClassId === 'general'
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-gray-55 dark:bg-zinc-950 border-gray-100 dark:border-zinc-850 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-zinc-700"
                    )}
                  >
                    💡 Geral & Transversais
                  </button>
                  {classes.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClassId(c.id)}
                      className={cn(
                        "px-5 py-2 rounded-xl text-xs font-bold transition-all border max-w-xs truncate",
                        selectedClassId === c.id
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-gray-55 dark:bg-zinc-950 border-gray-100 dark:border-zinc-850 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-zinc-700"
                      )}
                    >
                      📚 {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List of summaries */}
            <div className="space-y-4">
              {filteredSummaries.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] py-16 px-4 text-center">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">Nenhum Resumo Publicado</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1 max-w-sm mx-auto">
                    Nenhum aluno publicou arquivos para este filtro ainda. Compartilhe o primeiro resumo para ajudar os demais!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  {filteredSummaries.map((s) => {
                    const isLiked = s.likedBy?.includes(user?.uid);
                    const isDisliked = s.dislikedBy?.includes(user?.uid);
                    return (
                      <motion.div
                        key={s.id}
                        layout
                        onClick={() => setActiveSummary(s)}
                        className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group h-full relative hover:scale-[1.01]"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider block truncate max-w-[180px]">
                              {s.subjectName}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold shrink-0">
                              {formatSummaryDate(s.createdAt)}
                            </span>
                          </div>

                          <h3 className="text-lg font-black text-black dark:text-white tracking-tight leading-snug group-hover:text-emerald-500 transition-colors">
                            {s.title}
                          </h3>

                          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold line-clamp-2 leading-relaxed">
                            {s.description}
                          </p>

                          {/* PDF Visual Indicator */}
                          <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/10 p-3 rounded-xl matches-pdf">
                            <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-rose-900 dark:text-rose-300 truncate leading-none">
                                {s.pdfName || 'resumo_academico.pdf'}
                              </p>
                              <p className="text-[10px] text-rose-500 dark:text-rose-455 font-bold mt-0.5">
                                PDF Document • {s.pdfSize || '1.2 MB'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer with Votes, Comments count and Authorship */}
                        <div className="pt-4 mt-4 border-t border-gray-50 dark:border-zinc-850 flex items-center justify-between gap-2.5">
                          {/* Author information */}
                          <div className="flex items-center gap-2 min-w-0">
                            {s.creatorPhoto ? (
                              <img src={s.creatorPhoto} alt="" className="w-6 h-6 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                <UserIcon className="h-3 w-3 text-gray-400" />
                              </div>
                            )}
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 truncate">
                              Por {s.creatorName}
                            </span>
                          </div>

                          {/* Comments & Votes layout */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Vote BOM */}
                            <button
                              onClick={(e) => handleVote(s.id, 'like', e)}
                              className={cn(
                                "p-2 rounded-xl flex items-center justify-center gap-1 text-[10px] font-black transition-all border",
                                isLiked
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "bg-gray-55 dark:bg-zinc-950 border-gray-100 dark:border-zinc-850 text-gray-500 hover:text-emerald-500 hover:border-emerald-250"
                              )}
                              title="Resumo de Qualidade (Bom)"
                            >
                              👍 <span>{s.likesCount || 0}</span>
                            </button>

                            {/* Vote RUIM */}
                            <button
                              onClick={(e) => handleVote(s.id, 'dislike', e)}
                              className={cn(
                                "p-2 rounded-xl flex items-center justify-center gap-1 text-[10px] font-black transition-all border",
                                isDisliked
                                  ? "bg-red-500 border-red-500 text-white"
                                  : "bg-gray-55 dark:bg-zinc-950 border-gray-100 dark:border-zinc-850 text-gray-500 hover:text-red-550 hover:border-red-250"
                              )}
                              title="Resumo Confuso/Incompleto (Ruim)"
                            >
                              👎 <span>{s.dislikesCount || 0}</span>
                            </button>

                            {/* Comment Count Indicator */}
                            <div className="p-2 rounded-xl bg-gray-55 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850 text-gray-500 flex items-center gap-1 text-[10px] font-black">
                              <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                              <span>{s.commentCount || 0}</span>
                            </div>

                            {/* Delete/Trash button for creator or professor */}
                            {(s.creatorId === user?.uid || profile?.isProfessor) && (
                              <button
                                onClick={(e) => handleDeleteSummary(s.id, e)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all rounded-xl ml-1"
                                title="Excluir Resumo"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Summary Details & Evaluation View */
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            {/* Back button */}
            <button
              onClick={() => setActiveSummary(null)}
              className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-wider hover:translate-x-[-4px] transition-transform"
            >
              <ArrowLeft className="h-5 w-5" /> Voltar para a Biblioteca
            </button>

            {/* Grid for description and simulated pdf viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Overview & Simulated PDF viewer - 2 cols on wide screens */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-105/10 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                        {liveActiveSummary.subjectName}
                      </span>
                      <span className="text-xs font-bold text-gray-450 dark:text-gray-500">
                        Publicado em {formatSummaryDate(liveActiveSummary.createdAt)}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight uppercase">
                      {liveActiveSummary.title}
                    </h1>
                  </div>

                  <div className="border-t border-b border-gray-50 dark:border-zinc-850 py-5 flex items-center gap-3">
                    {liveActiveSummary.creatorPhoto ? (
                      <img src={liveActiveSummary.creatorPhoto} alt="" className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-black text-black dark:text-white leading-none">
                        Aluno {liveActiveSummary.creatorName}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 lowercase tracking-widest mt-1">
                        Autor do resumo • Compartilhando com a guilda
                      </p>
                    </div>
                  </div>

                  {/* Summary text/description */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      Introdução & Escopo do Resumo
                    </h4>
                    <p className="text-black dark:text-gray-200 font-semibold text-base leading-relaxed whitespace-pre-wrap">
                      {liveActiveSummary.description}
                    </p>
                  </div>
                </div>

                {/* Simulated PDF Viewer Experience */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center bg-gray-55 dark:bg-zinc-950 p-4 rounded-2xl border border-gray-100 dark:border-zinc-850">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                      <div>
                        <p className="text-xs font-black text-black dark:text-white">
                          {liveActiveSummary.pdfName || 'resumo.pdf'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                          Tamanho do Arquivo: {liveActiveSummary.pdfSize || '1.6 MB'} • Formato PDF Autorizado
                        </p>
                      </div>
                    </div>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Download do PDF do resumo simulado com sucesso!');
                      }}
                      className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-lg shrink-0 block"
                    >
                      Baixar PDF
                    </a>
                  </div>

                  {/* Simulated rendered PDF Pages */}
                  <div className="bg-gray-105 dark:bg-zinc-950 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 text-center select-none space-y-4">
                    <div className="bg-white dark:bg-zinc-900 max-w-lg mx-auto p-10 rounded-xl shadow-lg border border-gray-150 dark:border-zinc-850 min-h-[340px] flex flex-col justify-between text-left relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase">UNISOHUB SUMMARIES v1.0</span>
                          <span className="text-[10px] font-black text-gray-300">PAGINA 1 / 1</span>
                        </div>
                        <h2 className="text-xl font-black text-black dark:text-white tracking-tight border-b pb-2">
                          {liveActiveSummary.title}
                        </h2>
                        <div className="space-y-2 text-xs text-gray-650 dark:text-gray-455 font-bold leading-relaxed">
                          <p>⭐ [CONTEÚDO ACADÊMICO RESUMIDO NA ÍNTEGRA]</p>
                          <p>• Principais diretrizes estudadas em sala de aula detalhadas para facilitar a revisão.</p>
                          <p>• Fórmulas básicas, definições críticas de conceitos, e bibliografia sugerida pelo corpo docente.</p>
                          <p>• Dicas práticas de memorização rápida elaboradas pelo autor do resumo.</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-950 p-3 rounded-lg text-[10px] text-gray-500 font-black flex items-center gap-1">
                        🔒 Documentação revisada pela comunidade e ativa para estudo.
                      </div>
                    </div>
                    <p className="text-xs text-gray-450 dark:text-gray-500 font-bold">
                      💡 Visualização da página 1 de 1. Suporte completo a PDFs acadêmicos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Side controls - Vote counters & Comments Section */}
              <div className="space-y-6">
                {/* Evaluations Card */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-tight">
                    Avaliação da Comunidade
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Vote BOM */}
                    <button
                      onClick={(e) => handleVote(liveActiveSummary.id, 'like', e)}
                      className={cn(
                        "p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all",
                        liveActiveSummary.likedBy?.includes(user?.uid)
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none"
                          : "bg-gray-55 dark:bg-zinc-950 border-gray-100 dark:border-zinc-850 text-gray-750 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-zinc-700"
                      )}
                    >
                      👍
                      <span className="text-xs font-black uppercase tracking-wider">Bom ({liveActiveSummary.likesCount || 0})</span>
                    </button>

                    {/* Vote RUIM */}
                    <button
                      onClick={(e) => handleVote(liveActiveSummary.id, 'dislike', e)}
                      className={cn(
                        "p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all",
                        liveActiveSummary.dislikedBy?.includes(user?.uid)
                          ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-100 dark:shadow-none"
                          : "bg-gray-55 dark:bg-zinc-950 border-gray-100 dark:border-zinc-850 text-gray-750 dark:text-gray-300 hover:border-red-300 dark:hover:border-zinc-700"
                      )}
                    >
                      👎
                      <span className="text-xs font-black uppercase tracking-wider">Ruim ({liveActiveSummary.dislikesCount || 0})</span>
                    </button>
                  </div>

                  {/* Summary deleted by author or pro */}
                  {(liveActiveSummary.creatorId === user?.uid || profile?.isProfessor) && (
                    <button
                      onClick={(e) => handleDeleteSummary(liveActiveSummary.id, e)}
                      className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/40 text-red-600 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="h-4 w-4" /> Deletar Resumo
                    </button>
                  )}
                </div>

                {/* Comments box */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Comentários ({comments.length})
                  </h3>

                  {/* Comment List */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <p className="text-xs text-gray-450 dark:text-gray-500 text-center py-4 font-semibold">
                        Nenhum comentário enviado ainda.
                      </p>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} className="bg-gray-55 dark:bg-zinc-950 p-4 rounded-xl border border-gray-100 dark:border-zinc-850 space-y-1.5">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-xs font-black text-black dark:text-white truncate">
                              {c.senderName}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold shrink-0">
                              {formatSummaryDate(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-bold whitespace-pre-wrap leading-relaxed">
                            {c.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Form to submit new comment */}
                  <form onSubmit={handleAddComment} className="space-y-3 pt-3 border-t border-gray-50 dark:border-zinc-850">
                    <textarea
                      rows={3}
                      placeholder="Diga se o resumo te ajudou!"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-55 dark:bg-zinc-950 bg-opacity-80 border border-gray-100 dark:border-zinc-850 focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold text-xs text-black dark:text-white resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1"
                    >
                      <Send className="h-3.5 w-3.5" /> Enviar Comentário
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Summary Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-xl w-full border border-gray-100 dark:border-zinc-800 shadow-2xl relative"
          >
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-black dark:hover:text-white transition-all overflow-hidden"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter mb-1 select-none">
              Compartilhar Resumo
            </h2>
            <p className="text-xs font-bold text-gray-455 uppercase tracking-wider mb-6">
              Suba arquivos PDF e forneça o roteiro de estudos das matérias
            </p>

            <form onSubmit={handleUploadSummary} className="space-y-4">
              {/* Select subject */}
              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1.5">
                  Associar a qual Matéria?
                </label>
                <select
                  value={newClassId}
                  onChange={e => setNewClassId(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-55 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white font-bold text-sm outline-none"
                >
                  <option value="">💡 Geral & Transversais (Assuntos Gerais)</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>📚 {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1.5">
                  Título do Resumo / Tópico
                </label>
                <input
                  type="text"
                  placeholder="Ex: Resumo Geral de Álgebra Linear - P1"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-55 dark:bg-zinc-950/80 border border-gray-150 dark:border-zinc-850 focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold text-sm text-black dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1.5">
                  Breve introdução / descritivo das matérias inclusas
                </label>
                <textarea
                  rows={4}
                  placeholder="Escreva quais capítulos foram cobertos, dicas adicionais, fórmulas inclusas, etc..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-55 dark:bg-zinc-950/80 border border-gray-150 dark:border-zinc-850 focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold text-sm text-black dark:text-white leading-relaxed resize-none"
                />
              </div>

              {/* PDF Document Upload Area with dual drag & drop / click handler */}
              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1.5 font-bold">
                  Documento PDF Associado
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2",
                    isDragging
                      ? "border-emerald-500 bg-emerald-50/20"
                      : "border-gray-250 hover:border-emerald-400 dark:border-zinc-800 dark:hover:border-emerald-600 bg-gray-55 dark:bg-zinc-950"
                  )}
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                >
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <FileText className="h-8 w-8 text-neutral-400 group-hover:text-emerald-500" />
                  {selectedFile ? (
                    <div className="text-xs">
                      <p className="font-black text-emerald-600 dark:text-emerald-400">
                        {selectedFile.name}
                      </p>
                      <p className="text-gray-400 font-bold mt-0.5">
                        Tamanho do arquivo: {selectedFile.size} • PDF Detectado
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-black text-black dark:text-white">
                        Arraste ou clique para selecionar seu PDF acadêmico
                      </p>
                      <p className="text-[10px] text-gray-450 dark:text-gray-500 font-bold mt-1 uppercase tracking-wider">
                        Apenas formato PDF permitido (.pdf)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-gray-300 font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all shadow-md text-xs uppercase tracking-wider"
                >
                  Publicar Resumo
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const Home = ({ user }: { user: any }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block bg-yellow-400 text-black px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest"
        >
          Para Estudantes Universitários
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black text-black dark:text-white tracking-tighter leading-[0.9]"
        >
          Encontre o seu <br />
          <span className="text-blue-600 dark:text-blue-400">Grupo no UnisoHub.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto"
        >
          Conecte-se com alunos que possuem as habilidades que você precisa.
          Forme grupos de forma eficiente no UnisoHub e organize seus projetos em um só lugar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-8"
        >
          <div className="flex flex-col items-center gap-4">
            <Link
              to="/classes"
              className="bg-blue-600 text-white px-12 py-6 rounded-3xl text-xl font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 inline-flex items-center gap-3"
            >
              Começar Agora <ArrowLeft className="h-6 w-6 rotate-180" />
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
        {[
          { icon: UserIcon, title: "Perfil Detalhado", desc: "Liste suas habilidades e pontos fortes para ser encontrado por outros alunos." },
          { icon: BookOpen, title: "Salas por Matéria", desc: "Cada matéria tem seu código único. Entre na sala e veja todos os grupos disponíveis." },
          { icon: MessageSquare, title: "Chat em Tempo Real", desc: "Comunicação instantânea para o seu grupo planejar o trabalho sem sair do app." }
        ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="bg-white dark:bg-zinc-900 p-10 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="bg-yellow-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <f.icon className="h-7 w-7 text-black" />
              </div>
              <h3 className="text-2xl font-black text-black dark:text-white mb-3">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(() => {
    let guestUid = localStorage.getItem('unisohub_guest_uid');
    let guestName = localStorage.getItem('unisohub_guest_name');
    if (!guestUid) {
      guestUid = 'convidado_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('unisohub_guest_uid', guestUid);
    }
    if (!guestName) {
      guestName = `Estudante #${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('unisohub_guest_name', guestName);
    }
    return {
      uid: guestUid,
      isAnonymous: true,
      displayName: guestName,
      email: 'convidado@unisohub.com',
      photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${guestUid}`
    };
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const guestUid = localStorage.getItem('unisohub_guest_uid') || 'convidado_temp';
    const guestName = localStorage.getItem('unisohub_guest_name') || 'Estudante';
    const saved = localStorage.getItem('unisohub_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.uid) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return {
      uid: guestUid,
      name: guestName,
      email: 'convidado@unisohub.com',
      photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${guestUid}`,
      rpgStats: DEFAULT_STATS,
      rpgSkills: DEFAULT_SKILLS,
      isProfessor: false
    };
  });

  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    // Sync guest profile dynamically and non-blockingly with Firestore if possible
    const syncProfile = async () => {
      if (profile && profile.uid) {
        try {
          const s = await getDoc(doc(db, 'users', profile.uid));
          if (!s.exists()) {
            await setDoc(doc(db, 'users', profile.uid), profile);
          } else {
            // Keep state aligned if there are cloud changes
            const cloudData = s.data();
            if (cloudData && cloudData.name !== profile.name) {
              const merged = { ...profile, ...cloudData };
              setProfile(merged as UserProfile);
              localStorage.setItem('unisohub_profile', JSON.stringify(merged));
            }
          }
        } catch (e) {
          console.warn("Soft Firestore registration skipped (expected offline/local):", e);
        }
      }
    };
    syncProfile();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 text-2xl animate-pulse">UnisoHub...</div>;

  return (
    <Router>
      <div className={cn(
        "flex min-h-screen font-sans selection:bg-yellow-200 selection:text-black transition-colors relative",
        "bg-[#FDFDFD] text-black dark:bg-zinc-950 dark:text-white"
      )}>
        {/* Background Image with opacity */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.08] z-0"
          style={{
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
            backgroundRepeat: 'repeat'
          }}
        />

        <div className="relative z-10 flex w-full">
          <Sidebar user={user} profile={profile} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/profile" element={user ? <Profile user={user} profile={profile} setProfile={setProfile} /> : <Navigate to="/" />} />
              <Route path="/classes" element={user ? <Classes user={user} profile={profile} /> : <Navigate to="/" />} />
              <Route path="/my-groups" element={user ? <MyGroups user={user} /> : <Navigate to="/" />} />
              <Route path="/quizzes" element={user ? <Quizzes user={user} profile={profile} /> : <Navigate to="/" />} />
              <Route path="/forum" element={user ? <Forum user={user} profile={profile} /> : <Navigate to="/" />} />
              <Route path="/summaries" element={user ? <Summaries user={user} profile={profile} /> : <Navigate to="/" />} />
              <Route path="/class/:classId" element={user ? <ClassDetail user={user} profile={profile} /> : <Navigate to="/" />} />
              <Route path="/group/:groupId" element={user ? <GroupDetail user={user} profile={profile} /> : <Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
