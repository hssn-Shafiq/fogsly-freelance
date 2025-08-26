import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Save,
  Eye,
  AlertCircle,
  Video,
  Image as ImageIcon,
  HelpCircle,
  Building2
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { Ad, AdCreationData, AdFormState, AdFormErrors, AD_CONFIG } from '../../../firebase/types/ads';
import { createAd, updateAd, uploadVideoToFirebase, uploadImageToFirebase } from '../../../firebase/services/adService';
import { formatFog, formatUsd, getFogCoinSettingsWithCache, formatFogWithUsdSync } from '../../../utils/fogCoinUtils';
import { FogCoinSettings } from '../../../firebase/types/fogCoinSettings';
import { toast } from 'react-hot-toast';

interface CreateEditAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAd?: Ad | null;
  currentAdminId: string;
  onSuccess: () => void;
}

const CreateEditAdModal: React.FC<CreateEditAdModalProps> = ({
  isOpen,
  onClose,
  editingAd,
  currentAdminId,
  onSuccess
}) => {
  const [fogSettings, setFogSettings] = useState<FogCoinSettings | null>(null);
  const [formState, setFormState] = useState<AdFormState>({
    title: '',
    description: '',
    companyName: '', // Add company name field
    videoFile: null,
    videoUrl: '',
    previewImageFile: null,
    previewImageUrl: '',
    questions: [
      { question: '', options: ['', '', '', ''], correctAnswer: 0 },
      { question: '', options: ['', '', '', ''], correctAnswer: 0 },
      { question: '', options: ['', '', '', ''], correctAnswer: 0 }
    ],
    feedbackQuestion: {
      title: 'User Feedback',
      question: 'How would you rate this ad based on your interests, {userName}?'
    },
    totalReward: 4,
  });

  const [errors, setErrors] = useState<AdFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load FOG coin settings when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadFogSettings = async () => {
        try {
          const settings = await getFogCoinSettingsWithCache();
          setFogSettings(settings);
        } catch (error) {
          console.error('Error loading FOG settings:', error);
          // Set fallback settings
          setFogSettings({
            id: 'fallback',
            fogToUsdRate: 0.10,
            minimumWithdrawAmount: 50,
            maximumDailyEarnings: 100,
            isWithdrawalsEnabled: true,
            lastUpdatedBy: 'system',
            lastUpdatedAt: new Date(),
            effectiveFrom: new Date(),
            notes: 'Fallback settings'
          });
        }
      };
      loadFogSettings();
    }
  }, [isOpen]);

  // Update form state when editingAd changes
  useEffect(() => {
    if (editingAd) {
      console.log('Editing ad data:', editingAd);
      console.log('Questions available:', editingAd.questions);

      // Ensure we have at least 4 questions (3 custom + 1 feedback)
      const customQuestions = editingAd.questions.slice(0, 3);
      const feedbackQuestion = editingAd.questions.find(q => q.type === 'feedback') || editingAd.questions[3];

      console.log('Custom questions:', customQuestions);
      console.log('Feedback question:', feedbackQuestion);

      setFormState({
        title: editingAd.title || '',
        description: editingAd.description || '',
        companyName: editingAd.companyName || '', // Add company name from editing ad
        videoFile: null, // Files can't be pre-populated for security reasons
        videoUrl: editingAd.videoUrl || '',
        previewImageFile: null,
        previewImageUrl: editingAd.previewImage || '',
        questions: customQuestions.length > 0 ? customQuestions.map(q => ({
          question: q.question,
          options: [...q.options],
          correctAnswer: q.correctAnswer
        })) : [
          { question: '', options: ['', '', '', ''], correctAnswer: 0 },
          { question: '', options: ['', '', '', ''], correctAnswer: 0 },
          { question: '', options: ['', '', '', ''], correctAnswer: 0 }
        ],
        feedbackQuestion: {
          title: feedbackQuestion?.question || 'User Feedback',
          question: feedbackQuestion?.question || 'How would you rate this ad based on your interests, {userName}?'
        },
        totalReward: editingAd.totalReward || 10,

      });
    } else {
      // Reset form for new ad creation
      console.log('Creating new ad - resetting form');
      setFormState({
        title: '',
        description: '',
        companyName: '', // Reset company name
        videoFile: null,
        videoUrl: '',
        previewImageFile: null,
        previewImageUrl: '',
        questions: [
          { question: '', options: ['', '', '', ''], correctAnswer: 0 },
          { question: '', options: ['', '', '', ''], correctAnswer: 0 },
          { question: '', options: ['', '', '', ''], correctAnswer: 0 }
        ],
        feedbackQuestion: {
          title: 'User Feedback',
          question: 'How would you rate this ad based on your interests, {userName}?'
        },
        totalReward: 10,
      });
    }

    // Reset errors when switching between create/edit
    setErrors({});
  }, [editingAd]);

  const validateForm = useCallback((): boolean => {
    const newErrors: AdFormErrors = {};

    // Basic validation
    if (!formState.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formState.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formState.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!editingAd && !formState.videoFile) {
      newErrors.videoFile = 'Video file is required';
    }
    if (!editingAd && !formState.previewImageFile) {
      newErrors.previewImageFile = 'Preview image is required';
    }
    if (formState.totalReward < 1 || formState.totalReward > 100) {
      newErrors.totalReward = 'Reward must be between 1 and 100 FOG coins';
    }
    if (!formState.feedbackQuestion.title.trim()) {
      newErrors.feedbackQuestion = 'Feedback question title is required';
    }

    // Questions validation (only for the 3 custom questions)
    const questionErrors: string[] = [];
    formState.questions.forEach((q, index) => {
      if (!q.question.trim()) {
        questionErrors[index] = `Question ${index + 1} is required`;
      } else if (q.options.some(option => !option.trim())) {
        questionErrors[index] = `All options for question ${index + 1} are required`;
      } else if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        questionErrors[index] = `Valid correct answer must be selected for question ${index + 1}`;
      }
    });

    if (questionErrors.length > 0) {
      newErrors.questions = questionErrors as any;
    }

    if (formState.questions.length < 1) {
      newErrors.general = 'At least 1 custom question is required';
    }

    if (formState.questions.length > 3) {
      newErrors.general = 'Maximum 3 custom questions allowed';
    }

    // Feedback question validation
    if (!formState.feedbackQuestion?.title?.trim()) {
      newErrors.feedbackQuestion = 'Feedback question title is required';
    } else if (!formState.feedbackQuestion?.question?.trim()) {
      newErrors.feedbackQuestion = 'Feedback question text is required';
    }

    // ✅ FIX: Improved reward validation with decimal support
    if (!formState.totalReward || formState.totalReward < AD_CONFIG.MIN_REWARD_AMOUNT) {
      newErrors.totalReward = `Total reward must be at least ${AD_CONFIG.MIN_REWARD_AMOUNT} coins`;
    } else if (formState.totalReward > AD_CONFIG.MAX_REWARD_AMOUNT) {
      newErrors.totalReward = `Total reward cannot exceed ${AD_CONFIG.MAX_REWARD_AMOUNT} coins`;
    } else if (formState.totalReward <= 0) {
      newErrors.totalReward = 'Total reward must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState, editingAd]);

  const handleFileChange = (type: 'video' | 'image', file: File | null) => {
    if (!file) return;

    // Validate file type and size
    if (type === 'video') {
      const isValidFormat = AD_CONFIG.VIDEO_FORMATS.some(format =>
        file.name.toLowerCase().endsWith(`.${format}`)
      );
      if (!isValidFormat) {
        toast.error(`Video must be one of: ${AD_CONFIG.VIDEO_FORMATS.join(', ')}`);
        return;
      }
      if (file.size > AD_CONFIG.MAX_VIDEO_SIZE) {
        toast.error('Video file is too large (max 100MB)');
        return;
      }
      setFormState(prev => ({ ...prev, videoFile: file }));
    } else {
      const isValidFormat = AD_CONFIG.IMAGE_FORMATS.some(format =>
        file.name.toLowerCase().endsWith(`.${format}`)
      );
      if (!isValidFormat) {
        toast.error(`Image must be one of: ${AD_CONFIG.IMAGE_FORMATS.join(', ')}`);
        return;
      }
      if (file.size > AD_CONFIG.MAX_IMAGE_SIZE) {
        toast.error('Image file is too large (max 5MB)');
        return;
      }
      setFormState(prev => ({ ...prev, previewImageFile: file }));
    }
  };

  const addQuestion = () => {
    if (formState.questions.length < 3) { // Max 3 custom questions
      setFormState(prev => ({
        ...prev,
        questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
      }));
    }
  };

  const removeQuestion = (index: number) => {
    if (formState.questions.length > 1) { // Min 1 custom question
      setFormState(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? { ...q, options: q.options.map((opt, j) => j === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const updateFeedbackQuestion = (updates: Partial<typeof formState.feedbackQuestion>) => {
    setFormState(prev => ({
      ...prev,
      feedbackQuestion: {
        ...prev.feedbackQuestion,
        ...updates
      }
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      let videoUrl = editingAd?.videoUrl || '';
      let previewImageUrl = editingAd?.previewImage || '';

      const adData: AdCreationData = {
        title: formState.title,
        description: formState.description,
        companyName: formState.companyName, // Include company name
        questions: formState.questions,
        feedbackQuestionTitle: formState.feedbackQuestion.title,
        totalReward: formState.totalReward,
      };

      if (editingAd) {
        // Update existing ad
        await updateAd(editingAd.id, adData);

        // Handle file updates if new files provided
        if (formState.videoFile) {
          videoUrl = await uploadVideoToFirebase(formState.videoFile, editingAd.id);
        }
        if (formState.previewImageFile) {
          previewImageUrl = await uploadImageToFirebase(formState.previewImageFile, editingAd.id);
        }

        toast.success('Ad updated successfully!');
      } else {
        // Create new ad
        const adId = await createAd(adData, currentAdminId);

        // Handle file uploads
        if (formState.videoFile) {
          videoUrl = await uploadVideoToFirebase(formState.videoFile, adId);
        }
        if (formState.previewImageFile) {
          previewImageUrl = await uploadImageToFirebase(formState.previewImageFile, adId);
        }

        // Update ad with file URLs
        await updateAd(adId, {
          videoUrl,
          previewImage: previewImageUrl
        } as any);

        toast.success('Ad created successfully!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast.error('Failed to save ad');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[--color-bg-primary] rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[--color-border]">
          <div>
            <h2 className="text-2xl font-bold text-[--color-text-primary]">
              {editingAd ? 'Edit Ad' : 'Create New Ad'}
            </h2>
            <p className="text-[--color-text-secondary] mt-1">
              {editingAd ? 'Update your advertising campaign' : 'Create a new advertising campaign with questions'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button variant="ghost" onClick={onClose} className="p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {previewMode ? (
            // Preview Mode
            <div className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>{formState.title || 'Ad Title'}</CardTitle>
                  <CardDescription>{formState.description || 'Ad description...'}</CardDescription>
                  {formState.companyName && (
                    <div className="flex items-center gap-2 mt-2">
                      <Building2 className="w-4 h-4 text-[--color-text-secondary]" />
                      <span className="text-sm text-[--color-text-secondary]">{formState.companyName}</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[--color-text-secondary]">Total Reward</p>
                        <p className="font-semibold">{formatFog(formState.totalReward)}</p>
                      </div>
                      <div>
                        <p className="text-[--color-text-secondary]">Per Question</p>
                        <p className="font-semibold">
                          {formatFog(formState.questions.length > 0
                            ? Math.round(formState.totalReward / formState.questions.length)
                            : 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[--color-text-secondary]">USD Value</p>
                        <p className="font-semibold">{formatUsd((fogSettings?.fogToUsdRate || 0.10) * formState.totalReward)}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Questions ({formState.questions.length})</h4>
                      {formState.questions.map((q, index) => (
                        <div key={index} className="mb-4 p-4 bg-[--color-bg-secondary] rounded-lg">
                          <p className="font-medium mb-2">{index + 1}. {q.question || 'Question text...'}</p>
                          <div className="space-y-1">
                            {q.options.map((option, optIndex) => (
                              <p
                                key={optIndex}
                                className={`text-sm ${optIndex === q.correctAnswer ? 'text-green-600 font-medium' : 'text-[--color-text-secondary]'}`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option || `Option ${optIndex + 1}...`}
                                {optIndex === q.correctAnswer && ' ✓'}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Edit Mode
            <div className="p-6 space-y-6">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  {errors.general}
                </div>
              )}

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Ad Title</Label>
                      <Input
                        id="title"
                        value={formState.title}
                        onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter ad title..."
                      />
                      {errors.title && (
                        <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="companyName" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Company Name *
                      </Label>
                      <Input
                        id="companyName"
                        value={formState.companyName}
                        onChange={(e) => setFormState(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Enter company name..."
                      />
                      {errors.companyName && (
                        <p className="text-red-600 text-sm mt-1">{errors.companyName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formState.description}
                      onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your ad..."
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Media Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Media Files</CardTitle>
                  <CardDescription>
                    Upload your video and preview image. Files will be stored locally.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Video Upload */}
                    <div>
                      <Label>Video File</Label>
                      <div className="mt-2">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[--color-border] rounded-lg cursor-pointer hover:bg-[--color-bg-secondary] transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {formState.videoFile ? (
                              <>
                                <Video className="w-8 h-8 text-green-600 mb-2" />
                                <p className="text-sm text-[--color-text-primary] font-medium">
                                  {formState.videoFile.name}
                                </p>
                                <p className="text-xs text-[--color-text-secondary]">
                                  {(formState.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                              </>
                            ) : formState.videoUrl && editingAd ? (
                              <>
                                <Video className="w-8 h-8 text-blue-600 mb-2" />
                                <p className="text-sm text-[--color-text-primary] font-medium">
                                  Current Video
                                </p>
                                <p className="text-xs text-[--color-text-secondary]">
                                  Click to replace with new video
                                </p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-[--color-text-secondary] mb-2" />
                                <p className="text-sm text-[--color-text-secondary]">
                                  Click to upload video
                                </p>
                                <p className="text-xs text-[--color-text-secondary]">
                                  MP4, WebM, OGV (Max 100MB)
                                </p>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={(e) => handleFileChange('video', e.target.files?.[0] || null)}
                          />
                        </label>
                        {errors.videoFile && (
                          <p className="text-red-600 text-sm mt-1">{errors.videoFile}</p>
                        )}
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <Label>Preview Image</Label>
                      <div className="mt-2">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[--color-border] rounded-lg cursor-pointer hover:bg-[--color-bg-secondary] transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {formState.previewImageFile ? (
                              <>
                                <ImageIcon className="w-8 h-8 text-green-600 mb-2" />
                                <p className="text-sm text-[--color-text-primary] font-medium">
                                  {formState.previewImageFile.name}
                                </p>
                                <p className="text-xs text-[--color-text-secondary]">
                                  {(formState.previewImageFile.size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                              </>
                            ) : formState.previewImageUrl && editingAd ? (
                              <>
                                <ImageIcon className="w-8 h-8 text-blue-600 mb-2" />
                                <p className="text-sm text-[--color-text-primary] font-medium">
                                  Current Image
                                </p>
                                <p className="text-xs text-[--color-text-secondary]">
                                  Click to replace with new image
                                </p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-[--color-text-secondary] mb-2" />
                                <p className="text-sm text-[--color-text-secondary]">
                                  Click to upload image
                                </p>
                                <p className="text-xs text-[--color-text-secondary]">
                                  JPG, PNG, WebP (Max 5MB)
                                </p>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange('image', e.target.files?.[0] || null)}
                          />
                        </label>
                        {errors.previewImageFile && (
                          <p className="text-red-600 text-sm mt-1">{errors.previewImageFile}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Custom Questions (3 Max)</CardTitle>
                      <CardDescription>
                        Add up to 3 custom multiple-choice questions for users to answer
                      </CardDescription>
                    </div>
                    <Button
                      onClick={addQuestion}
                      disabled={formState.questions.length >= 3}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formState.questions.map((question, qIndex) => (
                    <div key={qIndex} className="p-4 border border-[--color-border] rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Question {qIndex + 1}</h4>
                        {formState.questions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <Input
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          placeholder="Enter your question..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Answer Options</Label>
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                className="mr-2"
                              />
                              <span className="text-sm font-medium w-6">
                                {String.fromCharCode(65 + oIndex)}.
                              </span>
                            </div>
                            <Input
                              value={option}
                              onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${oIndex + 1}...`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                        <p className="text-xs text-[--color-text-secondary] flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          Select the correct answer by clicking the radio button
                        </p>
                      </div>

                      {errors.questions?.[qIndex] && (
                        <p className="text-red-600 text-sm">{errors.questions[qIndex]}</p>
                      )}
                    </div>
                  ))}

                  {/* Feedback Question */}
                  <div className="p-4 border border-[--color-border] rounded-lg bg-blue-50/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Feedback Question (Automatic)</h4>
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                        Required
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Question Title
                        </Label>
                        <Input
                          placeholder="Enter feedback question title"
                          value={formState.feedbackQuestion?.title || ''}
                          onChange={(e) => updateFeedbackQuestion({ title: e.target.value })}
                          className="w-full mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Question Text (with profile data)
                        </Label>
                        <div className="text-xs text-gray-500 mb-2">
                          Use {`{userName}`}, {`{userAge}`}, {`{userLocation}`} to include user profile data
                        </div>
                        <Textarea
                          placeholder="How would you rate this ad based on your interests, {userName}?"
                          value={formState.feedbackQuestion?.question || ''}
                          onChange={(e) => updateFeedbackQuestion({ question: e.target.value })}
                          className="w-full"
                          rows={3}
                        />
                      </div>
                    </div>

                    {errors.feedbackQuestion && (
                      <p className="text-red-600 text-sm">{errors.feedbackQuestion}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Rewards & Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Rewards & Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="totalReward">Total Reward (FOG Coins)</Label>
                      <Input
                        id="totalReward"
                        type="number"
                        min={AD_CONFIG.MIN_REWARD_AMOUNT}
                        max={AD_CONFIG.MAX_REWARD_AMOUNT}
                        step="0.1" // ✅ FIX: Allow decimal input
                        value={formState.totalReward}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setFormState(prev => ({ ...prev, totalReward: value }));
                        }}
                      />
                      {errors.totalReward && (
                        <p className="text-red-600 text-sm mt-1">{errors.totalReward}</p>
                      )}
                      <p className="text-xs text-[--color-text-secondary] mt-1">
                        Per question: {formState.questions.length > 0
                          ? (formState.totalReward / 4).toFixed(2) // 4 questions total
                          : 0} coins
                      </p>
                      {fogSettings && (
                        <p className="text-xs text-[--color-text-secondary] mt-1">
                          USD Value: {formatUsd(fogSettings.fogToUsdRate * formState.totalReward)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[--color-border]">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!previewMode && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingAd ? 'Update Ad' : 'Create Ad'}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreateEditAdModal;
