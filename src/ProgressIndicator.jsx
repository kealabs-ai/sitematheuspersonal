import React from 'react';
import { Check } from 'lucide-react';

const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Plano' },
    { id: 2, name: 'Cadastro' },
    { id: 3, name: 'Pagamento' },
    { id: 4, name: 'Confirmação' }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step.id < currentStep 
                  ? 'bg-lime-green border-lime-green' 
                  : step.id === currentStep 
                  ? 'border-lime-green bg-lime-green/20 text-lime-green' 
                  : 'border-dark-border text-gray-600'
              }`}>
                {step.id < currentStep ? (
                  <Check size={20} className="text-black" />
                ) : (
                  <span className="font-bold">{step.id}</span>
                )}
              </div>
              <span className={`text-xs mt-2 uppercase font-semibold ${
                step.id <= currentStep ? 'text-lime-green' : 'text-gray-600'
              }`}>
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 transition-all ${
                step.id < currentStep ? 'bg-lime-green' : 'bg-dark-border'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
