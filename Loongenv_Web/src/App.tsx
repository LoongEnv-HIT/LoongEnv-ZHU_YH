import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Cpu, 
  Activity, 
  Eye as EyeIcon, 
  Box as BoxIcon, 
  ChevronRight, 
  ArrowRight, 
  Settings, 
  Zap, 
  ShieldCheck, 
  Database,
  Menu,
  X,
  Github,
  Sun,
  Moon,
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Studio } from './components/Studio';
import { Twin } from './components/Twin';
import { Net } from './components/Net';
import { Box } from './components/Box';
import { Eye } from './components/Eye';

import { Logo } from './components/Logo';

interface ComponentData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  features: string[];
}

const components: ComponentData[] = [
  {
    id: 'studio',
    name: 'LoongEnv-Studio',
    tagline: '设计 —— 正向设计入口',
    description: '定义任务、算法结构与参数配置，生成统一工程配置。作为整个生命周期的起点，Studio 确保了从需求到实现的逻辑一致性。',
    icon: Layout,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    features: ['任务流定义', '算法拓扑构建', '参数化配置', '统一配置导出']
  },
  {
    id: 'twin',
    name: 'LoongEnv-Twin',
    tagline: '仿真 —— 建模与验证',
    description: '对设计结果进行建模与“试错”，验证控制策略与参数可行性。通过高保真物理仿真，在实机运行前排除潜在风险。',
    icon: Activity,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    features: ['高保真动力学', '数字孪生同步', '策略鲁棒性测试', '碰撞检测预警']
  },
  {
    id: 'net',
    name: 'LoongEnv-Net',
    tagline: '控制 —— 学习增强',
    description: '提供学习增强的控制与模型补偿能力，提升控制精度与适应性。利用神经网络优化传统 PID 或 MPC 控制器。',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    features: ['模型补偿网络', '强化学习算子', '自适应参数调节', '高频推理引擎']
  },
  {
    id: 'box',
    name: 'LoongEnv-Box',
    tagline: '实机 —— 实时执行',
    description: '可运行实时控制任务的嵌入式计算硬件，执行控制循环并驱动真实机械臂。专为工业环境设计的低延迟计算单元。',
    icon: BoxIcon,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    features: ['实时内核支持', '多总线驱动', '低延迟控制环', '工业级防护']
  },
  {
    id: 'eye',
    name: 'LoongEnv-Eye',
    tagline: '监控 —— 安全与数据',
    description: '运行期安全监控与数据记录，在保障安全的同时采集真机数据用于训练与分析。实现闭环反馈的最后一步。',
    icon: EyeIcon,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    features: ['实时异常检测', '黑匣子数据记录', '性能指标分析', '安全边界防护']
  }
];

