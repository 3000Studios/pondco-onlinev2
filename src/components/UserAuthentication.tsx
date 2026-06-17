import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  User, 
  Mail, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle, 
  AlertOctagon, 
  Key, 
  HelpCircle, 
  ArrowRight, 
  UserPlus,
  RefreshCw,
  LogOut,
  FileSignature,
  FileText
} from 'lucide-react';
import { AccessibilitySettings, AuditLog, UserSession } from '../types';

interface UserAuthenticationProps {
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
  onAddLog: (newLog: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  session: UserSession | null;
  onLogin: (session: UserSession) => void;
  onLogout: () => void;
}

export const UserAuthentication: React.FC<UserAuthenticationProps> = ({
  settings,
  onAnnounce,
  playSound,
  onAddLog,
  session,
  onLogin,
  onLogout
}) => {
  const [authView, setAuthView] = useState<'login' | 'register' | 'reset'>('login');
  
  // Login fields
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaValue, setCaptchaValue] = useState(() => Math.floor(1000 + Math.random() * 8999).toString());
  
  // Registration fields
  const [regUser, setRegUser] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');
  const [regClearance, setRegClearance] = useState<UserSession['clearanceLevel']>('CITIZEN');
  const [securityQuest, setSecurityQuest] = useState('first_pet');
  const [securityAns, setSecurityAns] = useState('');

