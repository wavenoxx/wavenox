import * as React from "react";
import { createFileRoute, useHydrated } from "@tanstack/react-router";
import {
  ShieldCheck,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  BarChart3,
  Layers,
  PhoneCall,
  Calendar,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
  ShieldAlert,
  Sparkles,
  Building2,
  MapPin,
  Zap,
  Battery,
} from "lucide-react";
import {
  getCrmSession,
  loginCrmStaff,
  logoutCrmStaff,
  listCrmLeads,
  getCrmLeadDetail,
  transitionCrmLeadStage,
  assignCrmLeadOwner,
  addCrmLeadNote,
  createCrmFollowupTask,
  completeCrmFollowupTask,
  rescheduleCrmFollowupTask,
  correctCrmLeadData,
  logCrmPrivacyRequest,
  listCrmFollowupQueue,
  getCrmDashboardMetrics,
  ALLOWED_STAGE_TRANSITIONS,
  CRM_LEAD_STATUSES,
  CRM_QUALIFICATION_OUTCOMES,
  CRM_TASK_TYPES,
  CRM_PRIVACY_REQUEST_TYPES,
  CRM_PRIVACY_REQUEST_STATUSES,
  type CrmLeadStatus,
  type CrmQualificationOutcome,
  type CrmTaskType,
  type CrmPrivacyRequestType,
  type CrmPrivacyRequestStatus,
  type CrmLeadSummaryItem,
  type CrmLeadDetailPayload,
  type CrmFollowupTaskItem,
  type CrmDashboardMetrics,
} from "@/functions/crm";
import type { CrmPermission, CrmStaffMember, CrmStaffRole } from "@/server/crm-auth";
import { SUPPORTED_LEAD_SOURCES, type LeadSource } from "@/functions/leads";
import { ATTRIBUTION_CHANNELS, type AttributionChannel } from "@/lib/telemetry";

