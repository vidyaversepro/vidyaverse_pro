import { useEffect, type ComponentType } from 'react';
import {
  useMyStudentProfile,
  useMyAttendanceSummary,
  useMyTodayTimetable,
  useMyNotices,
  useMyTransport,
  useMyHostel,
  useMyDocuments
} from '@/lib/queries/student/student-queries';
import { useStudentInvoices } from '@/lib/queries/payments-queries';
import { useActiveInstitution } from '@/stores/activeInstitution';
import { TONE, TONE_VAR, TONE_TINT } from '@/components/shared/Pill';
import {
  Loader2,
  GraduationCap,
  IndianRupee,
  BookOpen,
  Heart,
  AlertCircle,
  Hash,
  Clock,
  CalendarDays,
  Bell,
  Bus,
  MapPin,
  Building,
  FileText,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function WidgetCard({ title, icon: Icon, children }: { title: string; icon: ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-2xl p-[18px]">
      <div className="flex items-center gap-2 mb-3.5 text-[15px]" style={{ fontFamily: 'var(--font-display)' }}>
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </div>
      {children}
    </div>
  );
}

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const setInstitutionId = useActiveInstitution((s) => s.setInstitutionId);

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useMyStudentProfile();

  // Students belong to exactly one institution — seed the Zustand store
  // so downstream hooks that read x-institution-id from the header work correctly.
  useEffect(() => {
    if (profile?.institution.id) {
      setInstitutionId(profile.institution.id);
    }
  }, [profile?.institution.id, setInstitutionId]);

  const { data: invoices } = useStudentInvoices(profile?.institution.id ?? '', profile?.id ?? '');

  const { data: attendanceData, isLoading: attendanceLoading } = useMyAttendanceSummary();
  const { data: timetableData, isLoading: timetableLoading } = useMyTodayTimetable();
  const { data: noticesData, isLoading: noticesLoading } = useMyNotices(5);
  const { data: transportData, isLoading: transportLoading, isError: transportError } = useMyTransport();
  const { data: hostelData, isLoading: hostelLoading, isError: hostelError } = useMyHostel();
  const { data: documentsData, isLoading: documentsLoading } = useMyDocuments();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Account exists but no Student record linked yet
  if (profileError || !profile) {
    return (
      <div className="p-6 space-y-4 max-w-lg">
        <h1 className="text-2xl">My Dashboard</h1>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-200 text-sm">
              Profile not linked yet
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              Your login account hasn't been connected to a student record.
              Please contact your school administrator to complete the setup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compute fee summary from invoices array
  const invoiceList: any[] = Array.isArray(invoices) ? invoices : [];

  const unpaidInvoices = invoiceList.filter((inv) =>
    ['unpaid', 'partial'].includes(inv.status)
  );
  const totalOutstanding = unpaidInvoices.reduce(
    (sum: number, inv: any) =>
      sum + parseFloat(inv.netAmount ?? '0') - parseFloat(inv.paidAmount ?? '0'),
    0
  );
  const payNowUrl = unpaidInvoices.find((inv) => inv.paymentLinkUrl)?.paymentLinkUrl as string | undefined;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Profile header */}
      <div className="flex items-center gap-3.5">
        <span
          className="w-[54px] h-[54px] rounded-full text-white flex items-center justify-center flex-shrink-0 text-xl"
          style={{ fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, hsl(var(--primary)), var(--accent-strong))' }}
        >
          {initials(profile.name)}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight truncate">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">{profile.institution.name}</p>
        </div>
      </div>

      {/* Academic identity cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border rounded-2xl p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Class &amp; Section</div>
          <div className="flex items-center gap-1.5 mt-1.5 font-bold text-[15px]">
            <GraduationCap className="h-4 w-4" style={{ color: TONE_VAR.peacock }} />
            {profile.section.class.name} — {profile.section.name}
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Admission No.</div>
          <div className="flex items-center gap-1.5 mt-1.5 font-bold text-[15px]">
            <Hash className="h-4 w-4" style={{ color: TONE_VAR.lotus }} />
            {profile.admissionNumber ?? '—'}
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Roll No.</div>
          <div className="flex items-center gap-1.5 mt-1.5 font-bold text-[15px]">
            <Hash className="h-4 w-4" style={{ color: TONE_VAR.indigo }} />
            {profile.rollNumber ?? '—'}
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Attendance */}
        <WidgetCard title="Attendance summary" icon={CalendarDays}>
          {attendanceLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : attendanceData ? (
            <div className="flex items-center gap-[18px]">
              <div className="relative w-[88px] h-[88px] shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="hsl(var(--border))" strokeWidth="3.4"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    strokeDasharray={`${attendanceData.stats.attendanceRate}, 100`}
                    fill="none" stroke="hsl(var(--primary))" strokeWidth="3.4" strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[19px]" style={{ fontFamily: 'var(--font-display)' }}>
                    {Math.round(attendanceData.stats.attendanceRate)}%
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-[13.5px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Present</span>
                  <span className="font-bold" style={{ color: TONE_VAR.green }}>{attendanceData.stats.present}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Absent</span>
                  <span className="font-bold" style={{ color: TONE_VAR.red }}>{attendanceData.stats.absent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Late</span>
                  <span className="font-bold" style={{ color: TONE_VAR.temple }}>{attendanceData.stats.late}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet</p>
          )}
        </WidgetCard>

        {/* Timetable */}
        <WidgetCard title="Today's classes" icon={Clock}>
          {timetableLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : timetableData && timetableData.length > 0 ? (
            <div className="flex flex-col gap-2">
              {timetableData.map((slot: any) => {
                const now = new Date();
                const [startH, startM] = slot.period.startTime.split(':').map(Number);
                const [endH, endM] = slot.period.endTime.split(':').map(Number);
                const periodStart = new Date(); periodStart.setHours(startH, startM, 0);
                const periodEnd = new Date(); periodEnd.setHours(endH, endM, 0);
                const isCurrent = now >= periodStart && now <= periodEnd;

                return (
                  <div
                    key={slot.id}
                    className="flex items-start justify-between gap-2 py-2.5 px-2.5 rounded-[10px] border-l-[3px]"
                    style={{ borderLeftColor: isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--border))', background: isCurrent ? 'hsl(var(--primary) / 0.06)' : 'hsl(var(--muted) / 0.5)' }}
                  >
                    <div>
                      <p className="font-bold text-[13.5px]">{slot.subjectName}</p>
                      <p className="text-xs text-muted-foreground">{slot.period.startTime} – {slot.period.endTime}</p>
                    </div>
                    {slot.room && (
                      <span className="text-[11px] font-bold text-muted-foreground bg-muted border rounded-[7px] px-2 py-0.5 whitespace-nowrap">
                        {slot.room}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No classes today</p>
          )}
        </WidgetCard>

        {/* Fee status */}
        <WidgetCard title="Fee status" icon={IndianRupee}>
          {unpaidInvoices.length === 0 ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: TONE_VAR.green }}>
              <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: TONE_TINT.green, color: TONE_VAR.green }}>
                All clear
              </span>
              <span className="text-muted-foreground">No outstanding dues</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[13px] text-muted-foreground">
                  {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[22px]" style={{ fontFamily: 'var(--font-display)', color: TONE_VAR.red }}>
                  ₹{totalOutstanding.toLocaleString('en-IN')}
                </span>
              </div>
              {unpaidInvoices.slice(0, 3).map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between py-2.5 border-t text-[13px]">
                  <span className="text-muted-foreground truncate max-w-[180px]">{inv.invoiceNumber}</span>
                  <span
                    className="inline-flex items-center text-[11px] font-bold capitalize px-2.5 py-1 rounded-full"
                    style={inv.status === 'partial' ? { color: TONE_VAR.temple, background: TONE_TINT.temple } : { color: TONE_VAR.red, background: TONE_TINT.red }}
                  >
                    {inv.status}
                  </span>
                </div>
              ))}
              {payNowUrl && (
                <button
                  onClick={() => window.open(payNowUrl, '_blank', 'noopener,noreferrer')}
                  className="w-full mt-3 h-[42px] rounded-[11px] text-white font-bold text-[13.5px]"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), var(--accent-strong))' }}
                >
                  Pay now
                </button>
              )}
            </>
          )}
        </WidgetCard>

        {/* Notices */}
        <WidgetCard title="Official notices" icon={Bell}>
          {noticesLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : noticesData && noticesData.length > 0 ? (
            <div className="flex flex-col">
              {noticesData.map((notice: any) => (
                <div key={notice.id} className="py-2.5 border-t first:border-0 first:pt-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-[13.5px] font-bold">{notice.title}</h4>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(notice.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-muted rounded-[6px] px-1.5 py-0.5">
                      {notice.category}
                    </span>
                    {notice.isPinned && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-white rounded-[6px] px-1.5 py-0.5" style={{ background: TONE.temple }}>
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-muted-foreground leading-snug line-clamp-2">{notice.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No notices posted yet</p>
          )}
        </WidgetCard>

        {/* Transport */}
        {!transportError && (
          <WidgetCard title="Transport" icon={Bus}>
            {transportLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : transportData ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[13.5px]">{transportData.routeName}</span>
                  <span className="text-[11px] font-bold text-muted-foreground bg-muted border rounded-[7px] px-2 py-0.5">
                    {transportData.routeCode}
                  </span>
                </div>
                <div className="text-[12.5px] text-muted-foreground leading-relaxed">
                  {transportData.vehicleNumber && <>Vehicle · {transportData.vehicleNumber}<br /></>}
                  {transportData.driverName && (
                    <>Driver · {transportData.driverName}{' '}
                      {transportData.driverPhone && (
                        <a href={`tel:${transportData.driverPhone}`} className="text-primary font-semibold">{transportData.driverPhone}</a>
                      )}
                    </>
                  )}
                </div>
                {transportData.stop && (
                  <div className="mt-2.5 pt-2.5 border-t">
                    <div className="flex items-center gap-1.5 font-bold text-foreground text-[13px] mb-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {transportData.stop.name}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {transportData.stop.pickupTime && <span>Pickup {transportData.stop.pickupTime}</span>}
                      {transportData.stop.dropTime && <span>Drop {transportData.stop.dropTime}</span>}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </WidgetCard>
        )}

        {/* Hostel */}
        {!hostelError && (
          <WidgetCard title="Hostel information" icon={Building}>
            {hostelLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : hostelData ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[13.5px]">{hostelData.hostelBlockName}</span>
                  <span className="text-[11px] font-bold text-muted-foreground bg-muted border rounded-[7px] px-2 py-0.5">
                    {hostelData.blockCode}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2.5 text-[13px]">
                  <div>
                    <span className="text-xs text-muted-foreground block">Room</span>
                    <span className="font-bold">{hostelData.roomNumber}</span>
                  </div>
                  {hostelData.bedNumber && (
                    <div>
                      <span className="text-xs text-muted-foreground block">Bed</span>
                      <span className="font-bold">{hostelData.bedNumber}</span>
                    </div>
                  )}
                </div>
                {hostelData.wardenName && (
                  <div className="mt-2.5 pt-2.5 border-t text-[12.5px] text-muted-foreground">
                    Warden · {hostelData.wardenName}{' '}
                    {hostelData.wardenPhone && (
                      <a href={`tel:${hostelData.wardenPhone}`} className="text-primary font-semibold">{hostelData.wardenPhone}</a>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </WidgetCard>
        )}

        {/* Documents */}
        <WidgetCard title="My documents" icon={FileText}>
          {documentsLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : documentsData ? (
            <div className="flex flex-col gap-3.5">
              {[
                { label: 'ID Cards', items: documentsData.idCards, tone: TONE_VAR.peacock, name: (d: any) => d.cardNumber || 'ID Card' },
                { label: 'Hall Tickets', items: documentsData.hallTickets, tone: TONE_VAR.indigo, name: (d: any) => d.hallTicketNumber || 'Hall Ticket' },
                { label: 'Certificates', items: documentsData.certificates, tone: TONE_VAR.temple, name: (d: any) => `${d.title}${d.certificateNumber ? ` (${d.certificateNumber})` : ''}` },
                { label: 'Transfer Certificates', items: documentsData.transferCertificates ?? [], tone: TONE_VAR.lotus, name: (d: any) => `TC${d.tcSerialNumber ? ` (${d.tcSerialNumber})` : ''}` },
              ].map((group) => (
                <div key={group.label}>
                  <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">{group.label}</h4>
                  {group.items?.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {group.items.map((doc: any) => (
                        <div key={doc.id} className="flex items-center gap-2.5 py-1">
                          <span className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: `${group.tone}1f`, color: group.tone }}>
                            <FileText className="h-4 w-4" />
                          </span>
                          <span className="flex-1 min-w-0 text-[13px] font-semibold truncate">{group.name(doc)}</span>
                          <button
                            onClick={() => window.open(doc.pdfUrl, '_blank')}
                            className="inline-flex items-center gap-1 border rounded-[9px] bg-muted px-2.5 py-1.5 text-xs font-bold text-primary flex-shrink-0"
                          >
                            <Download className="h-3.5 w-3.5" /> PDF
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">None generated yet</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents found</p>
          )}
        </WidgetCard>
      </div>

      {/* Quick links */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <button
          onClick={() => navigate('/student/visionarium')}
          className="text-left bg-card border rounded-2xl p-4 flex items-center gap-3.5 hover:border-primary hover:-translate-y-0.5 transition-all"
        >
          <span className="w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: TONE_TINT.indigo, color: TONE_VAR.indigo }}>
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <div className="font-bold text-sm">Visionarium</div>
            <div className="text-xs text-muted-foreground">Test series &amp; practice exams</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/student/feed')}
          className="text-left bg-card border rounded-2xl p-4 flex items-center gap-3.5 hover:border-primary hover:-translate-y-0.5 transition-all"
        >
          <span className="w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: TONE_TINT.lotus, color: TONE_VAR.lotus }}>
            <Heart className="h-5 w-5" />
          </span>
          <div>
            <div className="font-bold text-sm">Saathi Feed</div>
            <div className="text-xs text-muted-foreground">School updates &amp; social feed</div>
          </div>
        </button>
      </div>
    </div>
  );
}
