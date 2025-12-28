import { useState, useCallback } from 'react';
import { QUOTE_TOPICS, calculateQuote, formatQuoteMessage } from '../config/quoteFlowConfig';

export function useQuoteFlow(apiUrl, conversationId, onComplete) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(null);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
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

  const sendQuoteComplete = useCallback(async (quoteSummary, email) => {
    if (!conversationId) return;
    try {
      await fetch(`${apiUrl}/quote/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversation_id: conversationId, 
          quote_summary: quoteSummary,
          email 
        })
      });
    } catch (err) {
      console.warn('Failed to send quote completion:', err);
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
      const quote = calculateQuote(newAnswers);
      const quoteMessage = formatQuoteMessage(newAnswers, quote);
      
      await sendQuoteComplete(quoteMessage, newAnswers.email?.[0]);
      
      setIsActive(false);
      setCurrentStep(null);
      if (onComplete) {
        onComplete(newAnswers, quote, quoteMessage);
      }
      return { completed: true, selectedLabels, quote, quoteMessage };
    }

    setCurrentStepIndex(nextStepIndex);
    setSelectedOptions([]);
    await generateQuestion(nextStepIndex, selectedLabels);
    
    return { completed: false, selectedLabels };
  }, [currentStepIndex, selectedOptions, answers, currentStep, onComplete, generateQuestion, sendAnswerToBackend, sendQuoteComplete]);

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
      const quote = calculateQuote(newAnswers);
      const quoteMessage = formatQuoteMessage(newAnswers, quote);
      
      await sendQuoteComplete(quoteMessage, newAnswers.email?.[0]);
      
      setIsActive(false);
      setCurrentStep(null);
      if (onComplete) {
        onComplete(newAnswers, quote, quoteMessage);
      }
      return { completed: true, submittedValue: value, quote, quoteMessage };
    }

    setCurrentStepIndex(nextStepIndex);
    setSelectedOptions([]);
    await generateQuestion(nextStepIndex, value);
    
    return { completed: false, submittedValue: value };
  }, [currentStepIndex, answers, currentStep, onComplete, generateQuestion, sendAnswerToBackend, sendQuoteComplete]);

  const cancelFlow = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setAnswers({});
    setSelectedOptions([]);
    setCurrentStep(null);
    setConversationHistory([]);
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
    startFlow,
    selectOption,
    confirmSelection,
    submitTextInput,
    cancelFlow,
    goBack,
    canGoBack: currentStepIndex > 0
  };
}