  // Password Reset fields
  const [resetUser, setResetUser] = useState('');
  const [resetAnswer, setResetAnswer] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); // 1: verify user/ans, 2: input OTP token, 3: new password
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newPassConfirm, setNewPassConfirm] = useState('');

  // Status warnings
  const [errors, setErrors] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Local saved register DB mock
  const [registeredUsers, setRegisteredUsers] = useState<Array<any>>(() => {
    try {
      const cached = localStorage.getItem('civil_portal_auth_users');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    // Initial demo users
    return [
      {
        username: 'Mr. J.W. Swain',
        email: 'mr.jwswain@gmail.com',
        pass: '92842',
        clearance: 'SYSTEM_ADMIN',
        secQuest: 'first_pet',
        secAns: 'Spot'
      },
      {
        username: 'Riverside Corporate Client',
        email: 'client@pondco.online',
        pass: '10842',
        clearance: 'CITIZEN',
        secQuest: 'birth_city',
        secAns: 'Washington'
      }
    ];
  });

  const saveUsersToCache = (newUsersList: Array<any>) => {
    setRegisteredUsers(newUsersList);
    try {
      localStorage.setItem('civil_portal_auth_users', JSON.stringify(newUsersList));
    } catch(e) {}
  };

  // CAPTCHA Refresh helper
  const regenerateCaptcha = () => {
    const newVal = Math.floor(1000 + Math.random() * 8999).toString();
    setCaptchaValue(newVal);
    setCaptchaInput('');
    playSound();
    onAnnounce(`Visual authentication key refreshed. Current numbers are ${newVal.split('').join(' ')}`);
  };

  // Password security validation helper
  const isPasswordSecure = (p: string) => {
    const hasMinLength = p.length >= 8;
    const hasUppercase = /[A-Z]/.test(p);
    const hasLowercase = /[a-z]/.test(p);
    const hasDigit = /[0-9]/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);
    return hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;
  };

  // LOGIN PROCESS
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setSuccessMsg('');

    if (!loginUser.trim() || !loginPass) {
      setErrors('CREDENTIALS REJECTED: Mandatory clearance fields must not be empty.');
      onAnnounce('Identification failed: fields cannot be empty.');
      playSound();
      return;
    }

    if (captchaInput !== captchaValue) {
      setErrors('ACCESS DENIED: CAPTCHA compliance check code value mismatch.');
      onAnnounce('Identification failed: captcha value incorrect.');
      regenerateCaptcha();
      return;
    }

    // Lookup user
    const matchedUser = registeredUsers.find(u => 
      u.username.toLowerCase() === loginUser.toLowerCase() || 
      u.email.toLowerCase() === loginUser.toLowerCase()
    );

    if (!matchedUser || matchedUser.pass !== loginPass) {
      setErrors('ACCESS DENIED: Invalid credentials. Verification check failed against secure ledger database.');
      onAnnounce('Access denied: matching credentials not found.');
      playSound();
      // Write security incident log
      onAddLog({
        agency: 'Bureau of Public Compliance (BPC)',
        category: 'SECURITY',
        severity: 'ERROR',
        message: `UNAUTHORIZED GATEWAY PROSPECT: Intrusive login attempt rejected for identity claim [${loginUser}]. Failure logged in SEC-403 checkgate.`,
        operator: 'SYSTEM_DAEMON',
        ipAddress: '10.224.2.105'
      });
      return;
    }

    // Success Authentication
    const targetSession: UserSession = {
      username: matchedUser.username,
      email: matchedUser.email,
      clearanceLevel: matchedUser.clearance,
      token: `SEC-STAMP-TKN-${Math.floor(10000 + Math.random() * 89999)}`,
      authenticatedTime: new Date().toISOString(),
      avatarIcon: matchedUser.clearance === 'SYSTEM_ADMIN' ? '🛡️' : matchedUser.clearance === 'REGISTRY_AUDITOR' ? '🔎' : '💼'
    };

    onLogin(targetSession);
    setSuccessMsg(`Session verified and sealed. Security Token issued: ${targetSession.token}`);
    onAnnounce(`Access authorized. Welcome back senior officer ${matchedUser.username}. Clearance level is ${matchedUser.clearance}`);
    playSound();

    // Log success auth
    onAddLog({
      agency: 'Bureau of Public Compliance (BPC)',
      category: 'SECURITY',
      severity: 'SUCCESS',
      message: `SESSION SEALED: Authorized checkgate login completed for identity [${matchedUser.username}]. Role Clearance assigned: ${matchedUser.clearance}.`,
      operator: matchedUser.username,
      ipAddress: '10.224.2.105'
    });
  };

  // REGISTRATION PROCESS
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setSuccessMsg('');

    if (!regUser.trim() || !regEmail.trim() || !regPass || !securityAns.trim()) {
      setErrors('REGISTRANT CRITERIA EXCEPTION: All registry registration variables must be completed.');
      onAnnounce('Registration failed: fields must not be empty.');
      playSound();
      return;
    }

    if (regUser.length < 3) {
      setErrors('REGISTRY ERROR: Username credentials claim must be 3 or more alphanumeric characters.');
      onAnnounce('Registration failed: username too short.');
      playSound();
      return;
    }

    // Password matches
    if (regPass !== regPassConfirm) {
      setErrors('INTEGRITY FAILURE: Passwords do not match. Verification check mismatched.');
      onAnnounce('Registration failed: passwords do not match.');
      playSound();
      return;
    }

    // Check strength
    if (!isPasswordSecure(regPass)) {
      setErrors('SECURITY THRESHOLD OUT OF RANGE: Password complexity criteria rejected. Must hold 8+ characters, including uppercase, lowercase, numbers, and special symbols.');
      onAnnounce('Registration failed: password strength insufficient.');
      playSound();
      return;
    }

    // Check pre-existing username
    const exists = registeredUsers.some(u => u.username.toLowerCase() === regUser.toLowerCase() || u.email.toLowerCase() === regEmail.toLowerCase());
    if (exists) {
      setErrors('REGISTRY COLLISION: Identity claim already registered. Credentials index already locked.');
      onAnnounce('Registration failed: identity already registered.');
      playSound();
      return;
    }

    // Add User record
    const newUser = {
      username: regUser.trim(),
      email: regEmail.trim(),
      pass: regPass,
      clearance: regClearance,
      secQuest: securityQuest,
      secAns: securityAns.trim()
    };

    const nextUsers = [...registeredUsers, newUser];
    saveUsersToCache(nextUsers);

    setSuccessMsg(`IDENTITY REGISTERED: Clearance profile successfully enrolled for ${regUser}. Swapping to login gate...`);
    onAnnounce(`Account registered. Role Clearance ${regClearance} registered. Swapping to credential validation form.`);
    playSound();

    // Write audit log
    onAddLog({
      agency: 'Federal Archives & Records Office (FARO)',
      category: 'RECORDS',
      severity: 'SUCCESS',
      message: `IDENTITY ENROLLED: New security registry credentials generated for identity [${regUser}]. Access code cleared as ${regClearance}.`,
      operator: 'CREDENTIALS_DESK',
      ipAddress: '10.224.2.105'
    });

    // Clear and swap view
    setLoginUser(regUser);
    setTimeout(() => {
      setAuthView('login');
      setSuccessMsg('');
      setErrors('');
    }, 3000);
  };

  // PASSWORD RESET STEP 1: Verify Identity and Recovery Question
  const handleResetStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setSuccessMsg('');

    if (!resetUser.trim() || !resetAnswer.trim()) {
      setErrors('CRITERIA EXCEPTION: Missing identity name or challenge answer fields.');
      onAnnounce('Reset failed: please fill out all details.');
      playSound();
      return;
    }

    const matchedUser = registeredUsers.find(u => 
      u.username.toLowerCase() === resetUser.toLowerCase() || 
      u.email.toLowerCase() === resetUser.toLowerCase()
    );

    if (!matchedUser || matchedUser.secAns.toLowerCase() !== resetAnswer.toLowerCase().trim()) {
      setErrors('DENIAL: Identity verification metrics rejected. Target record validation failed.');
      onAnnounce('Identity check failed. Matching recovery answer was not detected.');
      playSound();
      return;
    }

    // Success check: generate OTP
    const code = Math.floor(100000 + Math.random() * 899999).toString();
    setGeneratedOTP(code);
    setResetStep(2);
    playSound();
    onAnnounce(`Challenge passed. Simulated secure multi factor authentication token generated.`);
    
    // Simulate alert token delivery print
    onAddLog({
      agency: 'Bureau of Public Compliance (BPC)',
      category: 'SYSTEM',
      severity: 'INFO',
      message: `RECOVERY HANDSHAKE: One-time token requested for account [${matchedUser.username}]. Simulated secure SMS/MFA carrier dispatched. Code: ${code}`,
      operator: 'SYSTEM_DAEMON',
      ipAddress: '10.224.2.105'
    });
  };

  // PASSWORD RESET STEP 2: Verify MFA OTP Token
  const handleResetStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');

    if (otpInput.trim() !== generatedOTP) {
      setErrors('SECURITY MISMATCH: The entered one-time auth code is out of sync or invalid.');
      onAnnounce('Verification failed. Interactive key mismatched.');
      playSound();
      return;
    }

    // Success OTP
    setResetStep(3);
    playSound();
    onAnnounce(`Verifications authenticated. Please provide your fresh secure passwords.`);
  };

  // PASSWORD RESET STEP 3: Apply Fresh Password
  const handleResetStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');

    if (!newPass) {
      setErrors('ERROR: Password fields cannot represent empty strings.');
      playSound();
      return;
    }

    if (newPass !== newPassConfirm) {
      setErrors('INTEGRITY FAULT: Passwords mismatched.');
      playSound();
      return;
    }

    if (!isPasswordSecure(newPass)) {
      setErrors('SECURITY EXCEPTION: Complexity targets failed. Ensure the new password matches secure complexity directives.');
      playSound();
      return;
    }

    // Update DB
    const updatedUsers = registeredUsers.map(u => {
      if (u.username.toLowerCase() === resetUser.toLowerCase() || u.email.toLowerCase() === resetUser.toLowerCase()) {
        return { ...u, pass: newPass };
      }
      return u;
    });

    saveUsersToCache(updatedUsers);
    setSuccessMsg('CREDS REFORMED: Password updated successfully! Redirecting to login checks...');
    onAnnounce('Password reset finalized. Swapping to authorization gateway.');
    playSound();

    // Log the change
    onAddLog({
      agency: 'Bureau of Public Compliance (BPC)',
      category: 'SECURITY',
      severity: 'WARNING',
      message: `SECURITY CREDENTIALS ALTERATION: Password recovery loop securely completed for credential container [${resetUser}]. Old credentials revoked.`,
      operator: 'RECOVERY_PORTAL',
      ipAddress: '10.224.2.105'
    });

    setTimeout(() => {
      setAuthView('login');
      setResetStep(1);
      setCaptchaInput('');
      setErrors('');
      setSuccessMsg('');
    }, 3000);
  };

  // LOG OUT
  const handleLogoutClick = () => {
    const userLeft = session?.username || 'SYSTEM_GUEST';
    onLogout();
    playSound();
    onAnnounce('Session cleared. Administrative authorization markers removed.');
    
    onAddLog({
      agency: 'Bureau of Public Compliance (BPC)',
      category: 'SECURITY',
      severity: 'INFO',
      message: `SESSION CLOSED: User session terminated gracefully for identity [${userLeft}]. Security tokens revoked.`,
      operator: userLeft,
      ipAddress: '10.224.2.105'
    });
  };

  return (
    <div className="space-y-6" id="panel-auth" role="tabpanel" aria-labelledby="tab-auth">
      
      {/* SECURITY REGISTRY WARNING ACCENT */}
      <div className={`p-4 rounded border-l-4 text-xs font-mono leading-relaxed shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        settings.highContrast
          ? 'bg-black text-white border border-amber-400'
          : 'bg-indigo-900/10 border-blue-900 text-blue-950/80'
      }`}>
        <div className="flex items-start gap-2.5">
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <strong className="block uppercase font-bold text-red-700">WARNING: FEDERAL COMPLIANCE ACCESS STATUTE Title 44</strong>
            <span>
              This authorization system regulates access indicators of the Federal Service Ledger. Unauthorized entries, password forgery, or malicious credential scans violate civil compliance mandates and are automatically flagged at centralized network centers.
            </span>
          </div>
        </div>
      </div>

      {/* IF AUTHENTICATED: DISPLAY DETAILED SECURE CLEARANCE ID CARD PROFILE */}
      {session ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          
          {/* PROFILE ID BADGE */}
          <div className={`p-6 rounded-lg border-2 shadow-md flex flex-col items-center justify-between text-center relative overflow-hidden ${
            settings.highContrast 
              ? 'border-black bg-white text-black' 
              : 'bg-white border-blue-900 ring-4 ring-blue-900/5'
          }`}>
            {/* Top design header bar */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950" />

            <div className="pt-2">
              <div className="w-20 h-20 bg-slate-100 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-4xl select-none mx-auto mb-3 shadow-inner">
                {session.avatarIcon}
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900">{session.username}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{session.email}</p>
            </div>

            <div className="w-full my-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs font-mono space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Assigned Clearances</span>
              <div className="font-extrabold text-blue-900 uppercase text-xs flex items-center justify-center gap-1 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {session.clearanceLevel.replace('_', ' ')}
              </div>
              <div className="text-[10px] text-slate-500 mt-2 text-left border-t border-slate-150 pt-1.5 space-y-0.5">
                <div>TOKENID: <span className="font-bold text-slate-700">{session.token}</span></div>
                <div>SECURE ISSUANCE: <span>{new Date(session.authenticatedTime).toLocaleTimeString()}</span></div>
                <div>DEVICE CONTEXT: <span className="text-slate-600">IP 10.224.2.105</span></div>
              </div>
            </div>

            <button
              onClick={handleLogoutClick}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-mono text-xs font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Revoke Token &amp; Logout
            </button>
          </div>

          {/* PRIVILEGES TABLE & SECURITY LOG FOR ACTIVE SESS */}
          <div className={`md:col-span-2 p-6 rounded-lg border shadow-xs space-y-6 ${
            settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-white border-slate-200'
          }`}>
            <div>
              <h4 className="font-serif font-bold text-base text-slate-900">Credential Clearance Capabilities Policy</h4>
              <p className="text-xs text-slate-500 mt-0.5">Below are your authorized clearances based on compliance tier validation.</p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Citizenship Privilege check */}
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-150 rounded">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Clearance Tier 1: Public Registry View-Only</strong>
                  <p className="text-slate-500 mt-0.5 text-[11px]">Authorized to read official agency status matrices, search directories, and lodge FOIA transparency requests.</p>
                </div>
              </div>

              {/* Civil Analyst Privileges */}
              <div className={`flex items-start gap-2.5 p-3 border rounded transition-all ${
                ['CIVIL_ANALYST', 'REGISTRY_AUDITOR', 'SYSTEM_ADMIN'].includes(session.clearanceLevel)
                  ? 'bg-emerald-50/40 border-emerald-250'
                  : 'bg-slate-100/50 border-slate-200 opacity-60'
              }`}>
                {['CIVIL_ANALYST', 'REGISTRY_AUDITOR', 'SYSTEM_ADMIN'].includes(session.clearanceLevel) ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-slate-800">Clearance Tier 2: Registry Analytical Auditing</strong>
                  <p className="text-slate-500 mt-0.5 text-[11px]">Authorized to inspect and filter advanced historical databases, trace cryptographic handshakes, and access detailed visual telemetries.</p>
                </div>
              </div>

              {/* Audit Clearance */}
              <div className={`flex items-start gap-2.5 p-3 border rounded transition-all ${
                ['REGISTRY_AUDITOR', 'SYSTEM_ADMIN'].includes(session.clearanceLevel)
                  ? 'bg-emerald-50/40 border-emerald-250'
                  : 'bg-slate-100/50 border-slate-200 opacity-60'
              }`}>
                {['REGISTRY_AUDITOR', 'SYSTEM_ADMIN'].includes(session.clearanceLevel) ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-slate-800">Clearance Tier 3: Ledger Administrative Verification</strong>
                  <p className="text-slate-500 mt-0.5 text-[11px]">Authorized to clear custom service logs, edit system notations, and generate public compliant transaction entries.</p>
                </div>
              </div>

              {/* Master System clearance */}
              <div className={`flex items-start gap-2.5 p-3 border rounded transition-all ${
                session.clearanceLevel === 'SYSTEM_ADMIN'
                  ? 'bg-emerald-50/40 border-emerald-250 font-semibold'
                  : 'bg-slate-100/50 border-slate-200 opacity-60'
              }`}>
                {session.clearanceLevel === 'SYSTEM_ADMIN' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-slate-800">Clearance Tier 4: Master System Integrator Override (Bypass Mode)</strong>
                  <p className="text-slate-500 mt-0.5 text-[11px]">Fully authorized to bypass environmental criteria limits, override tower flight guidelines, adjust cryptographic certificates, and override sector parameters.</p>
                </div>
              </div>
            </div>

            {/* Profile assistance helper */}
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded text-xs font-sans text-blue-950 flex items-start gap-2 leading-relaxed">
              <HelpCircle className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
              <span>
                To test higher clearance behaviors, you can register as a <strong>SYSTEM_ADMIN</strong> or log in using the demo admin credentials. The master login privilege allows you to toggle active gates and safety thresholds inside the <strong>Operations &amp; Sectors Tab</strong> automatically.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* NOT AUTHENTICATED: RENDER ACTIVE FORM (LOGIN / REGISTER / RESET) */
        <div className="max-w-md mx-auto animate-fade-in relative">
          
          <div className={`p-6 rounded-lg border shadow-lg space-y-6 ${
            settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-white border-slate-200'
          }`}>
            
            {/* View selectors */}
            <div className="flex border-b border-slate-150 pb-2.5 text-xs font-mono justify-around">
              <button 
                onClick={() => {
                  setAuthView('login');
                  setErrors('');
                  setSuccessMsg('');
                  playSound();
                }}
                className={`py-1 px-3 border-b-2 font-bold cursor-pointer transition-all ${
                  authView === 'login' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-800'
                }`}
              >
                Clearance Login
              </button>
              <button 
                onClick={() => {
                  setAuthView('register');
                  setErrors('');
                  setSuccessMsg('');
                  playSound();
                }}
                className={`py-1 px-3 border-b-2 font-bold cursor-pointer transition-all ${
                  authView === 'register' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-800'
                }`}
              >
                Enroll New Member
              </button>
              <button 
                onClick={() => {
                  setAuthView('reset');
                  setErrors('');
                  setSuccessMsg('');
                  setResetStep(1);
                  playSound();
                }}
                className={`py-1 px-3 border-b-2 font-bold cursor-pointer transition-all ${
                  authView === 'reset' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-800'
                }`}
              >
                Reset Clearance Pass
              </button>
            </div>

            {/* Error notifications */}
            {errors && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-mono leading-normal flex items-start gap-1.5 animate-bounce">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{errors}</span>
              </div>
            )}

            {/* Success notifications */}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded font-mono leading-normal flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FORM VIEW 1: LOGIN CARD */}
            {authView === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-center">
                  <h3 className="font-serif font-bold text-lg text-slate-900 flex justify-center items-center gap-1.5">
                    <UserCheck className="w-5 h-5 text-blue-900" />
                    Secure Credentials Gateway Check
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal text-slate-500">Provide official login credentials or registered email markers to seal your active session.</p>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Identity */}
                  <div className="space-y-1">
                    <label htmlFor="login-username" className="font-bold text-slate-700 block">Username / Assigned Email</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-username"
                        type="text"
                        placeholder="E.g., admin, analyst@compliance.gov..."
                        className="pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full"
                        value={loginUser}
                        onChange={(e) => setLoginUser(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Secret checking passcode */}
                  <div className="space-y-1">
                    <label htmlFor="login-pass" className="font-bold text-slate-700 block">Clearance Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-pass"
                        type="password"
                        placeholder="Enter secure clearance check passcode..."
                        className="pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Security Captcha verification code */}
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                    <label htmlFor="captcha-input" className="font-bold text-slate-700 block flex justify-between">
                      <span>Anti-Scraping Security Captcha Value</span>
                      <button 
                        type="button" 
                        onClick={regenerateCaptcha}
                        className="text-[10px] text-blue-900 underline hover:text-blue-950 font-bold"
                      >
                        Refresh Code
                      </button>
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 rounded text-base font-bold font-mono tracking-widest text-slate-600 select-none cursor-no-drop">
                        {captchaValue}
                      </div>
                      <input
                        id="captcha-input"
                        type="text"
                        maxLength={4}
                        placeholder="Verify code numbers..."
                        className="p-2 border border-slate-300 rounded text-center font-mono font-bold uppercase tracking-wider focus:ring-2 focus:ring-blue-900 w-full"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded font-mono text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>SECURELY HANDSHAKE LOG-IN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[11px] font-mono p-2 bg-slate-50 rounded border text-slate-500 leading-normal">
                  💡 <strong>Demo Profile Checks</strong>:
                  <div className="mt-1 pl-2 border-l-2 border-slate-300 space-y-0.5">
                    <div>User: <strong className="text-blue-950">admin</strong> &bull; password: <strong className="text-blue-950">Admin508@Secure</strong></div>
                    <div>User: <strong className="text-blue-950">auditor</strong> &bull; password: <strong className="text-blue-950">Auditor508@Gate</strong></div>
                  </div>
                </div>
              </form>
            )}

            {/* FORM VIEW 2: REGISTRATION ENROLLMENT */}
            {authView === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="text-center">
                  <h3 className="font-serif font-bold text-lg text-slate-900 flex justify-center items-center gap-1.5">
                    <UserPlus className="w-5 h-5 text-blue-900" />
                    Federal Clearance Register Enrollment
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">Register your personal citizen profile and request a local role-based access clearance token.</p>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Name */}
                  <div className="space-y-1">
                    <label htmlFor="reg-name" className="font-bold text-slate-700 block">Requested Identity Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-name"
                        type="text"
                        placeholder="Alphanumeric, e.g. sam_compliance..."
                        className="pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full"
                        value={regUser}
                        onChange={(e) => setRegUser(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Mail */}
                  <div className="space-y-1">
                    <label htmlFor="reg-mail" className="font-bold text-slate-700 block">Official Citizen Email Contact</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-mail"
                        type="email"
                        placeholder="E.g. sam@citizens.gov..."
                        className="pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Choose clearance level role */}
                  <div className="space-y-1">
                    <label htmlFor="reg-level" className="font-bold text-slate-700 block">Requested Clearance Credentials Tier</label>
                    <select
                      id="reg-level"
                      className="p-2 border border-slate-300 rounded font-sans focus:ring-2 focus:ring-blue-900 w-full bg-white text-slate-800"
                      value={regClearance}
                      onChange={(e) => setRegClearance(e.target.value as any)}
                    >
                      <option value="CITIZEN">Tier 1: CITIZEN (Read registries &amp; lodge files)</option>
                      <option value="CIVIL_ANALYST">Tier 2: CIVIL ANALYST (View analytics &amp; audit charts)</option>
                      <option value="REGISTRY_AUDITOR">Tier 3: REGISTRY AUDITOR (Generate log systems)</option>
                      <option value="SYSTEM_ADMIN">Tier 4: SYSTEM ADMIN (Toggle master parameters &amp; bypasses)</option>
                    </select>
                  </div>

                  {/* Password pass code validation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="reg-p" className="font-bold text-slate-700 block">Clearance password</label>
                      <input
                        id="reg-p"
                        type="password"
                        placeholder="Length 8+, uppercase, digits..."
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full"
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="reg-p-c" className="font-bold text-slate-700 block">Confirm password</label>
                      <input
                        id="reg-p-c"
                        type="password"
                        placeholder="Re-type password..."
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full"
                        value={regPassConfirm}
                        onChange={(e) => setRegPassConfirm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Security checks recovery details */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="reg-quest" className="font-bold text-slate-700 block">MFA security recovery question</label>
                      <select
                        id="reg-quest"
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full bg-white text-slate-800"
                        value={securityQuest}
                        onChange={(e) => setSecurityQuest(e.target.value)}
                      >
                        <option value="first_pet">First authorized pet name?</option>
                        <option value="birth_city">Civil state of birth city?</option>
                        <option value="first_school">Primary school of childhood?</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="reg-ans" className="font-bold text-slate-700 block">Recovery question answer</label>
                      <input
                        id="reg-ans"
                        type="text"
                        placeholder="Answer word..."
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full"
                        value={securityAns}
                        onChange={(e) => setSecurityAns(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded font-mono text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>ENROLL WITH FEDERAL LEDGER</span>
                  </button>
                </div>
              </form>
            )}

            {/* FORM VIEW 3: PASSWORD RECOVERY SYSTEM */}
            {authView === 'reset' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-serif font-bold text-lg text-slate-900 flex justify-center items-center gap-1.5">
                    <Key className="w-5 h-5 text-blue-900" />
                    MFA Credentials Recovery Desk
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">Recover your access key with security query validations followed by an interactive OTP token sequence.</p>
                </div>

                {/* Reset Step 1: Input Account Name and Validation Answer */}
                {resetStep === 1 && (
                  <form onSubmit={handleResetStep1} className="space-y-4 text-xs font-mono">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label htmlFor="reset-user" className="font-bold text-slate-700 font-sans block text-xs">Verify Account Username / Email</label>
                        <input
                          id="reset-user"
                          type="text"
                          placeholder="Provide registered identifier name..."
                          className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full font-sans text-xs"
                          value={resetUser}
                          onChange={(e) => setResetUser(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="reset-question-select" className="font-bold text-slate-700 font-sans block text-xs">MFA security question query type</label>
                        <select 
                          id="reset-question-select"
                          className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full bg-white text-slate-800 font-sans text-xs"
                        >
                          <option>First authorized pet name? (E.g. Spot for admin)</option>
                          <option>Civil state of birth city? (E.g. Washington for auditor)</option>
                          <option>Primary school of childhood?</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="reset-answer-input" className="font-bold text-slate-700 font-sans block text-xs">Your Security Recovery Question Answer</label>
                        <input
                          id="reset-answer-input"
                          type="text"
                          placeholder="Your security question word answer..."
                          className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full font-sans text-xs"
                          value={resetAnswer}
                          onChange={(e) => setResetAnswer(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-bold font-mono tracking-wider uppercase transition mt-2 cursor-pointer"
                    >
                      AUTHENTICATE SECURITY ANSWER
                    </button>
                  </form>
                )}

                {/* Reset Step 2: Simulated OTP check input */}
                {resetStep === 2 && (
                  <form onSubmit={handleResetStep2} className="space-y-4 text-xs">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 flex items-start gap-1 p text-[11px] font-mono leading-relaxed">
                      <AlertOctagon className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <strong>SECURE SMS DISPATCH SIMULATED:</strong>
                        <span> An automated one-time MFA authorization token was securely dispatched to compliance logs. Check the <strong>Live Registry Activity Feed</strong> on the dashboard to review the code!</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-center">
                      <label htmlFor="otp-verify-input" className="font-bold text-slate-700 block font-sans text-xs">Enter 6-Digit SMS / OTP auth Token</label>
                      <input
                        id="otp-verify-input"
                        type="text"
                        maxLength={6}
                        placeholder="Ex: 554312..."
                        className="p-2 border-2 border-dashed border-slate-300 rounded text-center font-mono font-bold text-base tracking-widest focus:ring-2 focus:ring-blue-900 w-44"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-bold font-mono tracking-wider uppercase transition cursor-pointer"
                    >
                      HANDSHAKE CODE
                    </button>
                  </form>
                )}

                {/* Reset Step 3: Input Fresh Password */}
                {resetStep === 3 && (
                  <form onSubmit={handleResetStep3} className="space-y-3 text-xs">
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label htmlFor="reset-new-p" className="font-bold text-slate-700 block text-xs">Fresh secure check password</label>
                        <input
                          id="reset-new-p"
                          type="password"
                          placeholder="Must contain capital, lower, numbers, symbol..."
                          className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full text-xs"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="reset-new-p-c" className="font-bold text-slate-700 block text-xs">Confirm fresh check password</label>
                        <input
                          id="reset-new-p-c"
                          type="password"
                          placeholder="Re-type new password..."
                          className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 w-full text-xs"
                          value={newPassConfirm}
                          onChange={(e) => setNewPassConfirm(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-bold font-mono tracking-wider uppercase transition cursor-pointer"
                    >
                      COMMIT NEW CLEARANCE PASSWORD
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
