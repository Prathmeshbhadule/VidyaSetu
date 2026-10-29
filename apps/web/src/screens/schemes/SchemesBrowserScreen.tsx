import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { syncManager } from '../../services/sync-manager.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import {
  evaluateSchemeEligibility,
  computeChecklistProgress,
  Scheme,
  Facility,
  generateUuidV7,
} from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  Award,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Printer,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const SchemesBrowserScreen: React.FC = () => {
  const { t } = useTranslation();
  const { currentStudent } = useAuthStore();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [search, setSearch] = useState('');
  const [girlFilter, setGirlFilter] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [checkedDocs, setCheckedDocs] = useState<string[]>([]);
  const [showEligibilityHelper, setShowEligibilityHelper] = useState(false);

  // Eligibility Helper questionnaire state
  const [helperGrade, setHelperGrade] = useState<number>(currentStudent?.grade || 5);
  const [helperGender, setHelperGender] = useState<'MALE' | 'FEMALE'>(
    (currentStudent?.gender as any) || 'FEMALE'
  );
  const [helperAttendance, setHelperAttendance] = useState<number>(80);

  useEffect(() => {
    async function loadData() {
      const localSchemes = await offlineDb.schemes.toArray();
      if (localSchemes.length > 0) {
        setSchemes(localSchemes);
      } else {
        // Fallback sample schemes
        const sampleSchemes: Scheme[] = [
          {
            id: 'sch-01',
            schoolId: 'global',
            name: 'PM POSHAN (Mid-Day Meal Scheme)',
            description: 'Nutritious cooked lunch provided on all school working days.',
            girlSpecific: false,
            attendanceThreshold: 70,
            eligibilityRules: { minGrade: 1, maxGrade: 8, minAttendancePercent: 70 },
            requiredDocuments: ['School Enrollment Record', 'Parent Self-Declaration'],
            applicationSteps: ['Automatic enrollment upon school admission', 'No form fee required'],
            whereToApply: 'School Headmaster Office',
            sourceUrl: 'https://pmposhan.education.gov.in',
            lastVerifiedAt: '2026-03-01',
            version: 1,
            deviceId: 'hub',
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
          },
          {
            id: 'sch-02',
            schoolId: 'global',
            name: 'Savitribai Phule Scholarship for Girl Students',
            description: 'Financial assistance for rural girl students in Grades 5-10.',
            girlSpecific: true,
            attendanceThreshold: 75,
            eligibilityRules: { gender: 'FEMALE', minGrade: 5, maxGrade: 10, minAttendancePercent: 75 },
            requiredDocuments: ['Caste Certificate (SC/VJNT)', 'Previous Marksheet', 'Student Bank Passbook Copy'],
            applicationSteps: ['Obtain form from Headmaster', 'Submit certified copies', 'School forwards to Social Welfare Dept'],
            whereToApply: 'School Headmaster Office',
            sourceUrl: 'https://mahadbt.maharashtra.gov.in',
            lastVerifiedAt: '2026-01-20',
            version: 1,
            deviceId: 'hub',
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
          },
          {
            id: 'sch-03',
            schoolId: 'global',
            name: 'Free Bicycle Scheme for Rural Secondary Girls',
            description: 'Free bicycle for rural girls entering Grade 8 living >2 km from school.',
            girlSpecific: true,
            attendanceThreshold: 75,
            eligibilityRules: { gender: 'FEMALE', minGrade: 8, maxGrade: 8 },
            requiredDocuments: ['School Enrollment Certificate', 'Residence Distance Proof', 'BPL Ration Card Copy'],
            applicationSteps: ['Submit form to Sarpanch / Headmaster', 'Physical verification by Gram Sevak'],
            whereToApply: 'School Office / Gram Panchayat',
            sourceUrl: 'https://rural.maharashtra.gov.in',
            lastVerifiedAt: '2026-02-01',
            version: 1,
            deviceId: 'hub',
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
          },
        ];
        await offlineDb.schemes.bulkPut(sampleSchemes);
        setSchemes(sampleSchemes);
      }

      // Sample facilities
      setFacilities([
        { id: 'f1', name: 'Aaple Sarkar Seva Kendra (CSC) Khed', type: 'CSC_CENTER', address: 'Near Bus Stand, Khed', contactNumber: '+912135222100', districtId: 'dist-01' },
        { id: 'f2', name: 'Block Education Office (BEO) Khed', type: 'BLOCK_EDUCATION_OFFICE', address: 'Panchayat Samiti Compound', contactNumber: '+912135222345', districtId: 'dist-01' },
        { id: 'f3', name: 'Gram Panchayat Office Khed', type: 'GRAM_PANCHAYAT', address: 'Gram Bhavan, Khed Village', contactNumber: '+912135222890', districtId: 'dist-01' },
      ]);
    }
    loadData();
  }, []);

  // Load active student's saved checklist when selecting a scheme
  useEffect(() => {
    async function loadStudentChecklist() {
      if (!selectedScheme || !currentStudent) return;
      const progress = await offlineDb.checklists
        .where('[studentId+schemeId]')
        .equals([currentStudent.id, selectedScheme.id])
        .first();

      if (progress) {
        setCheckedDocs(progress.checkedDocs || []);
      } else {
        setCheckedDocs([]);
      }
    }
    loadStudentChecklist();
  }, [selectedScheme, currentStudent]);

  const toggleDocChecked = async (docName: string) => {
    if (!selectedScheme || !currentStudent) return;

    const nextChecked = checkedDocs.includes(docName)
      ? checkedDocs.filter((d) => d !== docName)
      : [...checkedDocs, docName];

    setCheckedDocs(nextChecked);

    const summary = computeChecklistProgress(selectedScheme.requiredDocuments, nextChecked);

    // Save to local Dexie and enqueue outbox mutation atomically!
    await syncManager.mutate(
      'SchemeChecklistProgress',
      offlineDb.checklists,
      {
        id: generateUuidV7(),
        schoolId: currentStudent.schoolId,
        studentId: currentStudent.id,
        schemeId: selectedScheme.id,
        checkedDocs: nextChecked,
        completed: summary.isComplete,
        version: 1,
        deviceId: syncManager.getDeviceId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      'INSERT',
      2
    );
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const filteredSchemes = schemes.filter((s) => {
    if (girlFilter && !s.girlSpecific) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-36 space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-blue-600 min-w-[20px] mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed font-medium">
          <strong>Official Notice:</strong> {t('schemes.disclaimer')} Always confirm latest rules and eligibility with issuing government offices.
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-blue-600" />
            <span>{t('schemes.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {t('schemes.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEligibilityHelper(!showEligibilityHelper)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Eligibility Helper</span>
          </button>
          <AudioHelpButton text="विद्यार्थ्यांसाठी उपलब्ध सरकारी योजनांची यादी व आवश्यक कागदपत्रे." size="sm" />
        </div>
      </div>

      {/* 3-Question Eligibility Helper Card */}
      {showEligibilityHelper && (
        <div className="bg-white rounded-3xl p-6 border border-blue-200/80 shadow-lg space-y-4 animate-fade-in">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>3-Question Scheme Eligibility Helper</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Answer 3 simple questions to see which schemes you qualify for:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Student Grade</label>
              <select
                value={helperGrade}
                onChange={(e) => setHelperGrade(parseInt(e.target.value, 10))}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold text-sm min-h-[44px]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Gender</label>
              <select
                value={helperGender}
                onChange={(e) => setHelperGender(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold text-sm min-h-[44px]"
              >
                <option value="FEMALE">Girl Student (मुलगी)</option>
                <option value="MALE">Boy Student (मुलगा)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Current Attendance %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={helperAttendance}
                onChange={(e) => setHelperAttendance(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold text-sm min-h-[44px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search schemes by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          />
        </div>

        <button
          onClick={() => setGirlFilter(!girlFilter)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border transition-all min-h-[44px] ${
            girlFilter
              ? 'bg-rose-600 text-white border-rose-700 shadow-md'
              : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Girl-Child Schemes Only</span>
        </button>
      </div>

      {/* Schemes List */}
      <div className="space-y-4">
        {filteredSchemes.map((scheme) => {
          const isSelected = selectedScheme?.id === scheme.id;
          const dummyStudent = currentStudent || {
            id: 'demo-student',
            schoolId: 'sch-01',
            name: 'Demo Student',
            prn: 'PRN001',
            grade: helperGrade,
            gender: helperGender,
            assessedLevel: 3,
            avatarId: 'avatar-1',
            pinHash: '1234',
            parentalConsent: true,
            version: 1,
            deviceId: 'dev',
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
          };

          const eligibility = evaluateSchemeEligibility(scheme, dummyStudent, helperAttendance);

          return (
            <div
              key={scheme.id}
              className={`bg-white rounded-3xl border-2 transition-all p-5 sm:p-6 shadow-sm ${
                isSelected ? 'border-blue-500 shadow-md ring-2 ring-blue-400/20' : 'border-slate-200/90 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div
                className="flex flex-wrap items-start justify-between gap-3 cursor-pointer"
                onClick={() => setSelectedScheme(isSelected ? null : scheme)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {scheme.girlSpecific && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-extrabold text-[11px] uppercase tracking-wider">
                        {t('schemes.girlSpecificBadge')}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                        eligibility.eligible
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {eligibility.eligible ? '✓ Eligible for you' : 'Criteria pending'}
                    </span>
                  </div>

                  <h3 className="font-black text-lg sm:text-xl text-slate-900">
                    {scheme.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {scheme.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <AudioHelpButton text={`${scheme.name}. ${scheme.description}`} size="sm" />
                  {isSelected ? <ChevronUp className="w-5 h-5 text-amber-700" /> : <ChevronDown className="w-5 h-5 text-amber-700" />}
                </div>
              </div>

              {/* Expanded Scheme Details & Offline Document Checklist */}
              {isSelected && (
                <div className="mt-6 pt-6 border-t border-amber-100 space-y-6 animate-fade-in">
                  {/* Where to Apply & Eligibility Criteria */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                      <span className="text-xs font-extrabold uppercase text-amber-800">
                        {t('schemes.whereToApply')}
                      </span>
                      <p className="font-bold text-amber-950 text-sm mt-1">
                        {scheme.whereToApply}
                      </p>
                      <span className="text-[11px] text-amber-700 block mt-2">
                        Last verified: {scheme.lastVerifiedAt}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                      <span className="text-xs font-extrabold uppercase text-amber-800">
                        Application Steps
                      </span>
                      <ol className="list-decimal list-inside text-xs font-medium text-amber-950 mt-1.5 space-y-1">
                        {(scheme.applicationSteps || []).map((step: string, sIdx: number) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Offline Document Checklist (Zero ID Number storage guarantee!) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-extrabold text-amber-950 text-base flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        {t('schemes.requiredDocs')}
                      </h4>
                      <button
                        onClick={handlePrintSlip}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-all min-h-[36px]"
                      >
                        <Printer className="w-4 h-4" />
                        <span>{t('schemes.printChecklist')}</span>
                      </button>
                    </div>

                    <div className="space-y-2 mt-3">
                      {(scheme.requiredDocuments || []).map((doc: string) => {
                        const isChecked = checkedDocs.includes(doc);
                        return (
                          <button
                            key={doc}
                            onClick={() => toggleDocChecked(doc)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 font-bold text-sm transition-all text-left min-h-[48px] ${
                              isChecked
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                                : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span
                                className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                  isChecked
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-amber-400 bg-white'
                                }`}
                              >
                                {isChecked && <CheckCircle2 className="w-4 h-4" />}
                              </span>
                              <span>{doc}</span>
                            </span>
                            <span className="text-xs font-semibold text-amber-700">
                              {isChecked ? 'Ready ✓' : 'Needed'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nearby Assistance Centers */}
                  <div>
                    <h4 className="font-extrabold text-amber-950 text-sm mb-2 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      {t('schemes.facilitiesNearby')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {facilities.map((fac) => (
                        <div key={fac.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 text-xs">
                          <p className="font-bold text-amber-950">{fac.name}</p>
                          <p className="text-amber-800 text-[11px] mt-0.5">{fac.address}</p>
                          {fac.contactNumber && (
                            <p className="text-orange-700 font-semibold mt-1">Tel: {fac.contactNumber}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
