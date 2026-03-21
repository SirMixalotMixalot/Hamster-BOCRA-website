import { User as UserIcon } from "lucide-react";

const Profile = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <UserIcon className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">Profile details will appear here</p>
      </div>
    </div>
  );
};

export default Profile;
