import { useState, useCallback } from 'react';
import { QUOTE_TOPICS, calculateQuote, formatQuoteMessage } from '../config/quoteFlowConfig';

export function useQuoteFlow(apiUrl, onComplete) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const getCurrentTopic = useCallback(() => {
    return QUOTE_TOPICS[currentStepIndex] || null;
  }, [currentStepIndex]);

  const generateQuestion = useCallback(async (topicIndex, prevAnswer = '') => {
    const topic = QUOTE_TOPICS[topicIndex];
    if (!topic) return null;

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
          topic: topic.topic,
          covered_topics: coveredTopics,
          previous_answer: prevAnswer,
          is_first: topicIndex === 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate question');
      }

      const data = await response.json();
      setCurrentQuestion(data.question);
      setIsLoadingQuestion(false);
      return data.question;
    } catch (error) {
      console.error('Error generating question:', error);
      const fallbackQuestions = {
        company_type: "What type of company are you? Let me know so I can tailor this for you.",
        company_stage: "What stage is your company at right now?",
        platforms: "Which platforms do you need us to integrate?",
        traffic: "Roughly how much monthly traffic do you get?",
        dev_model: "How would you like us to work with your team?",
        urgency: "When do you need this done by?",
        customer_location: "Where are your customers located?",
        compliance: "Any compliance requirements we should know about?",
        goals: "What are the main things you want to achieve?",
        tools: "What martech tools are you using or planning to use?",
        documentation: "What kind of documentation would be helpful?",
        training_hours: "How much training would your team need?",
        support_duration: "How long would you need ongoing support?",
        support_hours: "How many support hours per month?",
        email: "Great! What's your work email so I can send the detailed quote?"
      };
      const fallback = fallbackQuestions[topic.id] || `Tell me about your ${topic.topic}`;
      setCurrentQuestion(fallback);
      setIsLoadingQuestion(false);
      return fallback;
    }
  }, [apiUrl]);

  const startFlow = useCallback(async () => {
    setIsActive(true);
    setCurrentStepIndex(0);
    setAnswers({});
    setSelectedOptions([]);
    setConversationHistory([]);
    await generateQuestion(0);
  }, [generateQuestion]);

  const selectOption = useCallback((value) => {
    const topic = getCurrentTopic();
    if (!topic) return;

    if (topic.multiSelect) {
      setSelectedOptions(prev => {
        if (prev.includes(value)) {
          return prev.filter(v => v !== value);
        }
        return [...prev, value];
      });
    } else {
      setSelectedOptions([value]);
    }
  }, [getCurrentTopic]);

  const confirmSelection = useCallback(async () => {
    const topic = getCurrentTopic();
    if (!topic || selectedOptions.length === 0) return null;

    const newAnswers = { ...answers, [topic.id]: selectedOptions };
    setAnswers(newAnswers);

    const selectedLabels = topic.options
      .filter(opt => selectedOptions.includes(opt.value))
      .map(opt => opt.label)
      .join(', ');

    setConversationHistory(prev => [
      ...prev,
      { role: 'assistant', content: currentQuestion },
      { role: 'user', content: selectedLabels }
    ]);

    const nextStepIndex = currentStepIndex + 1;
    
    if (nextStepIndex >= QUOTE_TOPICS.length) {
      const quote = calculateQuote(newAnswers);
      const quoteMessage = formatQuoteMessage(newAnswers, quote);
      setIsActive(false);
      if (onComplete) {
        onComplete(newAnswers, quote, quoteMessage);
      }
      return { completed: true, selectedLabels, quote, quoteMessage };
    }

    setCurrentStepIndex(nextStepIndex);
    setSelectedOptions([]);
    await generateQuestion(nextStepIndex, selectedLabels);
    
    return { completed: false, selectedLabels };
  }, [currentStepIndex, selectedOptions, answers, currentQuestion, onComplete, getCurrentTopic, generateQuestion]);

  const submitTextInput = useCallback(async (value) => {
    const topic = getCurrentTopic();
    if (!topic || !value.trim()) return null;

    const newAnswers = { ...answers, [topic.id]: [value.trim()] };
    setAnswers(newAnswers);

    setConversationHistory(prev => [
      ...prev,
      { role: 'assistant', content: currentQuestion },
      { role: 'user', content: value }
    ]);

    const nextStepIndex = currentStepIndex + 1;
    
    if (nextStepIndex >= QUOTE_TOPICS.length) {
      const quote = calculateQuote(newAnswers);
      const quoteMessage = formatQuoteMessage(newAnswers, quote);
      setIsActive(false);
      if (onComplete) {
        onComplete(newAnswers, quote, quoteMessage);
      }
      return { completed: true, submittedValue: value, quote, quoteMessage };
    }

    setCurrentStepIndex(nextStepIndex);
    setSelectedOptions([]);
    await generateQuestion(nextStepIndex, value);
    
    return { completed: false, submittedValue: value };
  }, [currentStepIndex, answers, currentQuestion, onComplete, getCurrentTopic, generateQuestion]);

  const cancelFlow = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setAnswers({});
    setSelectedOptions([]);
    setCurrentQuestion('');
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
        setCurrentQuestion(historyQuestion.content);
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

  const topic = getCurrentTopic();

  return {
    isActive,
    currentStep: topic ? {
      ...topic,
      question: currentQuestion
    } : null,
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
