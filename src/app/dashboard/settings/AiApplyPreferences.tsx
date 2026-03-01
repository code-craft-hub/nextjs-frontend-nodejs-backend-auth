import { cn } from "@/lib/utils";
import { JSX, useState } from "react";
import AuthorizeGoogle from "../../../hooks/gmail/AuthorizeGoogle";
import { userQueries } from "@module/user";
import { aiSettingsQueries } from "@/lib/queries/ai-settings.queries";
import { useQuery } from "@tanstack/react-query";
import { useUpdateAISettingsMutation } from "@/lib/mutations/ai-settings.mutations";
interface SettingOption {
  label: string;
  description: string;
  type: "toggle" | "buttons" | "custom";
  key?: string;
  actions?: string[];
}

interface Setting {
  section?: string;
  subTitle?: string;
  img?: string;
  heading?: boolean;
  child?: boolean;
  options: SettingOption[];
}

type AiApplyPreferences =
  | "autoApplyEnabled"
  | "autoSendApplications"
  | "enableWhatsAppApplications"
  | "saveAsDrafts"
  | "generateTailoredCv"
  | "useMasterCv";

type SwitchStates = {
  [key in AiApplyPreferences]: boolean;
};

interface SwitchProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

interface LabelProps {
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}

const Switch: React.FC<SwitchProps> = ({ id, checked, onCheckedChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="sr-only"
      id={id}
    />
    <div
      className={`w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        } mt-0.5`}
      />
    </div>
  </label>
);

// Mock Label component
const Label: React.FC<LabelProps> = ({ htmlFor, className = "", children }) => (
  <label htmlFor={htmlFor} className={className}>
    {children}
  </label>
);

export const AiApplyPreferences: React.FC = () => {
  const updateSettings = useUpdateAISettingsMutation();
  const { data: user } = useQuery(userQueries.detail());
  const { data: settings } = useQuery(aiSettingsQueries.detail());


  const [oauthState, setOauthState] = useState(false);

  const checkAuth = async (value: boolean ): Promise<void> => {
    console.log("OAuth state updated:", value);
    setOauthState(value);
  };

  const settingsConfig: Setting[] = [
    {
      section: "Auto Apply Configuration",
      subTitle: "Configure how Cver AI applies to jobs on your behalf.",
      options: [
        {
          label: "Enable Auto Apply",
          description: "Allow AI to automatically apply to matching jobs",
          type: "toggle",
          key: "autoApplyEnabled",
        },
      ],
    },
    {
      section: "Email Integration",
      subTitle: `Connect your Gmail account for email-based job applications `,
      img: "/email.svg",
      options: [
        {
          label: `Gmail ${oauthState ? "Connected" : "Not Connected"} `,
          description: `${
            oauthState ? "Connected : " : "Your Gmail is not connected:"
          } ${user?.email}`,
          type: "custom",
          actions: ["Disconnect", "Edit"],
        },
      ],
    },
    {
      section: "CV Strategy",
      heading: true,
      options: [
        {
          label: "Use Master CV",
          description: "Use your original uploaded CV for all applications",
          type: "toggle",
          key: "useMasterCv",
        },
        {
          label: "Generate Tailored CV",
          description: "Let Cver customize your CV for each job applications",
          type: "toggle",
          key: "generateTailoredCv",
        },
      ],
    },
    {
      child: true,
      options: [
        {
          label: "Auto-send Applications",
          description: "Automatically send applications via email",
          type: "toggle",
          key: "autoSendApplications",
        },
        {
          label: "Save as Drafts",
          description: "Save applications as drafts for review",
          type: "toggle",
          key: "saveAsDrafts",
        },
      ],
    },

    {
      section: "WhatsApp Integration",
      img: "/message.svg",
      subTitle:
        "Connect your WhatsApp for job applications outside the platform",
      options: [
        {
          label: "WhatsApp Connection",
          description: `Connected: ${user?.phoneNumber || "Not Connected"}`,
          type: "buttons",
          // actions: ["Disconnect", "Edit"],
        },
        {
          label: "Enable WhatsApp Applications",
          description: "Allow applications via WhatsApp",
          type: "toggle",
          key: "enableWhatsAppApplications",
        },
      ],
    },
  ];

  // Initialize state for all toggle switches
  const [switchStates, setSwitchStates] = useState<SwitchStates>(() => {
    const initialState: SwitchStates = {
      autoApplyEnabled: false,
      autoSendApplications: false,
      enableWhatsAppApplications: false,
      saveAsDrafts: false,
      generateTailoredCv: false,
      useMasterCv: false,
    };
    Object.entries(settings ?? {}).forEach(([key, value]) => {
      if (key && typeof value === "boolean") {
        initialState[key as keyof SwitchStates] = value;
      }
    });

    return initialState;
  });

  // Handle switch state changes
  const handleSwitchChange = async (key: string, checked: boolean) => {
    const newState = (prev: SwitchStates) => {
      const updated = {
        ...prev,
        [key]: checked,
      };

      // Ensure autoSendApplications and saveAsDrafts are always opposite
      if (key === "autoSendApplications") {
        updated.saveAsDrafts = !checked;
      } else if (key === "saveAsDrafts") {
        updated.autoSendApplications = !checked;
      }

      // if (key === "pauseForInput") {
      //   updated.intelligentAnswers = !checked;
      // } else if (key === "intelligentAnswers") {
      //   updated.pauseForInput = !checked;
      // }

      // if (key === "autoSubmit") {
      //   updated.reviewBeforeSubmit = !checked;
      // } else if (key === "reviewBeforeSubmit") {
      //   updated.autoSubmit = !checked;
      // }
      if (key === "generateTailoredCv") {
        updated.useMasterCv = !checked;
      } else if (key === "useMasterCv") {
        updated.generateTailoredCv = !checked;
      }

      return updated;
    };

    setSwitchStates(newState);

    try {
      await updateSettings.mutateAsync(newState(switchStates));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  // Handle button clicks
  const handleButtonClick = (_action: string): void => {};

  // const saveSettings = async (): Promise<void> => {};

  // Render button actions
  const renderButtons = (actions: string[]): JSX.Element => (
    <div className="flex gap-2">
      {actions.map((action: string, index: number) => (
        <button
          key={index}
          className={cn(
            "p-2 border border-blue-300 rounded-lg text-3xs transition-colors",
            index % 2 != 0 ? "bg-blue-500 text-white" : "text-blue-500",
          )}
          onClick={() => handleButtonClick(action)}
          style={{
            boxShadow: `
      0 0 0 1px rgba(158, 203, 251, 0.3),
      0 2px 4px rgba(158, 203, 251, 0.1),
      0 4px 8px rgba(158, 203, 251, 0.1)
    `,
          }}
        >
          {action}
        </button>
      ))}
    </div>
  );

  // Get switch state safely
  const getSwitchState = (key: AiApplyPreferences): boolean => {
    return switchStates[key] || false;
  };

  return (
    <div className="">
      <div className="space-y-6 font-inter">
        {settingsConfig.map((setting: Setting, settingIndex: number) => (
          <div
            key={setting.section || `child-${settingIndex}`}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border"
          >
            {!setting.child && setting.section && (
              <div className="flex items-center gap-3 mb-2">
                {setting.img && <img src={setting.img} alt={setting.section} />}
                <h2 className="text-md font-medium ">{setting.section}</h2>
              </div>
            )}
            {setting.subTitle && (
              <div className="mb-4">
                <p className="text-gray-600 text-md">{setting.subTitle}</p>
                {settingIndex === 1 && (
                  <p className="text-2xs text-gray-400 mt-1 max-w-xl">
                    &ldquo;We are still in the process of verifying our Gmail
                    integration, so you will get a message saying &ldquo;Google
                    hasn&apos;t verified this app&ldquo; Please click on
                    &ldquo;Advance&ldquo; and continue to give access of sending
                    emails to Cver AI&ldquo;
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              {setting.options?.map(
                (option: SettingOption, optionIndex: number) => (
                  <div
                    key={`${option.label}-${optionIndex}`}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <Label
                        htmlFor={option.key || option.label}
                        className="font-medium text-base block"
                      >
                        {option.label}
                      </Label>
                      <p className="text-gray-600 text-sm mt-1">
                        {option.description}
                      </p>
                    </div>

                    <div>
                      {option.type === "toggle" && option.key ? (
                        <Switch
                          id={option.key}
                          checked={getSwitchState(
                            option.key as AiApplyPreferences,
                          )}
                          onCheckedChange={(checked: boolean) =>
                            handleSwitchChange(option.key!, checked)
                          }
                        />
                      ) : option.type === "buttons" && option.actions ? (
                        renderButtons(option.actions)
                      ) : option.type === "custom" && option.actions ? (
                        <div>
                          <div className="flex gap-2">
                            <AuthorizeGoogle checkAuth={checkAuth} />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
