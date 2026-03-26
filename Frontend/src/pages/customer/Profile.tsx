import { useState, useRef, useEffect } from "react";
import { User as UserIcon, Camera, Loader2, Lock, Bell, Mail, MessageSquare, Pencil } from "lucide-react";
import { getCachedMe, getMe } from "@/lib/auth";

const inputBase =
  "w-full px-5 py-2.5 rounded-full border text-sm focus:outline-none transition-all duration-200";
const inputEnabled =
  `${inputBase} border-[hsl(215_20%_50%/0.25)] bg-[hsl(215_25%_15%/0.06)] text-foreground placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/25 focus:border-primary focus:shadow-[0_0_0_3px_hsl(210_85%_50%/0.1)]`;
const inputDisabled =
  `${inputBase} border-[hsl(215_20%_50%/0.15)] bg-[hsl(215_25%_15%/0.03)] text-foreground/70 cursor-default`;

const cardClasses = "glass rounded-2xl p-6";

const Profile = () => {
  // Loading
  const [loading, setLoading] = useState(true);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Personal details
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Address
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [country] = useState("Botswana");
  const [postalCode, setPostalCode] = useState("");

  const applyProfile = (me: Awaited<ReturnType<typeof getMe>>) => {
    setFullName(me.profile.full_name || "");
    setEmail(me.user.email || "");
    setGender(me.profile.gender || "");
    setDob(me.profile.date_of_birth || "");
    setPhone(me.profile.phone || "");
    setStreet(me.profile.address || "");
    setPhotoUrl(me.profile.profile_photo_url || null);
  };

  // Fetch profile data on mount
  useEffect(() => {
    const cachedMe = getCachedMe();
    if (cachedMe) {
      applyProfile(cachedMe);
      setLoading(false);
    }

    getMe()
      .then((me) => {
        applyProfile(me);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Collapsible sections
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const passwordRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  // Photo
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Close collapsible sections on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (passwordOpen && passwordRef.current && !passwordRef.current.contains(e.target as Node)) {
        setPasswordOpen(false);
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [passwordOpen, notifOpen]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setEditing(false);
    }, 800);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoUrl(URL.createObjectURL(file));
  };

  const inputCls = editing ? inputEnabled : inputDisabled;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <h2 className="text-3xl font-heading font-bold text-foreground text-center">Profile</h2>

      {/* Personal Details + Address Card */}
      <div className={cardClasses}>
        {/* Photo + Edit Button Row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1" />
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-white/60 border-2 border-white/80 flex items-center justify-center overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-10 w-10 text-muted-foreground/40" />
                )}
              </div>
              {editing && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <p className="mt-3 text-base font-semibold text-foreground">{fullName}</p>
          </div>
          <div className="flex-1 flex justify-end">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Personal Details */}
        <div className="space-y-4 pb-6 mb-6 border-b border-white/40">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Personal Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!editing} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">ID Number (Omang)</label>
              <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} disabled={!editing} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Gender</label>
              {editing ? (
                <div className="flex gap-2">
                  {["Male", "Female", "Other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        gender === g
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              ) : (
                <input type="text" value={gender} disabled className={inputDisabled} />
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} disabled={!editing} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input type="email" value={email} disabled className={`${inputBase} border-white/60 bg-white/30 text-foreground/60 cursor-not-allowed`} />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Address Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Street Address</label>
              <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} disabled={!editing} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">City / Town</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} disabled={!editing} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">District</label>
              <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!editing} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Country</label>
              <input type="text" value={country} disabled className={`${inputBase} border-white/60 bg-white/30 text-foreground/60 cursor-not-allowed`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Postal Code</label>
              <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} disabled={!editing} className={inputCls} />
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Card */}
      <div className={cardClasses}>
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">Account Settings</p>

        {/* Change Password — collapsible */}
        <div ref={passwordRef} className="mb-3">
          <button
            onClick={() => { setPasswordOpen(!passwordOpen); setNotifOpen(false); }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              passwordOpen
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            Change Password
          </button>
          <div
            className="grid transition-all duration-300 ease-in-out"
            style={{ gridTemplateRows: passwordOpen ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-foreground">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className={inputEnabled} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className={inputEnabled} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className={inputEnabled} />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSavingPassword(true);
                    setTimeout(() => {
                      setSavingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordOpen(false);
                    }, 800);
                  }}
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences — collapsible */}
        <div ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setPasswordOpen(false); }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              notifOpen
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            Notification Preferences
          </button>
          <div
            className="grid transition-all duration-300 ease-in-out"
            style={{ gridTemplateRows: notifOpen ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setEmailNotif(!emailNotif)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    emailNotif
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email Notifications
                </button>
                <button
                  type="button"
                  onClick={() => setSmsNotif(!smsNotif)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    smsNotif
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  SMS Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