const Nav: React.FC<{ onStart: () => void, onSelect: (id: string) => void, theme: 'dark' | 'light', toggleTheme: () => void }> = ({ onStart, onSelect, theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[var(--nav-bg)] backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelect('landing')}>
          <Logo size="md" />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {['Studio', 'Twin', 'Net', 'Box', 'Eye'].map((item) => (
            <button 
              key={item} 
              onClick={() => onSelect(item.toLowerCase())} 
              className="text-sm font-medium text-muted hover:text-loong-accent transition-colors"
            >
              {item}
            </button>
          ))}
          
          <div className="h-4 w-px bg-white/10 mx-2" />

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-loong-accent"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            onClick={onStart}
            className="bg-loong-accent text-loong-dark px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
          >
            立即体验
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-loong-dark border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
          >
            {['Studio', 'Twin', 'Net', 'Box', 'Eye'].map((item) => (
              <button 
                key={item} 
                onClick={() => { onSelect(item.toLowerCase()); setMobileMenuOpen(false); }} 
                className="text-lg font-medium text-left"
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero: React.FC<{ onStart: () => void, onSelect: (id: string) => void }> = ({ onStart, onSelect }) => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden tech-grid">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-loong-accent/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-loong-red/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-loong-accent/10 border border-loong-accent/20 text-xs font-mono text-loong-accent mb-6">
            <span className="flex h-2 w-2 rounded-full bg-loong-accent animate-pulse" />
            V1.5.0 STABLE RELEASE
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.85] mb-8">
            设计–控制–部署<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-loong-accent to-emerald-400">一体化</span>工程环境
          </h1>
          <p className="text-xl md:text-2xl text-muted mb-10 leading-relaxed max-w-3xl">
            从任务需求出发，构建 设计 → 建模 → 控制 → 实机运行 → 监控 的完整工程闭环。
            为工业机器人提供正向设计、精准建模与安全运行的专业级支撑。
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onStart}
              className="bg-loong-accent text-loong-dark px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-loong-accent/20"
            >
              开始构建 <ArrowRight size={20} />
            </button>
            <a 
              href="https://github.com/zhuyanhe1975-hit/LoongEnv"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              查看文档
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {components.map((c, idx) => (
            <div 
              key={c.id} 
              onClick={() => onSelect(c.id)}
              className="glass-card p-8 flex flex-col gap-6 group hover:border-loong-accent/50 transition-all cursor-pointer hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${c.bg} ${c.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <c.icon size={28} />
              </div>
              <div>
                <div className="text-xs font-mono text-muted mb-2">0{idx + 1}</div>
                <div className="font-display font-bold text-xl">{c.name.split('-')[1]}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const ComponentSection: React.FC<{ component: ComponentData, index: number, onOpen: () => void }> = ({ component, index, onOpen }) => {
  const isEven = index % 2 === 0;

  return (
    <section id={component.id} className="py-32 border-t border-white/5 relative overflow-hidden">
      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12">
        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-20 items-center`}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${component.bg} ${component.color} text-xs font-bold mb-6`}>
              {component.name}
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-8 leading-tight">
              {component.tagline}
            </h2>
            <p className="text-xl text-muted mb-10 leading-relaxed">
              {component.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {component.features.map((f) => (
                <div key={f} className="flex items-center gap-3 text-base text-muted">
                  <div className={`w-6 h-6 rounded-full ${component.bg} flex items-center justify-center`}>
                    <ShieldCheck size={14} className={component.color} />
                  </div>
                  {f}
                </div>
              ))}
            </div>

            <button 
              onClick={onOpen}
              className={`flex items-center gap-2 font-bold ${component.color} hover:gap-4 transition-all text-lg`}
            >
              进入模块详情 <ChevronRight size={24} />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 w-full"
          >
            <div className="aspect-video glass-card relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-loong-accent/5 to-transparent opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <component.icon size={160} className={`${component.color} opacity-10 group-hover:scale-110 transition-transform duration-700`} />
              </div>
              
              {/* Mock UI Elements */}
              <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <div className="text-xs font-mono opacity-40">LOONG_ENV_SYSTEM_READY</div>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6 h-1/3 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <div className="flex justify-between items-end h-full gap-2">
                  {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      className={`flex-1 rounded-t-md ${component.bg} ${component.color.replace('text', 'bg')}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
  return (
    <footer className="bg-[var(--bg-main)] py-24 border-t border-white/5">
      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <Logo size="md" />
            </div>
            <p className="text-muted text-lg max-w-md mb-10 leading-relaxed">
              面向工业机器人的全生命周期工程环境。从设计到监控，为您的机器人项目提供坚实的技术底座。
            </p>
            <div className="flex gap-5">
              <a href="https://github.com/zhuyanhe1975-hit/LoongEnv" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-loong-accent hover:text-loong-dark transition-all">
                <Github size={24} />
              </a>
              <a href="#" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-loong-accent hover:text-loong-dark transition-all">
                <Database size={24} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-8">核心组件</h4>
            <ul className="space-y-4 text-muted">
              {['Studio', 'Twin', 'Net', 'Box', 'Eye'].map((item) => (
                <li key={item}>
                  <button onClick={() => onSelect(item.toLowerCase())} className="hover:text-loong-accent transition-colors text-base">
                    LoongEnv-{item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-8">资源</h4>
            <ul className="space-y-4 text-muted">
              <li><a href="https://github.com/zhuyanhe1975-hit/LoongEnv" target="_blank" rel="noopener noreferrer" className="hover:text-loong-accent transition-colors text-base">技术文档</a></li>
              <li><a href="#" className="hover:text-loong-accent transition-colors text-base">API 参考</a></li>
              <li><a href="#" className="hover:text-loong-accent transition-colors text-base">示例工程</a></li>
              <li><a href="#" className="hover:text-loong-accent transition-colors text-base">社区论坛</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted">
          <p>© 2026 LoongEnv Engineering. All rights reserved.</p>
          <div className="flex gap-10">
            <a href="#" className="hover:text-loong-accent transition-colors">隐私政策</a>
            <a href="#" className="hover:text-loong-accent transition-colors">服务条款</a>
            <a href="#" className="hover:text-loong-accent transition-colors">联系我们</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [view, setView] = useState<'landing' | 'studio' | 'twin' | 'net' | 'box' | 'eye'>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen selection:bg-loong-accent selection:text-loong-dark transition-colors duration-300">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Nav 
              onStart={() => setView('studio')} 
              onSelect={(id) => setView(id as any)} 
              theme={theme}
              toggleTheme={toggleTheme}
            />
            <Hero onStart={() => setView('studio')} onSelect={(id) => setView(id as any)} />
            
            <main>
              {components.map((c, i) => (
                <ComponentSection 
                  key={c.id} 
                  component={c} 
                  index={i} 
                  onOpen={() => {
                    if (c.id === 'studio') setView('studio');
                    if (c.id === 'twin') setView('twin');
                    if (c.id === 'net') setView('net');
                    if (c.id === 'box') setView('box');
                    if (c.id === 'eye') setView('eye');
                  }} 
                />
              ))}

              <section className="py-40 bg-gradient-to-b from-transparent to-loong-accent/5">
                <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                  >
                    <h2 className="text-6xl md:text-7xl font-display font-bold mb-10 leading-tight">
                      准备好开启您的<br />机器人工程之旅了吗？
                    </h2>
                    <p className="text-2xl text-muted mb-16 max-w-2xl mx-auto">
                      加入数百个领先的工业实验室，使用 LoongEnv 构建下一代智能机器人系统。
                    </p>
                    <div className="flex flex-wrap justify-center gap-8">
                      <button 
                        onClick={() => setView('studio')}
                        className="bg-loong-accent text-loong-dark px-12 py-6 rounded-2xl font-bold text-xl hover:opacity-90 transition-all hover:scale-105 shadow-xl shadow-loong-accent/20"
                      >
                        申请试用
                      </button>
                      <button className="bg-white/5 border border-white/10 px-12 py-6 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all">
                        联系技术专家
                      </button>
                    </div>
                  </motion.div>
                </div>
              </section>
            </main>

            <Footer onSelect={(id) => setView(id as any)} />
          </motion.div>
        ) : view === 'studio' ? (
          <motion.div
            key="studio"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Studio onBack={() => setView('landing')} />
          </motion.div>
        ) : view === 'twin' ? (
          <motion.div
            key="twin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Twin onBack={() => setView('landing')} />
          </motion.div>
        ) : view === 'net' ? (
          <motion.div
            key="net"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Net onBack={() => setView('landing')} />
          </motion.div>
        ) : view === 'box' ? (
          <motion.div
            key="box"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Box onBack={() => setView('landing')} />
          </motion.div>
        ) : (
          <motion.div
            key="eye"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Eye onBack={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

