import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import matheusLogo from './assets/logotipo_matheus_personal.png';

const FEEDBACK_API = 'https://srv1023256.hstgr.cloud/api/feedbacks';

const Feedback = () => {
  const [form, setForm] = useState({ name: '', age: '', city: '', title: '', testimonial: '', rating: 0 });
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { setErrorMsg('Selecione uma avaliação com as estrelas.'); return; }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(FEEDBACK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, age: Number(form.age) }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.message || 'Erro ao enviar. Tente novamente.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Erro de conexão. Verifique sua internet.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-sm"
        >
          <img src={matheusLogo} alt="Matheus Personal" className="h-12 mx-auto mb-8 brightness-0 invert" />
          <div className="text-7xl mb-6">🙏</div>
          <h2 className="text-4xl font-bebas text-lime-green mb-4">Obrigado pelo Depoimento!</h2>
          <p className="text-gray-300 text-base leading-relaxed">
            Sua contribuição é muito importante para nós. Em breve você verá seu depoimento no site!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white font-inter py-8 px-4">
      <div className="max-w-xl mx-auto">

        {/* Logo */}
        <div className="text-center mb-10">
          <img src={matheusLogo} alt="Matheus Personal" className="h-14 mx-auto mb-6 brightness-0 invert" />

          {/* Texto informativo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-card border border-lime-green/30 p-6 text-left"
          >
            <p className="text-lime-green font-bold uppercase text-xs tracking-widest mb-3">🌐 Vem novidade por aí!</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              O novo site do <span className="text-white font-semibold">Matheus Personal</span> está chegando e queremos <span className="text-lime-green font-semibold">você lá</span>.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-3">
              Estamos coletando depoimentos de quem vive o nosso dia a dia para fortalecer nossa rede saudável. Pode nos ajudar compartilhando sua experiência?
            </p>
            <p className="text-lime-green font-semibold text-sm mt-3">Sua evolução é o que nos move! 💪</p>
          </motion.div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-card border border-dark-border p-5 sm:p-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bebas uppercase mb-6 text-center">
            Deixe seu <span className="text-lime-green">Depoimento</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Nome *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Seu nome"
                  className="w-full p-3 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Idade *</label>
                <input
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  required
                  type="number"
                  min="10"
                  max="100"
                  placeholder="Ex: 28"
                  className="w-full p-3 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Cidade *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="Ex: Passos - MG"
                className="w-full p-3 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Título *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Ex: Perdi 10kg em 3 meses!"
                className="w-full p-3 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Depoimento *</label>
              <textarea
                name="testimonial"
                value={form.testimonial}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Conte sua experiência com o Matheus Personal..."
                className="w-full p-3 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors text-sm resize-none"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-3">Avaliação *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="p-1 transition-transform active:scale-95"
                  >
                    <Star
                      size={40}
                      className="transition-colors"
                      fill={(hover || form.rating) >= star ? '#00B4D8' : 'transparent'}
                      stroke={(hover || form.rating) >= star ? '#00B4D8' : '#4a4a4a'}
                    />
                  </button>
                ))}
                {form.rating > 0 && (
                  <span className="ml-1 text-lime-green text-sm self-center font-semibold">
                    {['', 'Ruim', 'Regular', 'Bom', 'Ótimo', 'Excelente!'][form.rating]}
                  </span>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500 p-3 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all text-sm disabled:opacity-50"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar Depoimento'}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-gray-600 text-xs mt-8">
          © {new Date().getFullYear()} Matheus Personal · Desenvolvido por{' '}
          <a href="https://www.kealabs.com.br" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-lime-green transition-colors">
            Kealabs
          </a>
        </p>
      </div>
    </div>
  );
};

export default Feedback;
