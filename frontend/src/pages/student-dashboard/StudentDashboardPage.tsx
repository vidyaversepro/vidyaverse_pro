import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Loader2,
  UserCircle,
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
        <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="flex items-start gap-3 pt-6">
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
          </CardContent>
        </Card>
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

  return (
    <div className="space-y-6 p-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <UserCircle className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile.institution.name}
          </p>
        </div>
      </div>

      {/* Academic identity cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Class & Section</CardDescription>
            <CardTitle className="text-lg flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-blue-500" />
              {profile.section.class.name} — {profile.section.name}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Admission No.</CardDescription>
            <CardTitle className="text-lg flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-purple-500" />
              {profile.admissionNumber ?? '—'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Roll No.</CardDescription>
            <CardTitle className="text-lg">
              {profile.rollNumber ?? '—'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Row 1: Attendance | Timetable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Attendance Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Attendance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : attendanceData ? (
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0">
                  <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path
                      className="text-muted/20"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="3"
                    />
                    <path
                      className="text-primary"
                      strokeDasharray={`${attendanceData.stats.attendanceRate}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm font-bold">{Math.round(attendanceData.stats.attendanceRate)}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Present</span>
                    <span className="font-medium text-green-600">{attendanceData.stats.present}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Absent</span>
                    <span className="font-medium text-red-600">{attendanceData.stats.absent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Late</span>
                    <span className="font-medium text-amber-600">{attendanceData.stats.late}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Timetable Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Today's Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timetableLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : timetableData && timetableData.length > 0 ? (
              <div className="space-y-3">
                {timetableData.map((slot: any) => {
                  const now = new Date();
                  const [startH, startM] = slot.period.startTime.split(':').map(Number);
                  const [endH, endM] = slot.period.endTime.split(':').map(Number);
                  const periodStart = new Date(); periodStart.setHours(startH, startM, 0);
                  const periodEnd = new Date(); periodEnd.setHours(endH, endM, 0);
                  const isCurrent = now >= periodStart && now <= periodEnd;

                  return (
                    <div key={slot.id} className={`flex items-start justify-between border-l-2 pl-3 py-1 ${isCurrent ? 'border-primary bg-primary/5 rounded-r-md' : 'border-muted'}`}>
                      <div>
                        <p className="font-medium text-sm">{slot.subjectName}</p>
                        <p className="text-xs text-muted-foreground">{slot.period.startTime} - {slot.period.endTime}</p>
                      </div>
                      {slot.room && <Badge variant="outline" className="text-xs">{slot.room}</Badge>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No classes today</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fee status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Fee Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unpaidInvoices.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                All clear
              </Badge>
              <span>No outstanding dues</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? 's' : ''}
                </span>
                <span className="font-semibold text-red-600">
                  ₹{totalOutstanding.toLocaleString('en-IN')}
                </span>
              </div>
              {unpaidInvoices.slice(0, 3).map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between text-sm border-t pt-2">
                  <span className="text-muted-foreground truncate max-w-[180px]">
                    {inv.invoiceNumber}
                  </span>
                  <Badge
                    variant={inv.status === 'partial' ? 'secondary' : 'destructive'}
                    className="capitalize shrink-0 ml-2"
                  >
                    {inv.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Official Notices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Official Notices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {noticesLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : noticesData && noticesData.length > 0 ? (
            <div className="space-y-4">
              {noticesData.map((notice: any) => (
                <div key={notice.id} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-sm">{notice.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(notice.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{notice.category}</Badge>
                    {notice.isPinned && <Badge variant="default" className="text-[10px] uppercase tracking-wider bg-amber-500 hover:bg-amber-600">Pinned</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{notice.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No notices posted yet</p>
          )}
        </CardContent>
      </Card>

      {/* Row 2: Transport | Hostel */}
      {(!transportError || !hostelError) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!transportError && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  Transport Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transportLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : transportData ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{transportData.routeName}</span>
                      <Badge variant="outline">{transportData.routeCode}</Badge>
                    </div>
                    {transportData.vehicleNumber && (
                      <div className="text-muted-foreground">Vehicle: {transportData.vehicleNumber}</div>
                    )}
                    {transportData.driverName && (
                      <div className="text-muted-foreground">
                        Driver: {transportData.driverName} 
                        {transportData.driverPhone && <a href={`tel:${transportData.driverPhone}`} className="text-primary ml-2">{transportData.driverPhone}</a>}
                      </div>
                    )}
                    {transportData.stop && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 font-medium mb-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {transportData.stop.name}
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {transportData.stop.pickupTime && <span>Pickup: {transportData.stop.pickupTime}</span>}
                          {transportData.stop.dropTime && <span>Drop: {transportData.stop.dropTime}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {!hostelError && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Hostel Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hostelLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : hostelData ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{hostelData.hostelBlockName}</span>
                      <Badge variant="outline">{hostelData.blockCode}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span className="text-xs text-muted-foreground block">Room</span>
                        <span className="font-medium">{hostelData.roomNumber}</span>
                      </div>
                      {hostelData.bedNumber && (
                        <div>
                          <span className="text-xs text-muted-foreground block">Bed</span>
                          <span className="font-medium">{hostelData.bedNumber}</span>
                        </div>
                      )}
                    </div>
                    {hostelData.wardenName && (
                      <div className="mt-3 pt-3 border-t text-muted-foreground">
                        Warden: {hostelData.wardenName}
                        {hostelData.wardenPhone && <a href={`tel:${hostelData.wardenPhone}`} className="text-primary ml-2">{hostelData.wardenPhone}</a>}
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* My Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            My Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentsLoading ? (
             <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : documentsData ? (
             <div className="space-y-4">
               <div>
                 <h4 className="text-sm font-semibold mb-2 text-muted-foreground">ID Cards</h4>
                 {documentsData.idCards.length > 0 ? (
                   <div className="space-y-2">
                     {documentsData.idCards.map((doc: any) => (
                       <div key={doc.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                         <span>{doc.cardNumber || 'ID Card'}</span>
                         <button onClick={() => window.open(doc.pdfUrl, '_blank')} className="text-primary flex items-center gap-1 hover:underline">
                           <Download className="h-3.5 w-3.5" /> Download
                         </button>
                       </div>
                     ))}
                   </div>
                 ) : <p className="text-xs text-muted-foreground">No ID cards generated yet</p>}
               </div>

               <div>
                 <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Hall Tickets</h4>
                 {documentsData.hallTickets.length > 0 ? (
                   <div className="space-y-2">
                     {documentsData.hallTickets.map((doc: any) => (
                       <div key={doc.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                         <span>{doc.hallTicketNumber || 'Hall Ticket'}</span>
                         <button onClick={() => window.open(doc.pdfUrl, '_blank')} className="text-primary flex items-center gap-1 hover:underline">
                           <Download className="h-3.5 w-3.5" /> Download
                         </button>
                       </div>
                     ))}
                   </div>
                 ) : <p className="text-xs text-muted-foreground">No hall tickets generated yet</p>}
               </div>

               <div>
                 <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Certificates</h4>
                 {documentsData.certificates.length > 0 ? (
                   <div className="space-y-2">
                     {documentsData.certificates.map((doc: any) => (
                       <div key={doc.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                         <span className="truncate pr-4">{doc.title} {doc.certificateNumber ? `(${doc.certificateNumber})` : ''}</span>
                         <button onClick={() => window.open(doc.pdfUrl, '_blank')} className="text-primary flex items-center gap-1 hover:underline shrink-0">
                           <Download className="h-3.5 w-3.5" /> Download
                         </button>
                       </div>
                     ))}
                   </div>
                 ) : <p className="text-xs text-muted-foreground">No certificates generated yet</p>}
               </div>

               <div>
                 <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Transfer Certificates</h4>
                 {documentsData.transferCertificates?.length > 0 ? (
                   <div className="space-y-2">
                     {documentsData.transferCertificates.map((doc: any) => (
                       <div key={doc.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                         <span>TC {doc.tcSerialNumber ? `(${doc.tcSerialNumber})` : ''}</span>
                         <button onClick={() => window.open(doc.pdfUrl, '_blank')} className="text-primary flex items-center gap-1 hover:underline shrink-0">
                           <Download className="h-3.5 w-3.5" /> Download
                         </button>
                       </div>
                     ))}
                   </div>
                 ) : <p className="text-xs text-muted-foreground">No transfer certificates generated yet</p>}
               </div>
             </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents found</p>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate('/student/visionarium')}
        >
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              Visionarium
            </CardTitle>
            <CardDescription>Test series and practice exams</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate('/student/feed')}
        >
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Saathi Feed
            </CardTitle>
            <CardDescription>School updates and social feed</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
