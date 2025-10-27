import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { JSX, useState } from "react";
import AuthorizeGoogle from "./(google-gmail-authorization)/AuthorizeGoogle";
import { userQueries } from "@/lib/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { useUpdateUserMutation } from "@/lib/mutations/user.mutations";
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

interface SwitchStates {
  [key: string]: boolean;
}

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
  const updateUser = useUpdateUserMutation();
  const { data: user } = useQuery(userQueries.detail());

  const settings: Setting[] = [
    {
      section: "Auto Apply Configuration",
      subTitle: "Configure how Cver AI applies to jobs on your behalf.",
      options: [
        {
          label: "Enable Auto Apply",
          description: "Allow AI to automatically apply to matching jobs",
          type: "toggle",
          key: "enableAutoApply",
        },
      ],
    },
    {
      section: "Email Integration",
      subTitle: "Connect your Gmail account for email-based job applications",
      img: "/email.svg",
      options: [
        {
          label: "Gmail Connected",
          description: `Connected: ${user?.email}`,
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
          key: "useMasterCV",
        },
        {
          label: "Generate Tailored CV",
          description: "Let Cver customize your CV for each job applications",
          type: "toggle",
          key: "generateTailoredCV",
        },
      ],
    },
    {
      section: "Form Filing Method",
      options: [
        {
          label: "Review Before Submit",
          description:
            "AI fills forms but waits for your approval before submitting",
          type: "toggle",
          key: "reviewBeforeSubmit",
        },
        {
          label: "Auto Submit",
          description:
            "AI automatically submits applications after filing forms",
          type: "toggle",
          key: "autoSubmit",
        },
      ],
    },
    {
      section: "Handling Unknown Questions",
      options: [
        {
          label: "Intelligent Answers",
          description:
            "AI provides smart answers for questions outside its knowledge base",
          type: "toggle",
          key: "intelligentAnswers",
        },
        {
          label: "Pause for Input",
          description:
            "AI pauses and requests your input for unknown questions",
          type: "toggle",
          key: "pauseForInput",
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
          actions: ["Disconnect", "Edit"],
        },
      ],
    },
    {
      child: true,
      options: [
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
    const initialState: SwitchStates = {};
    Object.entries(user?.aiApplyPreferences ?? {}).forEach(([key, value]) => {
      if (key && typeof value === "boolean") {
        initialState[key] = value;
      }
    });
    // settings.forEach((setting: Setting) => {
    //   setting.options?.forEach((option: SettingOption) => {
    //     if (option.type === "toggle" && option.key) {
    //       initialState[option.key] = false; // Default to false, you can set custom defaults
    //     }
    //   });
    // });

    return initialState;
  });

  // Handle switch state changes
  const handleSwitchChange = async (key: string, checked: boolean) => {
    setSwitchStates((prev: SwitchStates) => {
      const newState = {
        ...prev,
        [key]: checked,
      };

      // Ensure autoSendApplications and saveAsDrafts are always opposite
      if (key === "autoSendApplications") {
        newState.saveAsDrafts = !checked;
      } else if (key === "saveAsDrafts") {
        newState.autoSendApplications = !checked;
      }

      if (key === "pauseForInput") {
        newState.intelligentAnswers = !checked;
      } else if (key === "intelligentAnswers") {
        newState.pauseForInput = !checked;
      }

      if (key === "autoSubmit") {
        newState.reviewBeforeSubmit = !checked;
      } else if (key === "reviewBeforeSubmit") {
        newState.autoSubmit = !checked;
      }
      if (key === "generateTailoredCV") {
        newState.useMasterCV = !checked;
      } else if (key === "useMasterCV") {
        newState.generateTailoredCV = !checked;
      }

      return newState;
    });

    // Optional: Add your custom logic here
    try {
      const userAIApplyPreferences = {
        aiApplyPreferences: switchStates,
      };
      await updateUser.mutateAsync({ data: userAIApplyPreferences });
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
            index % 2 != 0 ? "bg-blue-500 text-white" : "text-blue-500"
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
  const getSwitchState = (key: string): boolean => {
    return switchStates[key] || false;
  };

  return (
    <div className="">
      <div className="space-y-6 font-inter">
        {settings.map((setting: Setting, settingIndex: number) => (
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
              <p className="text-gray-600 text-md mb-4">{setting.subTitle}</p>
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
                          checked={getSwitchState(option.key)}
                          onCheckedChange={(checked: boolean) =>
                            handleSwitchChange(option.key!, checked)
                          }
                        />
                      ) : option.type === "buttons" && option.actions ? (
                        renderButtons(option.actions)
                      ) : option.type === "custom" && option.actions ? (
                        <div>
                          <div className="flex gap-2">
                            <AuthorizeGoogle />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      {/* <div className="mt-6 flex gap-4 ml-auto w-fit">
        <Button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={saveSettings}
        >
          Save Settings
        </Button>
      </div> */}
    </div>
  );
};
