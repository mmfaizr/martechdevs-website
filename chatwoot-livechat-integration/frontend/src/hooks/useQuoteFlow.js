import { useState, useCallback } from 'react';
import { QUOTE_TOPICS, calculateQuote } from '../config/quoteFlowConfig';

export function useQuoteFlow(apiUrl, conversationId, onComplete) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(null);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const sendAnswerToBackend = useCallback(async (answer) => {
    if (!conversationId) return;
    try {
      await fetch(`${apiUrl}/quote/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, answer })
      });
    } catch (err) {
      console.warn('Failed to send answer to backend:', err);
    }
  }, [apiUrl, conversationId]);

  const generateSalesQuote = useCallback(async (allAnswers, calculatedQuote) => {
    try {
      const response = await fetch(`${apiUrl}/quote/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversation_id: conversationId,
          answers: allAnswers,
          calculated_quote: calculatedQuote,
          email: allAnswers.email?.[0]
        })
      });

      if (!response.ok) throw new Error('Failed to generate quote');
      
      const data = await response.json();
      return data.quote_message;
    } catch (err) {
      console.error('Failed to generate sales quote:', err);
      return null;
    }
  }, [apiUrl, conversationId]);

  const generateQuestion = useCallback(async (topicIndex, prevAnswer = '') => {
    const topicConfig = QUOTE_TOPICS[topicIndex];
    if (!topicConfig) return null;

    const coveredTopics = QUOTE_TOPICS
      .slice(0, topicIndex)
      .map(t => t.topic)
      .join(', ');

    setIsLoadingQuestion(true);

    try {
      const response = await fetch(`${apiUrl}/quote/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          topic: topicConfig.topic,
          topic_id: topicConfig.id,
          default_options: topicConfig.options,
          covered_topics: coveredTopics,
          previous_answer: prevAnswer,
          is_first: topicIndex === 0,
          is_email_step: topicConfig.inputType === 'email'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate question');
      }

      const data = await response.json();
      
      const step = {
        id: topicConfig.id,
        question: data.question,
        options: data.options?.length > 0 ? data.options : topicConfig.options,
        multiSelect: data.multiSelect ?? topicConfig.multiSelect,
        inputType: data.inputType || topicConfig.inputType || null
      };

      setCurrentStep(step);
      setIsLoadingQuestion(false);
      return step;
    } catch (error) {
      console.error('Error generating question:', error);
      
      const fallbackStep = {
        id: topicConfig.id,
        question: topicIndex === 0 
          ? `Hey! Let's get you a quick quote. First, ${topicConfig.topic}?`
          : `Great! Now tell me about your ${topicConfig.topic}?`,
        options: topicConfig.options,
        multiSelect: topicConfig.multiSelect || false,
        inputType: topicConfig.inputType || null
      };
      
      setCurrentStep(fallbackStep);
      setIsLoadingQuestion(false);
      return fallbackStep;
    }
  }, [apiUrl, conversationId]);

  const startFlow = useCallback(async () => {
    setIsActive(true);
    setCurrentStepIndex(0);
    setAnswers({});
    setSelectedOptions([]);
    setConversationHistory([]);
    setCurrentStep(null);
    setIsGeneratingQuote(false);
    await generateQuestion(0);
  }, [generateQuestion]);

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

    const newAnswers = { ...answers, [currentStep.id]: selectedOptions };
    setAnswers(newAnswers);

    const selectedLabels = currentStep.options
      .filter(opt => selectedOptions.includes(opt.value))
      .map(opt => opt.label)
      .join(', ');

    await sendAnswerToBackend(selectedLabels);

    setConversationHistory(prev => [
      ...prev,
      { role: 'assistant', content: currentStep.question },
      { role: 'user', content: selectedLabels }
    ]);

    const nextStepIndex = currentStepIndex + 1;
    
    if (nextStepIndex >= QUOTE_TOPICS.length) {
      setIsGeneratingQuote(true);
      const calculatedQuote = calculateQuote(newAnswers);
      
      const salesQuote = await generateSalesQuote(newAnswers, calculatedQuote);
      
      setIsActive(false);
      setCurrentStep(null);
      setIsGeneratingQuote(false);
      
      if (onComplete) {
        onComplete(newAnswers, calculatedQuote, salesQuote);
      }
      return { completed: true, selectedLabels, quote: calculatedQuote, quoteMessage: salesQuote };
    }

    setCurrentStepIndex(nextStepIndex);
    setSelectedOptions([]);
    await generateQuestion(nextStepIndex, selectedLabels);
    
    return { completed: false, selectedLabels };
  }, [currentStepIndex, selectedOptions, answers, currentStep, onComplete, generateQuestion, sendAnswerToBackend, generateSalesQuote]);

  const submitTextInput = useCallback(async (value) => {
    if (!currentStep || !value.trim()) return null;

    const newAnswers = { ...answers, [currentStep.id]: [value.trim()] };
    setAnswers(newAnswers);

    await sendAnswerToBackend(value.trim());

    setConversationHistory(prev => [
      ...prev,
      { role: 'assistant', content: currentStep.question },
      { role: 'user', content: value }
    ]);

    const nextStepIndex = currentStepIndex + 1;
    
    if (nextStepIndex >= QUOTE_TOPICS.length) {
      setIsGeneratingQuote(true);
      const calculatedQuote = calculateQuote(newAnswers);
      
      const salesQuote = await generateSalesQuote(newAnswers, calculatedQuote);
      
      setIsActive(false);
      setCurrentStep(null);
      setIsGeneratingQuote(false);
      
      if (onComplete) {
        onComplete(newAnswers, calculatedQuote, salesQuote);
      }
      return { completed: true, submittedValue: value, quote: calculatedQuote, quoteMessage: salesQuote };
    }

    setCurrentStepIndex(nextStepIndex);
    setSelectedOptions([]);
    await generateQuestion(nextStepIndex, value);
    
    return { completed: false, submittedValue: value };
  }, [currentStepIndex, answers, currentStep, onComplete, generateQuestion, sendAnswerToBackend, generateSalesQuote]);

  const cancelFlow = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setAnswers({});
    setSelectedOptions([]);
    setCurrentStep(null);
    setConversationHistory([]);
    setIsGeneratingQuote(false);
  }, []);

  const goBack = useCallback(async () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      const prevTopic = QUOTE_TOPICS[prevIndex];
      setCurrentStepIndex(prevIndex);
      setSelectedOptions(answers[prevTopic.id] || []);
      
      const historyQuestion = conversationHistory.find(
        (h, i) => h.role === 'assistant' && i === (prevIndex * 2)
      );
      if (historyQuestion) {
        setCurrentStep({
          id: prevTopic.id,
          question: historyQuestion.content,
          options: prevTopic.options,
          multiSelect: prevTopic.multiSelect || false,
          inputType: prevTopic.inputType || null
        });
      } else {
        await generateQuestion(prevIndex);
      }
    }
  }, [currentStepIndex, answers, conversationHistory, generateQuestion]);

  const getProgress = useCallback(() => {
    return {
      current: currentStepIndex + 1,
      total: QUOTE_TOPICS.length,
      percentage: Math.round(((currentStepIndex + 1) / QUOTE_TOPICS.length) * 100)
    };
  }, [currentStepIndex]);

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
    goBack,
    canGoBack: currentStepIndex > 0
  };
}
