import React from 'react';
import { Instagram, MessageCircle, Globe } from 'lucide-react';
import matheusPhoto from './assets/matheus_personal.jpeg';

const LinkBio = () => {
  const links = [
    {
      icon: <MessageCircle size={24} />,
      text: 'Fale Comigo no WhatsApp',
      url: 'https://wa.me/5535998572602',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: <Globe size={24} />,
      text: 'Acesse Meu Site',
      url: '/',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      icon: <Instagram size={24} />,
      text: 'Siga no Instagram',
      url: 'https://instagram.com/matheusc_personal',
      color: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Foto */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 shadow-2xl shadow-orange-500/50">
              <img 
                src={matheusPhoto} 
                alt="Matheus Castro" 
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-orange-500 rounded-full p-2">
              <span className="text-2xl">💪</span>
            </div>
          </div>
        </div>

        {/* Nome e Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bebas uppercase text-white mb-2 tracking-wider">
            Matheus Castro
          </h1>
          <p className="text-orange-500 font-bold uppercase text-sm tracking-widest mb-3">
            Personal Trainer
          </p>
          <p className="text-gray-400 text-xs uppercase mb-1">
            CREF 035480-G/MG
          </p>
          
          {/* Frase de Efeito */}
          <div className="mt-6 bg-gradient-to-r from-orange-500/20 to-transparent border-l-4 border-orange-500 p-4">
            <p className="text-white text-lg font-bold italic">
              "Transforme seu corpo,<br />
              <span className="text-orange-500">Supere seus limites!"</span>
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="space-y-4 mb-8">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link.color} w-full flex items-center justify-center gap-3 text-white font-bold py-4 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg uppercase text-sm tracking-wide`}
            >
              {link.icon}
              {link.text}
            </a>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bebas text-orange-500">300+</div>
            <div className="text-xs text-gray-400 uppercase">Alunos</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bebas text-orange-500">5+</div>
            <div className="text-xs text-gray-400 uppercase">Anos</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bebas text-orange-500">100%</div>
            <div className="text-xs text-gray-400 uppercase">Dedicação</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-xs">
          <p>© {new Date().getFullYear()} Matheus Personal</p>
          <p className="mt-2 text-gray-700">Passos-MG</p>
        </div>
      </div>
    </div>
  );
};

export default LinkBio;
