import React, { useState } from 'react';
import { 
  FileSignature, 
  Send, 
  HelpCircle,
  CheckCircle,
  FileText,
  AlertCircle,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { AccessibilitySettings, AuditLog } from '../types';
import { OFFICIAL_AGENCIES } from '../data/mockData';

interface ServiceRequestFormProps {
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
  onAddLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  settings,
  onAnnounce,
  playSound,
  onAddLog
}) => {
  // Input fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    agency: OFFICIAL_AGENCIES[0],
    category: 'RECORDS' as AuditLog['category'],
    severity: 'INFO' as AuditLog['severity'],
    subject: '',
    description: '',
    captchaInput: ''
  });

  // State Management
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    receiptId: string;
    timestamp: string;
  } | null>(null);

  // Simple Captcha
  const captchaAnswer = "CIVIC2026";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Legal full name is required for FOIA verification.";
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "Name must be at least 3 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Authorized direct contact email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please supply a valid communication email address.";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Inquiry subject description is required.";
    } else if (formData.subject.length < 8) {
      newErrors.subject = "Please enter a descriptive subject (minimum 8 characters).";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Full dossier details and specifications are required.";
    } else if (formData.description.length < 20) {
      newErrors.description = "Please describe with sufficient clarity (minimum 20 characters).";
    }

    if (formData.captchaInput !== captchaAnswer) {
      newErrors.captchaInput = `Verification string mismatch. Enter "${captchaAnswer}" in all caps.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      onAnnounce("Submission failed. Please audit input errors marked below.");
      playSound();
      return;
    }

    setIsSubmitting(true);
    onAnnounce("Connecting to cryptographic public service portal. Hashing verification credentials... Please stand by.");
    playSound();

    // Mock processing timeout for realistic feel
    setTimeout(() => {
      const receiptId = `CS-${Math.floor(100000 + Math.random() * 900000)}`;
      const timestamp = new Date().toISOString();

      setSubmittedData({
        receiptId,
        timestamp
      });

      // Formulate automated log
      onAddLog({
        agency: formData.agency,
        category: formData.category,
        severity: 'SUCCESS',
        message: `Citizen submission ${receiptId} accepted on digital intake. Subject: "${formData.subject}". Assigned for Federal verification check.`,
        operator: `Citizen [${formData.fullName}]`,
        ipAddress: '192.168.1.1'
      });

      setIsSubmitting(false);
      onAnnounce(`Success. Submission verified. Receipt reference number generated: ${receiptId}. Keep this record safe.`);
      playSound();
    }, 2000);
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      agency: OFFICIAL_AGENCIES[0],
      category: 'RECORDS',
      severity: 'INFO',
      subject: '',
      description: '',
      captchaInput: ''
    });
    setSubmittedData(null);
    setErrors({});
    onAnnounce("Form fields cleared. Ready for new civic submission.");
    playSound();
  };

  return (
    <section 
      aria-labelledby="form-section-title"
      className={`p-6 rounded-lg shadow-sm border ${
        settings.highContrast ? 'bg-white border-black text-black' : 'bg-white border-slate-200'
      }`}
    >
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 id="form-section-title" className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-blue-900" />
          Federal Digital Support &amp; FOIA Intake Portal
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Submit official requests, file FOIA records inquiries, and report federal compliance grievances safely.
        </p>
      </div>

      {submittedData ? (
        /* SUCCESS RECEIPT STATE */
        <div className="p-6 bg-slate-50 border border-slate-200 rounded text-center max-w-xl mx-auto my-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-6 h-6" />
          </div>
          
          <h3 className="text-lg font-serif font-bold text-slate-900 mb-1">Civil Submission Accepted Successfully</h3>
          <p className="text-sm text-slate-600 mb-4">
            Subject: "{formData.subject}" has been securely written to our intake logs and assigned a permanent cryptographic agency tracker.
          </p>

          <div className="bg-white p-4 rounded border border-slate-200 text-left font-mono text-xs space-y-2 mb-6">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">TRACKER ID:</span>
              <span className="text-slate-900 font-bold">{submittedData.receiptId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">RECEIVING AGENCY:</span>
              <span className="text-slate-900 truncate max-w-[250px]">{formData.agency}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">CATEGORIZATION:</span>
              <span className="text-slate-900">{formData.category}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">TIMESTAMP RECORD:</span>
              <span className="text-slate-900">{new Date(submittedData.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">LEGAL COMPLIANT SIGN:</span>
              <span className="text-emerald-700 font-bold">DIGITALLY SIGNED ({formData.fullName.toUpperCase()})</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            A confirmation ledger record was written to the <strong className="text-blue-900">Public Audit Ledger</strong>. You can navigate there to view your transaction live in systemic flow logs.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleResetForm}
              className={`px-4 py-2 text-xs font-semibold rounded transition-all ${
                settings.highContrast 
                  ? 'bg-black text-white hover:bg-slate-900' 
                  : 'bg-blue-900 text-white hover:bg-blue-950 shadow-sm'
              }`}
            >
              FILE ANOTHER FILE INTAKE
            </button>
          </div>
        </div>
      ) : (
        /* FORM STATE */
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Form instructions alerts */}
          <div className="p-4 bg-slate-5 border border-slate-200 rounded text-xs flex gap-3 text-slate-700 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-blue-900 flex-shrink-0" />
            <div>
              <span className="font-bold">Required Legal Notice:</span> Under the provisions of 5 U.S.C. § 552a (Privacy Act), fields marked with a red asterisk ( <span className="text-rose-600 font-bold">*</span> ) are strictly required for security validation. Falsified submittals will be recorded and logged for security escalation.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 font-mono uppercase mb-2">
                Legal Full Name <span className="text-rose-600 font-bold">*</span>
              </label>
              <input 
                id="fullName"
                name="fullName"
                type="text"
                placeholder="e.g. Inspector John Doe"
                className={`w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                  errors.fullName ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-300'
                }`}
                value={formData.fullName}
                onChange={handleInputChange}
                aria-required="true"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 font-mono uppercase mb-2">
                Contact Email Address <span className="text-rose-600 font-bold">*</span>
              </label>
              <input 
                id="email"
                name="email"
                type="email"
                placeholder="e.g. john.doe@agency.gov"
                className={`w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                  errors.email ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-300'
                }`}
                value={formData.email}
                onChange={handleInputChange}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Receiving Agency */}
            <div>
              <label htmlFor="agency" className="block text-xs font-bold text-slate-700 font-mono uppercase mb-2">
                Destination Government Agency <span className="text-rose-600 font-bold">*</span>
              </label>
              <select
                id="agency"
                name="agency"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                value={formData.agency}
                onChange={handleInputChange}
              >
                {OFFICIAL_AGENCIES.map(agency => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
            </div>

            {/* Incident / Request Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-slate-700 font-mono uppercase mb-2">
                Classification Code <span className="text-rose-600 font-bold">*</span>
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="RECORDS">FOIA/Records Review (RECORDS)</option>
                <option value="COMPLIANCE">WCAG accessibility audit (COMPLIANCE)</option>
                <option value="SECURITY">Unauthorized Access Alert (SECURITY)</option>
                <option value="PUBLIC_REQUEST">Public Citizen Inquiry (PUBLIC_REQUEST)</option>
                <option value="SYSTEM">Digital Node Telemetry incident (SYSTEM)</option>
              </select>
            </div>

            {/* Urgency Classification */}
            <div>
              <label htmlFor="severity" className="block text-xs font-bold text-slate-700 font-mono uppercase mb-2">
                Intake Assessment Level <span className="text-rose-600 font-bold">*</span>
              </label>
              <select
                id="severity"
                name="severity"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                value={formData.severity}
                onChange={handleInputChange}
              >
                <option value="INFO">Routine Inquiries (INFO)</option>
                <option value="SUCCESS">Record Certification (SUCCESS)</option>
                <option value="WARNING">Escalated Variance (WARNING)</option>
                <option value="ERROR">Severe Breach / Fault Report (ERROR)</option>
              </select>
            </div>
          </div>

          {/* Subject Title */}
          <div>
            <label htmlFor="subject" className="block text-xs font-bold text-slate-700 font-mono uppercase mb-2">
              Formal Case Subject <span className="text-rose-600 font-bold">*</span>
            </label>
            <input 
              id="subject"
              name="subject"
              type="text"
              placeholder="Provide a concise 1-sentence descriptor of your records filing..."
              className={`w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                errors.subject ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-300'
              }`}
              value={formData.subject}
              onChange={handleInputChange}
              aria-required="true"
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "subject-error" : undefined}
            />
            {errors.subject && (
              <p id="subject-error" className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Core Description Details */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold text-slate-700 font-mono uppercase mb-2">
              Dossier Specifications and Case Description <span className="text-rose-600 font-bold">*</span>
            </label>
            <textarea 
              id="description"
              name="description"
              rows={4}
              placeholder="Indicate full records dates, document ID indices, and explicit reference logs requested..."
              className={`w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 font-sans ${
                errors.description ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-300'
              }`}
              value={formData.description}
              onChange={handleInputChange}
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Secure Human Verification Captcha Code */}
          <div className="p-4 bg-slate-100 rounded border border-slate-200">
            <h3 className="text-xs font-bold font-mono text-slate-700 uppercase mb-3">
              Federal Anti-Spam Gate Verification
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="bg-slate-300 text-slate-800 font-mono text-sm tracking-widest px-4 py-2 rounded font-black border border-slate-400 select-none text-center">
                {captchaAnswer}
              </div>
              <div className="flex-1">
                <label htmlFor="captchaInput" className="sr-only">Enter the verification text exactly</label>
                <input 
                  id="captchaInput"
                  name="captchaInput"
                  type="text"
                  placeholder="Type verification code precisely..."
                  className={`w-full sm:max-w-xs px-3 py-2 text-sm border rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    errors.captchaInput ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-300'
                  }`}
                  value={formData.captchaInput}
                  onChange={handleInputChange}
                  aria-required="true"
                  aria-invalid={!!errors.captchaInput}
                  aria-describedby={errors.captchaInput ? "captchaInput-error" : undefined}
                />
              </div>
            </div>
            {errors.captchaInput && (
              <p id="captchaInput-error" className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.captchaInput}
              </p>
            )}
          </div>

          {/* Submission / Reset Button trigger block */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded text-sm font-semibold flex items-center gap-2 transition-all ${
                isSubmitting 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : (settings.highContrast 
                      ? 'bg-black text-white hover:bg-slate-900 border-2 border-black' 
                      : 'bg-blue-900 hover:bg-blue-950 text-white shadow-sm hover:shadow-md')
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-950" />
                  <span>TRANSMITTING LEDGER RECORD...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>SUBMIT SECURE CASE FILE</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleResetForm}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              RESET
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
