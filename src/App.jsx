import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Menu, X, Dumbbell, Target, TrendingUp, Award, Instagram, Phone } from 'lucide-react';
import kealabsLogo from './assets/kealabs_logo_strategic.png';
import matheusPhoto from './assets/matheus_personal.jpg';

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
        <PricingSection />
        <OnlineSection />
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
        <h1 className="text-2xl md:text-3xl font-bebas uppercase tracking-wider">
          <span className="text-lime-green">Matheus</span> Personal
        </h1>
        
        <div className="flex items-center gap-4">
          <a 
            href="https://instagram.com/matheusc_personal" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lime-green hover:text-neon-green transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={28} />
          </a>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-lime-green">
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        <ul className="hidden md:flex space-x-8 font-semibold items-center">
          {['Início', 'Sobre', 'Serviços', 'Presencial', 'Online', 'Resultados', 'Contato'].map(item => (
            <li key={item}>
              <a href={`#${item.toLowerCase()}`} className="hover:text-lime-green transition-colors uppercase text-sm tracking-wide">
                {item}
              </a>
            </li>
          ))}
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
            style={{ zIndex: 45 }}
            onClick={() => setIsOpen(false)}
          ></div>
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="fixed top-0 right-0 h-screen w-72 bg-black/98 backdrop-blur-lg md:hidden pt-20 px-6 border-l border-lime-green/20"
            style={{ zIndex: 50 }}
          >
          <ul className="flex flex-col space-y-6">
            {['Início', 'Sobre', 'Serviços', 'Presencial', 'Online', 'Resultados', 'Contato'].map(item => (
              <li key={item}>
                <a 
                  href={`#${item.toLowerCase()}`} 
                  onClick={() => setIsOpen(false)}
                  className="text-xl hover:text-lime-green transition-colors block uppercase font-semibold"
                >
                  {item}
                </a>
              </li>
            ))}
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
              href="#presencial"
              className="inline-flex items-center justify-center bg-lime-green text-black font-bold py-4 px-10 rounded-none uppercase hover:bg-neon-green transition-all transform hover:scale-105 text-lg"
            >
              Ver Planos <ArrowRight className="ml-2" size={24} />
            </a>
            <a 
              href="#contato"
              className="inline-flex items-center justify-center border-2 border-lime-green text-lime-green font-bold py-4 px-10 rounded-none uppercase hover:bg-lime-green hover:text-black transition-all text-lg"
            >
              Agendar Avaliação
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
              Tenho <span className="text-lime-green font-bold">30 anos</span> e sou personal trainer, especialista em <span className="text-lime-green font-bold">treinos de hipertrofia e emagrecimento</span>.
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
              className="mb-6"
            >
              <div className="w-[350px] h-[350px] rounded-full overflow-hidden">
                <motion.img
                  src={matheusPhoto}
                  alt="Matheus Castro"
                  className="w-full h-full object-cover object-top"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
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
  { icon: <Dumbbell size={48} />, title: 'Treinamento de Força', description: 'Desenvolva força máxima e hipertrofia com periodização avançada' },
  { icon: <TrendingUp size={48} />, title: 'Condicionamento', description: 'HIIT e treinos funcionais para resistência e performance' },
  { icon: <Target size={48} />, title: 'Nutrição Esportiva', description: 'Planos alimentares personalizados para seus objetivos' },
  { icon: <Award size={48} />, title: 'Acompanhamento', description: 'Suporte contínuo e ajustes em tempo real' },
];

const ServicesSection = () => {
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
          <p className="text-gray-400 text-lg">Soluções completas para sua evolução</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              className="bg-dark-card border border-dark-border p-8 hover:border-lime-green transition-all group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-lime-green mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
              <h4 className="text-2xl font-bebas mb-3 uppercase">{service.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
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
    frequency: '2x na semana',
    classes: '8 aulas/mês',
    price: '499', 
    description: 'Ideal para quem quer consistência e um acompanhamento próximo para garantir o progresso',
    popular: false
  },
  { 
    name: 'PRATA', 
    frequency: '3x na semana',
    classes: '12 aulas/mês',
    price: '729', 
    description: 'Para quem está totalmente focado e quer uma transformação corporal mais rápida e intensa',
    popular: true
  },
  { 
    name: 'OURO', 
    frequency: '4x na semana',
    classes: '16 aulas/mês',
    price: '949', 
    description: 'Para quem está totalmente focado e quer uma transformação corporal mais rápida e intensa',
    popular: false
  },
  { 
    name: 'PLUS', 
    frequency: '5x na semana',
    classes: '20 aulas/mês',
    price: '1199', 
    description: 'O acompanhamento definitivo. Máximo comprometimento para uma transformação completa de corpo e mente',
    popular: false
  },
];

