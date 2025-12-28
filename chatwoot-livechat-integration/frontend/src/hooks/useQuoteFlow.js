import { useState, useCallback } from 'react';
import { QUOTE_FLOW_STEPS, calculateQuote, formatQuoteMessage } from '../config/quoteFlowConfig';

export function useQuoteFlow(onComplete) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);

  const startFlow = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    setAnswers({});
    setSelectedOptions([]);
  }, []);

  const getCurrentStep = useCallback(() => {
    return QUOTE_FLOW_STEPS[currentStep] || null;
  }, [currentStep]);

  const selectOption = useCallback((value) => {
    const step = QUOTE_FLOW_STEPS[currentStep];
    if (!step) return;

    if (step.multiSelect) {
      setSelectedOptions(prev => {
        if (prev.includes(value)) {
          return prev.filter(v => v !== value);
        }
        return [...prev, value];
      });
    } else {
      setSelectedOptions([value]);
    }
  }, [currentStep]);

  const confirmSelection = useCallback(() => {
    const step = QUOTE_FLOW_STEPS[currentStep];
    if (!step || selectedOptions.length === 0) return null;

    const newAnswers = { ...answers, [step.id]: selectedOptions };
    setAnswers(newAnswers);

    const selectedLabels = step.options
      .filter(opt => selectedOptions.includes(opt.value))
      .map(opt => opt.label)
      .join(', ');

    const nextStep = currentStep + 1;
    if (nextStep >= QUOTE_FLOW_STEPS.length) {
      const quote = calculateQuote(newAnswers);
      const quoteMessage = formatQuoteMessage(newAnswers, quote);
      setIsActive(false);
      if (onComplete) {
        onComplete(newAnswers, quote, quoteMessage);
      }
      return { completed: true, selectedLabels, quote, quoteMessage };
    }

    setCurrentStep(nextStep);
    setSelectedOptions([]);
    return { completed: false, selectedLabels, nextQuestion: QUOTE_FLOW_STEPS[nextStep].question };
  }, [currentStep, selectedOptions, answers, onComplete]);

  const submitTextInput = useCallback((value) => {
    const step = QUOTE_FLOW_STEPS[currentStep];
    if (!step || !value.trim()) return null;

    const newAnswers = { ...answers, [step.id]: [value.trim()] };
    setAnswers(newAnswers);

    const nextStep = currentStep + 1;
    if (nextStep >= QUOTE_FLOW_STEPS.length) {
      const quote = calculateQuote(newAnswers);
      const quoteMessage = formatQuoteMessage(newAnswers, quote);
      setIsActive(false);
      if (onComplete) {
        onComplete(newAnswers, quote, quoteMessage);
      }
      return { completed: true, submittedValue: value, quote, quoteMessage };
    }

    setCurrentStep(nextStep);
    setSelectedOptions([]);
    return { completed: false, submittedValue: value, nextQuestion: QUOTE_FLOW_STEPS[nextStep].question };
  }, [currentStep, answers, onComplete]);

  const cancelFlow = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setAnswers({});
    setSelectedOptions([]);
  }, []);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      const prevStepConfig = QUOTE_FLOW_STEPS[prevStep];
      setCurrentStep(prevStep);
      setSelectedOptions(answers[prevStepConfig.id] || []);
    }
  }, [currentStep, answers]);

  const getProgress = useCallback(() => {
    return {
      current: currentStep + 1,
      total: QUOTE_FLOW_STEPS.length,
      percentage: Math.round(((currentStep + 1) / QUOTE_FLOW_STEPS.length) * 100)
    };
  }, [currentStep]);

  return {
    isActive,
    currentStep: getCurrentStep(),
    selectedOptions,
    progress: getProgress(),
    startFlow,
    selectOption,
    confirmSelection,
    submitTextInput,
    cancelFlow,
    goBack,
    canGoBack: currentStep > 0
  };
}

