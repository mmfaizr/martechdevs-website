import { useState, useCallback, useRef } from 'react';
import { calculateQuote } from '../config/quoteFlowConfig';

export function useQuoteFlow(apiUrl, conversationId, onComplete) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  
  const collectedDataRef = useRef({});
  const currentFieldRef = useRef(null);

  const fetchNextQuestion = useCallback(async (previousAnswer = '') => {
    setIsLoadingQuestion(true);

    try {
      console.log('[QuoteFlow] Fetching next question:', { 
        conversationId, 
        previousAnswer: previousAnswer?.substring(0, 30),
        previousField: currentFieldRef.current,
        collectedKeys: Object.keys(collectedDataRef.current)
      });
      
      const response = await fetch(`${apiUrl}/quote/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId || null,
          previous_answer: previousAnswer,
          collected_data: collectedDataRef.current,
          previous_field: currentFieldRef.current
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[QuoteFlow] API error:', response.status, errorText);
        throw new Error('Failed to get next question');
      }

      const data = await response.json();
      
      collectedDataRef.current = data.collected_data || collectedDataRef.current;
      console.log('[QuoteFlow] Updated collected data:', collectedDataRef.current);
      
      if (data.needs_handoff) {
        console.log('[QuoteFlow] Handoff requested, stopping flow');
        setIsActive(false);
        setCurrentStep(null);
        setIsLoadingQuestion(false);
        return { completed: false, needsHandoff: true };
      }
      
      if (data.is_complete) {
        console.log('[QuoteFlow] Flow complete, generating quote...');
        setIsGeneratingQuote(true);
        setIsLoadingQuestion(false);
        
        try {
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
        } catch (quoteError) {
          console.error('[QuoteFlow] Quote generation error:', quoteError);
          const quote = calculateQuote(data.collected_data);
          setIsActive(false);
          setCurrentStep(null);
          setIsGeneratingQuote(false);
          
          if (onComplete) {
            onComplete(data.collected_data, quote, 'Your quote has been prepared! Check your email for details.');
          }
        }
        return { completed: true };
      }

      const step = {
        question: data.question,
        options: data.options || [],
        multiSelect: data.multi_select || false,
        inputType: data.input_type || null
      };
      
      currentFieldRef.current = data.next_field || null;
      console.log('[QuoteFlow] Setting step:', { 
        question: step.question?.substring(0, 50), 
        options: step.options?.length,
        nextField: currentFieldRef.current 
      });
      setCurrentStep(step);
      setQuestionCount(prev => prev + 1);
      setIsLoadingQuestion(false);
      
      return { completed: false };
    } catch (error) {
      console.error('[QuoteFlow] Error fetching question:', error);
      setIsLoadingQuestion(false);
      
      if (Object.keys(collectedDataRef.current).length === 0) {
        currentFieldRef.current = 'company_type';
        setCurrentStep({
          question: "Let's get you a quote! What type of company are you?",
          options: [
            { value: 'b2b_saas', label: 'B2B SaaS' },
            { value: 'b2c_saas', label: 'B2C SaaS' },
            { value: 'e_commerce', label: 'E-commerce' },
            { value: 'fintech', label: 'Fintech' },
            { value: 'other', label: 'Other' }
          ],
          multiSelect: false,
          inputType: null
        });
        setQuestionCount(1);
      } else {
        setCurrentStep({
          question: "Hmm, something went wrong. Could you try that again?",
          options: [],
          multiSelect: false,
          inputType: 'text'
        });
      }
      return { completed: false, error: true };
    }
  }, [apiUrl, conversationId, onComplete]);

  const startFlow = useCallback(async () => {
    setIsActive(true);
    setCurrentStep(null);
    collectedDataRef.current = {};
    currentFieldRef.current = null;
    setSelectedOptions([]);
    setQuestionCount(0);
    setIsGeneratingQuote(false);
    await fetchNextQuestion('');
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

  const selectAndConfirm = useCallback(async (option) => {
    if (!currentStep) return null;
    
    setSelectedOptions([]);
    const result = await fetchNextQuestion(option.label);
    
    return { ...result, selectedLabels: option.label };
  }, [currentStep, fetchNextQuestion]);

  const confirmSelection = useCallback(async () => {
    if (!currentStep || selectedOptions.length === 0) return null;

    const selectedLabels = currentStep.options
      .filter(opt => selectedOptions.includes(opt.value))
      .map(opt => opt.label)
      .join(', ');

    setSelectedOptions([]);
    const result = await fetchNextQuestion(selectedLabels);
    
    return { ...result, selectedLabels };
  }, [selectedOptions, currentStep, fetchNextQuestion]);

  const submitTextInput = useCallback(async (value) => {
    if (!currentStep || !value.trim()) return null;

    setSelectedOptions([]);
    const result = await fetchNextQuestion(value.trim());
    
    return { ...result, submittedValue: value };
  }, [currentStep, fetchNextQuestion]);

  const cancelFlow = useCallback(() => {
    setIsActive(false);
    setCurrentStep(null);
    collectedDataRef.current = {};
    currentFieldRef.current = null;
    setSelectedOptions([]);
    setQuestionCount(0);
    setIsGeneratingQuote(false);
  }, []);

  const getProgress = useCallback(() => {
    const estimatedTotal = 9;
    const current = Math.min(questionCount, estimatedTotal);
    return {
      current: current,
      total: estimatedTotal,
      percentage: Math.min(95, Math.round((current / estimatedTotal) * 100))
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
    selectAndConfirm,
    confirmSelection,
    submitTextInput,
    cancelFlow,
    canGoBack: false
  };
}