const PricingSection = () => {
  return (
    <section id="presencial" className="py-20 px-4 bg-dark-card">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-5xl md:text-6xl font-bebas uppercase mb-6">
            Acompanhamento <span className="text-lime-green">Presencial</span>
          </h3>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            O plano presencial é para você que busca a <span className="text-lime-green font-semibold">máxima performance e segurança</span>, com minha supervisão direta em cada exercício. Garanto a <span className="text-lime-green font-semibold">técnica perfeita</span>, a motivação extra e os ajustes necessários em tempo real para <span className="text-lime-green font-semibold">acelerar seus resultados</span>.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-black border-2 p-6 ${plan.popular ? 'border-lime-green scale-105' : 'border-dark-border'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-lime-green text-black px-4 py-1 font-bold text-xs uppercase">
                  Mais Escolhido
                </div>
              )}
              <h4 className="text-3xl font-bebas mb-1 text-center text-lime-green">{plan.name}</h4>
              <p className="text-center text-gray-400 text-sm mb-4">{plan.frequency}</p>
              <div className="text-center mb-4 pb-4 border-b border-dark-border">
                <span className="text-4xl font-bebas text-white">R${plan.price}</span>
                <span className="text-gray-400 text-sm">/mês</span>
                <p className="text-lime-green text-xs mt-1 font-semibold">{plan.classes}</p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 min-h-[80px]">
                {plan.description}
              </p>
              <a 
                href="#contato"
                className={`block text-center py-3 font-bold uppercase transition-all text-sm ${
                  plan.popular 
                    ? 'bg-lime-green text-black hover:bg-neon-green' 
                    : 'border-2 border-lime-green text-lime-green hover:bg-lime-green hover:text-black'
                }`}
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

const OnlineSection = () => {
  const benefits = [
    { title: 'Treino 100% Personalizado', description: 'Montado do zero, respeitando seus objetivos, sua rotina e seus limites' },
    { title: 'Flexibilidade Total', description: 'Escolha treinar em casa ou na academia' },
    { title: 'Treino no App com Vídeos', description: 'Acesse seu plano de treino de forma organizada e veja a execução correta de cada exercício' },
    { title: 'Feedbacks Semanais', description: 'Análise da sua evolução e ajustes no plano para garantir o progresso contínuo' },
    { title: 'Suporte VIP via WhatsApp', description: 'Tire suas dúvidas diretamente comigo e receba a motivação que precisa para não desistir' },
  ];

  return (
    <section id="online" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
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
            Leve meu método para onde você estiver. Com a consultoria online, você tem a <span className="text-lime-green font-semibold">flexibilidade de treinar em casa ou na academia</span>, no seu próprio ritmo, mas com todo o meu planejamento e suporte para não perder o foco e <span className="text-lime-green font-semibold">alcançar seus objetivos</span>.
          </p>
        </motion.div>

        <div className="bg-dark-card border-2 border-lime-green p-8 md:p-12">
          <div className="text-center mb-8">
            <h4 className="text-3xl font-bebas uppercase text-lime-green mb-4">
              Itens Inclusos na Consultoria Online
            </h4>
            <div className="inline-block bg-black border-2 border-lime-green px-8 py-4">
              <span className="text-5xl font-bebas text-lime-green">R$119</span>
              <span className="text-2xl text-gray-400">,90</span>
              <span className="text-gray-400">/mês</span>
            </div>
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
              href="#contato"
              className="inline-flex items-center justify-center bg-lime-green text-black font-bold py-4 px-12 uppercase hover:bg-neon-green transition-all transform hover:scale-105 text-lg"
            >
              Quero Consultoria Online <ArrowRight className="ml-2" size={24} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Ana Paula Silva',
      age: '32 anos',
      result: 'Perdeu 15kg em 4 meses',
      text: 'O Matheus mudou completamente minha relação com o treino. Além de perder peso, ganhei confiança e disposição. O acompanhamento dele é impecável!',
      rating: 5
    },
    {
      name: 'Carlos Eduardo',
      age: '28 anos',
      result: 'Ganhou 8kg de massa muscular',
      text: 'Treino com o Matheus há 1 ano e os resultados são incríveis. Ele sabe exatamente como extrair o máximo de cada treino. Recomendo demais!',
      rating: 5
    },
    {
      name: 'Juliana Costa',
      age: '35 anos',
      result: 'Definiu o corpo em 6 meses',
      text: 'A consultoria online do Matheus é perfeita pra quem tem rotina corrida. Consigo treinar no meu tempo e ele sempre me dá todo suporte necessário!',
      rating: 5
    },
    {
      name: 'Ricardo Mendes',
      age: '42 anos',
      result: 'Melhorou condicionamento físico',
      text: 'Depois dos 40 achei que não conseguiria mais evoluir, mas o Matheus provou o contrário. Estou mais forte e saudável do que nunca!',
      rating: 5
    },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-black border border-dark-border p-6 relative"
            >
              <div className="absolute top-4 right-4 text-6xl text-lime-green/20 font-serif">”</div>
              <div className="mb-4">
                <h4 className="text-xl font-bold text-white">{testimonial.name}</h4>
                <p className="text-sm text-gray-500">{testimonial.age}</p>
                <p className="text-lime-green text-sm font-semibold mt-1">{testimonial.result}</p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">
                “{testimonial.text}”
              </p>
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-lime-green text-lg">★</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ResultsSection = () => {
  const [sliderValue, setSliderValue] = useState(50);

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

        <div className="max-w-4xl mx-auto">
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-dark-card border-2 border-dark-border">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800')" }}></div>
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800')",
                clipPath: `polygon(0 0, ${sliderValue}% 0, ${sliderValue}% 100%, 0 100%)`
              }}
            ></div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderValue} 
              onChange={(e) => setSliderValue(e.target.value)}
              className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
            />
            <div className="absolute inset-y-0 bg-lime-green z-20 pointer-events-none" style={{ left: `calc(${sliderValue}% - 2px)`, width: '4px' }}>
              <div className="absolute top-1/2 -translate-y-1/2 -left-4 bg-lime-green rounded-full h-8 w-8 flex items-center justify-center shadow-lg">
                <ChevronLeft color="black" size={20} />
                <ChevronRight color="black" size={20} />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/80 px-4 py-2 text-sm font-bold">ANTES</div>
            <div className="absolute bottom-4 right-4 bg-lime-green/90 text-black px-4 py-2 text-sm font-bold">DEPOIS</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const message = `Olá! Meu nome é ${name}. Gostaria de mais informações sobre consultoria. Email: ${email}`;
      const whatsappUrl = `https://wa.me/5535998572602?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      alert("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
      setName('');
      setEmail('');
      setPhone('');
    }
  };

  return (
    <section id="contato" className="py-20 px-4 bg-dark-card">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-5xl md:text-6xl font-bebas uppercase mb-4">
            Comece Sua <span className="text-lime-green">Transformação</span>
          </h3>
          <p className="text-gray-400 text-lg mb-4">Agende sua avaliação gratuita agora</p>
          <a 
            href="https://wa.me/5535998572602" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-lime-green hover:text-neon-green transition-colors text-xl font-bold"
          >
            <Phone size={24} /> (35) 99857-2602
          </a>
        </motion.div>

        <form onSubmit={handleSubmit} className="bg-black border border-dark-border p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <input 
              type="text" 
              placeholder="Seu nome completo" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-dark-card border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
            />
            <input 
              type="email" 
              placeholder="Seu e-mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-dark-card border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
            />
          </div>
          <input 
            type="tel" 
            placeholder="Seu telefone/WhatsApp" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-4 bg-dark-card border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors mb-6"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all transform hover:scale-105 disabled:opacity-50 text-lg flex items-center justify-center"
          >
            {loading ? 'Enviando...' : 'Agendar Avaliação Gratuita'}
            {!loading && <ArrowRight className="ml-2" size={24} />}
          </button>
        </form>
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
              {['Início', 'Sobre', 'Serviços', 'Presencial', 'Online', 'Resultados', 'Contato'].map(item => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-lime-green transition-colors uppercase text-xs tracking-wide">
                    {item}
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
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} <span className="text-lime-green font-semibold">Matheus Personal</span>. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default App;
