
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Menu, X } from 'lucide-react';

const App = () => {
  return (
    <div className="bg-black text-white font-inter">
      <div className="bg-yellow-500 text-black text-center py-2 px-4 text-sm md:text-base font-bold">
        🚧 Site em Desenvolvimento 🚧
      </div>
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <PricingSection />
        <BeforeAfterSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-10 left-0 right-0 z-50">
      <nav className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-md">
        <h1 className="text-xl md:text-2xl font-oswald uppercase">Matheus Personal</h1>
        
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <ul className="hidden md:flex space-x-6">
          {['Início', 'Serviços', 'Preços', 'Resultados', 'Contato'].map(item => (
            <li key={item}><a href={`#${item.toLowerCase()}`} className="hover:text-lime-green transition-colors">{item}</a></li>
          ))}
        </ul>
      </nav>

      {isOpen && (
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed top-0 right-0 h-screen w-64 bg-black/95 backdrop-blur-md md:hidden pt-20 px-6"
        >
          <ul className="flex flex-col space-y-6">
            {['Início', 'Serviços', 'Preços', 'Resultados', 'Contato'].map(item => (
              <li key={item}>
                <a 
                  href={`#${item.toLowerCase()}`} 
                  onClick={() => setIsOpen(false)}
                  className="text-xl hover:text-lime-green transition-colors block"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </header>
  );
};

const HeroSection = () => {
  return (
    <section id="início" className="h-screen flex items-center justify-center bg-cover bg-center px-4" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?fit=crop&w=1950&q=80')" }}>
      <div className="text-center bg-black/50 p-6 md:p-8 rounded-lg max-w-4xl">
        <motion.h2 
          className="text-4xl md:text-7xl font-oswald uppercase"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Transforme seu corpo, <br /> Mude sua vida.
        </motion.h2>
        <motion.p 
          className="mt-4 text-lg md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Treinamento de elite para resultados extraordinários.
        </motion.p>
        <motion.a 
          href="#contato"
          className="mt-8 inline-flex items-center bg-lime-green text-black font-bold py-3 px-6 md:px-8 rounded-full uppercase hover:bg-white transition-all transform hover:scale-105 text-sm md:text-base"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          Comece agora <ArrowRight className="ml-2" size={20} />
        </motion.a>
      </div>
    </section>
  );
};

const services = [
  { icon: '🏋️', title: 'Treinamento de Força', description: 'Desenvolva força máxima e hipertrofia muscular com periodização de treino avançada.' },
  { icon: '🏃♂️', title: 'Condicionamento Físico', description: 'Melhore sua resistência, agilidade e capacidade cardiovascular com treinos de alta intensidade (HIIT).' },
  { icon: '🍏', title: 'Aconselhamento Nutricional', description: 'Planos nutricionais personalizados para otimizar seus resultados, seja para ganho de massa ou perda de gordura.' },
  { icon: '🤸♀️', title: 'Flexibilidade e Mobilidade', description: 'Aumente sua amplitude de movimento, previna lesões e melhore sua recuperação muscular.' },
];

const ServicesSection = () => {
  return (
    <section id="serviços" className="py-12 md:py-20 px-4">
      <div className="container mx-auto text-center">
        <h3 className="text-3xl md:text-5xl font-oswald uppercase mb-8 md:mb-12">Meus Serviços</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              className="bg-gray-900 p-6 md:p-8 rounded-lg border border-gray-800"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="text-4xl md:text-5xl mb-4">{service.icon}</div>
              <h4 className="text-xl md:text-2xl font-oswald mb-2">{service.title}</h4>
              <p className="text-sm md:text-base text-gray-400">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const pricingPlans = [
  { name: 'Plano Básico', price: 'R$199', features: ['Avaliação Física', 'Treino Mensal', 'Suporte via App'] },
  { name: 'Plano Pro', price: 'R$299', features: ['Tudo do Básico', 'Acompanhamento Nutricional', 'Treinos quinzenais presenciais'], highlighted: true },
  { name: 'Plano Elite', price: 'R$499', features: ['Tudo do Pro', 'Acompanhamento diário', 'Treinos semanais presenciais'] },
];

const PricingSection = () => {
  const [current, setCurrent] = useState(1);
  const controls = useAnimation();

  const nextPlan = () => {
    setCurrent(current === pricingPlans.length - 1 ? 0 : current + 1);
  };

  const prevPlan = () => {
    setCurrent(current === 0 ? pricingPlans.length - 1 : current - 1);
  };

  useEffect(() => {
    controls.start({
      x: `-${current * 100}%`,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    });
  }, [current, controls]);

  return (
    <section id="preços" className="py-12 md:py-20 bg-gray-900 px-4">
      <div className="container mx-auto text-center">
        <h3 className="text-3xl md:text-5xl font-oswald uppercase mb-8 md:mb-12">Planos de Consultoria</h3>
        <div className="relative overflow-hidden md:hidden">
          <motion.div className="flex" animate={controls}>
            {pricingPlans.map((plan, index) => (
              <div key={index} className="w-full flex-shrink-0 px-2">
                <PricingCard plan={plan} />
              </div>
            ))}
          </motion.div>
          <button onClick={prevPlan} className="absolute top-1/2 left-2 -translate-y-1/2 bg-lime-green/50 rounded-full p-2"><ChevronLeft color="black" /></button>
          <button onClick={nextPlan} className="absolute top-1/2 right-2 -translate-y-1/2 bg-lime-green/50 rounded-full p-2"><ChevronRight color="black" /></button>
        </div>
        <div className="hidden md:grid md:grid-cols-3 gap-6 md:gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingCard = ({ plan }) => (
  <div className={`p-6 md:p-8 rounded-lg border ${plan.highlighted ? 'border-lime-green' : 'border-gray-700'} bg-black relative`}>
    {plan.highlighted && <span className="absolute top-0 right-4 -translate-y-1/2 bg-lime-green text-black text-xs md:text-sm font-bold px-3 py-1 rounded-full uppercase">Popular</span>}
    <h4 className="text-2xl md:text-3xl font-oswald mb-4">{plan.name}</h4>
    <p className="text-4xl md:text-5xl font-bold mb-6 text-lime-green">{plan.price}<span className="text-base md:text-lg">/mês</span></p>
    <ul className="text-left space-y-3 mb-8">
      {plan.features.map(feature => <li key={feature} className="flex items-center text-sm md:text-base"><ArrowRight className="text-lime-green mr-2 h-4 w-4 flex-shrink-0" /> {feature}</li>)}
    </ul>
    <a href="#contato" className={`w-full block text-center py-3 px-6 md:px-8 rounded-full uppercase font-bold text-sm md:text-base ${plan.highlighted ? 'bg-lime-green text-black hover:bg-white' : 'bg-gray-700 text-white hover:bg-gray-600'} transition-all`}>
      Contratar
    </a>
  </div>
);

const BeforeAfterSection = () => {
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <section id="resultados" className="py-12 md:py-20 px-4">
      <div className="container mx-auto text-center">
        <h3 className="text-3xl md:text-5xl font-oswald uppercase mb-8 md:mb-12">Resultados Reais</h3>
        <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] overflow-hidden rounded-lg">
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
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div className="absolute inset-y-0 bg-lime-green" style={{ left: `calc(${sliderValue}% - 2px)`, width: '4px' }}>
            <div className="absolute top-1/2 -translate-y-1/2 -left-3 md:-left-4 bg-lime-green rounded-full h-6 w-6 md:h-8 md:w-8 flex items-center justify-center">
              <ChevronLeft color="black" className="h-4 w-4 md:h-5 md:w-5" /><ChevronRight color="black" className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    
    console.log("Salvando no Firebase (simulação):", { name, email });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const message = `Olá, meu nome é ${name}. Gostaria de mais informações sobre a consultoria.`;
      const whatsappUrl = `https://wa.me/5500000000000?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error("Erro ao salvar lead: ", error);
      alert("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
      setName('');
      setEmail('');
    }
  };

  return (
    <section id="contato" className="py-12 md:py-20 bg-gray-900 px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <h3 className="text-3xl md:text-5xl font-oswald uppercase mb-4">Inicie sua Jornada</h3>
        <p className="text-sm md:text-base text-gray-400 mb-8">Deixe seu contato e entrarei em contato para agendar uma avaliação inicial gratuita.</p>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Seu nome" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 md:p-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-green text-sm md:text-base"
            />
            <input 
              type="email" 
              placeholder="Seu e-mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 md:p-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-green text-sm md:text-base"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto inline-flex items-center justify-center bg-lime-green text-black font-bold py-3 px-8 md:px-12 rounded-full uppercase hover:bg-white transition-all transform hover:scale-105 disabled:opacity-50 text-sm md:text-base"
          >
            {loading ? 'Enviando...' : 'Enviar e ir para WhatsApp'}
            {!loading && <ArrowRight className="ml-2" size={20} />}
          </button>
        </form>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-6 text-center px-4">
      <div className="mb-4">
        <img 
          src="/src/assets/kealabs_logo_strategic.png" 
          alt="KeaLabs Logo" 
          className="h-12 mx-auto mb-2"
        />
        <p className="text-sm text-gray-400">Construído e Assessorado por KeaLabs</p>
        <p className="text-xs text-gray-500">Lab de Passos-MG</p>
      </div>
      <p className="text-gray-500 text-sm md:text-base">&copy; {new Date().getFullYear()} Matheus Personal. Todos os direitos reservados.</p>
    </footer>
  );
};

export default App;
