const TrustSignals = () => {
  const trustFeatures = [
    { icon: 'ms:lock', title: 'Encrypted' },
    { icon: 'ms:groups', title: '50K Users' },
    { icon: 'ms:memory', title: 'AI Driven' },
    { icon: 'ms:speed', title: 'Realtime' }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      {trustFeatures.map((feature, index) => (
        <div key={index} className="bg-surface-container-high/20 backdrop-blur-xl border border-outline-variant/10 p-5 rounded-2xl flex flex-col items-center justify-center group hover:bg-surface-container-high/40 transition-all duration-500">
          <Icon name={feature.icon} size={20} className="text-on-surface-variant/20 mb-3 group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-extrabold text-on-surface-variant/40 group-hover:text-on-surface uppercase tracking-[0.2em]">{feature.title}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustSignals;