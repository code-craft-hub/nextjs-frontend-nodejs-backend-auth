import { cn } from "@/lib/utils";
import { JSX, useState } from "react";
import AuthorizeGoogle from "@/features/email-application/hooks/AuthorizeGoogle";
import { userQueries } from "@features/user";
import { aiSettingsQueries } from "@/features/ai-settings/queries/ai-settings.queries";
import { useQuery } from "@tanstack/react-query";
import { useUpdateAISettingsMutation } from "@/features/ai-settings/mutations/ai-settings.mutations";
import { Switch, Label } from "./Switch";
// import { AutoSendConfigPanel, AutoSendConfig } from "./AutoSendConfigPanel";
// import { autoApplyQueries, useTriggerAutoApplyMutation } from "@/features/auto-apply";

// ─── Tier daily application caps (mirrors server TIER_DAILY_LIMITS) ───────────
// const TIER_DAILY_LIMITS: Record<string, number> = {
//   free: 0,
//   basic: 1,
//   starter: 3,
//   pro: 5,
//   professional: 5,
//   enterprise: 10,
//   custom: 10,
// };
// const DEFAULT_TIER_LIMIT = 1;

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

export const AiApplyPreferences: React.FC = () => {
  const updateSettings = useUpdateAISettingsMutation();
  const { data: user } = useQuery(userQueries.detail());
  const { data: settings } = useQuery(aiSettingsQueries.detail());
  // const { data: quotaData } = useQuery(autoApplyQueries.quota());
  // const triggerAutoApply = useTriggerAutoApplyMutation();
  // const [triggerMessage, setTriggerMessage] = useState<string | null>(null);

  // const quota = quotaData?.data;

  // const accountTier = user?.accountTier ?? "basic";
  // const tierCap = TIER_DAILY_LIMITS[accountTier] ?? DEFAULT_TIER_LIMIT;

  const [oauthState, setOauthState] = useState(false);

  // ── Auto-send configuration state ────────────────────────────────────────
  // const [autoSendConfig, setAutoSendConfig] = useState<AutoSendConfig>(() => ({
  //   maxApplicationsPerDay: Math.min(settings?.maxApplicationsPerDay ?? tierCap, tierCap),
  //   minMatchScore: settings?.minMatchScore ?? 70,
  //   preferredJobTypes: (settings?.preferredJobTypes as string[]) ?? [],
  //   excludedCompanies: (settings?.excludedCompanies as string[]) ?? [],
  // }));

  // Sync when settings load from the server
  // useEffect(() => {
  //   if (!settings) return;
  //   setAutoSendConfig({
  //     maxApplicationsPerDay: Math.min(settings.maxApplicationsPerDay ?? tierCap, tierCap),
  //     minMatchScore: settings.minMatchScore ?? 70,
  //     preferredJobTypes: (settings.preferredJobTypes as string[]) ?? [],
  //     excludedCompanies: (settings.excludedCompanies as string[]) ?? [],
  //   });
  // }, [settings]);

  // const saveAutoSendConfig = async (patch: Partial<AutoSendConfig>) => {
  //   try {
  //     await updateSettings.mutateAsync(patch);
  //   } catch (error) {
  //     console.error("Error saving auto-send config:", error);
  //   }
  // };

  const checkAuth = async (value: boolean): Promise<void> => {
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
          description: `${oauthState ? "Connected : " : "Your Gmail is not connected:"} ${user?.email}`,
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
      ],
    },
    {
      section: "WhatsApp Integration",
      img: "/message.svg",
      subTitle: "Connect your WhatsApp for job applications outside the platform",
      options: [
        {
          label: "WhatsApp Connection",
          description: `Connected: ${user?.phoneNumber || "Not Connected"}`,
          type: "buttons",
        },
        {
          label: "Enable WhatsApp Recommendation & Applications",
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
      const updated = { ...prev, [key]: checked };

      if (key === "autoSendApplications") {
        updated.saveAsDrafts = !checked;
      } else if (key === "saveAsDrafts") {
        updated.autoSendApplications = !checked;
      }

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

  // const handleTriggerNow = async () => {
  //   setTriggerMessage(null);
  //   try {
  //     const result = await triggerAutoApply.mutateAsync();
  //     setTriggerMessage(result.data.message);
  //   } catch {
  //     setTriggerMessage("Failed to trigger auto-apply. Please try again.");
  //   }
  // };

  // Handle button clicks
  const handleButtonClick = (_action: string): void => {};

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

  const getSwitchState = (key: AiApplyPreferences): boolean => switchStates[key] || false;

  return (
    <div className="">
      <div className="space-y-6 font-inter">
        {settingsConfig.map((setting: Setting, settingIndex: number) => (
          <div
            key={setting.section || `child-${settingIndex}`}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border"
          >
            {setting.section && (
              <div className="flex items-center gap-3 mb-2">
                {setting.img && <img src={setting.img} alt={setting.section} />}
                <h2 className="text-md font-medium ">{setting.section}</h2>
              </div>
            )}
            {setting.subTitle && (
              <div className="mb-4">
                <p className="text-gray-600 text-md">{setting.subTitle}</p>
              </div>
            )}

            <div className="space-y-4">
              {setting.options?.map((option: SettingOption, optionIndex: number) => (
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
                    <p className="text-gray-600 text-sm mt-1">{option.description}</p>
                  </div>

                  <div>
                    {option.type === "toggle" && option.key ? (
                      <Switch
                        id={option.key}
                        checked={getSwitchState(option.key as AiApplyPreferences)}
                        onCheckedChange={(checked: boolean) =>
                          handleSwitchChange(option.key!, checked)
                        }
                      />
                    ) : option.type === "buttons" && option.actions ? (
                      renderButtons(option.actions)
                    ) : option.type === "custom" && option.actions ? (
                      <div id="gmail-authorize-toggle">
                        <div className="flex gap-2">
                          <AuthorizeGoogle checkAuth={checkAuth} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {setting.section === "Auto Apply Configuration" && switchStates.autoApplyEnabled && (
                <>
                  {/* <AutoSendConfigPanel
                    accountTier={accountTier}
                    tierCap={tierCap}
                    config={autoSendConfig}
                    onConfigChange={(patch) =>
                      setAutoSendConfig((prev) => ({ ...prev, ...patch }))
                    }
                    onSave={saveAutoSendConfig}
                  /> */}

                  {/* ── Quota status & manual trigger ─────────────────── */}
                  {/* <div className="mt-4 pt-4 border-t flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">Today's usage</p>
                      {quota ? (
                        <p className="text-gray-500 text-sm mt-0.5">
                          {quota.usedToday} / {quota.effectiveLimit} applications used
                          {quota.remaining > 0 && (
                            <span className="ml-1 text-green-600">
                              ({quota.remaining} remaining)
                            </span>
                          )}
                          {quota.remaining === 0 && (
                            <span className="ml-1 text-orange-500">(limit reached)</span>
                          )}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm mt-0.5">Loading quota…</p>
                      )}
                      {triggerMessage && (
                        <p className="text-sm mt-1 text-blue-600">{triggerMessage}</p>
                      )}
                    </div>
                    <button
                      onClick={handleTriggerNow}
                      disabled={
                        triggerAutoApply.isPending ||
                        !quota ||
                        quota.remaining === 0
                      }
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                        quota && quota.remaining > 0
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed",
                      )}
                    >
                      {triggerAutoApply.isPending ? "Running…" : "Run Now"}
                    </button>
                  </div> */}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
