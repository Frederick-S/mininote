import { useState, useCallback } from 'react';

export interface ValidationRule<T> {
  field: keyof T;
  validate: (value: any, formData: T) => string | null;
}

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationRules: ValidationRule<T>[]
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback(
    (field: keyof T, value: any): string | null => {
      const rule = validationRules.find(r => r.field === field);
      if (!rule) return null;
      
      return rule.validate(value, { ...formData, [field]: value });
    },
    [formData, validationRules]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    validationRules.forEach(rule => {
      const error = rule.validate(formData[rule.field], formData);
      if (error) {
        newErrors[rule.field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validationRules]);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    formData,
    errors,
    validateField,
    validateForm,
    updateField,
    clearErrors,
    resetForm,
    setFormData,
  };
}