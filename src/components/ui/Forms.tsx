import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full h-11 px-4 bg-surface-hover border border-border-subtle rounded-lg text-sm text-on-background placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full p-4 bg-surface-hover border border-border-subtle rounded-lg text-sm text-on-background placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-y min-h-[100px] ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-on-background mb-1.5 ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = 'Label';