export const Route = createFileRoute("/ops")({
  head: () => ({
    meta: [
      { title: "WAVENOX Operations CRM | Staff Workspace" },
      {
        name: "description",
        content:
          "Private WAVENOX staff workspace for solar consultation lead management, follow-up operations, and marketing attribution.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  loader: async () => {
    return await getCrmSession();
  },
  component: OpsWorkspacePage,
});

type OpsTab = "overview" | "leads" | "pipeline" | "followups" | "attribution" | "governance";

const STAGE_LABELS: Record<CrmLeadStatus, string> = {
  new: "New Enquiry",
  contacted: "Contacted",
  qualified: "Qualified",
  survey_booked: "Site Visit Booked",
  quoted: "Proposal Quoted",
  contract_signed: "Contract Signed",
  installed: "Installed",
  archived: "Archived",
};

const STAGE_BADGE_STYLES: Record<CrmLeadStatus, string> = {
  new: "bg-blue-50 text-blue-800 border-blue-200",
  contacted: "bg-sky-50 text-sky-800 border-sky-200",
  qualified: "bg-emerald-50 text-emerald-800 border-emerald-200",
  survey_booked: "bg-indigo-50 text-indigo-800 border-indigo-200",
  quoted: "bg-amber-50 text-amber-900 border-amber-200",
  contract_signed: "bg-teal-50 text-teal-900 border-teal-200",
  installed: "bg-green-100 text-green-900 border-green-300",
  archived: "bg-neutral-100 text-neutral-600 border-neutral-300",
};

const SOURCE_LABELS: Record<string, string> = {
  studio: "Design Studio (/deploy)",
  drawer: "Quick Consultation Drawer",
  enterprise: "Commercial RFP (/enterprise)",
  net_metering: "Net-Metering Desk (/net-metering)",
  architects: "Architects Desk (/architects)",
};

const CHANNEL_LABELS: Record<AttributionChannel, string> = {
  paid_search: "Paid Search",
  paid_social: "Paid Social",
  organic_search: "Organic Search",
  referral: "Referral",
  direct: "Direct",
  unknown: "Unknown / Unclassified",
};

const TASK_TYPE_LABELS: Record<CrmTaskType, string> = {
  call: "Phone Call",
  whatsapp_review: "WhatsApp Review",
  bill_review: "Electricity Bill Audit",
  site_survey_confirm: "Site Survey Confirmation",
  quote_followup: "Proposal Follow-Up",
  contract_followup: "Contract Review",
};

const ROLE_LABELS: Record<CrmStaffRole, string> = {
  owner_admin: "Owner / Admin",
  sales_coordinator: "Sales Coordinator",
  read_only_viewer: "Read-Only Viewer",
};

function formatInr(val: number | null | undefined): string {
  if (val == null || Number.isNaN(val)) return "Not provided";
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val)}`;
}

type CrmSessionData = Awaited<ReturnType<typeof getCrmSession>>;

function OpsWorkspacePage() {
  const hydrated = useHydrated();
  const initialSession = Route.useLoaderData() as CrmSessionData;

  const [sessionState, setSessionState] = React.useState<CrmSessionData>(initialSession);
  const [activeTab, setActiveTab] = React.useState<OpsTab>("overview");

  // Sign-In Form State
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [loginReason, setLoginReason] = React.useState<string | null>(
    !initialSession.authenticated ? initialSession.reason : null,
  );
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  // Workspace Data State
  const [isLoadingWorkspace, setIsLoadingWorkspace] = React.useState(false);
  const [workspaceError, setWorkspaceError] = React.useState<string | null>(null);
  const [leadsData, setLeadsData] = React.useState<{
    items: CrmLeadSummaryItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    staffDirectory: Array<{
      id: string;
      full_name: string;
      role: CrmStaffRole;
      is_active: boolean;
    }>;
  } | null>(null);
  const [allPipelineLeads, setAllPipelineLeads] = React.useState<CrmLeadSummaryItem[]>([]);
  const [followupQueue, setFollowupQueue] = React.useState<{
    tasks: CrmFollowupTaskItem[];
    counts: { overdue: number; dueToday: number; upcoming: number; completed: number };
  } | null>(null);
  const [metrics, setMetrics] = React.useState<CrmDashboardMetrics | null>(null);

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<CrmLeadStatus | "">("");
  const [sourceFilter, setSourceFilter] = React.useState<LeadSource | "">("");
  const [channelFilter, setChannelFilter] = React.useState<AttributionChannel | "">("");
  const [ownerFilter, setOwnerFilter] = React.useState<string>("");
  const [overdueOnly, setOverdueOnly] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  // Follow-Up Queue Tab Filter
  const [followupFilter, setFollowupFilter] = React.useState<
    "all_open" | "overdue" | "due_today" | "upcoming" | "completed"
  >("all_open");
  const [completingTaskId, setCompletingTaskId] = React.useState<string | null>(null);
  const [taskCompletionNote, setTaskCompletionNote] = React.useState("");
  const [taskContactConfirmed, setTaskContactConfirmed] = React.useState(true);
  const [reschedulingTaskId, setReschedulingTaskId] = React.useState<string | null>(null);
  const [taskNewDueAt, setTaskNewDueAt] = React.useState("");
  const [taskRescheduleReason, setTaskRescheduleReason] = React.useState("");

  // Selected Lead Detail Drawer State
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null);
  const [leadDetail, setLeadDetail] = React.useState<CrmLeadDetailPayload | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const [detailFeedback, setDetailFeedback] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Lead Detail Action Forms
  const [targetStage, setTargetStage] = React.useState<CrmLeadStatus>("contacted");
  const [stageReason, setStageReason] = React.useState("");
  const [stageQualOutcome, setStageQualOutcome] = React.useState<CrmQualificationOutcome | "">("");
  const [stageDisqualReason, setStageDisqualReason] = React.useState("");
  const [restoreArchivedFlag, setRestoreArchivedFlag] = React.useState(false);

  const [targetOwnerId, setTargetOwnerId] = React.useState<string>("");
  const [ownerAssignReason, setOwnerAssignReason] = React.useState("");

  const [staffNoteText, setStaffNoteText] = React.useState("");
  const [newTaskType, setNewTaskType] = React.useState<CrmTaskType>("call");
  const [newTaskDueAt, setNewTaskDueAt] = React.useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 3600_000);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [newTaskAssignee, setNewTaskAssignee] = React.useState<string>("");
  const [newTaskSummary, setNewTaskSummary] = React.useState("");

  // Data Correction Form
  const [showCorrectionForm, setShowCorrectionForm] = React.useState(false);
  const [corrClientName, setCorrClientName] = React.useState("");
  const [corrCity, setCorrCity] = React.useState("");
  const [corrPinCode, setCorrPinCode] = React.useState("");
  const [corrDiscomCode, setCorrDiscomCode] = React.useState("");
  const [corrCompanyName, setCorrCompanyName] = React.useState("");
  const [corrReason, setCorrReason] = React.useState("");

  // Privacy Request Form
  const [showPrivacyForm, setShowPrivacyForm] = React.useState(false);
  const [privReqType, setPrivReqType] = React.useState<CrmPrivacyRequestType>("access");
  const [privReqStatus, setPrivReqStatus] = React.useState<CrmPrivacyRequestStatus>("received");
  const [privReqSummary, setPrivReqSummary] = React.useState("");

  const hasPermission = React.useCallback(
    (perm: CrmPermission): boolean => {
      if (!sessionState.authenticated) return false;
      return sessionState.permissions.includes(perm);
    },
    [sessionState],
  );

  const fetchWorkspaceData = React.useCallback(
    async (overridePage?: number) => {
      if (!sessionState.authenticated) return;
      setIsLoadingWorkspace(true);
      setWorkspaceError(null);

      try {
        const activePage = overridePage ?? currentPage;
        const [leadsRes, fullPipelineRes, queueRes, metricsRes] = await Promise.all([
          listCrmLeads({
            data: {
              page: activePage,
              pageSize: 15,
              status: statusFilter || undefined,
              source: sourceFilter || undefined,
              channel: channelFilter || undefined,
              ownerId: ownerFilter || undefined,
              overdueOnly: overdueOnly || undefined,
              search: searchQuery.trim() || undefined,
            },
          }),
          listCrmLeads({
            data: {
              page: 1,
              pageSize: 50,
            },
          }),
          listCrmFollowupQueue(),
          getCrmDashboardMetrics({ data: {} }),
        ]);

        if (!leadsRes.ok) {
          setWorkspaceError(leadsRes.message);
          return;
        }
        setLeadsData(leadsRes);

        if (fullPipelineRes.ok) {
          setAllPipelineLeads(fullPipelineRes.items);
        }
        if (queueRes.ok) {
          setFollowupQueue({ tasks: queueRes.tasks, counts: queueRes.counts });
        }
        if (metricsRes.ok) {
          setMetrics(metricsRes.metrics);
        }
      } catch (err) {
        setWorkspaceError(
          err instanceof Error ? err.message : "Unable to load CRM workspace data.",
        );
      } finally {
        setIsLoadingWorkspace(false);
      }
    },
    [
      sessionState.authenticated,
      currentPage,
      statusFilter,
      sourceFilter,
      channelFilter,
      ownerFilter,
      overdueOnly,
      searchQuery,
    ],
  );

  React.useEffect(() => {
    if (sessionState.authenticated) {
      void fetchWorkspaceData();
    }
  }, [sessionState.authenticated, fetchWorkspaceData]);

  const openLeadDetail = React.useCallback(
    async (leadId: string) => {
      setSelectedLeadId(leadId);
      setIsLoadingDetail(true);
      setDetailFeedback(null);
      setShowCorrectionForm(false);
      setShowPrivacyForm(false);

      try {
        const res = await getCrmLeadDetail({ data: { leadId } });
        if (!res.ok) {
          setDetailFeedback({ type: "error", text: res.message });
          return;
        }
        setLeadDetail(res.data);

        const currentStatus = res.data.lead.status;
        const allowedNext = ALLOWED_STAGE_TRANSITIONS[currentStatus] ?? [];
        setTargetStage(allowedNext[0] ?? "contacted");
        setStageReason("");
        setStageQualOutcome(res.data.lead.qualification_outcome ?? "");
        setStageDisqualReason(res.data.lead.disqualification_reason ?? "");
        setRestoreArchivedFlag(currentStatus === "archived");

        setTargetOwnerId(
          res.data.lead.assigned_staff_id ??
            (sessionState.authenticated ? sessionState.staff.id : ""),
        );
        setOwnerAssignReason("");

        setNewTaskAssignee(
          res.data.lead.assigned_staff_id ??
            (sessionState.authenticated ? sessionState.staff.id : ""),
        );

        // Populate data correction defaults
        setCorrClientName(res.data.lead.client_name);
        setCorrCity(res.data.lead.city);
        setCorrPinCode(res.data.lead.pin_code ?? "");
        setCorrDiscomCode(res.data.lead.discom_code ?? "");
        setCorrCompanyName(res.data.lead.company_name ?? "");
        setCorrReason("");
      } catch (err) {
        setDetailFeedback({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load lead detail.",
        });
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [sessionState],
  );

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    setLoginReason(null);

    try {
      const res = await loginCrmStaff({
        data: {
          email: loginEmail.trim(),
          password: loginPassword,
        },
      });

      if (!res.ok) {
        setLoginError(res.message);
        setLoginReason("reason" in res && res.reason ? res.reason : "unauthorized");
        return;
      }

      const refreshed = await getCrmSession();
      setSessionState(refreshed);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoPersonaLogin = async (personaEmail: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    setLoginReason(null);

    try {
      const res = await loginCrmStaff({
        data: {
          email: personaEmail,
          demoPersonaEmail: personaEmail,
        },
      });

      if (!res.ok) {
        setLoginError(res.message);
        setLoginReason("reason" in res && res.reason ? res.reason : "forbidden");
        return;
      }

      const refreshed = await getCrmSession();
      setSessionState(refreshed);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Demo sandbox sign-in failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutCrmStaff();
    const refreshed = await getCrmSession();
    setSessionState(refreshed);
    setActiveTab("overview");
    setSelectedLeadId(null);
    setLeadDetail(null);
    setLeadsData(null);
    setLoginError(null);
    setLoginReason(null);
  };

  const handleTransitionStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadDetail) return;
    setDetailFeedback(null);

    const res = await transitionCrmLeadStage({
      data: {
        leadId: leadDetail.lead.id,
        newStatus: targetStage,
        expectedVersion: leadDetail.lead.crm_version,
        reason: stageReason.trim() || undefined,
        qualificationOutcome: stageQualOutcome || undefined,
        disqualificationReason: stageDisqualReason.trim() || undefined,
        restoreFromArchive: restoreArchivedFlag || undefined,
      },
    });

    if (!res.ok) {
      setDetailFeedback({ type: "error", text: res.message });
      return;
    }

    setDetailFeedback({
      type: "success",
      text: `Stage updated to "${STAGE_LABELS[res.lead.status]}" (v${res.lead.crm_version}).`,
    });
    await Promise.all([openLeadDetail(leadDetail.lead.id), fetchWorkspaceData()]);
  };

  const handleAssignOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadDetail) return;
    setDetailFeedback(null);

    const res = await assignCrmLeadOwner({
      data: {
        leadId: leadDetail.lead.id,
        assignedStaffId: targetOwnerId === "unassigned" || !targetOwnerId ? null : targetOwnerId,
        expectedVersion: leadDetail.lead.crm_version,
        reason: ownerAssignReason.trim() || undefined,
      },
    });

    if (!res.ok) {
      setDetailFeedback({ type: "error", text: res.message });
      return;
    }

    setDetailFeedback({
      type: "success",
      text: "Lead ownership updated and recorded in audit trail.",
    });
    await Promise.all([openLeadDetail(leadDetail.lead.id), fetchWorkspaceData()]);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadDetail || !staffNoteText.trim()) return;
    setDetailFeedback(null);

    const res = await addCrmLeadNote({
      data: {
        expectedVersion: leadDetail.lead.crm_version,
        leadId: leadDetail.lead.id,
        noteBody: staffNoteText.trim(),
      },
    });

    if (!res.ok) {
      setDetailFeedback({ type: "error", text: res.message });
      return;
    }

    setStaffNoteText("");
    setDetailFeedback({
      type: "success",
      text: "Internal staff note appended to activity history.",
    });
    await Promise.all([openLeadDetail(leadDetail.lead.id), fetchWorkspaceData()]);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadDetail || !newTaskSummary.trim()) return;
    setDetailFeedback(null);

    const parsedDue = Date.parse(newTaskDueAt);
    const dueIso = Number.isNaN(parsedDue)
      ? new Date(Date.now() + 24 * 3600_000).toISOString()
      : new Date(parsedDue).toISOString();

    const res = await createCrmFollowupTask({
      data: {
        expectedVersion: leadDetail.lead.crm_version,
        leadId: leadDetail.lead.id,
        assignedStaffId:
          newTaskAssignee || (sessionState.authenticated ? sessionState.staff.id : ""),
        taskType: newTaskType,
        dueAt: dueIso,
        summary: newTaskSummary.trim(),
      },
    });

    if (!res.ok) {
      setDetailFeedback({ type: "error", text: res.message });
      return;
    }

    setNewTaskSummary("");
    setDetailFeedback({
      type: "success",
      text: "Follow-up task scheduled.",
    });
    await Promise.all([openLeadDetail(leadDetail.lead.id), fetchWorkspaceData()]);
  };

  const handleCompleteTask = async (taskId: string, note: string, confirmed: boolean) => {
    const res = await completeCrmFollowupTask({
      data: {
        expectedVersion: followupQueue?.tasks.find((task) => task.id === taskId)?.lead_version,
        taskId,
        completionNote: note.trim() || "Completed scheduled follow-up action.",
        customerContactConfirmed: confirmed,
      },
    });

    if (!res.ok) {
      if (leadDetail) {
        setDetailFeedback({ type: "error", text: res.message });
      } else {
        setWorkspaceError(res.message);
      }
      return;
    }

    setCompletingTaskId(null);
    setTaskCompletionNote("");
    if (leadDetail) {
      setDetailFeedback({ type: "success", text: "Follow-up task marked completed." });
      await openLeadDetail(leadDetail.lead.id);
    }
    await fetchWorkspaceData();
  };

  const handleRescheduleTask = async (taskId: string) => {
    const parsedDue = Date.parse(taskNewDueAt);
    if (Number.isNaN(parsedDue)) {
      setWorkspaceError("Please select a valid date and time for rescheduling.");
      return;
    }

    const res = await rescheduleCrmFollowupTask({
      data: {
        expectedVersion: followupQueue?.tasks.find((task) => task.id === taskId)?.lead_version,
        taskId,
        newDueAt: new Date(parsedDue).toISOString(),
        reason: taskRescheduleReason.trim() || "Rescheduled by coordinator",
      },
    });

    if (!res.ok) {
      setWorkspaceError(res.message);
      return;
    }

    setReschedulingTaskId(null);
    setTaskNewDueAt("");
    setTaskRescheduleReason("");
    if (leadDetail) {
      await openLeadDetail(leadDetail.lead.id);
    }
    await fetchWorkspaceData();
  };

  const handleCorrectLeadData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadDetail) return;
    setDetailFeedback(null);

    const res = await correctCrmLeadData({
      data: {
        leadId: leadDetail.lead.id,
        expectedVersion: leadDetail.lead.crm_version,
        reason: corrReason.trim(),
        updates: {
          client_name: corrClientName.trim() || undefined,
          city: corrCity.trim() || undefined,
          pin_code: corrPinCode.trim() || undefined,
          discom_code: corrDiscomCode.trim() || undefined,
          company_name: corrCompanyName.trim() || undefined,
        },
      },
    });

    if (!res.ok) {
      setDetailFeedback({ type: "error", text: res.message });
      return;
    }

    setShowCorrectionForm(false);
    setDetailFeedback({
      type: "success",
      text: "Customer record corrected with before/after audit log entry.",
    });
    await Promise.all([openLeadDetail(leadDetail.lead.id), fetchWorkspaceData()]);
  };

  const handleLogPrivacyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadDetail) return;
    setDetailFeedback(null);

    const res = await logCrmPrivacyRequest({
      data: {
        expectedVersion: leadDetail.lead.crm_version,
        leadId: leadDetail.lead.id,
        requestType: privReqType,
        status: privReqStatus,
        resolutionSummary: privReqSummary.trim(),
      },
    });

    if (!res.ok) {
      setDetailFeedback({ type: "error", text: res.message });
      return;
    }

    setShowPrivacyForm(false);
    setPrivReqSummary("");
    setDetailFeedback({
      type: "success",
      text: "Data Principal privacy request logged.",
    });
    await Promise.all([openLeadDetail(leadDetail.lead.id), fetchWorkspaceData()]);
  };

  // ==========================================================================
  // RENDER 1: UNAUTHENTICATED OR PERMISSION-DENIED GATE
  // ==========================================================================
  if (!sessionState.authenticated) {
    const isPermissionDenied =
      loginReason === "not_staff" ||
      loginReason === "disabled_staff" ||
      loginReason === "forbidden";

    return (
      <div className="min-h-screen bg-[#F4F4F2] text-[#171A20] flex flex-col justify-between p-4 sm:p-8">
        <header className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm font-bold tracking-[0.22em] uppercase text-[#171A20] hover:opacity-80"
            >
              WAVENOX
            </a>
            <span className="text-xs text-neutral-400">/</span>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-600">
              Operations & Lead Intelligence
            </span>
          </div>
          <span
            id="ops-mode-badge"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider border ${
              sessionState.mode === "demo"
                ? "bg-amber-50 text-amber-900 border-amber-300"
                : "bg-emerald-50 text-emerald-900 border-emerald-300"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {sessionState.mode === "demo" ? "Demo Sandbox Mode" : "Live Production Mode"}
          </span>
        </header>

        <main className="max-w-xl w-full mx-auto my-8 bg-white border border-neutral-200 rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">
            <Lock className="w-4 h-4 text-[#171A20]" />
            Invite-Only Staff Authentication Gate
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#171A20] mb-2">
            WAVENOX Sales & Operations CRM
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed mb-6">
            Access to customer consultation records, phone numbers, follow-up queues, and
            attribution telemetry is restricted to active provisioned WAVENOX staff members.
          </p>

          {/* Permission-Denied / 403 State */}
          {isPermissionDenied && loginError && (
            <div
              id="ops-permission-denied-banner"
              role="alert"
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-900"
            >
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider font-semibold text-red-800">
                    403 Permission Denied ({loginReason})
                  </div>
                  <p className="text-sm mt-1">{loginError}</p>
                  <p className="text-xs text-red-700 mt-1.5">
                    Zero customer consultation records were returned by the server.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Live Mode Unconfigured Fail-Closed Banner */}
          {sessionState.mode === "live" && sessionState.reason === "live_unconfigured" && (
            <div
              id="ops-live-failclosed-banner"
              role="alert"
              className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-950"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider font-semibold text-amber-900">
                    Fail-Closed Server Security Guard (LIVE Mode)
                  </div>
                  <p className="text-sm mt-1">{sessionState.message}</p>
                  <p className="text-xs text-amber-800 mt-1.5">
                    Configure valid <code>SUPABASE_URL</code> and{" "}
                    <code>SUPABASE_SERVICE_ROLE_KEY</code> on the server, or run with explicit{" "}
                    <code>LEAD_MODE=demo</code> for isolated sandbox testing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Non-403 Login Error */}
          {!isPermissionDenied && loginError && (
            <div
              id="ops-login-error"
              role="alert"
              className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-900"
            >
              {loginError}
            </div>
          )}

          {/* Staff Credentials Form */}
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label
                htmlFor="ops-login-email"
                className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5"
              >
                Staff Email Address
              </label>
              <input
                id="ops-login-email"
                disabled={!hydrated || isLoggingIn}
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="staff.name@wavenox.com"
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#171A20]"
              />
            </div>

            <div>
              <label
                htmlFor="ops-login-password"
                className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="ops-login-password"
                disabled={!hydrated || isLoggingIn}
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#171A20]"
              />
            </div>

            <button
              id="ops-login-submit"
              type="submit"
              disabled={!hydrated || isLoggingIn}
              className="w-full py-2.5 px-4 bg-[#171A20] text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
            >
              {isLoggingIn ? "Verifying Staff Session..." : "Sign In to Operations CRM"}
            </button>
          </form>

          {/* Explicit Demo Mode Sandbox Persona Switcher */}
          {sessionState.mode === "demo" && sessionState.demoPersonas.length > 0 && (
            <div id="ops-demo-persona-panel" className="mt-8 pt-6 border-t border-neutral-200">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-amber-900">
                  Demo Sandbox Staff Personas (LEAD_MODE=demo)
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  Server-Signed HMAC Session
                </span>
              </div>
              <p className="text-xs text-neutral-600 mb-3">
                Select a provisioned staff role below to inspect role-based access control, PII
                masking, and negative authorization checks:
              </p>
              <div className="space-y-2">
                {sessionState.demoPersonas.map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    data-testid={`demo-persona-${persona.role}-${persona.is_active ? "active" : "disabled"}`}
                    onClick={() => void handleDemoPersonaLogin(persona.email)}
                    disabled={isLoggingIn}
                    className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-[#171A20] hover:bg-neutral-50 transition flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#171A20] truncate">
                        {persona.full_name}
                      </div>
                      <div className="text-xs text-neutral-500 truncate">{persona.email}</div>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-mono uppercase border ${
                        !persona.is_active
                          ? "bg-red-50 text-red-800 border-red-200"
                          : persona.role === "owner_admin"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                            : persona.role === "sales_coordinator"
                              ? "bg-blue-50 text-blue-900 border-blue-200"
                              : "bg-neutral-100 text-neutral-700 border-neutral-300"
                      }`}
                    >
                      {!persona.is_active ? "Deactivated" : ROLE_LABELS[persona.role]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="max-w-5xl w-full mx-auto text-center text-xs text-neutral-500 border-t border-neutral-200 pt-4">
          WAVENOX Internal Operations · Protected by Supabase Row Level Security & Server-Side Role
          Verification · All timestamps displayed in IST (Asia/Kolkata, UTC+05:30).
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // RENDER 2: AUTHENTICATED STAFF WORKSPACE
  // ==========================================================================
  const staff: CrmStaffMember = sessionState.staff;
  const canMutateStage = hasPermission("leads:update_stage");
  const canAssignSelf = hasPermission("leads:assign_self");
  const canAssignAny = hasPermission("leads:assign_any");
  const canAddNote = hasPermission("leads:add_note");
  const canCreateTask = hasPermission("tasks:create");
  const canCompleteTask = hasPermission("tasks:complete");
  const canCorrectData = hasPermission("leads:correct_data");
  const canManagePrivacy = hasPermission("privacy:manage");

  const filteredTasks = (followupQueue?.tasks ?? []).filter((t) => {
    if (followupFilter === "all_open") return t.status === "pending";
    if (followupFilter === "overdue") return t.urgency === "overdue";
    if (followupFilter === "due_today") return t.urgency === "due_today";
    if (followupFilter === "upcoming") return t.urgency === "upcoming";
    if (followupFilter === "completed") return t.status === "completed";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4F4F2] text-[#171A20] flex flex-col">
      {/* Top Staff Header */}
      <header className="bg-[#171A20] text-white border-b border-neutral-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs font-bold tracking-[0.22em] uppercase text-white hover:opacity-80"
            >
              WAVENOX
            </a>
            <span className="text-neutral-600">/</span>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-300">
              CRM & Lead Intelligence
            </span>
            <span
              id="ops-authenticated-mode-badge"
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                sessionState.mode === "demo"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
              }`}
            >
              {sessionState.mode === "demo" ? "Demo Sandbox" : "Live DB"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <div id="ops-staff-name" className="text-xs font-medium text-white leading-tight">
                {staff.full_name}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                {ROLE_LABELS[staff.role]}
              </div>
            </div>
            <span
              id="ops-staff-role-badge"
              className="sm:hidden px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-200"
            >
              {ROLE_LABELS[staff.role]}
            </span>

            <button
              type="button"
              onClick={() => void fetchWorkspaceData()}
              disabled={isLoadingWorkspace}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition"
              title="Refresh CRM Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWorkspace ? "animate-spin" : ""}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>

            <button
              id="ops-signout-btn"
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-red-950/70 hover:bg-red-900 text-xs text-red-200 border border-red-800/60 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-neutral-800/80">
          {(
            [
              { id: "overview", label: "Overview", icon: BarChart3 },
              {
                id: "leads",
                label: `All Leads (${leadsData?.total ?? 0})`,
                icon: FileText,
              },
              { id: "pipeline", label: "Pipeline", icon: Layers },
              {
                id: "followups",
                label: `Follow-Ups (${
                  (followupQueue?.counts.overdue ?? 0) + (followupQueue?.counts.dueToday ?? 0)
                } Due)`,
                icon: Clock,
              },
              { id: "attribution", label: "Attribution", icon: Sparkles },
              { id: "governance", label: "Settings & Governance", icon: ShieldCheck },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`ops-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition ${
                  active
                    ? "border-white text-white"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Read-Only Viewer Notice Banner */}
      {staff.role === "read_only_viewer" && (
        <div
          id="ops-viewer-mode-banner"
          className="bg-neutral-200/80 border-b border-neutral-300 px-4 py-2 text-xs text-neutral-800"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <Info className="w-4 h-4 text-neutral-700 shrink-0" />
            <span>
              <strong>Read-Only Viewer Mode:</strong> Phone numbers, email addresses, and customer
              notes are masked for privacy protection. Stage transitions, owner assignments, and
              task mutations are disabled for your role.
            </span>
          </div>
        </div>
      )}

      {workspaceError && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 mt-4">
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-900 flex items-center justify-between gap-3"
          >
            <span>{workspaceError}</span>
            <button
              type="button"
              onClick={() => setWorkspaceError(null)}
              className="text-xs font-mono underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* ================================================================ */}
        {/* TAB 1: OVERVIEW                                                  */}
        {/* ================================================================ */}
        {activeTab === "overview" && metrics && (
          <div id="ops-view-overview" className="space-y-6">
            {/* Operational KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  Total Persisted Enquiries
                </div>
                <div
                  id="ops-kpi-total-leads"
                  className="text-3xl font-semibold text-[#171A20] mt-1"
                >
                  {metrics.totalLeads}
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  {metrics.eligibleLeadsCount} active (non-archived) ·{" "}
                  {metrics.stageCounts.archived} archived
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  New & Unassigned Queue
                </div>
                <div className="text-3xl font-semibold text-[#171A20] mt-1">
                  {metrics.stageCounts.new}{" "}
                  <span className="text-base font-normal text-neutral-500">
                    new ({metrics.unassignedLeadsCount} unassigned)
                  </span>
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  Requires initial coordinator phone qualification
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  Follow-Up SLA Status (IST)
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span
                    id="ops-kpi-overdue-count"
                    className={`text-3xl font-semibold ${
                      metrics.overdueFollowupsCount > 0 ? "text-red-700" : "text-[#171A20]"
                    }`}
                  >
                    {metrics.overdueFollowupsCount} Overdue
                  </span>
                  <span className="text-sm text-amber-800 font-medium">
                    · {metrics.dueTodayFollowupsCount} Due Today
                  </span>
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  Evaluated in Asia/Kolkata (UTC+05:30)
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  Qualification Rate
                </div>
                <div className="text-3xl font-semibold text-emerald-800 mt-1">
                  {metrics.conversionMetrics.qualifiedRatePct}%
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  {metrics.conversionMetrics.qualifiedCount} of {metrics.eligibleLeadsCount}{" "}
                  eligible leads qualified
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  Site Visit Booking Rate
                </div>
                <div className="text-3xl font-semibold text-indigo-900 mt-1">
                  {metrics.conversionMetrics.surveyConversionPct}%
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  {metrics.conversionMetrics.surveyBookedCount} structural/DISCOM surveys booked
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  Signed / Installed Conversion
                </div>
                <div className="text-3xl font-semibold text-teal-900 mt-1">
                  {metrics.conversionMetrics.contractConversionPct}%
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  {metrics.conversionMetrics.contractSignedCount} signed or commissioned projects
                </div>
              </div>
            </div>

            {/* Honest Financial & Attribution Disclosure Box */}
            <div
              id="ops-financial-honesty-banner"
              className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  Operational Analytics Methodology & Financial Guardrails
                </div>
                <p className="text-xs text-neutral-700">
                  {metrics.financialDisclosures.pipelineRevenueNotice}
                </p>
              </div>
              <div className="shrink-0 px-3 py-1.5 rounded bg-neutral-100 border border-neutral-300 text-xs font-mono text-neutral-800">
                {metrics.financialDisclosures.roasNotice}
              </div>
            </div>

            {/* Stage Distribution & Urgent Action Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#171A20] mb-4">
                  Leads by Sales Stage
                </h2>
                <div className="space-y-2.5">
                  {CRM_LEAD_STATUSES.map((st) => {
                    const count = metrics.stageCounts[st] ?? 0;
                    const pct =
                      metrics.totalLeads > 0 ? Math.round((count / metrics.totalLeads) * 100) : 0;
                    return (
                      <div key={st} className="flex items-center justify-between gap-3 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded border font-medium ${STAGE_BADGE_STYLES[st]}`}
                        >
                          {STAGE_LABELS[st]}
                        </span>
                        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#171A20]"
                            style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
                          />
                        </div>
                        <span className="font-mono text-neutral-700 w-16 text-right">
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#171A20]">
                    Immediate Coordinator Attention
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("leads")}
                    className="text-xs font-mono underline text-neutral-600 hover:text-[#171A20]"
                  >
                    View All Leads
                  </button>
                </div>
                <div className="space-y-2.5">
                  {allPipelineLeads
                    .filter((l) => l.is_overdue || l.assigned_staff_id === null)
                    .slice(0, 5)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border border-neutral-200 flex items-center justify-between gap-3 hover:bg-neutral-50"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-[#171A20]">
                              {item.reference_code}
                            </span>
                            {item.is_overdue && (
                              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-mono uppercase">
                                Overdue Follow-Up
                              </span>
                            )}
                            {!item.assigned_staff_id && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono uppercase">
                                Unassigned
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-medium text-[#171A20] truncate mt-0.5">
                            {item.client_name} · {item.city}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {item.system_kw ? `${item.system_kw} kW` : "Sizing pending"} ·{" "}
                            {SOURCE_LABELS[item.source ?? ""] ?? item.source ?? "Unknown"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void openLeadDetail(item.id)}
                          className="shrink-0 px-3 py-1.5 rounded bg-[#171A20] text-white text-xs font-medium hover:bg-neutral-800"
                        >
                          Inspect
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: ALL LEADS (SEARCH, FILTER, PAGINATED TABLE & MOBILE CARDS) */}
        {/* ================================================================ */}
        {activeTab === "leads" && (
          <div id="ops-view-leads" className="space-y-4">
            {/* Search & Filter Controls */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-2 relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="ops-search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search WNX ref, name, phone, city..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#171A20]"
                  />
                </div>

                <select
                  id="ops-filter-status"
                  aria-label="Filter by sales stage"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as CrmLeadStatus | "");
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="">All Sales Stages</option>
                  {CRM_LEAD_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {STAGE_LABELS[st]}
                    </option>
                  ))}
                </select>

                <select
                  id="ops-filter-source"
                  aria-label="Filter by form source"
                  value={sourceFilter}
                  onChange={(e) => {
                    setSourceFilter(e.target.value as LeadSource | "");
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="">All Form Sources</option>
                  {SUPPORTED_LEAD_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {SOURCE_LABELS[src] ?? src}
                    </option>
                  ))}
                </select>

                <select
                  id="ops-filter-channel"
                  aria-label="Filter by marketing channel"
                  value={channelFilter}
                  onChange={(e) => {
                    setChannelFilter(e.target.value as AttributionChannel | "");
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="">All Channels</option>
                  {ATTRIBUTION_CHANNELS.map((ch) => (
                    <option key={ch} value={ch}>
                      {CHANNEL_LABELS[ch]}
                    </option>
                  ))}
                </select>

                <select
                  id="ops-filter-owner"
                  aria-label="Filter by assigned owner"
                  value={ownerFilter}
                  onChange={(e) => {
                    setOwnerFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="">All Owners</option>
                  <option value="unassigned">Unassigned Only</option>
                  {(leadsData?.staffDirectory ?? [])
                    .filter((s) => s.role !== "read_only_viewer")
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-100">
                <label className="inline-flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                  <input
                    id="ops-filter-overdue"
                    type="checkbox"
                    checked={overdueOnly}
                    onChange={(e) => {
                      setOverdueOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="rounded border-neutral-300"
                  />
                  <Filter className="w-3.5 h-3.5 text-red-700" />
                  <span>Show Overdue Follow-Ups Only</span>
                </label>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 font-mono">
                    Showing {leadsData?.items.length ?? 0} of {leadsData?.total ?? 0} leads
                  </span>
                  {(searchQuery ||
                    statusFilter ||
                    sourceFilter ||
                    channelFilter ||
                    ownerFilter ||
                    overdueOnly) && (
                    <button
                      id="ops-clear-filters"
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("");
                        setSourceFilter("");
                        setChannelFilter("");
                        setOwnerFilter("");
                        setOverdueOnly(false);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-mono underline text-neutral-700 hover:text-[#171A20]"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Table (lg+) */}
            <div className="hidden lg:block bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                    <th className="py-3 px-4">Reference / Created (IST)</th>
                    <th className="py-3 px-4">Customer & Contact</th>
                    <th className="py-3 px-4">Location & DISCOM</th>
                    <th className="py-3 px-4">Preliminary Sizing</th>
                    <th className="py-3 px-4">Source & Channel</th>
                    <th className="py-3 px-4">Stage & Owner</th>
                    <th className="py-3 px-4">Next Follow-Up</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-xs">
                  {(leadsData?.items ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-500">
                        No consultation leads match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    (leadsData?.items ?? []).map((item) => (
                      <tr
                        key={item.id}
                        data-testid={`lead-row-${item.reference_code}`}
                        className="hover:bg-neutral-50 transition"
                      >
                        <td className="py-3 px-4 align-top">
                          <div className="font-mono font-semibold text-[#171A20]">
                            {item.reference_code}
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {item.created_at_ist}
                          </div>
                          {item.possible_duplicate_count > 1 && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono">
                              {item.possible_duplicate_count} Enquiries (Same Phone)
                            </span>
                          )}
                          {item.do_not_contact && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-red-100 text-red-900 text-[10px] font-mono">
                              DO NOT CONTACT
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="font-medium text-[#171A20]">{item.client_name}</div>
                          <div className="font-mono text-neutral-600 mt-0.5">
                            {item.masked_phone}
                          </div>
                          {item.company_name && (
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              {item.company_name}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="text-[#171A20] font-medium">{item.city}</div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            PIN: {item.pin_code ?? "Not provided"} ·{" "}
                            {item.discom_code ?? "Not provided"}
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="font-medium text-[#171A20]">
                            {item.system_kw != null ? `${item.system_kw} kW` : "Not provided"}
                            {item.battery_units > 0 ? ` + ${item.battery_units} Bat` : ""}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            Bill: {formatInr(item.monthly_bill_inr)}
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="font-medium text-[#171A20]">
                            {SOURCE_LABELS[item.source ?? ""] ?? item.source ?? "Not provided"}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            {CHANNEL_LABELS[item.attribution_channel]}
                            {item.utm_campaign ? ` · ${item.utm_campaign}` : ""}
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top">
                          <span
                            className={`inline-block px-2 py-0.5 rounded border text-[11px] font-medium ${STAGE_BADGE_STYLES[item.status]}`}
                          >
                            {STAGE_LABELS[item.status]}
                          </span>
                          <div className="text-[11px] text-neutral-600 mt-1">
                            {item.assigned_staff_name ?? (
                              <span className="text-amber-800 font-medium">Unassigned</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top">
                          {item.next_followup_ist ? (
                            <div>
                              <div className="text-[11px] text-neutral-700">
                                {item.next_followup_ist}
                              </div>
                              {item.is_overdue && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-mono uppercase">
                                  Overdue
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-neutral-400">None scheduled</span>
                          )}
                        </td>

                        <td className="py-3 px-4 align-top text-right">
                          <button
                            type="button"
                            data-testid={`inspect-lead-${item.reference_code}`}
                            onClick={() => void openLeadDetail(item.id)}
                            className="px-3 py-1.5 rounded bg-[#171A20] text-white text-xs font-medium hover:bg-neutral-800 transition"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Cards (<lg) */}
            <div className="lg:hidden space-y-3">
              {(leadsData?.items ?? []).map((item) => (
                <div
                  key={item.id}
                  data-testid={`lead-card-${item.reference_code}`}
                  className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-semibold text-[#171A20]">
                        {item.reference_code}
                      </span>
                      <div className="text-sm font-semibold text-[#171A20] mt-0.5">
                        {item.client_name}
                      </div>
                      <div className="text-xs font-mono text-neutral-600">{item.masked_phone}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded border text-[11px] font-medium ${STAGE_BADGE_STYLES[item.status]}`}
                    >
                      {STAGE_LABELS[item.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Location
                      </span>
                      {item.city} ({item.discom_code ?? "Not provided"})
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Sizing
                      </span>
                      {item.system_kw != null ? `${item.system_kw} kW` : "Not provided"} ·{" "}
                      {formatInr(item.monthly_bill_inr)}
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Source / Channel
                      </span>
                      {item.source ?? "Not provided"} · {CHANNEL_LABELS[item.attribution_channel]}
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Owner
                      </span>
                      {item.assigned_staff_name ?? "Unassigned"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                    <div className="text-[11px] text-neutral-500">
                      {item.is_overdue ? (
                        <span className="text-red-700 font-mono font-semibold">
                          OVERDUE: {item.next_followup_ist}
                        </span>
                      ) : (
                        <span>Created: {item.created_at_ist}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => void openLeadDetail(item.id)}
                      className="px-3 py-1.5 rounded bg-[#171A20] text-white text-xs font-medium"
                    >
                      Inspect Lead
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            {leadsData && leadsData.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs">
                <span className="font-mono text-neutral-600">
                  Page {leadsData.page} of {leadsData.totalPages} ({leadsData.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={leadsData.page <= 1}
                    onClick={() => {
                      const prev = Math.max(1, leadsData.page - 1);
                      setCurrentPage(prev);
                      void fetchWorkspaceData(prev);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-300 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button
                    type="button"
                    disabled={leadsData.page >= leadsData.totalPages}
                    onClick={() => {
                      const next = Math.min(leadsData.totalPages, leadsData.page + 1);
                      setCurrentPage(next);
                      void fetchWorkspaceData(next);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-300 disabled:opacity-40"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: PIPELINE BOARD                                            */}
        {/* ================================================================ */}
        {activeTab === "pipeline" && (
          <div id="ops-view-pipeline" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CRM_LEAD_STATUSES.map((stage) => {
                const stageLeads = allPipelineLeads.filter((l) => l.status === stage);
                return (
                  <div
                    key={stage}
                    className="bg-white border border-neutral-200 rounded-xl p-3.5 flex flex-col"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-neutral-200">
                      <span
                        className={`px-2 py-0.5 rounded border text-xs font-medium ${STAGE_BADGE_STYLES[stage]}`}
                      >
                        {STAGE_LABELS[stage]}
                      </span>
                      <span className="text-xs font-mono text-neutral-500">
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="space-y-2.5 flex-1">
                      {stageLeads.length === 0 ? (
                        <div className="py-6 text-center text-xs text-neutral-400">
                          No leads in stage
                        </div>
                      ) : (
                        stageLeads.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-lg border border-neutral-200 hover:border-neutral-400 transition space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-[11px] font-semibold text-[#171A20]">
                                {item.reference_code}
                              </span>
                              {item.is_overdue && (
                                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-mono">
                                  Overdue
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-[#171A20]">
                              {item.client_name}
                            </div>
                            <div className="text-[11px] text-neutral-600">
                              {item.city} ·{" "}
                              {item.system_kw != null ? `${item.system_kw} kW` : "Sizing pending"}
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-neutral-100">
                              <span className="text-[10px] font-mono text-neutral-500 truncate">
                                {item.assigned_staff_name ?? "Unassigned"}
                              </span>
                              <button
                                type="button"
                                onClick={() => void openLeadDetail(item.id)}
                                className="text-[11px] font-mono underline text-[#171A20]"
                              >
                                Open
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: FOLLOW-UPS QUEUE                                          */}
        {/* ================================================================ */}
        {activeTab === "followups" && followupQueue && (
          <div id="ops-view-followups" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-neutral-200 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    {
                      id: "all_open",
                      label: `All Pending (${
                        followupQueue.counts.overdue +
                        followupQueue.counts.dueToday +
                        followupQueue.counts.upcoming
                      })`,
                    },
                    { id: "overdue", label: `Overdue (${followupQueue.counts.overdue})` },
                    { id: "due_today", label: `Due Today IST (${followupQueue.counts.dueToday})` },
                    { id: "upcoming", label: `Upcoming (${followupQueue.counts.upcoming})` },
                    { id: "completed", label: `Completed (${followupQueue.counts.completed})` },
                  ] as const
                ).map((bucket) => (
                  <button
                    key={bucket.id}
                    type="button"
                    onClick={() => setFollowupFilter(bucket.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      followupFilter === bucket.id
                        ? "bg-[#171A20] text-white border-[#171A20]"
                        : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {bucket.label}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono text-neutral-500">
                Timezone: Asia/Kolkata (IST, UTC+05:30)
              </span>
            </div>

            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center text-sm text-neutral-500">
                  No follow-up tasks in this bucket.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    data-testid={`followup-task-${task.id}`}
                    className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                              task.urgency === "overdue"
                                ? "bg-red-100 text-red-900 border border-red-200"
                                : task.urgency === "due_today"
                                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                                  : task.urgency === "completed"
                                    ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                    : "bg-blue-50 text-blue-900 border border-blue-200"
                            }`}
                          >
                            {task.urgency === "due_today"
                              ? "Due Today (IST)"
                              : task.urgency.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 text-[11px] font-mono">
                            {TASK_TYPE_LABELS[task.task_type]}
                          </span>
                          <span className="text-xs font-mono text-neutral-600">
                            Due: {task.due_at_ist}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-[#171A20]">{task.summary}</div>
                        <div className="text-xs text-neutral-600">
                          Lead:{" "}
                          <span className="font-mono font-medium text-[#171A20]">
                            {task.lead_reference_code}
                          </span>{" "}
                          ({task.lead_client_name} · {task.lead_city}) · Assigned to:{" "}
                          <strong>{task.assigned_staff_name}</strong>
                        </div>
                        {task.completion_note && (
                          <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2 mt-1">
                            Completed ({task.completed_at_ist}): {task.completion_note}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void openLeadDetail(task.lead_id)}
                          className="px-3 py-1.5 rounded border border-neutral-300 text-xs font-medium hover:bg-neutral-50"
                        >
                          Open Lead
                        </button>
                        {task.status === "pending" && canCompleteTask && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setCompletingTaskId(completingTaskId === task.id ? null : task.id);
                                setReschedulingTaskId(null);
                              }}
                              className="px-3 py-1.5 rounded bg-emerald-800 text-white text-xs font-medium hover:bg-emerald-900"
                            >
                              Complete
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReschedulingTaskId(
                                  reschedulingTaskId === task.id ? null : task.id,
                                );
                                setCompletingTaskId(null);
                              }}
                              className="px-3 py-1.5 rounded bg-neutral-800 text-white text-xs font-medium hover:bg-neutral-700"
                            >
                              Reschedule
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Task Completion Form */}
                    {completingTaskId === task.id && (
                      <div className="pt-3 border-t border-neutral-200 bg-neutral-50 p-3 rounded-lg space-y-2.5">
                        <input
                          type="text"
                          value={taskCompletionNote}
                          onChange={(e) => setTaskCompletionNote(e.target.value)}
                          placeholder="Record call/follow-up outcome note..."
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="inline-flex items-center gap-1.5 text-xs text-neutral-700">
                            <input
                              type="checkbox"
                              checked={taskContactConfirmed}
                              onChange={(e) => setTaskContactConfirmed(e.target.checked)}
                            />
                            Update lead last-contacted timestamp
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCompletingTaskId(null)}
                              className="px-2.5 py-1 text-xs text-neutral-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void handleCompleteTask(
                                  task.id,
                                  taskCompletionNote,
                                  taskContactConfirmed,
                                )
                              }
                              className="px-3 py-1.5 rounded bg-emerald-800 text-white text-xs font-medium"
                            >
                              Confirm Completion
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Inline Task Reschedule Form */}
                    {reschedulingTaskId === task.id && (
                      <div className="pt-3 border-t border-neutral-200 bg-neutral-50 p-3 rounded-lg space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="datetime-local"
                            value={taskNewDueAt}
                            onChange={(e) => setTaskNewDueAt(e.target.value)}
                            className="px-3 py-2 text-xs border border-neutral-300 rounded bg-white"
                          />
                          <input
                            type="text"
                            value={taskRescheduleReason}
                            onChange={(e) => setTaskRescheduleReason(e.target.value)}
                            placeholder="Reason for rescheduling..."
                            className="px-3 py-2 text-xs border border-neutral-300 rounded bg-white"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReschedulingTaskId(null)}
                            className="px-2.5 py-1 text-xs text-neutral-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleRescheduleTask(task.id)}
                            className="px-3 py-1.5 rounded bg-[#171A20] text-white text-xs font-medium"
                          >
                            Save New Due Time
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 5: MARKETING ATTRIBUTION & CAMPAIGN INTELLIGENCE             */}
        {/* ================================================================ */}
        {activeTab === "attribution" && metrics && (
          <div id="ops-view-attribution" className="space-y-6">
            {/* Explicit ROAS Unavailable Banner */}
            <div
              id="ops-roas-unavailable-banner"
              className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="text-xs font-mono uppercase tracking-wider font-semibold text-[#171A20]">
                  Privacy-First Multi-Touch Attribution Engine
                </div>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Captures sanitized First-Touch, Last-Touch, and Conversion-Touch paths without
                  third-party cookies or PII in URLs.
                </p>
              </div>
              <div className="shrink-0 px-3 py-1.5 rounded bg-amber-50 border border-amber-300 text-amber-950 text-xs font-mono font-medium">
                {metrics.financialDisclosures.roasNotice}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Form Source */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#171A20] mb-4">
                  Enquiries by Lead Capture Form (Original Source)
                </h2>
                <div className="space-y-2.5">
                  {metrics.bySource.map((row) => (
                    <div
                      key={row.source}
                      className="flex items-center justify-between gap-3 text-xs border-b border-neutral-100 pb-2"
                    >
                      <span className="font-medium text-[#171A20]">
                        {SOURCE_LABELS[row.source] ?? row.source}
                      </span>
                      <span className="font-mono text-neutral-700">
                        {row.count} leads ({row.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Classified Channel */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#171A20] mb-4">
                  Enquiries by Classified Marketing Channel
                </h2>
                <div className="space-y-2.5">
                  {metrics.byChannel.map((row) => (
                    <div
                      key={row.channel}
                      className="flex items-center justify-between gap-3 text-xs border-b border-neutral-100 pb-2"
                    >
                      <span className="font-medium text-[#171A20]">
                        {CHANNEL_LABELS[row.channel]}
                      </span>
                      <span className="font-mono text-neutral-700">
                        {row.count} leads ({row.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* First Touch vs Last Touch Source Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
                  First-Touch Discovery Source
                </h3>
                <div className="space-y-2">
                  {metrics.byFirstTouchSource.map((item) => (
                    <div
                      key={item.source}
                      className="flex items-center justify-between text-xs border-b border-neutral-100 pb-1.5"
                    >
                      <span className="font-mono text-[#171A20]">{item.source}</span>
                      <span className="font-mono text-neutral-600">{item.count} leads</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
                  Last-Touch Conversion Source
                </h3>
                <div className="space-y-2">
                  {metrics.byLastTouchSource.map((item) => (
                    <div
                      key={item.source}
                      className="flex items-center justify-between text-xs border-b border-neutral-100 pb-1.5"
                    >
                      <span className="font-mono text-[#171A20]">{item.source}</span>
                      <span className="font-mono text-neutral-600">{item.count} leads</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Campaign Conversion Performance Table */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-neutral-200">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#171A20]">
                  Campaign Funnel Conversion Matrix
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Tracks real funnel progression from enquiry to qualification, site survey, and
                  signed contract per campaign.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-mono uppercase text-neutral-500">
                      <th className="py-2.5 px-4">UTM Campaign</th>
                      <th className="py-2.5 px-4">Channel</th>
                      <th className="py-2.5 px-4">Source</th>
                      <th className="py-2.5 px-4 text-right">Total Leads</th>
                      <th className="py-2.5 px-4 text-right">Qualified</th>
                      <th className="py-2.5 px-4 text-right">Survey Booked</th>
                      <th className="py-2.5 px-4 text-right">Contract Signed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {metrics.byCampaign.map((camp) => (
                      <tr key={camp.campaign} className="hover:bg-neutral-50">
                        <td className="py-2.5 px-4 font-mono font-medium text-[#171A20]">
                          {camp.campaign}
                        </td>
                        <td className="py-2.5 px-4">{CHANNEL_LABELS[camp.channel]}</td>
                        <td className="py-2.5 px-4 font-mono">{camp.source}</td>
                        <td className="py-2.5 px-4 text-right font-mono">{camp.totalLeads}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-800">
                          {camp.qualifiedLeads}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-indigo-800">
                          {camp.surveyBookedLeads}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-teal-800">
                          {camp.contractSignedLeads}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 6: SETTINGS, STAFF ROLES & DPDP PRIVACY GOVERNANCE           */}
        {/* ================================================================ */}
        {activeTab === "governance" && (
          <div id="ops-view-governance" className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#171A20] mb-1">
                Provisioned WAVENOX Staff Directory
              </h2>
              <p className="text-xs text-neutral-600 mb-4">
                Staff access is invite-only and verified on every request against{" "}
                <code>public.crm_staff_members</code>. Deactivating a staff record revokes access
                immediately.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-mono uppercase text-neutral-500">
                      <th className="py-2.5 px-4">Staff Member</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">PII & Mutation Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {(leadsData?.staffDirectory ?? []).map((member) => (
                      <tr key={member.id}>
                        <td className="py-2.5 px-4 font-medium text-[#171A20]">
                          {member.full_name}
                        </td>
                        <td className="py-2.5 px-4 font-mono">{ROLE_LABELS[member.role]}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                              member.is_active
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                          >
                            {member.is_active ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-neutral-600">
                          {member.role === "owner_admin"
                            ? "Full CRM operations, unarchive, any-owner reassignment, DPDP privacy register"
                            : member.role === "sales_coordinator"
                              ? "Lead qualification, stage progression, self-assignment, notes, follow-ups"
                              : "Read-only summary & analytics; phone/email/notes masked"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#171A20]">
                India DPDP Act, 2023 & DPDP Rules, 2025 Operational Alignment
              </h2>
              <p className="text-xs text-neutral-700 leading-relaxed">
                Per Ministry of Electronics and Information Technology (MeitY) Gazette notifications
                (Nov 2025 DPBI establishment; Nov 2026 Consent Manager framework; May 2027 full Data
                Fiduciary enforcement), WAVENOX enforces explicit consent capture (
                <code>consent_given</code>, <code>consent_version</code>, <code>consent_at</code>),
                URL PII stripping, role-based PII masking, and append-only audit logs on all
                customer records.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className="font-mono font-semibold text-[#171A20]">
                    1. Enquiry Retention (24 Months)
                  </div>
                  <p className="text-neutral-600 mt-1">
                    Unconverted solar enquiries (<code>enquiry_24m</code>) are retained for up to 24
                    months for follow-up and tariff revision comparison unless erasure or consent
                    withdrawal is requested earlier.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className="font-mono font-semibold text-[#171A20]">
                    2. Commissioned Lifecycle (25 Years)
                  </div>
                  <p className="text-neutral-600 mt-1">
                    Signed and installed projects (<code>project_lifecycle_25y</code>) are retained
                    for statutory GST invoicing, DISCOM net-metering records, and 25-year PV module
                    warranty administration.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className="font-mono font-semibold text-[#171A20]">
                    3. Append-Only Audit Trail
                  </div>
                  <p className="text-neutral-600 mt-1">
                    <code>public.crm_lead_activities</code> is protected by PostgreSQL trigger{" "}
                    <code>trg_prevent_crm_activity_mutation</code> prohibiting UPDATE or DELETE.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* SLIDE-OVER LEAD DETAIL DRAWER                                        */}
      {/* ==================================================================== */}
      {selectedLeadId && (
        <div
          id="ops-lead-detail-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Consultation Lead Detail Inspector"
          className="fixed inset-0 z-50 bg-black/50 flex justify-end"
        >
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 z-10 bg-[#171A20] text-white px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-neutral-300">
                    {leadDetail?.lead.reference_code ?? "Loading..."}
                  </span>
                  {leadDetail && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${STAGE_BADGE_STYLES[leadDetail.lead.status]}`}
                    >
                      {STAGE_LABELS[leadDetail.lead.status]}
                    </span>
                  )}
                  {leadDetail?.lead.pii_masked && (
                    <span className="px-2 py-0.5 rounded bg-neutral-700 text-neutral-200 text-[10px] font-mono">
                      PII Masked
                    </span>
                  )}
                </div>
                <h2 className="text-base font-semibold mt-0.5">
                  {leadDetail?.lead.client_name ?? "Loading Lead Record..."}
                </h2>
              </div>
              <button
                id="ops-close-detail-btn"
                type="button"
                onClick={() => {
                  setSelectedLeadId(null);
                  setLeadDetail(null);
                }}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                aria-label="Close lead detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingDetail && !leadDetail ? (
              <div className="p-8 text-center text-sm text-neutral-500">
                Loading consultation record and audit history...
              </div>
            ) : leadDetail ? (
              <div className="p-5 space-y-6 flex-1">
                {detailFeedback && (
                  <div
                    id="ops-detail-feedback"
                    role="status"
                    className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                      detailFeedback.type === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-red-50 border-red-200 text-red-900"
                    }`}
                  >
                    {detailFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{detailFeedback.text}</span>
                  </div>
                )}

                {leadDetail.lead.do_not_contact && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 font-medium">
                    DO NOT CONTACT ACTIVE: Customer has withdrawn outreach consent (
                    {leadDetail.lead.consent_withdrawn_at ?? "Recorded"}). Outbound marketing calls
                    are prohibited.
                  </div>
                )}

                {/* Section A: Customer & Property Details */}
                <section className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-600">
                      Customer & Property Profile
                    </h3>
                    {canCorrectData && (
                      <button
                        type="button"
                        onClick={() => setShowCorrectionForm(!showCorrectionForm)}
                        className="text-xs font-mono underline text-[#171A20]"
                      >
                        {showCorrectionForm ? "Cancel Correction" : "Correct Customer Data"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Phone Number
                      </span>
                      <span
                        id="ops-detail-phone"
                        className="font-mono font-semibold text-[#171A20]"
                      >
                        {leadDetail.lead.phone_display}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Email Address
                      </span>
                      <span className="font-mono text-[#171A20]">
                        {leadDetail.lead.email_display ?? "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        City / PIN Code
                      </span>
                      <span className="text-[#171A20]">
                        {leadDetail.lead.city} · PIN: {leadDetail.lead.pin_code ?? "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Property Tier & DISCOM
                      </span>
                      <span className="text-[#171A20]">
                        {leadDetail.lead.property_tier} ·{" "}
                        {leadDetail.lead.discom_code ?? "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Company / Studio Name
                      </span>
                      <span className="text-[#171A20]">
                        {leadDetail.lead.company_name ?? "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Company Website
                      </span>
                      <span className="text-[#171A20]">
                        {leadDetail.lead.company_url ?? "Not provided"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-200 text-xs">
                    <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                      Original Customer Submission Notes (Protected)
                    </span>
                    <p
                      id="ops-detail-customer-notes"
                      className="text-neutral-800 mt-0.5 whitespace-pre-wrap"
                    >
                      {leadDetail.lead.notes ?? "Not provided"}
                    </p>
                  </div>

                  {/* Controlled Data Correction Form */}
                  {showCorrectionForm && canCorrectData && (
                    <form
                      onSubmit={handleCorrectLeadData}
                      className="pt-3 border-t border-neutral-200 space-y-2.5"
                    >
                      <div className="text-xs font-mono font-semibold text-[#171A20]">
                        Audited Customer Data Correction (Logs Before & After State)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={corrClientName}
                          onChange={(e) => setCorrClientName(e.target.value)}
                          placeholder="Customer Name"
                          className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white"
                        />
                        <input
                          type="text"
                          value={corrCity}
                          onChange={(e) => setCorrCity(e.target.value)}
                          placeholder="City"
                          className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white"
                        />
                        <input
                          type="text"
                          value={corrPinCode}
                          onChange={(e) => setCorrPinCode(e.target.value)}
                          placeholder="6-digit PIN Code"
                          className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white"
                        />
                        <input
                          type="text"
                          value={corrDiscomCode}
                          onChange={(e) => setCorrDiscomCode(e.target.value)}
                          placeholder="DISCOM Code (e.g. TGSPDCL)"
                          className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white"
                        />
                      </div>
                      <input
                        type="text"
                        required
                        minLength={5}
                        value={corrReason}
                        onChange={(e) => setCorrReason(e.target.value)}
                        placeholder="Mandatory correction reason (min 5 chars)..."
                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded bg-[#171A20] text-white text-xs font-medium"
                      >
                        Save Audited Correction
                      </button>
                    </form>
                  )}
                </section>

                {/* Section B: Preliminary Solar Configuration */}
                <section className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-600">
                    Preliminary Solar Configuration Snapshot
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Array Size
                      </span>
                      <span className="font-semibold text-[#171A20]">
                        {leadDetail.lead.system_kw != null
                          ? `${leadDetail.lead.system_kw} kW`
                          : "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Battery Units
                      </span>
                      <span className="font-semibold text-[#171A20]">
                        {leadDetail.lead.battery_units} units
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Monthly Bill
                      </span>
                      <span className="font-semibold text-[#171A20]">
                        {formatInr(leadDetail.lead.monthly_bill_inr)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-mono uppercase">
                        Roof Area
                      </span>
                      <span className="font-semibold text-[#171A20]">
                        {leadDetail.lead.roof_area_sqft != null
                          ? `${leadDetail.lead.roof_area_sqft} sq ft`
                          : "Not provided"}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-500 pt-1">
                    Indicative Estimate: {formatInr(leadDetail.lead.net_price_inr)} (Preliminary
                    sizing estimate only — not contracted revenue).
                  </div>
                </section>

                {/* Section C: Multi-Touch Marketing Attribution & Consent */}
                <section className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2.5 text-xs">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-600">
                    Multi-Touch Attribution & Consent Audit
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded bg-white border border-neutral-200">
                      <div className="text-[10px] font-mono uppercase text-neutral-400">
                        First Touch
                      </div>
                      <div className="font-mono font-medium text-[#171A20] mt-0.5">
                        {leadDetail.lead.first_touch_source ?? "Not provided"} /{" "}
                        {leadDetail.lead.first_touch_medium ?? "Not provided"}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        Campaign: {leadDetail.lead.first_touch_campaign ?? "Not provided"}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        Path: {leadDetail.lead.first_touch_landing_path ?? "Not provided"}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-neutral-200">
                      <div className="text-[10px] font-mono uppercase text-neutral-400">
                        Last Touch
                      </div>
                      <div className="font-mono font-medium text-[#171A20] mt-0.5">
                        {leadDetail.lead.last_touch_source ?? "Not provided"} /{" "}
                        {leadDetail.lead.last_touch_medium ?? "Not provided"}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        Campaign: {leadDetail.lead.last_touch_campaign ?? "Not provided"}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        Path: {leadDetail.lead.last_touch_landing_path ?? "Not provided"}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-neutral-200">
                      <div className="text-[10px] font-mono uppercase text-neutral-400">
                        Conversion Touch
                      </div>
                      <div className="font-medium text-[#171A20] mt-0.5">
                        Form: {leadDetail.lead.source ?? "Not provided"}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Channel: {CHANNEL_LABELS[leadDetail.lead.attribution_channel]}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        Route: {leadDetail.lead.conversion_path ?? "Not provided"}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-600 font-mono pt-1">
                    DPDP Consent:{" "}
                    {leadDetail.lead.pii_masked
                      ? "Restricted"
                      : leadDetail.lead.consent_given
                        ? "Verified"
                        : "No"}{" "}
                    ({leadDetail.lead.consent_version ?? "N/A"} @{" "}
                    {leadDetail.lead.consent_at_ist ?? "Not provided"}) · Retention:{" "}
                    {leadDetail.lead.retention_category}
                  </div>
                </section>

                {/* Section D: Interactive CRM Operations (Role-Gated) */}
                {canMutateStage && (
                  <section className="border border-neutral-200 rounded-xl p-4 space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#171A20]">
                      Sales Stage & Ownership Controls
                    </h3>

                    {/* Stage Transition Form */}
                    <form onSubmit={handleTransitionStage} className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label
                            htmlFor="ops-stage-select"
                            className="block text-[11px] font-mono uppercase text-neutral-600 mb-1"
                          >
                            Transition Stage To
                          </label>
                          <select
                            id="ops-stage-select"
                            value={targetStage}
                            onChange={(e) => setTargetStage(e.target.value as CrmLeadStatus)}
                            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                          >
                            {(ALLOWED_STAGE_TRANSITIONS[leadDetail.lead.status] ?? []).map((st) => (
                              <option key={st} value={st}>
                                {STAGE_LABELS[st]}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="ops-qual-select"
                            className="block text-[11px] font-mono uppercase text-neutral-600 mb-1"
                          >
                            Qualification Outcome
                          </label>
                          <select
                            id="ops-qual-select"
                            value={stageQualOutcome}
                            onChange={(e) =>
                              setStageQualOutcome(e.target.value as CrmQualificationOutcome | "")
                            }
                            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                          >
                            <option value="">Keep current</option>
                            {CRM_QUALIFICATION_OUTCOMES.map((out) => (
                              <option key={out} value={out}>
                                {out}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <input
                        id="ops-stage-reason-input"
                        type="text"
                        value={stageReason}
                        onChange={(e) => setStageReason(e.target.value)}
                        placeholder="Operational note / quote reference (required for Quoted, Signed, Installed, Archived)..."
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                      />

                      <button
                        id="ops-stage-submit-btn"
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#171A20] text-white text-xs font-medium hover:bg-neutral-800"
                      >
                        Update Sales Stage
                      </button>
                    </form>

                    {/* Ownership Assignment Form */}
                    {canAssignSelf && (
                      <form
                        onSubmit={handleAssignOwner}
                        className="pt-3 border-t border-neutral-200 space-y-2.5"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <select
                            id="ops-owner-select"
                            aria-label="Assign lead owner"
                            value={targetOwnerId}
                            onChange={(e) => setTargetOwnerId(e.target.value)}
                            className="px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                          >
                            {canAssignAny && <option value="unassigned">Unassigned</option>}
                            {(leadsData?.staffDirectory ?? [])
                              .filter(
                                (s) =>
                                  s.is_active &&
                                  s.role !== "read_only_viewer" &&
                                  (canAssignAny || s.id === staff.id),
                              )
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.full_name} ({ROLE_LABELS[s.role]})
                                </option>
                              ))}
                          </select>
                          <input
                            type="text"
                            value={ownerAssignReason}
                            onChange={(e) => setOwnerAssignReason(e.target.value)}
                            placeholder="Assignment note (optional)..."
                            className="px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                          />
                        </div>
                        <button
                          id="ops-owner-submit-btn"
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg border border-[#171A20] text-[#171A20] text-xs font-medium hover:bg-neutral-100"
                        >
                          Save Lead Owner
                        </button>
                      </form>
                    )}
                  </section>
                )}

                {/* Schedule Follow-Up & Internal Staff Notes */}
                {(canCreateTask || canAddNote) && (
                  <section className="border border-neutral-200 rounded-xl p-4 space-y-4">
                    {canCreateTask && (
                      <form onSubmit={handleCreateTask} className="space-y-2.5">
                        <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#171A20]">
                          Schedule Follow-Up Task
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <select
                            id="ops-task-type-select"
                            aria-label="Follow-up task type"
                            value={newTaskType}
                            onChange={(e) => setNewTaskType(e.target.value as CrmTaskType)}
                            className="px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                          >
                            {CRM_TASK_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {TASK_TYPE_LABELS[t]}
                              </option>
                            ))}
                          </select>
                          <input
                            id="ops-task-due-input"
                            type="datetime-local"
                            value={newTaskDueAt}
                            onChange={(e) => setNewTaskDueAt(e.target.value)}
                            className="px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                          />
                        </div>
                        <input
                          id="ops-task-summary-input"
                          type="text"
                          value={newTaskSummary}
                          onChange={(e) => setNewTaskSummary(e.target.value)}
                          placeholder="Follow-up action summary (e.g. Confirm TGSPDCL bill & roof dimensions)..."
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                        />
                        <button
                          id="ops-task-submit-btn"
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg bg-[#171A20] text-white text-xs font-medium"
                        >
                          Schedule Follow-Up
                        </button>
                      </form>
                    )}

                    {canAddNote && (
                      <form
                        onSubmit={handleAddNote}
                        className="pt-3 border-t border-neutral-200 space-y-2.5"
                      >
                        <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#171A20]">
                          Add Internal Staff Note
                        </h3>
                        <textarea
                          id="ops-note-textarea"
                          rows={2}
                          value={staffNoteText}
                          onChange={(e) => setStaffNoteText(e.target.value)}
                          placeholder="Add internal engineering or sales qualification note (never overwrites customer notes)..."
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                        />
                        <button
                          id="ops-note-submit-btn"
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg border border-[#171A20] text-[#171A20] text-xs font-medium hover:bg-neutral-100"
                        >
                          Add Staff Note
                        </button>
                      </form>
                    )}
                  </section>
                )}

                {/* Owner/Admin DPDP Privacy Request Control */}
                {canManagePrivacy && (
                  <section className="border border-neutral-200 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-700">
                        DPDP Data Principal Request Register
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPrivacyForm(!showPrivacyForm)}
                        className="text-xs font-mono underline text-[#171A20]"
                      >
                        {showPrivacyForm ? "Hide Form" : "Log Privacy Request"}
                      </button>
                    </div>

                    {showPrivacyForm && (
                      <form onSubmit={handleLogPrivacyRequest} className="space-y-2.5 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <select
                            value={privReqType}
                            onChange={(e) =>
                              setPrivReqType(e.target.value as CrmPrivacyRequestType)
                            }
                            className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white"
                          >
                            {CRM_PRIVACY_REQUEST_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <select
                            value={privReqStatus}
                            onChange={(e) =>
                              setPrivReqStatus(e.target.value as CrmPrivacyRequestStatus)
                            }
                            className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white"
                          >
                            {CRM_PRIVACY_REQUEST_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          required
                          minLength={5}
                          value={privReqSummary}
                          onChange={(e) => setPrivReqSummary(e.target.value)}
                          placeholder="Verification & handling summary..."
                          className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded bg-[#171A20] text-white text-xs font-medium"
                        >
                          Record Privacy Request
                        </button>
                      </form>
                    )}
                  </section>
                )}

                {/* Section E: Immutable Activity & Audit History */}
                <section className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-600">
                    Immutable Activity & Audit Trail ({leadDetail.activities.length} Events)
                  </h3>
                  <div
                    id="ops-activity-timeline"
                    className="space-y-2.5 border-l-2 border-neutral-200 pl-4"
                  >
                    {leadDetail.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-1"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono font-semibold uppercase text-[11px] text-[#171A20]">
                            {act.action_type.replace(/_/g, " ")}
                          </span>
                          <span className="font-mono text-[11px] text-neutral-500">
                            {act.created_at_ist}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-600">
                          Actor: <strong>{act.actor_label}</strong>
                        </div>
                        {act.note_body && <p className="text-neutral-800 mt-1">{act.note_body}</p>}
                        {act.reason && (
                          <p className="text-neutral-700 italic">Reason: {act.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
