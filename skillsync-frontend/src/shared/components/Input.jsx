import { forwardRef } from 'react';

/**
 * Form field with label, hint and error message.
 * Wraps either a native input or a textarea based on `as` prop.
 */
const Input = forwardRef(function Input(
  { label, hint, error, as = 'input', className = '', id, ...rest },
  ref
) {
  const fieldId = id || rest.name;
  const Tag = as === 'textarea' ? 'textarea' : 'input';
  const tagClass = as === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="field">
      {label && <label htmlFor={fieldId} className="field-label">{label}</label>}
      <Tag
        id={fieldId}
        ref={ref}
        className={`${tagClass} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...rest}
      />
      {error && <span id={`${fieldId}-error`} className="field-error">{error}</span>}
      {!error && hint && <span id={`${fieldId}-hint`} className="field-hint">{hint}</span>}
    </div>
  );
});

export default Input;
