'use client';

import { useState, useEffect } from 'react';

export interface RFP {
  title: string;
  description: string;
  lineItems: LineItem[];
  deliveryLocation: string;
  deliveryStates: string[];
  deliveryDate: string;
  // estimatedBudget: number;
  // currency: string;
  createdBy: string; // Make this required
  organizationId: string; // Make this required
  // quotationCutoffDate: string;
  questionTemplateId?: string;  
  questionAnswers: { [key: string]: string | number };
  // selectionCriteria: SelectionCriteria;
}

export interface LineItem {
  productName: string;
  description: string;
  quantity: number;
  urgency: 'Low' | 'Medium' | 'High';
}

// export interface SelectionCriteria {
//   technicalWeightage: number;
//   commercialWeightage: number;
//   requiredCertifications: string[];
//   preferredBrands: string[];
//   warrantyRequirement: string;
// }

interface Question {
  id: string;
  type: 'select' | 'textarea' | 'number' | 'date' | 'radio' | 'text';
  options?: string[];
  question: string;
  required: boolean;
  placeholder?: string;
  
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
    description: '',
    lineItems: [{
      productName: '',
      description: '',
      quantity: 1,
      urgency: 'Medium',
    }],
    deliveryLocation: '',
    deliveryStates: [''],
    deliveryDate: '',
    // TODO: Replace with actual user and organization IDs from your auth system
    createdBy: '4c01af3c-890c-45e6-a91d-d31dbdb8af91', // This should come from user context
    organizationId: '59a631f9-7e82-453a-82b0-b849f8ab8352', // This should come from user context
    questionAnswers: {},
    questionTemplateId: '',
  });
  
  const [questionTemplates, setQuestionTemplates] = useState<QuestionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionTemplate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch question templates on component mount
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
          const initialAnswers: { [key: string]: string | number } = {};
          templateToSelect.questions.forEach(q => {
            initialAnswers[q.id] = q.type === 'number' ? 0 : '';
          });
          setFormData(prev => ({
            ...prev,
            questionAnswers: initialAnswers,
            questionTemplateId: templateToSelect.id,
          }));
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
    section?: keyof RFP,
    index?: number,
    subfield?: string
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (section === 'lineItems' && index !== undefined) {
        const newLineItems = [...prev.lineItems];
        const numValue = name === 'quantity' ? Number(value) || 0 : value;
        newLineItems[index] = { ...newLineItems[index], [name]: numValue };
        return { ...prev, lineItems: newLineItems };
      } else if (section === 'questionAnswers') {
        const selectedQuestion = selectedTemplate?.questions.find(q => q.id === name);
        const processedValue = selectedQuestion?.type === 'number' ? Number(value) || 0 : value;
        return { ...prev, questionAnswers: { ...prev.questionAnswers, [name]: processedValue } };
      } else if (name === 'deliveryStates') {
        const arrayValue = value.split(',').map((item) => item.trim()).filter((item) => item);
        return { ...prev, [name]: arrayValue };
      }
      return { ...prev, [name]: value };
    });
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          productName: '',
          description: '',
          quantity: 1,
          urgency: 'Medium',
        },
      ],
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    const initialAnswers: { [key: string]: string | number } = {};
    if (selectedTemplate) {
      selectedTemplate.questions.forEach(q => {
        initialAnswers[q.id] = q.type === 'number' ? 0 : '';
      });
    }
    setFormData({
      title: '',
      description: '',
      lineItems: [{
        productName: '',
        description: '',
        quantity: 1,
        urgency: 'Medium',
      }],
      deliveryLocation: '',
      deliveryStates: [''],
      deliveryDate: '',
      createdBy: '4c01af3c-890c-45e6-a91d-d31dbdb8af91',
      organizationId: '59a631f9-7e82-453a-82b0-b849f8ab8352',
      questionAnswers: initialAnswers,
      questionTemplateId: selectedTemplate?.id || '',
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.deliveryLocation.trim()) return 'Delivery location is required';
    if (!formData.deliveryDate) return 'Delivery date is required';
    if (!formData.createdBy) return 'User ID is required';
    if (!formData.organizationId) return 'Organization ID is required';
    if (formData.lineItems.some(item => !item.productName.trim() || item.quantity < 1)) {
      return 'All line items must have a valid product name and quantity (minimum 1)';
    }
    if (selectedTemplate) {
      const requiredQuestions = selectedTemplate.questions.filter((q) => q.required);
      for (const q of requiredQuestions) {
        const answer = formData.questionAnswers[q.id];
        if (answer === undefined || answer === '' || (q.type === 'number' && answer === 0)) {
          return `${q.question} is required`;
        }
        if (q.type === 'number' && Number(answer) <= 0) {
          return `${q.question} must be a positive number`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      // Clean up the data before sending - only include active fields
      const submitData = {
        title: formData.title,
        description: formData.description,
        lineItems: formData.lineItems.map(item => ({
          productName: item.productName,
          description: item.description,
          quantity: Number(item.quantity),
          urgency: item.urgency,
        })),
        deliveryLocation: formData.deliveryLocation,
        deliveryStates: formData.deliveryStates.filter(state => state.trim()),
        deliveryDate: formData.deliveryDate,
        createdBy: formData.createdBy,
        organizationId: formData.organizationId,
        questionAnswers: formData.questionAnswers,
        questionTemplateId: formData.questionTemplateId,
      };

      console.log('Submitting data:', JSON.stringify(submitData, null, 2));

      const response = await fetch('/api/rfp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add any additional headers your API might need (auth tokens, etc.)
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (response.ok) {
        alert('RFP submitted successfully!');
        resetForm();
      } else {
        setError(responseData.message || responseData.error || 'Failed to submit RFP.');
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-lg text-red-600">No question templates available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">Create Request for Proposal</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-green-700 mb-6">Basic Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RFP Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a clear and descriptive title for your RFP"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of what you're looking for, including specific requirements, expectations, and any relevant background information"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors resize-none"
                  rows={4}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">Be specific about your requirements to help vendors provide accurate quotes</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-green-700 mb-6">Line Items</h2>
            {formData.lineItems.map((item, index) => (
              <div key={index} className="mb-6 p-6 bg-gradient-to-r from-green-50 to-green-25 rounded-lg border border-green-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Line Item {index + 1}</h3>
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm hover:shadow-md"
                      disabled={isSubmitting}
                    >
                      Remove Item
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Product Name and Description Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input
                        type="text"
                        name="productName"
                        value={item.productName}
                        onChange={(e) => handleInputChange(e, 'lineItems', index)}
                        placeholder="e.g., Dell Latitude 5420 Laptop"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={item.description}
                        onChange={(e) => handleInputChange(e, 'lineItems', index)}
                        placeholder="Detailed description of the item including key features and requirements"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors resize-none"
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Quantity and Urgency Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleInputChange(e, 'lineItems', index)}
                        placeholder="1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors"
                        min="1"
                        required
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500 mt-1">Number of units needed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                      <select
                        name="urgency"
                        value={item.urgency}
                        onChange={(e) => handleInputChange(e, 'lineItems', index)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors"
                        disabled={isSubmitting}
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">How urgently is this needed</p>
                    </div>
                  </div>        
                </div>
              </div>
            ))}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={addLineItem}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 font-medium shadow-md hover:shadow-lg flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Another Line Item</span>
              </button>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-green-700 mb-6">Delivery Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location *</label>
                <input
                  type="text"
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleInputChange}
                  placeholder="Enter delivery location"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery State</label>
                <input
                  type="text"
                  name="deliveryStates"
                  value={formData.deliveryStates.join(', ')}
                  onChange={handleInputChange}
                  placeholder="e.g., Karnataka, Maharashtra"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                  required
                  min={currentDate}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Question Answers */}
          {selectedTemplate.questions.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-green-700 mb-6">Question Answers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedTemplate.questions.map((question) => {
                  const fullSpan = question.type === 'textarea' || question.type === 'radio' || question.type === 'select';
                  const colClass = fullSpan ? 'md:col-span-2 lg:col-span-3' : '';
                  const answer = formData.questionAnswers[question.id] ?? (question.type === 'number' ? 0 : '');
                  const placeholderText = question.placeholder || `Enter ${question.question.toLowerCase()}`;
                  
                  return (
                    <div key={question.id} className={colClass}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {question.question} {question.required && <span className="text-red-500">*</span>}
                      </label>
                      {question.type === 'select' && (
                        <select
                          name={question.id}
                          value={answer.toString()}
                          onChange={(e) => handleInputChange(e, 'questionAnswers')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                          required={question.required}
                          disabled={isSubmitting}
                        >
                          <option value="">Select an option</option>
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                          required={question.required}
                          disabled={isSubmitting}
                        />
                      )}
                      {question.type === 'radio' && (
                        <div className="space-y-2 mt-2">
                          {question.options?.map((opt) => (
                            <label key={opt} className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                              <input
                                type="radio"
                                name={question.id}
                                value={opt}
                                checked={answer === opt}
                                onChange={(e) => handleInputChange(e, 'questionAnswers')}
                                className="mr-2 text-green-600"
                                required={question.required}
                                disabled={isSubmitting}
                              />
                              {opt}
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

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className={`flex-1 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? 'Submitting...' : 'Submit RFP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}