import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { auth, db, onAuthStateChanged, signInWithPopup, googleProvider, signOut, doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, addDoc, serverTimestamp, updateDoc, arrayUnion } from './firebase';
import { UserProfile, ClassRoom, Group, Application, Message, RPGStat } from './types';
import { LogIn, LogOut, User as UserIcon, Users, MessageSquare, Plus, Search, Check, X, Send, ArrowLeft, BookOpen, AlertCircle, Flame, Zap, Wind, Brain, Smile, Dices, Code, Palette, PenTool, Hash, Shield, Sword, Trophy, Star, Skull, Crown, Map, Sun, Moon } from 'lucide-react';
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

  const handleSignOut = async () => {
    localStorage.removeItem('unisohub_guest_uid');
    localStorage.removeItem('unisohub_guest_name');
    await signOut(auth);
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
            <NavItem to="/quizzes" icon={Brain} label="Quizzes & Desafios" />
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
              <span>Sair</span>
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
  { name: 'Força', value: 1, icon: 'Sword' },
  { name: 'Agilidade', value: 1, icon: 'Wind' },
  { name: 'Inteligência', value: 1, icon: 'Brain' },
  { name: 'Carisma', value: 1, icon: 'Smile' },
  { name: 'Sorte', value: 1, icon: 'Dices' },
];

const DEFAULT_SKILLS: RPGStat[] = [
  { name: 'Programação', value: 1, icon: 'Code' },
  { name: 'Design', value: 1, icon: 'Palette' },
  { name: 'Escrita', value: 1, icon: 'PenTool' },
  { name: 'Matemática', value: 1, icon: 'Hash' },
  { name: 'Pesquisa', value: 1, icon: 'Search' },
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
  const icons: any = { Zap, Wind, Brain, Smile, Dices, Code, Palette, PenTool, Hash, Shield, Sword, Trophy, Star, Search };
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
    await setDoc(doc(db, 'users', user.uid), updated);
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

  useEffect(() => {
    // Read classrooms
    const qClasses = query(collection(db, 'classes'), orderBy('createdAt', 'desc'));
    const unsubClasses = onSnapshot(qClasses, snap => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassRoom)));
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
        createdAt: serverTimestamp()
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
                  setActiveQuiz(null);
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
                  onClick={() => setActiveQuiz(null)}
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
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => setExpandedQuizId(expandedQuizId === q.id ? null : q.id)}
                          className="w-full text-center py-2 rounded-xl text-xs font-black bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:opacity-90 transition-all block"
                        >
                          {expandedQuizId === q.id ? "Fechar Submissões" : "Ver Notas dos Alunos"}
                        </button>

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

    </div>
  );
};

const Classes = ({ user }: { user: any }) => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [code, setCode] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newBossName, setNewBossName] = useState('');
  const [newDifficulty, setNewDifficulty] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'classes'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassRoom)));
    });
  }, []);

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
    const docRef = await addDoc(collection(db, 'classes'), {
      name: newClassName,
      code: newCode,
      bossName: newBossName || 'Mestre Desconhecido',
      difficulty: newDifficulty,
      creatorId: user.uid,
      createdAt: serverTimestamp()
    });
    setNewClassName('');
    setNewBossName('');
    setNewDifficulty(1);
    setShowCreate(false);
    navigate(`/class/${docRef.id}`);
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

const ClassDetail = ({ user }: { user: any }) => {
  const { classId } = useParams();
  const [classroom, setClassroom] = useState<ClassRoom | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', maxMembers: 4 });
  const navigate = useNavigate();

  useEffect(() => {
    if (!classId) return;
    getDoc(doc(db, 'classes', classId)).then(s => setClassroom({ id: s.id, ...s.data() } as ClassRoom));

    const q = query(collection(db, 'groups'), where('classId', '==', classId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)));
    });
  }, [classId]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !classId) return;
    const docRef = await addDoc(collection(db, 'groups'), {
      ...newGroup,
      classId,
      creatorId: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp()
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
          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 dark:shadow-blue-900/40 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Formar Nova Guilda (Grupo)
          </button>
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
      createdAt: serverTimestamp()
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
      createdAt: serverTimestamp()
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
                  {m.createdAt ? format(m.createdAt.toDate(), 'HH:mm', { locale: ptBR }) : '...'}
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
          {user ? (
            <div className="flex flex-col items-center gap-4">
              <Link
                to="/classes"
                className="bg-blue-600 text-white px-12 py-6 rounded-3xl text-xl font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 inline-flex items-center gap-3"
              >
                Entrar no UnisoHub <ArrowLeft className="h-6 w-6 rotate-180" />
              </Link>
              {user.isAnonymous && (
                <div className="text-sm font-medium text-gray-400 dark:text-gray-500 flex flex-col sm:flex-row items-center gap-2 mt-4">
                  <span>Modo Convidado Ativo ({user.displayName})</span>
                  <span className="hidden sm:inline">•</span>
                  <button
                    onClick={() => signInWithPopup(auth, googleProvider)}
                    className="text-blue-600 dark:text-blue-400 font-extrabold hover:underline"
                  >
                    Vincular Conta Google para salvar permanentemente
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Link
                to="/classes"
                className="bg-blue-600 text-white px-12 py-6 rounded-3xl text-xl font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 inline-flex items-center gap-3"
              >
                Entrar como Convidado <ArrowLeft className="h-6 w-6 rotate-180" />
              </Link>
              <button
                onClick={() => signInWithPopup(auth, googleProvider)}
                className="bg-gray-100 dark:bg-zinc-800 text-black dark:text-white border border-gray-205 dark:border-zinc-700 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-200"
              >
                Entrar com o Google
              </button>
            </div>
          )}
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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
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
    return onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        const s = await getDoc(doc(db, 'users', u.uid));
        if (s.exists()) {
          setProfile({ uid: s.id, ...s.data() } as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: u.uid,
            name: u.displayName || 'Aluno',
            email: u.email || '',
            photoURL: u.photoURL || '',
            rpgStats: DEFAULT_STATS,
            rpgSkills: DEFAULT_SKILLS,
            isProfessor: false
          };
          await setDoc(doc(db, 'users', u.uid), newProfile);
          setProfile(newProfile);
        }
        setLoading(false);
      } else {
        // Sem login? Cria/restaura um usuário convidado (Guest) automático e persistente!
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

        const guestUserObj = {
          uid: guestUid,
          isAnonymous: true,
          displayName: guestName,
          email: 'convidado@unisohub.com',
          photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${guestUid}`
        };

        setUser(guestUserObj);

        try {
          const s = await getDoc(doc(db, 'users', guestUid));
          if (s.exists()) {
            setProfile({ uid: s.id, ...s.data() } as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: guestUid,
              name: guestName,
              email: guestUserObj.email,
              photoURL: guestUserObj.photoURL,
              rpgStats: DEFAULT_STATS,
              rpgSkills: DEFAULT_SKILLS,
              isProfessor: false
            };
            await setDoc(doc(db, 'users', guestUid), newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error("Erro ao ler/escrever perfil do convidado:", err);
        }
        setLoading(false);
      }
    });
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
              <Route path="/classes" element={user ? <Classes user={user} /> : <Navigate to="/" />} />
              <Route path="/quizzes" element={user ? <Quizzes user={user} profile={profile} /> : <Navigate to="/" />} />
              <Route path="/class/:classId" element={user ? <ClassDetail user={user} /> : <Navigate to="/" />} />
              <Route path="/group/:groupId" element={user ? <GroupDetail user={user} profile={profile} /> : <Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
