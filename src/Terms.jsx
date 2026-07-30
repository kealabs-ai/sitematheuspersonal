import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-lime-green hover:text-neon-green mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>

          <h1 className="text-5xl font-bebas uppercase mb-8">
            <span className="text-lime-green">Termos</span> de Uso
          </h1>

          <div className="bg-dark-card border border-dark-border p-8 space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bebas text-lime-green mb-3">1. Aceitação dos Termos</h2>
              <p>Ao contratar nossos serviços, você concorda com estes termos de uso.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bebas text-lime-green mb-3">2. Serviços Oferecidos</h2>
              <p>Oferecemos consultoria de personal training online com acompanhamento personalizado.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bebas text-lime-green mb-3">3. Pagamento e Cancelamento</h2>
              <p>Os pagamentos são processados mensalmente. Você pode cancelar a qualquer momento com 7 dias de garantia.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bebas text-lime-green mb-3">4. Responsabilidades</h2>
              <p>O aluno deve seguir as orientações do personal trainer e informar qualquer condição de saúde relevante.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bebas text-lime-green mb-3">5. Contato</h2>
              <p>Para dúvidas, entre em contato via WhatsApp: (35) 99857-2602</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
