import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen sport-bg text-white font-inter flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-[120px] md:text-[180px] font-bebas leading-none text-lime-green">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-500 -mt-4">
            <Search size={20} />
            <p className="text-sm uppercase tracking-widest">Página não encontrada</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-gray-400 text-lg">
            A página que você está procurando não existe ou foi movida.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 border-2 border-dark-border text-gray-300 px-6 py-3 hover:border-lime-green/50 hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 bg-lime-green text-black px-6 py-3 font-bold hover:bg-neon-green transition-all"
            >
              <Home size={18} />
              Ir para Home
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-8 border-t border-dark-border"
        >
          <p className="text-gray-600 text-xs">
            Precisa de ajuda? Entre em contato pelo{' '}
            <a 
              href="https://wa.me/5535998572602" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lime-green hover:text-neon-green transition-colors"
            >
              WhatsApp
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
