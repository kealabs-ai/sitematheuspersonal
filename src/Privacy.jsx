import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
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
            <span className="text-lime-green">Política</span> de Privacidade
          </h1>

          <div className="bg-dark-card border border-dark-border p-8 space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bebas text-lime-green mb-3">1. Coleta de Dados</h2>
              <p>Coletamos apenas dados necessários para prestação dos serviços: nome, email, telefone e CPF.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bebas text-lime-green mb-3">2. Uso dos Dados</h2>
              <p>Seus dados são utilizados exclusivamente para comunicação, acompanhamento e processamento de pagamentos.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bebas text-lime-green mb-3">3. Segurança</h2>
              <p>Utilizamos criptografia SSL e não armazenamos dados de cartão de crédito. Pagamentos são processados de forma segura.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bebas text-lime-green mb-3">4. Compartilhamento</h2>
              <p>Seus dados não são compartilhados com terceiros, exceto processadores de pagamento autorizados.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bebas text-lime-green mb-3">5. Seus Direitos</h2>
              <p>Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bebas text-lime-green mb-3">6. Contato</h2>
              <p>Para questões sobre privacidade, entre em contato via WhatsApp: (35) 99857-2602</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
