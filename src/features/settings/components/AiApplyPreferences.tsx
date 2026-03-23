import { cn } from "@/lib/utils";
import { JSX, useEffect, useRef, useState } from "react";
import AuthorizeGoogle from "@/features/email-application/hooks/AuthorizeGoogle";
import { userQueries } from "@features/user";
import { aiSettingsQueries } from "@/features/ai-settings/queries/ai-settings.queries";
import { useQuery } from "@tanstack/react-query";
import { useUpdateAISettingsMutation } from "@/features/ai-settings/mutations/ai-settings.mutations";

// ─── Tier daily application caps (mirrors server TIER_DAILY_LIMITS) ───────────
const TIER_DAILY_LIMITS: Record<string, number> = {
  free: 0,
  basic: 1,
  starter: 3,
  pro: 5,
  professional: 5,
  enterprise: 10,
  custom: 10,
};
const DEFAULT_TIER_LIMIT = 1;

const JOB_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];
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

interface AutoSendConfig {
  maxApplicationsPerDay: number;
  minMatchScore: number;
  preferredJobTypes: string[];
  excludedCompanies: string[];
}

export const AiApplyPreferences: React.FC = () => {
  const updateSettings = useUpdateAISettingsMutation();
  const { data: user } = useQuery(userQueries.detail());
  const { data: settings } = useQuery(aiSettingsQueries.detail());

  const accountTier = user?.accountTier ?? "basic";
  const tierCap = TIER_DAILY_LIMITS[accountTier] ?? DEFAULT_TIER_LIMIT;

  const [oauthState, setOauthState] = useState(false);

  // ── Auto-send configuration state ────────────────────────────────────────
  const [autoSendConfig, setAutoSendConfig] = useState<AutoSendConfig>(() => ({
    maxApplicationsPerDay: Math.min(
      settings?.maxApplicationsPerDay ?? tierCap,
      tierCap,
    ),
    minMatchScore: settings?.minMatchScore ?? 70,
    preferredJobTypes: (settings?.preferredJobTypes as string[]) ?? [],
    excludedCompanies: (settings?.excludedCompanies as string[]) ?? [],
  }));

  // Sync when settings load from the server
  useEffect(() => {
    if (!settings) return;
    setAutoSendConfig({
      maxApplicationsPerDay: Math.min(
        settings.maxApplicationsPerDay ?? tierCap,
        tierCap,
      ),
      minMatchScore: settings.minMatchScore ?? 70,
      preferredJobTypes: (settings.preferredJobTypes as string[]) ?? [],
      excludedCompanies: (settings.excludedCompanies as string[]) ?? [],
    });
  }, [settings]);

  // Excluded company input state
  const [companyInput, setCompanyInput] = useState("");
  const companyInputRef = useRef<HTMLInputElement>(null);

  const saveAutoSendConfig = async (patch: Partial<AutoSendConfig>) => {
    try {
      await updateSettings.mutateAsync(patch);
    } catch (error) {
      console.error("Error saving auto-send config:", error);
    }
  };

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
                        <div id="gmail-authorize-toggle">
                          <div className="flex gap-2">
                            <AuthorizeGoogle checkAuth={checkAuth} />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ),
              )}

              {/* ── Auto-send configuration panel ─────────────────────────── */}
              {setting.section === "Auto Apply Configuration" &&
                switchStates.autoApplyEnabled && (
                <div className="mt-2 pt-4 border-t border-gray-100 space-y-5">
                  {/* Applications per day */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-800">
                          Applications per day
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Your <span className="capitalize">{accountTier}</span>{" "}
                          plan allows up to <strong>{tierCap}</strong> per day
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          max={tierCap}
                          value={autoSendConfig.maxApplicationsPerDay}
                          disabled={tierCap === 0}
                          onChange={(e) => {
                            const val = Math.min(
                              Math.max(1, Number(e.target.value)),
                              tierCap,
                            );
                            setAutoSendConfig((prev) => ({
                              ...prev,
                              maxApplicationsPerDay: val,
                            }));
                          }}
                          onBlur={() =>
                            saveAutoSendConfig({
                              maxApplicationsPerDay:
                                autoSendConfig.maxApplicationsPerDay,
                            })
                          }
                          className="w-16 text-center border border-gray-300 rounded-lg py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-xs text-gray-500">/ day</span>
                      </div>
                    </div>
                    {tierCap === 0 && (
                      <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                        Upgrade your plan to enable auto-send applications.
                      </p>
                    )}
                  </div>

                  {/* Minimum match score */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-800">
                          Minimum match score
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Only apply to jobs above this score
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={autoSendConfig.minMatchScore}
                          onChange={(e) => {
                            const val = Math.min(
                              100,
                              Math.max(0, Number(e.target.value)),
                            );
                            setAutoSendConfig((prev) => ({
                              ...prev,
                              minMatchScore: val,
                            }));
                          }}
                          onBlur={() =>
                            saveAutoSendConfig({
                              minMatchScore: autoSendConfig.minMatchScore,
                            })
                          }
                          className="w-16 text-center border border-gray-300 rounded-lg py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={autoSendConfig.minMatchScore}
                      onChange={(e) =>
                        setAutoSendConfig((prev) => ({
                          ...prev,
                          minMatchScore: Number(e.target.value),
                        }))
                      }
                      onMouseUp={() =>
                        saveAutoSendConfig({
                          minMatchScore: autoSendConfig.minMatchScore,
                        })
                      }
                      onTouchEnd={() =>
                        saveAutoSendConfig({
                          minMatchScore: autoSendConfig.minMatchScore,
                        })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>

                  {/* Preferred job types */}
                  <div className="space-y-1.5">
                    <p className="font-medium text-sm text-gray-800">
                      Preferred job types
                    </p>
                    <p className="text-xs text-gray-500">
                      Leave empty to match all types
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {JOB_TYPE_OPTIONS.map((opt) => {
                        const selected =
                          autoSendConfig.preferredJobTypes.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            onClick={async () => {
                              const updated = selected
                                ? autoSendConfig.preferredJobTypes.filter(
                                    (t) => t !== opt.value,
                                  )
                                : [
                                    ...autoSendConfig.preferredJobTypes,
                                    opt.value,
                                  ];
                              setAutoSendConfig((prev) => ({
                                ...prev,
                                preferredJobTypes: updated,
                              }));
                              await saveAutoSendConfig({
                                preferredJobTypes: updated,
                              });
                            }}
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                              selected
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400",
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Excluded companies */}
                  <div className="space-y-1.5">
                    <p className="font-medium text-sm text-gray-800">
                      Excluded companies
                    </p>
                    <p className="text-xs text-gray-500">
                      Skip applications to these companies
                    </p>
                    {autoSendConfig.excludedCompanies.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {autoSendConfig.excludedCompanies.map((company) => (
                          <span
                            key={company}
                            className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1"
                          >
                            {company}
                            <button
                              onClick={async () => {
                                const updated =
                                  autoSendConfig.excludedCompanies.filter(
                                    (c) => c !== company,
                                  );
                                setAutoSendConfig((prev) => ({
                                  ...prev,
                                  excludedCompanies: updated,
                                }));
                                await saveAutoSendConfig({
                                  excludedCompanies: updated,
                                });
                              }}
                              className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors leading-none"
                              aria-label={`Remove ${company}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <input
                        ref={companyInputRef}
                        type="text"
                        value={companyInput}
                        onChange={(e) => setCompanyInput(e.target.value)}
                        onKeyDown={async (e) => {
                          if (
                            (e.key === "Enter" || e.key === ",") &&
                            companyInput.trim()
                          ) {
                            e.preventDefault();
                            const name = companyInput.trim().replace(/,$/, "");
                            if (
                              !autoSendConfig.excludedCompanies.includes(name)
                            ) {
                              const updated = [
                                ...autoSendConfig.excludedCompanies,
                                name,
                              ];
                              setAutoSendConfig((prev) => ({
                                ...prev,
                                excludedCompanies: updated,
                              }));
                              await saveAutoSendConfig({
                                excludedCompanies: updated,
                              });
                            }
                            setCompanyInput("");
                          }
                        }}
                        placeholder="Company name, then Enter"
                        className="flex-1 border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={async () => {
                          const name = companyInput.trim();
                          if (
                            name &&
                            !autoSendConfig.excludedCompanies.includes(name)
                          ) {
                            const updated = [
                              ...autoSendConfig.excludedCompanies,
                              name,
                            ];
                            setAutoSendConfig((prev) => ({
                              ...prev,
                              excludedCompanies: updated,
                            }));
                            await saveAutoSendConfig({
                              excludedCompanies: updated,
                            });
                          }
                          setCompanyInput("");
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
