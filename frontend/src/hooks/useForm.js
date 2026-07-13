import { useState, useCallback } from 'react';

/**
 * Custom hook for form handling
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Submit handler function
 * @param {Function} validate - Validation function
 * @returns {Object} Form state and handlers
 */
const useForm = (initialValues = {}, onSubmit = () => {}, validate = () => ({})) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
  }, [validate, values]);

    const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values, { resetForm });
      } catch (err) {
        // silent fail - error handled by parent
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [onSubmit, resetForm, validate, values]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues
  };
};

export default useForm;
