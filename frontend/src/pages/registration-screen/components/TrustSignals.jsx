import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const trustFeatures = [
    {
      icon: 'Shield',
      title: 'Secure & Private',
      description: 'Your data is encrypted and never shared'
    },
    {
      icon: 'Users',
      title: '50,000+ Users',
      description: 'Join thousands of successful candidates'
    },
    {
      icon: 'Award',
      title: 'AI-Powered',
      description: 'Advanced algorithms for realistic practice'
    },
    {
      icon: 'Clock',
      title: '24/7 Available',
      description: 'Practice anytime, anywhere'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      content: 'IntervYou.AI helped me land my dream job. The AI feedback was incredibly detailed and actionable.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Product Manager at Microsoft',
      content: 'The realistic interview scenarios prepared me for every question. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="space-y-8">
      {/* Trust Features */}
      <div className="grid grid-cols-2 gap-4">
        {trustFeatures?.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name={feature?.icon} size={20} color="var(--color-primary)" />
            </div>
            <h4 className="text-sm font-medium text-foreground mb-1">
              {feature?.title}
            </h4>
            <p className="text-xs text-muted-foreground">
              {feature?.description}
            </p>
          </div>
        ))}
      </div>
      {/* Security Badges */}
      <div className="flex items-center justify-center space-x-4 py-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Lock" size={16} color="var(--color-success)" />
          <span className="text-xs text-muted-foreground">SSL Secured</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={16} color="var(--color-success)" />
          <span className="text-xs text-muted-foreground">GDPR Compliant</span>
        </div>
      </div>
      {/* Testimonials */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground text-center">
          What Our Users Say
        </h3>
        {testimonials?.map((testimonial, index) => (
          <div key={index} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              {[...Array(testimonial?.rating)]?.map((_, i) => (
                <Icon key={i} name="Star" size={12} color="var(--color-warning)" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              "{testimonial?.content}"
            </p>
            <div className="text-xs">
              <span className="font-medium text-foreground">{testimonial?.name}</span>
              <span className="text-muted-foreground"> - {testimonial?.role}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Success Stats */}
      <div className="bg-success/5 border border-success/20 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-success mb-1">94%</div>
          <div className="text-xs text-muted-foreground">
            Success rate in landing interviews
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;