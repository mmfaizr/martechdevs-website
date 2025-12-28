import { useState, useCallback } from 'react';
import { calculateQuote } from '../config/quoteFlowConfig';

export function useQuoteFlow(apiUrl, conversationId, onComplete) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [collectedData, setCollectedData] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const fetchNextQuestion = useCallback(async (previousAnswer = '', currentData = {}) => {
    setIsLoadingQuestion(true);

    try {
      const response = await fetch(`${apiUrl}/quote/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          previous_answer: previousAnswer,
          collected_data: currentData
        })
      });

      if (!response.ok) throw new Error('Failed to get next question');

      const data = await response.json();
      
      setCollectedData(data.collected_data || currentData);
      
      if (data.is_complete) {
        setIsGeneratingQuote(true);
        const quote = calculateQuote(data.collected_data);
        
        const quoteResponse = await fetch(`${apiUrl}/quote/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: conversationId,
            answers: data.collected_data,
            calculated_quote: quote,
            email: data.collected_data.email
          })
        });

        const quoteData = await quoteResponse.json();
        
        setIsActive(false);
        setCurrentStep(null);
        setIsGeneratingQuote(false);
        
        if (onComplete) {
          onComplete(data.collected_data, quote, quoteData.quote_message);
        }
        return { completed: true };
      }

      setCurrentStep({
        question: data.question,
        options: data.options || [],
        multiSelect: data.multi_select || false,
        inputType: data.input_type || null
      });
      setQuestionCount(prev => prev + 1);
      setIsLoadingQuestion(false);
      
      return { completed: false };
    } catch (error) {
      console.error('Error fetching question:', error);
      setIsLoadingQuestion(false);
      return { completed: false, error: true };
    }
  }, [apiUrl, conversationId, onComplete]);

  const startFlow = useCallback(async () => {
    setIsActive(true);
    setCurrentStep(null);
    setCollectedData({});
    setSelectedOptions([]);
    setQuestionCount(0);
    setIsGeneratingQuote(false);
    await fetchNextQuestion('', {});
  }, [fetchNextQuestion]);

  const selectOption = useCallback((value) => {
    if (!currentStep) return;

    if (currentStep.multiSelect) {
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

  const confirmSelection = useCallback(async () => {
    if (!currentStep || selectedOptions.length === 0) return null;

    const selectedLabels = currentStep.options
      .filter(opt => selectedOptions.includes(opt.value))
      .map(opt => opt.label)
      .join(', ');

    setSelectedOptions([]);
    const result = await fetchNextQuestion(selectedLabels, collectedData);
    
    return { ...result, selectedLabels };
  }, [selectedOptions, currentStep, collectedData, fetchNextQuestion]);

  const submitTextInput = useCallback(async (value) => {
    if (!currentStep || !value.trim()) return null;

    setSelectedOptions([]);
    const result = await fetchNextQuestion(value.trim(), collectedData);
    
    return { ...result, submittedValue: value };
  }, [currentStep, collectedData, fetchNextQuestion]);

  const cancelFlow = useCallback(() => {
    setIsActive(false);
    setCurrentStep(null);
    setCollectedData({});
    setSelectedOptions([]);
    setQuestionCount(0);
    setIsGeneratingQuote(false);
  }, []);

  const getProgress = useCallback(() => {
    const estimatedTotal = 10;
    return {
      current: questionCount,
      total: estimatedTotal,
      percentage: Math.min(90, Math.round((questionCount / estimatedTotal) * 100))
    };
  }, [questionCount]);

  return {
    isActive,
    currentStep,
    selectedOptions,
    progress: getProgress(),
    isLoadingQuestion,
    isGeneratingQuote,
    startFlow,
    selectOption,
    confirmSelection,
    submitTextInput,
    cancelFlow,
    canGoBack: false
  };
}
