import React from 'react';
import { Instagram, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import kealabsLogo from './assets/kealabs_logo_strategic_white.png';
import matheusLogo from './assets/logotipo_matheus_personal.png';

const NAV_LINKS = [
  ['Início',    '/dashboard'],
  ['Treinos',   '/dashboard/treinos'],
  ['Evolução',  '/dashboard/evolucao'],
  ['Nutrição',  '/dashboard/nutricao'],
  ['Perfil',    '/dashboard/perfil'],
];

export default function AppFooter() {
  const navigate = useNavigate();

  return (
    <footer className="py-12 px-4 bg-black border-t border-dark-border pb-[calc(3rem+60px)] md:pb-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">

          {/* Kealabs */}
          <div className="text-center md:text-left">
            <a href="https://www.kealabs.com.br" target="_blank" rel="noopener noreferrer" className="inline-block">
              <img src={kealabsLogo} alt="KeaLabs" className="h-10 mb-3 opacity-80 hover:opacity-100 transition-opacity brightness-0 invert" />
            </a>
            <p className="text-sm text-gray-400">Business Intelligence e Agentes de IA</p>
            <p className="text-xs text-gray-600">Lab de Passos-MG</p>
          </div>

          {/* Nav + social */}
          <div className="text-center md:text-right">
            <h4 className="text-lime-green font-bebas text-xl mb-3 uppercase tracking-wider">Área do Aluno</h4>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map(([label, path]) => (
                <li key={path}>
                  <button onClick={() => navigate(path)}
                    className="text-gray-400 hover:text-lime-green transition-colors uppercase text-xs tracking-wide">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              <a href="https://instagram.com/matheusc_personal" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lime-green hover:text-neon-green transition-colors text-sm">
                <Instagram size={20} /> @matheusc_personal
              </a>
              <br />
              <a href="https://wa.me/5535998572602" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lime-green hover:text-neon-green transition-colors text-sm">
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
}
