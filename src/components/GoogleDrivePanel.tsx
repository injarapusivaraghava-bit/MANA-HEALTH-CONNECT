import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';
import {
  initGoogleAuth,
  googleSignIn,
  getGoogleAccessToken,
  googleLogout,
} from '../firebase';
import {
  DriveFileItem,
  getOrCreateManaHealthFolder,
  listDriveFiles,
  uploadBlobToDrive,
  downloadDriveFile,
  renameDriveFile,
  deleteDriveFile,
} from '../services/googleDriveService';
import { healthStore } from '../services/healthStore';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  Cloud,
  Upload,
  Search,
  Download,
  Trash2,
  Edit3,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  FileText,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  PlusCircle,
  X,
  ShieldCheck,
} from 'lucide-react';

type PendingMutation =
  | {
      type: 'delete';
      file: DriveFileItem;
    }
  | {
      type: 'rename';
      file: DriveFileItem;
      newName: string;
    };

export const GoogleDrivePanel: React.FC<{ onRecordImported?: () => void }> = ({
  onRecordImported,
}) => {
  const { language } = useLanguage();
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [scopeMode, setScopeMode] = useState<'appFolder' | 'allDrive'>('appFolder');
  const [appFolderId, setAppFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Rename input modal & Mandatory Confirmation Dialog state
  const [renameDraft, setRenameDraft] = useState<{ file: DriveFileItem; name: string } | null>(null);
  const [pendingMutation, setPendingMutation] = useState<PendingMutation | null>(null);
  const [mutating, setMutating] = useState(false);

  const fetchDriveData = useCallback(
    async (overrideFolderId?: string) => {
      const token = await getGoogleAccessToken();
      if (!token) {
        setNeedsAuth(true);
        return;
      }

      setLoading(true);
      setErrorMsg(null);
      try {
        let folderIdToUse = overrideFolderId || appFolderId;
        if (scopeMode === 'appFolder' && !folderIdToUse) {
          folderIdToUse = await getOrCreateManaHealthFolder(token);
          setAppFolderId(folderIdToUse);
        }

        const list = await listDriveFiles(token, {
          search: searchTerm,
          folderId: scopeMode === 'appFolder' ? folderIdToUse || undefined : undefined,
        });
        setFiles(list);
      } catch (err: any) {
        if (err?.status === 401) {
          setNeedsAuth(true);
          setErrorMsg(
            language === 'te'
              ? 'మీ Google Drive సెషన్ గడువు ముగిసింది. దయచేసి మళ్ళీ సైన్ ఇన్ చేయండి.'
              : 'Your Google Drive session expired. Please sign in again.'
          );
        } else {
          setErrorMsg(err?.message || 'Failed to load files from Google Drive.');
        }
      } finally {
        setLoading(false);
      }
    },
    [appFolderId, scopeMode, searchTerm, language]
  );

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (authedUser) => {
        setUser(authedUser);
        setNeedsAuth(false);
      },
      (firebaseUser) => {
        setUser(firebaseUser);
        setNeedsAuth(true);
      }
    );

    // Also check if token is already cached in memory
    getGoogleAccessToken().then((token) => {
      if (token) {
        setNeedsAuth(false);
        fetchDriveData();
      }
    });

    return () => unsubscribe();
  }, [fetchDriveData]);

  useEffect(() => {
    if (!needsAuth) {
      fetchDriveData();
    }
  }, [needsAuth, scopeMode, fetchDriveData]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      setUser(result.user);
      setNeedsAuth(false);
      const folderId = await getOrCreateManaHealthFolder(result.accessToken);
      setAppFolderId(folderId);
      await fetchDriveData(folderId);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          (language === 'te'
            ? 'Google సైన్ ఇన్ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
            : 'Google Sign-In failed. Please allow popups and try again.')
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setUser(null);
    setNeedsAuth(true);
    setFiles([]);
    setAppFolderId(null);
    setStatusMsg(null);
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = '';
    if (!selected) return;

    const token = await getGoogleAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const folderId = appFolderId || (await getOrCreateManaHealthFolder(token));
      if (!appFolderId) setAppFolderId(folderId);

      const uploaded = await uploadBlobToDrive(
        token,
        selected,
        selected.name,
        selected.type || 'application/octet-stream',
        folderId,
        `Medical report uploaded via MANA HEALTH CONNECT for ${healthStore.patientProfile.name}`
      );
      setStatusMsg(
        language === 'te'
          ? `"${uploaded.name}" మీ Google Drive లో సురక్షితంగా అప్‌లోడ్ చేయబడింది!`
          : `"${uploaded.name}" uploaded to Google Drive successfully.`
      );
      await fetchDriveData(folderId);
    } catch (err: any) {
      if (err?.status === 401) {
        setNeedsAuth(true);
      }
      setErrorMsg(err?.message || 'Failed to upload file to Google Drive.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: DriveFileItem) => {
    const token = await getGoogleAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setErrorMsg(null);
    try {
      await downloadDriveFile(token, file);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Download failed.');
    }
  };

  const handleImportToHealthLocker = (file: DriveFileItem) => {
    healthStore.addHealthRecord({
      patientId: healthStore.currentUser.uid,
      familyMemberName: 'Self (నేను)',
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: 'Lab Report',
      date: (file.modifiedTime || new Date().toISOString()).split('T')[0],
      doctorOrLab: 'Google Drive Sync',
      fileName: file.name,
      fileType: file.mimeType,
      notes: `Linked from Google Drive (${file.webViewLink || file.id})`,
    });
    setStatusMsg(
      language === 'te'
        ? `"${file.name}" మీ ఆరోగ్య రికార్డుల లాకర్‌లోకి దిగుమతి చేయబడింది.`
        : `"${file.name}" imported into your Health Records Locker.`
    );
    if (onRecordImported) onRecordImported();
  };

  const executeConfirmedMutation = async () => {
    if (!pendingMutation) return;
    const token = await getGoogleAccessToken();
    if (!token) {
      setPendingMutation(null);
      setNeedsAuth(true);
      return;
    }

    setMutating(true);
    setErrorMsg(null);
    try {
      if (pendingMutation.type === 'delete') {
        await deleteDriveFile(token, pendingMutation.file.id);
        setStatusMsg(
          language === 'te'
            ? `"${pendingMutation.file.name}" Google Drive నుండి తొలగించబడింది.`
            : `"${pendingMutation.file.name}" deleted from Google Drive.`
        );
      } else if (pendingMutation.type === 'rename') {
        const updated = await renameDriveFile(
          token,
          pendingMutation.file.id,
          pendingMutation.newName
        );
        setStatusMsg(
          language === 'te'
            ? `ఫైల్ పేరు "${updated.name}" గా మార్చబడింది.`
            : `File renamed to "${updated.name}".`
        );
      }
      setPendingMutation(null);
      await fetchDriveData();
    } catch (err: any) {
      if (err?.status === 401) {
        setNeedsAuth(true);
      }
      setErrorMsg(err?.message || 'Operation failed on Google Drive.');
    } finally {
      setMutating(false);
    }
  };

  const formatBytes = (sizeStr?: string) => {
    if (!sizeStr) return 'Google Doc';
    const bytes = Number(sizeStr);
    if (Number.isNaN(bytes) || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-gray-900">
                {language === 'te'
                  ? 'Google Drive ఆరోగ్య రికార్డుల క్లౌడ్ బ్యాకప్'
                  : 'Google Drive Medical Cloud Vault'}
              </h2>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                1P Workspace Sync
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'te'
                ? 'మీ ల్యాబ్ రిపోర్టులు, ప్రిస్క్రిప్షన్లు మరియు స్కాన్‌లను మీ వ్యక్తిగత Google Drive లో సురక్షితంగా భద్రపరుచుకోండి మరియు బ్రౌజ్ చేయండి.'
                : 'Securely back up, browse, download, and manage medical PDFs & scans directly in your personal Google Drive.'}
            </p>
          </div>
        </div>

        {!needsAuth && user && (
          <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200 px-3 py-2 rounded-2xl text-xs self-start md:self-auto">
            <div className="text-left">
              <p className="font-bold text-emerald-950 truncate max-w-[180px]">
                {user.displayName || 'Google Connected'}
              </p>
              <p className="text-[11px] text-emerald-700 truncate max-w-[180px]">
                {user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 rounded-xl bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 border border-emerald-200 transition"
              title="Disconnect Google Drive"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Status & Error Banners */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-3 text-xs flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3 text-xs flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </span>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Unauthenticated State: Official Google Sign-In Button */}
      {needsAuth ? (
        <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-white border border-emerald-200 rounded-3xl p-6 md:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="max-w-lg mx-auto space-y-1.5">
            <h3 className="font-bold text-gray-900 text-base">
              {language === 'te'
                ? 'మీ Google Drive ఖాతాను కనెక్ట్ చేయండి'
                : 'Connect Your Google Drive Account'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'te'
                ? 'మీ వైద్య నివేదికలను Google Drive లో అప్‌లోడ్ చేయడానికి, చూడటానికి మరియు మేనేజ్ చేయడానికి మీ అనుమతితో Google ద్వారా సైన్ ఇన్ చేయండి.'
                : 'Sign in with Google to view your Drive medical files, back up lab reports to a dedicated Mana Health Connect folder, and download records anytime.'}
            </p>
          </div>
          <div className="pt-1 flex justify-center">
            <GoogleSignInButton
              onClick={handleLogin}
              disabled={isLoggingIn}
              label={
                isLoggingIn
                  ? language === 'te'
                    ? 'సైన్ ఇన్ అవుతోంది...'
                    : 'Signing in...'
                  : 'Sign in with Google'
              }
            />
          </div>
        </div>
      ) : (
        /* Authenticated Drive Explorer */
        <div className="space-y-4">
          {/* Controls Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Folder Scope Switcher */}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl text-xs font-bold w-fit">
              <button
                type="button"
                onClick={() => setScopeMode('appFolder')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  scopeMode === 'appFolder'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>
                  {language === 'te' ? 'మన ఆరోగ్య ఫోల్డర్' : 'Mana Health Folder'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setScopeMode('allDrive')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  scopeMode === 'allDrive'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'మొత్తం Google Drive' : 'All Drive Files'}</span>
              </button>
            </div>

            {/* Search + Upload + Refresh */}
            <div className="flex flex-wrap items-center gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchDriveData();
                }}
                className="relative flex-1 min-w-[200px]"
              >
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    language === 'te'
                      ? 'Drive లో ఫైల్స్ వెతకండి...'
                      : 'Search files in Google Drive...'
                  }
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                />
              </form>

              <label className="cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition">
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploading
                    ? language === 'te'
                      ? 'అప్‌లోడ్ అవుతోంది...'
                      : 'Uploading...'
                    : language === 'te'
                    ? 'Drive లో అప్‌లోడ్'
                    : 'Upload to Drive'}
                </span>
                <input
                  type="file"
                  accept="application/pdf,image/*,.txt,.doc,.docx"
                  onChange={handleUploadFile}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => fetchDriveData()}
                disabled={loading}
                className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
                title="Refresh Google Drive files"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
              </button>
            </div>
          </div>

          {/* Files List */}
          {loading ? (
            <div className="py-10 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>
                {language === 'te'
                  ? 'Google Drive నుండి ఫైల్స్ లోడ్ అవుతున్నాయి...'
                  : 'Loading files from Google Drive...'}
              </span>
            </div>
          ) : files.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center space-y-2 text-xs text-gray-500">
              <FileText className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-700">
                {language === 'te'
                  ? 'ఈ ఫోల్డర్‌లో ఇంకా ఫైల్స్ లేవు.'
                  : 'No files found in this view.'}
              </p>
              <p>
                {language === 'te'
                  ? 'పైనున్న "Drive లో అప్‌లోడ్" బటన్ ఉపయోగించి మీ రిపోర్టులను భద్రపరుచుకోండి లేదా "All Drive Files" చూడండి.'
                  : 'Use "Upload to Drive" above or switch to "All Drive Files" to browse existing documents.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 bg-gray-50/50 flex flex-col justify-between gap-3 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {formatBytes(file.size)} •{' '}
                          {file.modifiedTime
                            ? new Date(file.modifiedTime).toLocaleDateString()
                            : 'Synced'}
                        </p>
                      </div>
                    </div>

                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 p-1"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/70 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleImportToHealthLocker(file)}
                      className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 bg-emerald-100/70 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>
                        {language === 'te' ? 'లాకర్‌కు జతచేయి' : 'Import to Locker'}
                      </span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDownload(file)}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200/70 rounded-lg transition"
                        title="Download from Drive"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenameDraft({ file, name: file.name })}
                        className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition"
                        title="Rename file in Drive"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingMutation({ type: 'delete', file })}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                        title="Delete file from Drive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rename Input Modal (Step 1 before Confirmation) */}
      {renameDraft && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'te' ? 'Google Drive ఫైల్ పేరు మార్చండి' : 'Rename Google Drive File'}
              </h3>
              <button
                onClick={() => setRenameDraft(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!renameDraft.name.trim()) return;
                const { file, name } = renameDraft;
                setRenameDraft(null);
                setPendingMutation({ type: 'rename', file, newName: name.trim() });
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-gray-700">New File Name:</label>
                <input
                  type="text"
                  required
                  value={renameDraft.name}
                  onChange={(e) =>
                    setRenameDraft({ ...renameDraft, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRenameDraft(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Review Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Explicit Confirmation Dialog for Drive Mutations (Rename / Delete) */}
      {pendingMutation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  pendingMutation.type === 'delete'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-base">
                  {pendingMutation.type === 'delete'
                    ? language === 'te'
                      ? 'Google Drive నుండి ఫైల్ తొలగించాలా?'
                      : 'Delete file from Google Drive?'
                    : language === 'te'
                    ? 'Google Drive ఫైల్ పేరు మార్చాలా?'
                    : 'Update file name in Google Drive?'}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {pendingMutation.type === 'delete' ? (
                    <>
                      Are you sure you want to permanently delete{' '}
                      <strong className="text-gray-900">
                        "{pendingMutation.file.name}"
                      </strong>{' '}
                      from your Google Drive? This action cannot be undone.
                    </>
                  ) : (
                    <>
                      Confirm renaming{' '}
                      <strong className="text-gray-900">
                        "{pendingMutation.file.name}"
                      </strong>{' '}
                      to{' '}
                      <strong className="text-emerald-800">
                        "{pendingMutation.newName}"
                      </strong>{' '}
                      in your Google Drive?
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={mutating}
                onClick={() => setPendingMutation(null)}
                className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={mutating}
                onClick={executeConfirmedMutation}
                className={`flex-1 py-2.5 rounded-2xl text-white font-bold text-xs shadow-md transition ${
                  pendingMutation.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {mutating
                  ? 'Processing...'
                  : pendingMutation.type === 'delete'
                  ? 'Confirm Delete'
                  : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
