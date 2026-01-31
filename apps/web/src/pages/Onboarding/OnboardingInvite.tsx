import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Copy } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Jane Cooper",
    email: "jane.cooper@example.com",
    role: "Owner",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: "2",
    name: "Robert Fox",
    email: "robert.fox@example.com",
    role: "Can view",
    avatar: "https://i.pravatar.cc/150?img=2"
  },
  {
    id: "3",
    name: "Kathryn Murphy",
    email: "kathryn.murphy@example.com",
    role: "Admin",
    avatar: "https://i.pravatar.cc/150?img=3"
  },
  {
    id: "4",
    name: "Jenny Wilson",
    email: "jenny.wilson@example.com",
    role: "Can view",
    avatar: "https://i.pravatar.cc/150?img=4"
  }
];

export default function OnboardingInvite() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [members] = useState<TeamMember[]>(initialMembers);
  const shareLink = "https://shareprojectidkename.com/3453453g6353";

  const handleSendInvite = () => {
    if (email) {
      // Sending invite
      setEmail("");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <OnboardingLayout currentStep={4} totalSteps={5}>
      <div className="flex-1 max-w-2xl">
        <h1 className="text-4xl font-bold text-foreground mb-12">
          Invite member
        </h1>

        <div className="space-y-8">
          {/* Champ d'email */}
          <div>
            <Input
              type="email"
              placeholder="Enter a email of member who'll invite"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-base"
            />
          </div>

          {/* Carte d'invitation */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Invite Team Member</h3>
              <button className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Everyone at project can access this file.
            </p>

            <div className="flex gap-3 mb-6">
              <Input
                type="email"
                placeholder="contact@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSendInvite}>
                Send Invite
              </Button>
            </div>

            {/* Liste des membres */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-muted-foreground">Project Members</h4>
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{member.role}</div>
                </div>
              ))}
            </div>

            {/* Lien de partage */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Link to share</h4>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons
        onBack={() => navigate("/onboarding/alerts")}
        onContinue={() => navigate("/onboarding/setup")}
        onSkip={() => navigate("/onboarding/setup")}
      />
    </OnboardingLayout>
  );
}