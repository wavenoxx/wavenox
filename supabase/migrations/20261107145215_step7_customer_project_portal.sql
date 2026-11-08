-- Additive Step 7. Apply only through an approved migration process.
CREATE SCHEMA IF NOT EXISTS project_private;
REVOKE ALL ON SCHEMA project_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA project_private TO service_role;

CREATE TABLE public.installation_projects (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 reference text NOT NULL UNIQUE DEFAULT ('WNX-P-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 consultation_id uuid NOT NULL UNIQUE REFERENCES public.consultations(id),
 title text NOT NULL CHECK (length(title) BETWEEN 3 AND 120),
 project_type text NOT NULL CHECK (project_type IN ('residential','commercial','hybrid')),
 city text NOT NULL CHECK (length(city) BETWEEN 2 AND 100),
 coordinator_id uuid NOT NULL REFERENCES public.crm_staff_members(id),
 state text NOT NULL DEFAULT 'active' CHECK (state IN ('active','on_hold','completed','cancelled')),
 version int NOT NULL DEFAULT 1 CHECK (version > 0),
 contact_reference text NOT NULL CHECK (length(contact_reference) BETWEEN 10 AND 300),
 activation_evidence text NOT NULL CHECK (length(activation_evidence) BETWEEN 15 AND 1000),
 created_by uuid NOT NULL REFERENCES public.crm_staff_members(id),
 creation_request_id uuid NOT NULL UNIQUE, creation_payload_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 CHECK ((state='completed') = (completed_at IS NOT NULL))
);
CREATE INDEX ON public.installation_projects(coordinator_id, updated_at DESC);
CREATE TABLE public.project_memberships (
 project_id uuid NOT NULL REFERENCES public.installation_projects(id), user_id uuid NOT NULL REFERENCES auth.users(id),
 active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz,
 PRIMARY KEY(project_id,user_id), CHECK (active = (revoked_at IS NULL))
);
CREATE INDEX ON public.project_memberships(user_id,active);
CREATE TABLE public.project_invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.installation_projects(id),
 email text NOT NULL CHECK (length(email)<=254 AND email=lower(trim(email)) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked')),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours', created_at timestamptz NOT NULL DEFAULT now(),
 accepted_user_id uuid REFERENCES auth.users(id), UNIQUE(project_id,email)
);
CREATE INDEX ON public.project_invitations(email,status,expires_at);
CREATE TABLE public.project_sessions (
 token_hash text PRIMARY KEY CHECK (token_hash ~ '^[a-f0-9]{64}$'), user_id uuid NOT NULL REFERENCES auth.users(id),
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now()+interval '1 hour', revoked_at timestamptz,
 CHECK(expires_at<=created_at+interval '1 hour')
);
CREATE INDEX ON public.project_sessions(user_id,expires_at);
CREATE TABLE public.project_milestones (
 project_id uuid NOT NULL REFERENCES public.installation_projects(id), key text NOT NULL CHECK(key IN ('confirmed','survey','engineering','utility','equipment','scheduled','installation','commissioning','handover','aftercare')),
 label text NOT NULL CHECK(length(label)<=100), ordinal int NOT NULL CHECK(ordinal BETWEEN 1 AND 10),
 state text NOT NULL DEFAULT 'not_started' CHECK(state IN ('not_started','in_progress','blocked','completed','not_applicable')),
 summary text NOT NULL DEFAULT '' CHECK(length(summary)<=1000), completed_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now(), evidence_document_id uuid,
 PRIMARY KEY(project_id,key), UNIQUE(project_id,ordinal), CHECK((state='completed')=(completed_at IS NOT NULL))
);
CREATE TABLE public.project_appointments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.installation_projects(id),
 kind text NOT NULL CHECK(kind IN ('survey','installation','service')), status text NOT NULL CHECK(status IN ('requested','proposed','confirmed','rescheduled','completed','cancelled')),
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, assigned_staff_id uuid NOT NULL REFERENCES public.crm_staff_members(id),
 instructions text NOT NULL CHECK(length(instructions) BETWEEN 5 AND 1000), completed_at timestamptz,
 CHECK(ends_at>starts_at AND ends_at-starts_at<=interval '8 hours'), CHECK((status='completed')=(completed_at IS NOT NULL))
);
CREATE INDEX ON public.project_appointments(project_id,starts_at);
CREATE INDEX ON public.project_appointments(assigned_staff_id,starts_at,ends_at) WHERE status='confirmed';
CREATE TABLE public.project_documents (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES public.installation_projects(id),
 title text NOT NULL CHECK(length(title) BETWEEN 3 AND 120), kind text NOT NULL CHECK(kind IN ('survey','engineering','quotation','agreement','equipment','utility','commissioning','handover','warranty')),
 visibility text NOT NULL DEFAULT 'internal' CHECK(visibility IN ('internal','customer')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','superseded')),
 revision int NOT NULL DEFAULT 1 CHECK(revision>0), storage_path text NOT NULL UNIQUE,
 mime text NOT NULL CHECK(mime IN ('image/jpeg','image/png')), uploaded_by uuid NOT NULL REFERENCES public.crm_staff_members(id),
 created_at timestamptz NOT NULL DEFAULT now(), replaces_id uuid REFERENCES public.project_documents(id),
 CHECK(storage_path=project_id::text||'/'||id::text||'.jpg')
);
CREATE INDEX ON public.project_documents(project_id,status);
ALTER TABLE public.project_milestones ADD FOREIGN KEY(evidence_document_id) REFERENCES public.project_documents(id);
CREATE TABLE public.project_support_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.installation_projects(id), created_by uuid NOT NULL,
 category text NOT NULL CHECK(category IN ('survey','installation','equipment','documentation','commissioning','aftercare','other')),
 description text NOT NULL CHECK(length(description) BETWEEN 10 AND 2000), status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved')),
 public_response text NOT NULL DEFAULT '' CHECK(length(public_response)<=2000), internal_note text NOT NULL DEFAULT '' CHECK(length(internal_note)<=2000),
 created_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz,
 CHECK((status='resolved')=(resolved_at IS NOT NULL)), CHECK(status<>'resolved' OR length(public_response)>=5)
);
CREATE INDEX ON public.project_support_requests(project_id,created_at DESC);
CREATE INDEX ON public.project_support_requests(created_by,created_at DESC);
CREATE TABLE public.project_activities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.installation_projects(id),
 actor_kind text NOT NULL CHECK(actor_kind IN ('staff','customer')), actor_id uuid NOT NULL, actor_label text NOT NULL CHECK(length(actor_label)<=150),
 action text NOT NULL CHECK(length(action)<=60), summary text NOT NULL CHECK(length(summary)<=2000), customer_visible boolean NOT NULL DEFAULT false,
 before_state jsonb, after_state jsonb, request_id uuid NOT NULL, payload_hash text NOT NULL, result jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(project_id,request_id)
);
CREATE INDEX ON public.project_activities(project_id,created_at DESC);
CREATE TABLE public.project_rate_limits (key text PRIMARY KEY CHECK(length(key)<=100), started_at timestamptz NOT NULL DEFAULT now(), attempts int NOT NULL DEFAULT 1 CHECK(attempts>0));

DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['installation_projects','project_memberships','project_invitations','project_sessions','project_milestones','project_appointments','project_documents','project_support_requests','project_activities','project_rate_limits'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated, service_role',t);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE ON public.%I TO service_role',t);
 END LOOP;
END $$;
REVOKE UPDATE ON public.project_activities FROM service_role;
CREATE FUNCTION project_private.immutable_activity() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN RAISE EXCEPTION 'PROJECT_AUDIT_IMMUTABLE'; END $$;
CREATE TRIGGER project_audit_append_only BEFORE UPDATE OR DELETE ON public.project_activities FOR EACH ROW EXECUTE FUNCTION project_private.immutable_activity();

-- Auth internals are exposed only through this narrow service-only helper, never through a view.
CREATE FUNCTION project_private.verified_email(p_user uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE e text; BEGIN
 SELECT lower(email) INTO e FROM auth.users WHERE id=p_user AND email_confirmed_at IS NOT NULL AND deleted_at IS NULL AND (banned_until IS NULL OR banned_until<=now());
 IF e IS NULL OR EXISTS(SELECT 1 FROM public.crm_staff_members WHERE auth_user_id=p_user) THEN
  RAISE EXCEPTION 'CUSTOMER_IDENTITY_REQUIRED' USING ERRCODE='42501'; END IF;
 RETURN e;
END $$;
CREATE FUNCTION project_private.authorize(p_kind text,p_actor uuid,p_project uuid) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$ DECLARE r text; coord uuid; BEGIN
 SELECT coordinator_id INTO coord FROM public.installation_projects WHERE id=p_project;
 IF coord IS NULL THEN RAISE EXCEPTION 'PROJECT_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
 IF p_kind='staff' THEN
  SELECT role INTO r FROM public.crm_staff_members WHERE id=p_actor AND is_active FOR SHARE;
  IF r='owner_admin' OR (r='sales_coordinator' AND coord=p_actor) THEN RETURN r; END IF;
 ELSIF p_kind='customer' THEN
  PERFORM project_private.verified_email(p_actor);
  IF EXISTS(SELECT 1 FROM public.project_memberships WHERE project_id=p_project AND user_id=p_actor AND active) THEN RETURN 'customer'; END IF;
 END IF;
 RAISE EXCEPTION 'PROJECT_ACCESS_DENIED' USING ERRCODE='42501';
END $$;
CREATE FUNCTION public.project_consume_limit(p_key text,p_limit int,p_seconds int) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$ DECLARE n int; BEGIN
 IF p_limit NOT BETWEEN 1 AND 100 OR p_seconds NOT BETWEEN 60 AND 86400 THEN RAISE EXCEPTION 'INVALID_LIMIT'; END IF;
 INSERT INTO public.project_rate_limits(key) VALUES(p_key) ON CONFLICT(key) DO UPDATE SET
 attempts=CASE WHEN project_rate_limits.started_at+make_interval(secs=>p_seconds)<=now() THEN 1 ELSE project_rate_limits.attempts+1 END,
 started_at=CASE WHEN project_rate_limits.started_at+make_interval(secs=>p_seconds)<=now() THEN now() ELSE project_rate_limits.started_at END RETURNING attempts INTO n;
 RETURN n<=p_limit;
END $$;
CREATE FUNCTION public.project_open_customer_session(p_user_id uuid,p_email text,p_token_hash text) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$ DECLARE e text; i public.project_invitations; BEGIN
 e:=project_private.verified_email(p_user_id);
 IF e IS DISTINCT FROM lower(trim(p_email)) THEN RAISE EXCEPTION 'IDENTITY_MISMATCH' USING ERRCODE='42501'; END IF;
 FOR i IN SELECT * FROM public.project_invitations WHERE email=e AND status='pending' AND expires_at>now() ORDER BY project_id LOOP
  PERFORM 1 FROM public.installation_projects WHERE id=i.project_id FOR UPDATE;
  SELECT * INTO i FROM public.project_invitations WHERE id=i.id AND status='pending' AND expires_at>now() FOR UPDATE;
  CONTINUE WHEN NOT FOUND;
  INSERT INTO public.project_memberships(project_id,user_id) VALUES(i.project_id,p_user_id) ON CONFLICT(project_id,user_id) DO UPDATE SET active=true,revoked_at=NULL,created_at=now();
  UPDATE public.project_invitations SET status='accepted',accepted_user_id=p_user_id WHERE id=i.id;
  UPDATE public.installation_projects SET version=version+1,updated_at=now() WHERE id=i.project_id;
  INSERT INTO public.project_activities(project_id,actor_kind,actor_id,actor_label,action,summary,request_id,payload_hash,result)
  VALUES(i.project_id,'customer',p_user_id,'Customer','membership_accepted','Approved project invitation accepted after email verification.',gen_random_uuid(),'auth','{}');
 END LOOP;
 IF NOT EXISTS(SELECT 1 FROM public.project_memberships WHERE user_id=p_user_id AND active) THEN RAISE EXCEPTION 'NO_PROJECT_ACCESS' USING ERRCODE='42501'; END IF;
 INSERT INTO public.project_sessions(token_hash,user_id) VALUES(p_token_hash,p_user_id);
 RETURN p_user_id;
END $$;
CREATE FUNCTION public.project_customer_session(p_token_hash text) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$ DECLARE u uuid; BEGIN
 SELECT user_id INTO u FROM public.project_sessions WHERE token_hash=p_token_hash AND revoked_at IS NULL AND expires_at>now();
 IF u IS NULL THEN RAISE EXCEPTION 'SESSION_REQUIRED' USING ERRCODE='42501'; END IF;
 PERFORM project_private.verified_email(u); RETURN u;
END $$;
CREATE FUNCTION public.project_create(p_actor_id uuid,p_input jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE actor public.crm_staff_members; lead public.consultations; p public.installation_projects; rid uuid; h text; result jsonb;
BEGIN
 actor:=crm_private.writer(p_actor_id);
 IF actor.role<>'owner_admin' THEN RAISE EXCEPTION 'OWNER_REQUIRED' USING ERRCODE='42501'; END IF;
 rid:=(p_input->>'requestId')::uuid; h:=encode(sha256(convert_to(p_input::text,'UTF8')),'hex');
 SELECT * INTO lead FROM public.consultations WHERE id=(p_input->>'consultationId')::uuid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_CONSULTATION' USING ERRCODE='PT400'; END IF;
 SELECT * INTO p FROM public.installation_projects WHERE consultation_id=lead.id;
 IF FOUND THEN
  IF p.creation_request_id=rid AND p.creation_payload_hash=h AND p.created_by=p_actor_id THEN RETURN jsonb_build_object('projectId',p.id,'version',p.version,'replayed',true); END IF;
  RAISE EXCEPTION 'PROJECT_ALREADY_EXISTS' USING ERRCODE='PT409';
 END IF;
 IF lead.crm_version IS DISTINCT FROM (p_input->>'expectedLeadVersion')::int THEN RAISE EXCEPTION 'VERSION_CONFLICT' USING ERRCODE='PT409'; END IF;
 IF lead.status<>'contract_signed' OR p_input->>'prerequisitesConfirmed' IS DISTINCT FROM 'true' OR NOT EXISTS(SELECT 1 FROM public.crm_staff_members WHERE id=(p_input->>'coordinatorId')::uuid AND is_active AND role IN ('owner_admin','sales_coordinator')) THEN RAISE EXCEPTION 'PROJECT_PREREQUISITES_REQUIRED' USING ERRCODE='PT400'; END IF;
 INSERT INTO public.installation_projects(consultation_id,title,project_type,city,coordinator_id,contact_reference,activation_evidence,created_by,creation_request_id,creation_payload_hash)
 VALUES(lead.id,p_input->>'title',p_input->>'projectType',p_input->>'city',(p_input->>'coordinatorId')::uuid,p_input->>'contactReference',p_input->>'authorizationEvidence',p_actor_id,rid,h) RETURNING * INTO p;
 INSERT INTO public.project_milestones(project_id,key,label,ordinal,state,summary,completed_at)
 SELECT p.id,k,l,n,CASE WHEN n=1 THEN 'completed' ELSE 'not_started' END,CASE WHEN n=1 THEN 'Project activated after staff review of operational prerequisites.' ELSE '' END,CASE WHEN n=1 THEN now() ELSE NULL END
 FROM (VALUES('confirmed','Project confirmed',1),('survey','Site survey',2),('engineering','Engineering review',3),('utility','DISCOM / net-metering coordination',4),('equipment','Equipment preparation',5),('scheduled','Installation scheduled',6),('installation','Installation underway',7),('commissioning','Testing & commissioning',8),('handover','Handover',9),('aftercare','Aftercare & support',10)) AS x(k,l,n);
 result:=jsonb_build_object('projectId',p.id,'version',1);
 INSERT INTO public.project_activities(project_id,actor_kind,actor_id,actor_label,action,summary,before_state,after_state,request_id,payload_hash,result)
 VALUES(p.id,'staff',actor.id,actor.full_name,'project_created',p.activation_evidence,NULL,to_jsonb(p),rid,h,result);
 RETURN result;
END $$;
CREATE FUNCTION public.project_read(p_actor_kind text,p_actor_id uuid,p_project_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$ DECLARE result jsonb; BEGIN
 PERFORM project_private.authorize(p_actor_kind,p_actor_id,p_project_id);
 SELECT to_jsonb(p)||jsonb_build_object(
 'milestones',(SELECT coalesce(jsonb_agg(to_jsonb(m) ORDER BY ordinal),'[]') FROM public.project_milestones m WHERE project_id=p.id),
 'appointments',(SELECT coalesce(jsonb_agg(to_jsonb(a)),'[]') FROM (SELECT * FROM public.project_appointments WHERE project_id=p.id ORDER BY starts_at DESC LIMIT 100) a),
 'documents',(SELECT coalesce(jsonb_agg(to_jsonb(d)),'[]') FROM (SELECT * FROM public.project_documents WHERE project_id=p.id ORDER BY created_at DESC LIMIT 100) d),
 'support',(SELECT coalesce(jsonb_agg(to_jsonb(s)),'[]') FROM (SELECT * FROM public.project_support_requests WHERE project_id=p.id ORDER BY created_at DESC LIMIT 100) s),
 'activities',(SELECT coalesce(jsonb_agg(to_jsonb(a)),'[]') FROM (SELECT * FROM public.project_activities WHERE project_id=p.id ORDER BY created_at DESC LIMIT 100) a),
 'memberships',(SELECT coalesce(jsonb_agg(to_jsonb(m)),'[]') FROM public.project_memberships m WHERE project_id=p.id),
 'invitations',(SELECT coalesce(jsonb_agg(to_jsonb(i)),'[]') FROM public.project_invitations i WHERE project_id=p.id)
 ) INTO result FROM public.installation_projects p WHERE id=p_project_id;
 RETURN result;
END $$;
CREATE FUNCTION public.project_list(p_actor_kind text,p_actor_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$ DECLARE r text; result jsonb; BEGIN
 IF p_actor_kind='staff' THEN
  SELECT role INTO r FROM public.crm_staff_members WHERE id=p_actor_id AND is_active;
  IF r IS NULL THEN RAISE EXCEPTION 'STAFF_REQUIRED' USING ERRCODE='42501'; END IF;
 ELSIF p_actor_kind='customer' THEN PERFORM project_private.verified_email(p_actor_id);
 ELSE RAISE EXCEPTION 'IDENTITY_REQUIRED' USING ERRCODE='42501'; END IF;
 SELECT coalesce(jsonb_agg(to_jsonb(x)),'[]') INTO result FROM (
  SELECT p.id,p.reference,CASE WHEN r='read_only_viewer' THEN 'Restricted project' ELSE p.title END AS title,
  CASE WHEN r='read_only_viewer' THEN '' ELSE p.city END AS city,p.project_type,p.state,p.version,p.updated_at,(r='read_only_viewer') IS TRUE AS restricted
  FROM public.installation_projects p WHERE (p_actor_kind='staff' AND (r IN ('owner_admin','read_only_viewer') OR p.coordinator_id=p_actor_id)) OR
  (p_actor_kind='customer' AND EXISTS(SELECT 1 FROM public.project_memberships m WHERE m.project_id=p.id AND m.user_id=p_actor_id AND m.active))
  ORDER BY p.updated_at DESC LIMIT 50
 ) x;
 RETURN result;
END $$;
CREATE FUNCTION public.project_mutate(p_actor_kind text,p_actor_id uuid,p_project_id uuid,p_expected_version int,p_request_id uuid,p_action text,p_payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
<<mutation>>
DECLARE p public.installation_projects; r text; a public.project_activities; m public.project_milestones; ap public.project_appointments; d public.project_documents; s public.project_support_requests;
 h text; summary text; visible boolean:=false; old_state jsonb; new_state jsonb; result jsonb; resource uuid; target uuid; label text; st text; invite_email text; revision_no int:=1; next_state text; allowed boolean;
BEGIN
 IF p_actor_kind='staff' THEN PERFORM crm_private.writer(p_actor_id); END IF;
 SELECT * INTO p FROM public.installation_projects WHERE id=p_project_id FOR UPDATE;
 r:=project_private.authorize(p_actor_kind,p_actor_id,p_project_id);
 h:=encode(sha256(convert_to(p_action||p_payload::text,'UTF8')),'hex');
 SELECT * INTO a FROM public.project_activities WHERE project_id=p_project_id AND request_id=p_request_id;
 IF FOUND THEN
  IF a.actor_id=p_actor_id AND a.actor_kind=p_actor_kind AND a.action=p_action AND a.payload_hash=h THEN RETURN a.result||'{"replayed":true}'::jsonb; END IF;
  RAISE EXCEPTION 'REQUEST_REPLAY_CONFLICT' USING ERRCODE='PT409';
 END IF;
 IF p.version IS DISTINCT FROM p_expected_version THEN RAISE EXCEPTION 'VERSION_CONFLICT' USING ERRCODE='PT409'; END IF;
 IF p_actor_kind='customer' AND p_action NOT IN ('support','appointment') THEN RAISE EXCEPTION 'CUSTOMER_ACTION_DENIED' USING ERRCODE='42501'; END IF;
 IF p.state IN ('completed','cancelled') AND p_action IN ('milestone','coordinator') THEN RAISE EXCEPTION 'REOPEN_PROJECT_FIRST' USING ERRCODE='PT409'; END IF;
 IF p_action IN ('coordinator','status','invite','revoke') AND r<>'owner_admin' THEN RAISE EXCEPTION 'OWNER_REQUIRED' USING ERRCODE='42501'; END IF;
 IF p_actor_kind='staff' THEN SELECT full_name INTO label FROM public.crm_staff_members WHERE id=p_actor_id; ELSE label:='Customer'; END IF;
 summary:=coalesce(p_payload->>'reason',p_payload->>'summary','');
 IF p_action='coordinator' THEN
  target:=(p_payload->>'coordinatorId')::uuid;
  IF NOT EXISTS(SELECT 1 FROM public.crm_staff_members WHERE id=target AND is_active AND role IN ('owner_admin','sales_coordinator')) THEN RAISE EXCEPTION 'INVALID_COORDINATOR' USING ERRCODE='PT400'; END IF;
  old_state:=jsonb_build_object('coordinator_id',p.coordinator_id);
  UPDATE public.installation_projects SET coordinator_id=target WHERE id=p.id;
  new_state:=jsonb_build_object('coordinator_id',target);
 ELSIF p_action='status' THEN
  st:=p_payload->>'state';
  IF st=p.state THEN RAISE EXCEPTION 'NO_STATE_CHANGE' USING ERRCODE='PT400'; END IF;
  IF st='completed' AND (SELECT count(*) FROM public.project_milestones m JOIN public.project_documents d ON d.id=m.evidence_document_id AND d.project_id=p.id AND d.status='verified' AND d.kind=m.key WHERE m.project_id=p.id AND m.key IN ('commissioning','handover') AND m.state='completed')<>2 THEN RAISE EXCEPTION 'COMPLETION_EVIDENCE_REQUIRED' USING ERRCODE='PT400'; END IF;
  old_state:=jsonb_build_object('state',p.state,'completed_at',p.completed_at);
  UPDATE public.installation_projects SET state=st,completed_at=CASE WHEN st='completed' THEN now() ELSE NULL END WHERE id=p.id;
  new_state:=jsonb_build_object('state',st); visible:=true;
 ELSIF p_action='milestone' THEN
  SELECT * INTO m FROM public.project_milestones WHERE project_id=p.id AND key=p_payload->>'key';
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_MILESTONE' USING ERRCODE='PT400'; END IF;
  next_state:=p_payload->>'state';
  allowed:=CASE m.state WHEN 'not_started' THEN next_state IN ('in_progress','blocked','not_applicable') WHEN 'in_progress' THEN next_state IN ('blocked','completed','not_applicable') WHEN 'blocked' THEN next_state IN ('in_progress','not_applicable') WHEN 'completed' THEN next_state='in_progress' WHEN 'not_applicable' THEN next_state IN ('not_started','in_progress') ELSE false END;
  IF NOT coalesce(allowed,false) OR length(trim(summary))<10 THEN RAISE EXCEPTION 'INVALID_MILESTONE_TRANSITION' USING ERRCODE='PT400'; END IF;
  resource:=(p_payload->>'evidenceDocumentId')::uuid;
  IF resource IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.project_documents WHERE id=resource AND project_id=p.id AND status='verified') THEN RAISE EXCEPTION 'INVALID_DOCUMENT_EVIDENCE' USING ERRCODE='PT400'; END IF;
  IF m.key IN ('commissioning','handover') THEN
   IF next_state='not_applicable' OR (next_state='completed' AND NOT EXISTS(SELECT 1 FROM public.project_documents WHERE id=resource AND project_id=p.id AND kind=m.key AND status='verified')) THEN RAISE EXCEPTION 'VERIFIED_DOCUMENT_REQUIRED' USING ERRCODE='PT400'; END IF;
   IF next_state='completed' AND NOT EXISTS(SELECT 1 FROM public.project_milestones WHERE project_id=p.id AND key=CASE WHEN m.key='handover' THEN 'commissioning' ELSE 'installation' END AND state='completed') THEN RAISE EXCEPTION 'PRIOR_MILESTONE_REQUIRED' USING ERRCODE='PT400'; END IF;
  END IF;
  IF m.key IN ('installation','commissioning') AND m.state='completed' AND EXISTS(SELECT 1 FROM public.project_milestones WHERE project_id=p.id AND key=CASE WHEN m.key='installation' THEN 'commissioning' ELSE 'handover' END AND state='completed') THEN RAISE EXCEPTION 'REVERSE_DEPENDENT_MILESTONE_FIRST' USING ERRCODE='PT409'; END IF;
  old_state:=to_jsonb(m);
  UPDATE public.project_milestones SET state=next_state,summary=mutation.summary,updated_at=now(),completed_at=CASE WHEN next_state='completed' THEN now() ELSE NULL END,evidence_document_id=resource WHERE project_id=p.id AND key=m.key RETURNING to_jsonb(project_milestones) INTO new_state;
  visible:=true;
 ELSIF p_action='appointment' THEN
  st:=p_payload->>'status'; resource:=coalesce((p_payload->>'id')::uuid,gen_random_uuid());
  IF p_actor_kind='customer' AND (st<>'requested' OR p_payload ? 'id' OR p_payload ? 'assignedStaffId') THEN RAISE EXCEPTION 'CUSTOMER_CAN_ONLY_REQUEST' USING ERRCODE='42501'; END IF;
  IF p_payload ? 'id' THEN SELECT * INTO ap FROM public.project_appointments WHERE id=resource AND project_id=p.id; IF NOT FOUND THEN RAISE EXCEPTION 'APPOINTMENT_NOT_FOUND' USING ERRCODE='PT400'; END IF; old_state:=to_jsonb(ap); END IF;
  IF st='completed' AND (ap.status IS DISTINCT FROM 'confirmed' OR ap.ends_at>now() OR ap.starts_at IS DISTINCT FROM (p_payload->>'startsAt')::timestamptz OR ap.ends_at IS DISTINCT FROM (p_payload->>'endsAt')::timestamptz) THEN RAISE EXCEPTION 'CONFIRMED_VISIT_REQUIRED' USING ERRCODE='PT400'; END IF;
  IF st IN ('rescheduled','cancelled') AND ap.id IS NULL THEN RAISE EXCEPTION 'EXISTING_APPOINTMENT_REQUIRED' USING ERRCODE='PT400'; END IF;
  IF ap.status IN ('cancelled','completed') THEN RAISE EXCEPTION 'APPOINTMENT_CLOSED' USING ERRCODE='PT409'; END IF;
  target:=coalesce((p_payload->>'assignedStaffId')::uuid,p.coordinator_id);
  IF r='sales_coordinator' AND target<>p_actor_id THEN RAISE EXCEPTION 'COORDINATOR_SCOPE' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.crm_staff_members WHERE id=target AND is_active AND role IN ('owner_admin','sales_coordinator')) THEN RAISE EXCEPTION 'INVALID_COORDINATOR' USING ERRCODE='PT400'; END IF;
  IF st IN ('requested','proposed','confirmed','rescheduled') AND (p_payload->>'startsAt')::timestamptz<=now() THEN RAISE EXCEPTION 'FUTURE_APPOINTMENT_REQUIRED' USING ERRCODE='PT400'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(target::text,7));
  IF st='confirmed' AND EXISTS(SELECT 1 FROM public.project_appointments WHERE assigned_staff_id=target AND status='confirmed' AND id<>resource AND starts_at<(p_payload->>'endsAt')::timestamptz AND ends_at>(p_payload->>'startsAt')::timestamptz) THEN RAISE EXCEPTION 'APPOINTMENT_OVERLAP' USING ERRCODE='PT409'; END IF;
  INSERT INTO public.project_appointments(id,project_id,kind,status,starts_at,ends_at,assigned_staff_id,instructions,completed_at)
  VALUES(resource,p.id,p_payload->>'kind',st,(p_payload->>'startsAt')::timestamptz,(p_payload->>'endsAt')::timestamptz,target,p_payload->>'instructions',CASE WHEN st='completed' THEN now() ELSE NULL END)
  ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,status=excluded.status,starts_at=excluded.starts_at,ends_at=excluded.ends_at,assigned_staff_id=excluded.assigned_staff_id,instructions=excluded.instructions,completed_at=excluded.completed_at RETURNING to_jsonb(project_appointments) INTO new_state;
  summary:='Appointment '||st||': '||(p_payload->>'instructions'); visible:=true;
 ELSIF p_action='note' THEN
  IF length(trim(summary))<5 THEN RAISE EXCEPTION 'NOTE_REQUIRED' USING ERRCODE='PT400'; END IF;
  visible:=coalesce((p_payload->>'customerVisible')::boolean,false); new_state:=jsonb_build_object('summary',summary,'customer_visible',visible);
 ELSIF p_action='invite' THEN
  invite_email:=lower(trim(p_payload->>'email'));
  IF EXISTS(SELECT 1 FROM public.project_invitations WHERE project_id=p.id AND project_invitations.email=invite_email AND (status='accepted' OR (status='pending' AND expires_at>now()))) THEN RAISE EXCEPTION 'INVITATION_ALREADY_ACTIVE' USING ERRCODE='PT409'; END IF;
  INSERT INTO public.project_invitations(project_id,email) VALUES(p.id,invite_email) ON CONFLICT(project_id,email) DO UPDATE SET status='pending',expires_at=now()+interval '24 hours',accepted_user_id=NULL,created_at=now() RETURNING id,to_jsonb(project_invitations) INTO resource,new_state;
 ELSIF p_action='revoke' THEN
  IF (p_payload ? 'userId')=(p_payload ? 'invitationId') THEN RAISE EXCEPTION 'ONE_ACCESS_TARGET_REQUIRED' USING ERRCODE='PT400'; END IF;
  IF p_payload ? 'userId' THEN
   target:=(p_payload->>'userId')::uuid;
   UPDATE public.project_memberships SET active=false,revoked_at=now() WHERE project_id=p.id AND user_id=target AND active RETURNING to_jsonb(project_memberships) INTO new_state;
   IF NOT FOUND THEN RAISE EXCEPTION 'MEMBERSHIP_NOT_FOUND' USING ERRCODE='PT400'; END IF;
   UPDATE public.project_invitations SET status='revoked' WHERE project_id=p.id AND accepted_user_id=target;
  ELSE
   UPDATE public.project_invitations SET status='revoked' WHERE project_id=p.id AND id=(p_payload->>'invitationId')::uuid AND status='pending' RETURNING to_jsonb(project_invitations) INTO new_state;
   IF NOT FOUND THEN RAISE EXCEPTION 'INVITATION_NOT_FOUND' USING ERRCODE='PT400'; END IF;
  END IF;
 ELSIF p_action='document' THEN
  resource:=(p_payload->>'id')::uuid;
  IF p_payload->>'replacesId' IS NOT NULL THEN
   SELECT * INTO d FROM public.project_documents WHERE id=(p_payload->>'replacesId')::uuid AND project_id=p.id AND status<>'superseded';
   IF NOT FOUND OR EXISTS(SELECT 1 FROM public.project_milestones WHERE project_id=p.id AND evidence_document_id=d.id AND state='completed') THEN RAISE EXCEPTION 'DOCUMENT_REPLACEMENT_DENIED' USING ERRCODE='PT409'; END IF;
   old_state:=to_jsonb(d); revision_no:=d.revision+1;
   UPDATE public.project_documents SET status='superseded' WHERE id=d.id;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='project-documents' AND name=p_payload->>'storagePath') THEN RAISE EXCEPTION 'STORAGE_OBJECT_REQUIRED' USING ERRCODE='PT400'; END IF;
  INSERT INTO public.project_documents(id,project_id,title,kind,visibility,revision,storage_path,mime,uploaded_by,replaces_id)
  VALUES(resource,p.id,p_payload->>'title',p_payload->>'kind',p_payload->>'visibility',revision_no,p_payload->>'storagePath',p_payload->>'mime',p_actor_id,(p_payload->>'replacesId')::uuid) RETURNING to_jsonb(project_documents) INTO new_state;
  summary:='Document uploaded for review: '||(p_payload->>'title');
 ELSIF p_action='document_review' THEN
  SELECT * INTO d FROM public.project_documents WHERE id=(p_payload->>'id')::uuid AND project_id=p.id AND status<>'superseded';
  IF NOT FOUND THEN RAISE EXCEPTION 'DOCUMENT_NOT_FOUND' USING ERRCODE='PT400'; END IF;
  IF (p_payload->>'verified')::boolean IS DISTINCT FROM true AND EXISTS(SELECT 1 FROM public.project_milestones WHERE project_id=p.id AND evidence_document_id=d.id AND state='completed') THEN RAISE EXCEPTION 'REVERSE_MILESTONE_FIRST' USING ERRCODE='PT409'; END IF;
  old_state:=to_jsonb(d); resource:=d.id;
  UPDATE public.project_documents SET status=CASE WHEN (p_payload->>'verified')::boolean THEN 'verified' ELSE 'pending' END WHERE id=d.id RETURNING to_jsonb(project_documents) INTO new_state;
  visible:=d.visibility='customer' AND (p_payload->>'verified')::boolean;
  IF visible THEN summary:='Document available: '||d.title; END IF;
 ELSIF p_action='support' THEN
  IF NOT public.project_consume_limit('support:'||p_actor_id::text,5,3600) THEN RAISE EXCEPTION 'SUPPORT_RATE_LIMIT' USING ERRCODE='PT429'; END IF;
  INSERT INTO public.project_support_requests(project_id,created_by,category,description) VALUES(p.id,p_actor_id,p_payload->>'category',p_payload->>'description') RETURNING id,to_jsonb(project_support_requests) INTO resource,new_state;
  summary:='Support request received.'; visible:=true;
 ELSIF p_action='support_response' THEN
  SELECT * INTO s FROM public.project_support_requests WHERE id=(p_payload->>'id')::uuid AND project_id=p.id;
  IF NOT FOUND THEN RAISE EXCEPTION 'SUPPORT_NOT_FOUND' USING ERRCODE='PT400'; END IF;
  old_state:=to_jsonb(s); resource:=s.id;
  UPDATE public.project_support_requests SET status=p_payload->>'status',public_response=p_payload->>'publicResponse',internal_note=coalesce(p_payload->>'internalNote',''),resolved_at=CASE WHEN p_payload->>'status'='resolved' THEN now() ELSE NULL END WHERE id=s.id RETURNING to_jsonb(project_support_requests) INTO new_state;
  summary:='Support request '||(p_payload->>'status')||'.'; visible:=length(coalesce(p_payload->>'publicResponse',''))>0;
 ELSE RAISE EXCEPTION 'INVALID_PROJECT_ACTION' USING ERRCODE='PT400'; END IF;
 IF p_action IN ('coordinator','status','invite','revoke','document_review') AND length(trim(coalesce(p_payload->>'reason','')))<10 THEN RAISE EXCEPTION 'REASON_REQUIRED' USING ERRCODE='PT400'; END IF;
 UPDATE public.installation_projects SET version=version+1,updated_at=now() WHERE id=p.id;
 result:=jsonb_build_object('projectId',p.id,'version',p.version+1,'resourceId',resource);
 INSERT INTO public.project_activities(project_id,actor_kind,actor_id,actor_label,action,summary,customer_visible,before_state,after_state,request_id,payload_hash,result)
 VALUES(p.id,p_actor_kind,p_actor_id,label,p_action,summary,visible,old_state,new_state,p_request_id,h,result);
 RETURN result;
END $$;
CREATE FUNCTION public.project_document_access(p_actor_kind text,p_actor_id uuid,p_document_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$ DECLARE d public.project_documents; r text; BEGIN
 SELECT * INTO d FROM public.project_documents WHERE id=p_document_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'DOCUMENT_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
 r:=project_private.authorize(p_actor_kind,p_actor_id,d.project_id);
 IF d.status='superseded' OR (r='customer' AND (d.visibility<>'customer' OR d.status<>'verified')) THEN RAISE EXCEPTION 'DOCUMENT_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
 INSERT INTO public.project_activities(project_id,actor_kind,actor_id,actor_label,action,summary,request_id,payload_hash,result)
 VALUES(d.project_id,p_actor_kind,p_actor_id,CASE WHEN r='customer' THEN 'Customer' ELSE 'Authorized staff' END,'document_access','Authorized document download requested.',gen_random_uuid(),'download',jsonb_build_object('documentId',d.id));
 RETURN d.storage_path;
END $$;

-- Private bucket, with a restrictive policy protecting it even if another permissive
-- storage policy is added elsewhere. The application never issues signed/public URLs.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('project-documents','project-documents',false,3145728,ARRAY['image/jpeg']) ON CONFLICT(id) DO NOTHING;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM storage.buckets WHERE id='project-documents' AND public) THEN RAISE EXCEPTION 'PROJECT_BUCKET_MUST_BE_PRIVATE'; END IF; END $$;
CREATE POLICY project_documents_server_only ON storage.objects AS RESTRICTIVE FOR ALL TO anon,authenticated
USING(bucket_id<>'project-documents') WITH CHECK(bucket_id<>'project-documents');
-- Needed only for checking that a successful storage upload exists before registering it.
GRANT SELECT ON storage.objects TO service_role;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA project_private FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA project_private TO service_role;
REVOKE ALL ON FUNCTION public.project_consume_limit(text,int,int),public.project_open_customer_session(uuid,text,text),public.project_customer_session(text),public.project_create(uuid,jsonb),public.project_read(text,uuid,uuid),public.project_list(text,uuid),public.project_mutate(text,uuid,uuid,int,uuid,text,jsonb),public.project_document_access(text,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.project_consume_limit(text,int,int),public.project_open_customer_session(uuid,text,text),public.project_customer_session(text),public.project_create(uuid,jsonb),public.project_read(text,uuid,uuid),public.project_list(text,uuid),public.project_mutate(text,uuid,uuid,int,uuid,text,jsonb),public.project_document_access(text,uuid,uuid) TO service_role;

CREATE FUNCTION project_private.email_allowed(p_email text) RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 SELECT NOT EXISTS(SELECT 1 FROM public.crm_staff_members WHERE lower(email)=lower(trim(p_email))) AND (
 EXISTS(SELECT 1 FROM public.project_invitations WHERE email=lower(trim(p_email)) AND status='pending' AND expires_at>now()) OR
 EXISTS(SELECT 1 FROM public.project_memberships m JOIN auth.users u ON u.id=m.user_id WHERE m.active AND lower(u.email)=lower(trim(p_email)) AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<=now())));
$$;
CREATE FUNCTION public.project_email_allowed(p_email text) RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT project_private.email_allowed(p_email); $$;
REVOKE ALL ON FUNCTION project_private.email_allowed(text),public.project_email_allowed(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION project_private.email_allowed(text),public.project_email_allowed(text) TO service_role;
