import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Menu, X, Dumbbell, Target, TrendingUp, Award, Instagram, Phone, MessageSquare } from 'lucide-react';
import kealabsLogo from './assets/kealabs_logo_strategic_white.png';
import matheusLogo from './assets/logotipo_matheus_personal.png';
import matheusPhoto from './assets/matheus_personal.jpeg';

const App = () => {
  return (
    <div className="bg-dark-bg text-white font-inter">
      <div className="bg-gradient-to-r from-lime-green to-neon-green text-black text-center py-2 px-4 text-sm md:text-base font-bold">
        🚧 Site em Desenvolvimento 🚧
      </div>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <PersonalSection />
        <PricingSection />
        <TestimonialsSection />
        <ResultsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-10 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-black/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
      <nav className="container mx-auto flex justify-between items-center p-4">
        <a href="#início"><img src={matheusLogo} alt="Matheus Personal" className="h-14 md:h-16 brightness-0 invert" /></a>
        
        <div className="flex items-center gap-4">
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-lime-green">
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        <ul className="hidden md:flex space-x-8 font-semibold items-center">
          {[['Início', 'início'], ['Sobre', 'sobre'], ['Serviços', 'serviços'], ['Consultoria Online', 'consultoria'], ['Resultados', 'resultados'], ['Contato', 'contato']].map(([label, anchor]) => (
            <li key={anchor}>
              <a href={`#${anchor}`} className="hover:text-lime-green transition-colors uppercase text-sm tracking-wide">
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href="#depoimentos" className="text-lime-green hover:text-neon-green transition-colors" aria-label="Depoimentos" title="Depoimentos">
              <MessageSquare size={24} />
            </a>
          </li>
          <li>
            <a 
              href="/login"
              className="bg-lime-green text-black px-4 py-2 font-bold uppercase text-xs hover:bg-neon-green transition-colors"
            >
              Área do Aluno
            </a>
          </li>
          <li>
            <a 
              href="https://instagram.com/matheusc_personal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lime-green hover:text-neon-green transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
          </li>
        </ul>
      </nav>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 md:hidden"
            style={{ zIndex: 45, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.85)' }}
            onClick={() => setIsOpen(false)}
          ></div>
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="fixed top-0 right-0 h-screen w-72 bg-black/95 backdrop-blur-xl md:hidden pt-20 px-6 border-l border-lime-green/20"
            style={{ zIndex: 50 }}
          >
          <ul className="flex flex-col space-y-6">
            {[['Início', 'início'], ['Sobre', 'sobre'], ['Serviços', 'serviços'], ['Consultoria Online', 'consultoria'], ['Resultados', 'resultados'], ['Contato', 'contato']].map(([label, anchor]) => (
              <li key={anchor}>
                <a 
                  href={`#${anchor}`} 
                  onClick={() => setIsOpen(false)}
                  className="text-xl hover:text-lime-green transition-colors block uppercase font-semibold"
                >
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#depoimentos"
                onClick={() => setIsOpen(false)}
                className="text-xl hover:text-lime-green transition-colors block uppercase font-semibold"
              >
                Depoimentos
              </a>
            </li>
            <li>
              <a 
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-xl hover:text-lime-green transition-colors block uppercase font-semibold"
              >
                Área do Aluno
              </a>
            </li>
          </ul>
        </motion.div>
        </>
      )}
    </header>
  );
};

const HeroSection = () => {
  return (
    <section id="início" className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-dark-bg to-black opacity-90"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20"></div>
      
      <div className="relative z-10 text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl md:text-8xl font-bebas uppercase mb-6 leading-tight">
            Transforme <span className="text-lime-green">Seu Corpo</span><br />
            Supere <span className="text-neon-green">Seus Limites</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
            Treinamento personalizado de alta performance para resultados reais
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#consultoria"
              className="inline-flex items-center justify-center bg-lime-green text-black font-bold py-4 px-10 rounded-none uppercase hover:bg-neon-green transition-all transform hover:scale-105 text-lg"
            >
              Ver Consultoria <ArrowRight className="ml-2" size={24} />
            </a>
            <a 
              href="#personal"
              className="inline-flex items-center justify-center border-2 border-lime-green text-lime-green font-bold py-4 px-10 rounded-none uppercase hover:bg-lime-green hover:text-black transition-all text-lg"
            >
              Plano Personal
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  return (
    <section id="sobre" className="py-20 px-4 bg-dark-card">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-5xl md:text-6xl font-bebas uppercase mb-6 text-lime-green">
              Matheus Castro
            </h3>
            <p className="text-sm text-gray-400 mb-6 uppercase tracking-wider">
              Registro CREF - <span className="text-lime-green font-bold">035480-G/MG</span>
            </p>
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              Tenho <span className="text-lime-green font-bold">31 anos</span> e sou personal trainer, especialista em <span className="text-lime-green font-bold">treinos de hipertrofia e emagrecimento</span>.
            </p>
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              Com a experiência de já ter transformado a vida de <span className="text-lime-green font-bold">mais de 300 alunos</span>, meu foco é te guiar em uma jornada de <span className="text-lime-green font-bold">resultados reais</span>, seja para emagrecimento, ganho de massa ou mais qualidade de vida.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Ofereço <span className="text-lime-green font-bold">acompanhamento individual</span> e planejamento de treinos personalizados, com a flexibilidade do formato <span className="text-lime-green font-bold">presencial ou online</span>.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <div className="w-[220px] h-[220px] rounded-full overflow-hidden">
                <img
                  src={matheusPhoto}
                  alt="Matheus Castro"
                  className="w-full h-full object-cover" style={{ objectPosition: '15% 10%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Award size={40} />, value: '300+', label: 'Alunos' },
                { icon: <Dumbbell size={40} />, value: '100%', label: 'Dedicação' },
              ].map((stat, i) => (
                <div key={i} className="bg-black border border-dark-border p-6 text-center">
                  <div className="text-lime-green mb-2 flex justify-center">{stat.icon}</div>
                  <div className="text-3xl font-bebas text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400 uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};;

const services = [
  {
    icon: <Dumbbell size={48} />,
    title: 'Treinamento de Força',
    description: 'Desenvolva força máxima e hipertrofia com periodização avançada',
    details: [
      'Periodização linear e ondulatória',
      'Treinos de 4 a 6 dias por semana',
      'Foco em hipertrofia e ganho de força',
      'Exercícios compostos e isolados',
      'Progressão de carga monitorada',
      'Adaptado para academia ou home gym',
    ],
    about: 'Programa estruturado com base científica para maximizar o ganho de massa muscular e força. Cada treino é montado de acordo com seu nível, equipamentos disponíveis e objetivos específicos.',
  },
  {
    icon: <TrendingUp size={48} />,
    title: 'Emagrecimento',
    description: 'HIIT e treinos funcionais para resistência e performance',
    details: [
      'Protocolos HIIT e Tabata',
      'Treinos funcionais e circuitos',
      'Melhora de resistência cardiovascular',
      'Queima calórica acelerada',
      'Exercícios com e sem equipamentos',
      'Progressão gradual de intensidade',
    ],
    about: 'Treinos de alta intensidade projetados para melhorar seu condicionamento físico, acelerar o metabolismo e aumentar a resistência. Ideal para quem quer emagrecer mantendo a massa muscular.',
  },
  {
    icon: <Target size={48} />,
    title: 'Nutrição Esportiva',
    description: 'Planos alimentares personalizados para seus objetivos',
    details: [
      'Plano alimentar individualizado',
      'Cálculo de macronutrientes',
      'Estratégias de cutting e bulking',
      'Sugestões de suplementação',
      'Receitas práticas e saudáveis',
      'Ajustes semanais conforme evolução',
    ],
    about: 'Disponível exclusivamente no Plano Diamante. Um plano nutricional completo elaborado para potencializar seus resultados no treino, com orientações práticas para o dia a dia.',
    badge: '💎 Plano Diamante',
  },
  {
    icon: <Award size={48} />,
    title: 'Acompanhamento',
    description: 'Suporte contínuo e ajustes em tempo real',
    details: [
      'Feedback semanal detalhado',
      'Suporte via WhatsApp',
      'Ajustes no treino conforme evolução',
      'Análise de métricas e progresso',
      'Motivação e orientação constante',
      'Relatórios de desempenho',
    ],
    about: 'Você nunca estará sozinho na sua jornada. Acompanhamento próximo com feedbacks semanais, ajustes no plano e suporte direto para garantir que você continue evoluindo.',
  },
];

const ServiceModal = ({ service, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={onClose}>
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="bg-dark-card border-2 border-lime-green w-full max-w-md p-8 relative"
      onClick={e => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
        <X size={20} />
      </button>

      <div className="text-lime-green mb-4">{service.icon}</div>

      <h3 className="text-3xl font-bebas uppercase text-white mb-1">{service.title}</h3>

      {service.badge && (
        <span className="inline-block text-xs font-bold uppercase bg-purple-400/10 border border-purple-400/40 text-purple-400 px-3 py-1 mb-3">
          {service.badge}
        </span>
      )}

      <p className="text-gray-400 text-sm leading-relaxed mb-5">{service.about}</p>

      <ul className="space-y-2 mb-6">
        {service.details.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-lime-green">✓</span> {d}
          </li>
        ))}
      </ul>

      <a
        href="#consultoria"
        onClick={onClose}
        className="block w-full text-center py-3 font-bold uppercase text-sm bg-lime-green text-black hover:bg-neon-green transition-all"
      >
        Ver Planos
      </a>
    </motion.div>
  </div>
);

const ServicesSection = () => {
  const [selected, setSelected] = useState(null);

  return (
    <section id="serviços" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-5xl md:text-6xl font-bebas uppercase mb-4">
            <span className="text-lime-green">Meus</span> Serviços
          </h3>
          <p className="text-gray-400 text-lg">Clique em um serviço para ver os detalhes</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.button
              key={index}
              onClick={() => setSelected(service)}
              className="bg-dark-card border border-dark-border p-8 hover:border-lime-green transition-all group text-left cursor-pointer w-full"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="text-lime-green mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
              <h4 className="text-2xl font-bebas mb-3 uppercase">{service.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{service.description}</p>
              <span className="text-lime-green text-xs uppercase font-semibold tracking-wide border-b border-lime-green/40 pb-0.5 group-hover:border-lime-green transition-colors">
                Ver detalhes →
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <ServiceModal service={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
};

const personalPlans = [
  { frequency: '2x na semana', pricePerClass: '75,00', total: '600,00', classes: 8 },
  { frequency: '3x na semana', pricePerClass: '70,00', total: '840,00', classes: 12 },
  { frequency: '4x na semana', pricePerClass: '65,00', total: '1.040,00', classes: 16 },
  { frequency: '5x na semana', pricePerClass: '60,00', total: '1.200,00', classes: 20 },
];

const PersonalSection = () => {
  return (
    <section id="personal" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-5xl md:text-6xl font-bebas uppercase mb-4">
            Plano <span className="text-lime-green">Personal</span>
          </h3>
          <p className="text-gray-400 text-lg">Treinamento online em tempo real com acompanhamento individual</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {personalPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-black border-2 border-dark-border p-6"
            >
              <h4 className="text-xl font-bebas mb-1 text-center text-lime-green uppercase">{plan.frequency}</h4>
              <p className="text-center text-gray-500 text-xs mb-4">{plan.classes} aulas/mês</p>
              <div className="text-center mb-4 pb-4 border-b border-dark-border">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-gray-400 text-sm mb-1">R$</span>
                  <span className="text-5xl font-bebas text-white leading-none">{plan.pricePerClass}</span>
                  <span className="text-gray-400 text-sm mb-1">/aula</span>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  Total mensal: <span className="text-lime-green font-semibold">R$ {plan.total}</span>
                </p>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá Matheus! Tenho interesse no plano Personal ${plan.frequency}. Pode me passar mais informações?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 px-4 font-bold uppercase transition-all text-sm border-2 border-lime-green text-lime-green hover:bg-lime-green hover:text-black"
              >
                Contratar
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const pricingPlans = [
  {
    name: 'BRONZE',
    price: '79,90',
    duration: '1 mês',
    months: 1,
    description: 'Treino personalizado com acompanhamento completo por 1 mês.',
    popular: false,
  },
  {
    name: 'PRATA',
    price: '69,90',
    duration: '3 meses',
    months: 3,
    monthlyTotal: '209,70',
    description: 'Treino personalizado com acompanhamento completo por 3 meses.',
    popular: false,
  },
  {
    name: 'OURO',
    price: '49,90',
    duration: '6 meses',
    months: 6,
    monthlyTotal: '299,40',
    description: 'Treino personalizado com acompanhamento completo por 6 meses.',
    popular: true,
  },
];

const WHATSAPP = '5535998572602';

const planDetails = {
  BRONZE: {
    features: [
      '✅ Treino personalizado mensal',
      '✅ Acesso ao app com vídeos',
      '✅ Suporte via WhatsApp',
      '✅ Feedback semanal',
      '✅ Ajustes no plano conforme evolução',
      '❌ Plano nutricional',
    ],
    ideal: 'Ideal para quem quer experimentar a consultoria online sem compromisso de longo prazo.',
  },
  PRATA: {
    features: [
      '✅ Treino personalizado por 3 meses',
      '✅ Acesso ao app com vídeos',
      '✅ Suporte via WhatsApp',
      '✅ Feedback semanal',
      '✅ Ajustes no plano conforme evolução',
      '✅ Revisão completa do treino a cada mês',
      '❌ Plano nutricional',
    ],
    ideal: 'Ideal para quem busca resultados consistentes com um compromisso de médio prazo.',
  },
  OURO: {
    features: [
      '✅ Treino personalizado por 6 meses',
      '✅ Acesso ao app com vídeos',
      '✅ Suporte via WhatsApp',
      '✅ Feedback semanal',
      '✅ Ajustes no plano conforme evolução',
      '✅ Revisão completa do treino a cada mês',
      '✅ Relatório de evolução bimestral',
      '❌ Plano nutricional',
    ],
    ideal: 'Ideal para quem quer transformação real com o melhor custo-benefício.',
  },
  DIAMANTE: {
    features: [
      '✅ Treino personalizado mensal',
      '✅ Acesso ao app com vídeos',
      '✅ Suporte VIP via WhatsApp',
      '✅ Feedback semanal',
      '✅ Ajustes no plano conforme evolução',
      '✅ Plano nutricional personalizado',
      '✅ Acompanhamento nutricional no app',
      '✅ Prioridade no atendimento',
    ],
    ideal: 'Ideal para quem quer o pacote completo: treino + nutrição com acompanhamento premium.',
  },
};

const PlanModal = ({ plan, onClose, onContract }) => {
  const details = planDetails[plan.name] ?? { features: [], ideal: '' };
  const color = plan.diamond ? 'purple-400' : 'lime-green';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-dark-card border-2 w-full max-w-md p-8 relative"
        style={{ borderColor: plan.diamond ? '#c084fc' : '#84cc16' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h3 className={`text-4xl font-bebas uppercase mb-1 ${plan.diamond ? 'text-purple-400' : 'text-lime-green'}`}>
          Plano {plan.name}
        </h3>
        <p className="text-gray-400 text-sm mb-1 uppercase tracking-widest">{plan.duration}</p>
        <div className="flex items-end gap-1 mb-4">
          <span className="text-gray-400 text-sm mb-1">R$</span>
          <span className="text-5xl font-bebas text-white leading-none">{plan.price}</span>
          <span className="text-gray-400 text-sm mb-1">/mês</span>
          {plan.monthlyTotal && (
            <span className="text-gray-500 text-xs mb-1 ml-2">· Total R$ {plan.monthlyTotal}</span>
          )}
        </div>

        <p className={`text-sm mb-5 ${plan.diamond ? 'text-purple-300' : 'text-lime-green'}`}>{details.ideal}</p>

        <ul className="space-y-2 mb-6">
          {details.features.map((f, i) => (
            <li key={i} className="text-sm text-gray-300">{f}</li>
          ))}
        </ul>

        <button
          onClick={onContract}
          className={`w-full py-3 font-bold uppercase text-sm transition-all ${
            plan.diamond
              ? 'bg-purple-400 text-black hover:bg-purple-300'
              : 'bg-lime-green text-black hover:bg-neon-green'
          }`}
        >
          Contratar Agora
        </button>
      </motion.div>
    </div>
  );
};

const PricingSection = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePlanClick = (plan) => {
    navigate('/cart', { state: { plan } });
  };

  return (
    <section id="consultoria" className="py-20 px-4 bg-dark-card">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-5xl md:text-6xl font-bebas uppercase mb-6">
            Consultoria <span className="text-lime-green">Online</span>
          </h3>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Treine de onde estiver com <span className="text-lime-green font-semibold">acompanhamento profissional completo</span>. Escolha a frequência ideal para seus objetivos e tenha acesso a treinos personalizados, suporte direto e resultados garantidos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-black border-2 p-6 ${
                plan.diamond ? 'border-purple-400 scale-105' :
                plan.popular ? 'border-lime-green scale-105' : 'border-dark-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-lime-green text-black px-4 py-1 font-bold text-xs uppercase">
                  Mais Vendido
                </div>
              )}
              {plan.diamond && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-400 text-black px-4 py-1 font-bold text-xs uppercase">
                  💎 Premium
                </div>
              )}
              <h4 className={`text-3xl font-bebas mb-4 text-center ${plan.diamond ? 'text-purple-400' : 'text-lime-green'}`}>{plan.name}</h4>
              <div className="text-center mb-4 pb-4 border-b border-dark-border">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">{plan.duration}</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-gray-400 text-sm mb-1">R$</span>
                  <span className="text-5xl font-bebas text-white leading-none">{plan.price}</span>
                  <span className="text-gray-400 text-sm mb-1">/mês</span>
                </div>
                {plan.monthlyTotal && (
                  <p className="text-gray-500 text-xs mt-2">
                    Total: <span className="text-lime-green font-semibold">R$ {plan.monthlyTotal}</span>
                  </p>
                )}
                {plan.diamond && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-center gap-2 bg-purple-400/10 border border-purple-400/30 px-3 py-1.5">
                      <span className="text-purple-400 text-xs">🏋️</span>
                      <span className="text-purple-300 text-xs font-bold uppercase tracking-wide">Treino Personalizado</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-purple-400/10 border border-purple-400/30 px-3 py-1.5">
                      <span className="text-purple-400 text-xs">🥗</span>
                      <span className="text-purple-300 text-xs font-bold uppercase tracking-wide">Plano Nutricional</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4 min-h-[60px]">
                {plan.description}
              </p>
              <button
                onClick={() => setSelectedPlan(plan)}
                className={`w-full text-center py-2 px-4 text-xs uppercase font-semibold transition-all mb-2 border ${
                  plan.diamond
                    ? 'border-purple-400/40 text-purple-400 hover:bg-purple-400/10'
                    : 'border-lime-green/40 text-lime-green hover:bg-lime-green/10'
                }`}
              >
                Ver detalhes
              </button>
              <button 
                onClick={() => handlePlanClick(plan)}
                className={`w-full text-center py-3 px-4 font-bold uppercase transition-all text-sm ${
                  plan.diamond
                    ? 'bg-purple-400 text-black hover:bg-purple-300'
                    : plan.popular 
                    ? 'bg-lime-green text-black hover:bg-neon-green' 
                    : 'border-2 border-lime-green text-lime-green hover:bg-lime-green hover:text-black'
                }`}
              >
                Contratar
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <PlanModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
            onContract={() => { setSelectedPlan(null); handlePlanClick(selectedPlan); }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

const OnlineSection = () => {
  const benefits = [
    { title: 'Treino 100% Personalizado', description: 'Montado do zero, respeitando seus objetivos, sua rotina e seus limites' },
    { title: 'Flexibilidade Total', description: 'Escolha treinar em casa ou na academia' },
    { title: 'Treino no App com Vídeos', description: 'Acesse seu plano de treino de forma organizada e veja a execução correta de cada exercício' },
    { title: 'Feedbacks Semanais', description: 'Análise da sua evolução e ajustes no plano para garantir o progresso contínuo' },
    { title: 'Suporte VIP via WhatsApp', description: 'Tire suas dúvidas diretamente comigo e receba a motivação que precisa para não desistir' },
  ];

  return (
    <section id="beneficios" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-5xl md:text-6xl font-bebas uppercase mb-6">
            Benefícios da <span className="text-lime-green">Consultoria</span>
          </h3>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Todos os planos incluem acesso completo à plataforma com treinos personalizados, acompanhamento semanal e suporte direto via WhatsApp.
          </p>
        </motion.div>

        <div className="bg-dark-card border-2 border-lime-green p-8 md:p-12">
          <div className="text-center mb-8">
            <h4 className="text-3xl font-bebas uppercase text-lime-green mb-4">
              Itens Inclusos em Todos os Planos
            </h4>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 bg-black border border-dark-border p-6"
              >
                <div className="text-lime-green text-2xl flex-shrink-0">✅</div>
                <div>
                  <h5 className="text-xl font-bold text-white mb-2">{benefit.title}</h5>
                  <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a 
              href="#consultoria"
              className="inline-flex items-center justify-center bg-lime-green text-black font-bold py-4 px-12 uppercase hover:bg-neon-green transition-all transform hover:scale-105 text-lg"
            >
              Ver Planos <ArrowRight className="ml-2" size={24} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('https://srv1023256.hstgr.cloud/api/feedbacks')
      .then(r => r.json())
      .then(data => setTestimonials(Array.isArray(data) ? data : (data?.feedbacks ?? [])))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  const prev = () => setCurrent(i => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent(i => (i + 1) % testimonials.length);

  return (
    <section id="depoimentos" className="py-20 px-4 bg-dark-card">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-5xl md:text-6xl font-bebas uppercase mb-4">
            O Que Dizem <span className="text-lime-green">Meus Alunos</span>
          </h3>
          <p className="text-gray-400 text-lg">Depoimentos reais de quem transformou o corpo e a vida</p>
        </motion.div>

        {loading ? (
          <p className="text-center text-gray-500">Carregando depoimentos...</p>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum depoimento ainda.</p>
        ) : (
          <div className="relative max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="bg-black border border-dark-border p-8 relative"
              >
                <div className="absolute top-4 right-4 text-6xl text-lime-green/20 font-serif">&ldquo;</div>
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-white">{testimonials[current].name}</h4>
                  {testimonials[current].age && <p className="text-sm text-gray-500">{testimonials[current].age} anos</p>}
                  {testimonials[current].city && <p className="text-gray-500 text-xs">{testimonials[current].city}</p>}
                  {testimonials[current].title && <p className="text-lime-green text-sm font-semibold mt-1">{testimonials[current].title}</p>}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">
                  &ldquo;{testimonials[current].testimonial}&rdquo;
                </p>
                <div className="flex gap-1">
                  {[...Array(Number(testimonials[current].rating) || 5)].map((_, i) => (
                    <span key={i} className="text-lime-green text-lg">&#9733;</span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6">
              <button onClick={prev} className="text-gray-400 hover:text-lime-green transition-colors p-2">
                <ChevronLeft size={28} />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === current ? 'bg-lime-green scale-125' : 'bg-gray-600 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              <button onClick={next} className="text-gray-400 hover:text-lime-green transition-colors p-2">
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const galleryImages = [
  { src: '/img/antes_e_depois_01.jpeg', label: 'Transformação 1' },
  { src: '/img/antes_e_depois_02.jpeg', label: 'Transformação 2' },
  { src: '/img/antes_e_depois_03.jpeg', label: 'Transformação 3' },
  { src: '/img/antes_e_depois_04.jpeg', label: 'Transformação 4' },
  { src: '/img/antes_e_depois_05.jpeg', label: 'Transformação 5' },
  { src: '/img/antes_e_depois_06.jpeg', label: 'Transformação 6' },
];

const ResultsSection = () => {
  const [lightbox, setLightbox] = useState(null);

  const prev = () => setLightbox(i => (i - 1 + galleryImages.length) % galleryImages.length);
  const next = () => setLightbox(i => (i + 1) % galleryImages.length);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  return (
    <section id="resultados" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-5xl md:text-6xl font-bebas uppercase mb-4">
            Resultados <span className="text-lime-green">Comprovados</span>
          </h3>
          <p className="text-gray-400 text-lg">Transformações reais de alunos reais</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-6xl mx-auto">
          {galleryImages.map((img, i) => (
            <motion.button
              key={i}
              onClick={() => setLightbox(i)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden aspect-[3/4] bg-dark-card border border-dark-border group"
            >
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold uppercase tracking-widest border border-white/60 px-3 py-1">
                  Ver foto
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-600 text-xs mt-8 uppercase tracking-widest"
        >
          Resultados individuais podem variar
        </motion.p>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center px-4"
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
              <X size={28} />
            </button>

            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-4 text-gray-400 hover:text-white transition-colors z-10 p-2"
            >
              <ChevronLeft size={36} />
            </button>

            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={galleryImages[lightbox].src}
              alt={galleryImages[lightbox].label}
              className="max-h-[90vh] max-w-full object-contain"
              onClick={e => e.stopPropagation()}
            />

            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-4 text-gray-400 hover:text-white transition-colors z-10 p-2"
            >
              <ChevronRight size={36} />
            </button>

            <div className="absolute bottom-4 flex gap-2">
              {galleryImages.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightbox(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === lightbox ? 'bg-lime-green scale-125' : 'bg-gray-600 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ContactSection = () => {
  return (
    <section id="contato" className="py-20 px-4 bg-dark-card">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-5xl md:text-6xl font-bebas uppercase mb-4">
            Comece Sua <span className="text-lime-green">Transformação</span>
          </h3>
          <p className="text-gray-400 text-lg mb-8">Entre em contato agora mesmo</p>
          <a 
            href="https://wa.me/5535998572602" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-lime-green hover:text-neon-green transition-colors text-2xl font-bold"
          >
            <Phone size={32} /> (35) 99857-2602
          </a>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-12 px-4 bg-black border-t border-dark-border">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          <div className="text-center md:text-left">
            <a href="https://www.kealabs.com.br" target="_blank" rel="noopener noreferrer" className="inline-block">
              <img 
                src={kealabsLogo} 
                alt="KeaLabs" 
                className="h-10 mb-3 opacity-80 hover:opacity-100 transition-opacity brightness-0 invert"
              />
            </a>
            <p className="text-sm text-gray-400">Business Intelligence e Agentes de IA</p>
            <p className="text-xs text-gray-600">Lab de Passos-MG</p>
          </div>
          
          <div className="text-center md:text-right">
            <h4 className="text-lime-green font-bebas text-xl mb-3 uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2 text-sm">
              {[['Início', 'início'], ['Sobre', 'sobre'], ['Serviços', 'serviços'], ['Consultoria Online', 'consultoria'], ['Resultados', 'resultados'], ['Contato', 'contato']].map(([label, anchor]) => (
                <li key={anchor}>
                  <a href={`#${anchor}`} className="text-gray-400 hover:text-lime-green transition-colors uppercase text-xs tracking-wide">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              <a 
                href="https://instagram.com/matheusc_personal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lime-green hover:text-neon-green transition-colors text-sm"
              >
                <Instagram size={20} /> @matheusc_personal
              </a>
              <br />
              <a 
                href="https://wa.me/5535998572602" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lime-green hover:text-neon-green transition-colors text-sm"
              >
                <Phone size={20} /> (35) 99857-2602
              </a>
            </div>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-dark-border">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-gray-500 text-xs uppercase tracking-wide">Protegido por</span>
            <a
              href="https://letsencrypt.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#003A70] px-3 py-1.5 hover:opacity-90 transition-opacity"
              title="Let's Encrypt - SSL gratuito"
            >
              <svg width="18" height="18" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 4L8 16v16c0 13.3 10.3 25.7 24 28 13.7-2.3 24-14.7 24-28V16L32 4z" fill="#003A70"/>
                <path d="M32 4L8 16v16c0 13.3 10.3 25.7 24 28 13.7-2.3 24-14.7 24-28V16L32 4z" stroke="#00A8E0" strokeWidth="2"/>
                <path d="M22 32h20M32 22v20" stroke="#00A8E0" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="32" cy="32" r="8" stroke="#00A8E0" strokeWidth="2"/>
              </svg>
              <span className="text-white text-xs font-bold tracking-wide">Let's Encrypt</span>
            </a>
          </div>
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} <span className="text-lime-green font-semibold">Matheus Personal</span>. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default App;
