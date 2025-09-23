'use client';

import RFPConversation from '@/components/shared/RFPConversation';
import { useState, useEffect } from 'react';

export interface RFP {
  title: string;
  deliveryLocation: string;
  deliveryStates: string[];
  deliveryDate: string;
  createdBy: string;
  organizationId: string;
  questionTemplateId?: string;
  questionAnswers: { [key: string]: string | number };
}

interface Question {
  id: string;
  type: 'select' | 'textarea' | 'number' | 'date' | 'radio' | 'text';
  options?: string[];
  question: string;
  required: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

interface QuestionTemplate {
  id: string;
  questions: Question[];
  categoryId?: string | null;
  categoryName?: string | null;
  version?: number;
  isActive?: boolean;
  createdBy?: string;
  createdByEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function RFPForm() {
  const [formData, setFormData] = useState<RFP>({
    title: '',
    deliveryLocation: '',
    deliveryStates: [],
    deliveryDate: '',
    createdBy: '4c01af3c-890c-45e6-a91d-d31dbdb8af91',
    organizationId: '59a631f9-7e82-453a-82b0-b849f8ab8352',
    questionAnswers: {},
    questionTemplateId: '',
  });

  const [questionTemplates, setQuestionTemplates] = useState<QuestionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionTemplate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper function to initialize question answers with proper defaults
  const initializeQuestionAnswers = (template: QuestionTemplate): { [key: string]: string | number } => {
    const initialAnswers: { [key: string]: string | number } = {};
    
    template.questions.forEach(q => {
      if (q.id === 'usage_type') {
        // Always set a default value for usage_type
        const defaultUsageType = q.options && q.options.length > 0 ? q.options[0] : 'Temporary';
        initialAnswers[q.id] = defaultUsageType;
      } else if (q.type === 'number') {
        initialAnswers[q.id] = 0;
      } else if (q.type === 'select' && q.options && q.options.length > 0) {
        // For other select fields, use first option as default
        initialAnswers[q.id] = q.options[0];
      } else {
        initialAnswers[q.id] = '';
      }
    });
    
    return initialAnswers;
  };

  // Fetch question templates
  useEffect(() => {
    const fetchQuestionTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/question-templates', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch question templates');
        }
        const templates: QuestionTemplate[] = await response.json();
        setQuestionTemplates(templates);
        if (templates.length > 0) {
          const preferredId = '76b7abd2-b84e-4755-8403-29b2341714bc';
          const templateToSelect = templates.find(t => t.id === preferredId) || templates[0];
          setSelectedTemplate(templateToSelect);
          
          const initialAnswers = initializeQuestionAnswers(templateToSelect);
          
          setFormData(prev => ({
            ...prev,
            questionAnswers: initialAnswers,
            questionTemplateId: templateToSelect.id,
          }));
          console.log('Selected Template:', JSON.stringify(templateToSelect, null, 2));
          console.log('Initial Answers:', JSON.stringify(initialAnswers, null, 2));
        }
      } catch (err) {
        console.error('Error fetching question templates:', err);
        setError('Failed to load question templates. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionTemplates();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section?: 'questionAnswers'
  ) => {
    const { name, value } = e.target;

    console.log(name, " -> ", value);
    
    setFormData(prev => {
      if (section === 'questionAnswers') {
        const selectedQuestion = selectedTemplate?.questions.find(q => q.id === name);
        
        // Special handling for usage_type - never allow empty value
        if (name === 'usage_type') {
          if (value === '') {
            // If somehow an empty value is selected, use the first available option
            const usageTypeQuestion = selectedTemplate?.questions.find(q => q.id === 'usage_type');
            const defaultValue = usageTypeQuestion?.options?.[0] || 'Temporary';
            return { ...prev, questionAnswers: { ...prev.questionAnswers, [name]: defaultValue } };
          }
        }
        
        const processedValue = selectedQuestion?.type === 'number' ? Number(value) || (0) : value;
        return { ...prev, questionAnswers: { ...prev.questionAnswers, [name]: processedValue } };
      }
      if (name === 'deliveryStates') {
        return { ...prev, deliveryStates: value ? [value] : [] };
      }
      return { ...prev, [name]: value };
    });
  };

  const resetForm = () => {
    const initialAnswers = selectedTemplate ? initializeQuestionAnswers(selectedTemplate) : {};
    
    setFormData({
      title: '',
      deliveryLocation: '',
      deliveryStates: [],
      deliveryDate: '',
      createdBy: '4c01af3c-890c-45e6-a91d-d31dbdb8af91',
      organizationId: '59a631f9-7e82-453a-82b0-b849f8ab8352',
      questionAnswers: initialAnswers,
      questionTemplateId: selectedTemplate?.id || '',
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.deliveryLocation.trim()) return 'Delivery location is required';
    if (!formData.deliveryDate) return 'Delivery date is required';
    if (!formData.createdBy) return 'User ID is required';
    if (!formData.organizationId) return 'Organization ID is required';

    // Validate questionAnswers based on template requirements
    if (selectedTemplate) {
      const requiredQuestions = selectedTemplate.questions.filter(q => q.required);
      for (const q of requiredQuestions) {
        const answer = formData.questionAnswers[q.id];
        if (answer === undefined || answer === null || answer === '' || (q.type === 'number' && answer === 0)) {
          return `${q.question} is required`;
        }
        if (q.type === 'number') {
          const numValue = Number(answer);
          if (q.min && numValue < q.min) {
            return `${q.question} must be at least ${q.min}`;
          }
          if (q.max && numValue > q.max) {
            return `${q.question} must not exceed ${q.max}`;
          }
        }
      }
    }

    // Special validation for usage_type
    const usageTypeValue = formData.questionAnswers['usage_type'];
    if (!usageTypeValue || usageTypeValue === '' || usageTypeValue === null || usageTypeValue === undefined) {
      return 'Usage type is required and must have a valid value';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    console.log('Form Data before submission:', JSON.stringify(formData, null, 2));

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = {
        title: formData.title.trim() || undefined,
        deliveryLocation: formData.deliveryLocation.trim(),
        deliveryStates: formData.deliveryStates.length ? formData.deliveryStates : undefined,
        deliveryDate: formData.deliveryDate,
        createdBy: formData.createdBy,
        organizationId: formData.organizationId,
        questionTemplateId: formData.questionTemplateId || undefined,
        questionAnswers: formData.questionAnswers,
      };

      console.log('Submitting data to /api/rfp:', JSON.stringify(submitData, null, 2));

      const response = await fetch('/api/rfp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();
      console.log('API Response:', JSON.stringify(responseData, null, 2));

      if (response.ok) {
        alert(responseData.message || 'RFP submitted successfully!');
        resetForm();
      } else {
        setError(responseData.message || 'Failed to submit RFP.');
        console.error('API Error:', responseData);
      }
    } catch (error) {
      console.error('Error submitting RFP:', error);
      setError('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDate = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-green-700">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
          </svg>
          <span className="text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
          <span className="text-lg font-medium">No question templates available.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-2xl font-extrabold text-green-900 tracking-tight sm:text-4xl">
            Create Request for Proposal
          </h1>
          <p className="mt-2 text-lg text-green-700">Complete the details below to submit your RFP.</p>
        </header>

        {error && (
          <div className="mb-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.732 6.732a1 1 0 011.414 0L10 7.586l.854-.854a1 1 0 111.414 1.414L11.414 9l.854.854a1 1 0 11-1.414 1.414L10 10.414l-.854.854a1 1 0 01-1.414-1.414L8.586 9l-.854-.854a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* RFP Title Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-green-800 mb-6">RFP Overview</h2>
            <div className="flex flex-col sm:flex-row sm:space-x-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">RFP Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter RFP title"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors bg-gray-50 text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Requirements Card */}
          {selectedTemplate.questions.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
              <h2 className="text-2xl font-semibold text-green-800 mb-6">Requirements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedTemplate.questions.map((question) => {
                  const fullSpan = question.type === 'textarea' || question.type === 'radio' || question.type === 'select';
                  const colClass = fullSpan ? 'sm:col-span-2 lg:col-span-3' : '';
                  const answer = formData.questionAnswers[question.id] ?? (question.type === 'number' ? (question.min || 0) : '');
                  const placeholderText = question.placeholder || `Enter ${question.question.toLowerCase()}`;

                  return (
                    <div key={question.id} className={colClass}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {question.question} {question.required && <span className="text-red-500">*</span>}
                      </label>
                      {question.type === 'select' && (
                        <select
                          name={question.id}
                          value={answer.toString()}
                          onChange={(e) => handleInputChange(e, 'questionAnswers')}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors bg-gray-50 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          required={question.required}
                          disabled={isSubmitting}
                        >
                          {/* For usage_type and other required selects, don't show empty option */}
                          {!question.required && <option value="">Select an option</option>}
                          {question.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                      {question.type === 'textarea' && (
                        <textarea
                          name={question.id}
                          value={answer.toString()}
                          onChange={(e) => handleInputChange(e, 'questionAnswers')}
                          placeholder={placeholderText}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors bg-gray-50 text-gray-800 placeholder-gray-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                          rows={4}
                          required={question.required}
                          disabled={isSubmitting}
                        />
                      )}
                      {['text', 'number', 'date'].includes(question.type) && (
                        <input
                          type={question.type}
                          name={question.id}
                          value={answer.toString()}
                          onChange={(e) => handleInputChange(e, 'questionAnswers')}
                          placeholder={placeholderText}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors bg-gray-50 text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          required={question.required}
                          disabled={isSubmitting}
                          min={question.type === 'date' ? currentDate : question.type === 'number' ? (0) : undefined}
                          max={question.type === 'number' ? question.max : undefined}
                        />
                      )}
                      {question.type === 'radio' && (
                        <div className="space-y-3 mt-2">
                          {question.options?.map((opt) => (
                            <label
                              key={opt}
                              className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={opt}
                                checked={answer === opt}
                                onChange={(e) => handleInputChange(e, 'questionAnswers')}
                                className="mr-3 text-green-600 focus:ring-green-600 disabled:cursor-not-allowed"
                                required={question.required}
                                disabled={isSubmitting}
                              />
                              <span className="text-sm text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivery Details Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-green-800 mb-6">Delivery Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Location *</label>
                <input
                  type="text"
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleInputChange}
                  placeholder="Enter delivery location"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors bg-gray-50 text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery State</label>
                <input
                  type="text"
                  name="deliveryStates"
                  value={formData.deliveryStates[0] || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Karnataka"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors bg-gray-50 text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date *</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors bg-gray-50 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  min={currentDate}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || loading}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold shadow-md hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
                  </svg>
                  Submitting RFP...
                </span>
              ) : (
                'Submit RFP'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}