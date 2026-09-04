import { useState } from 'react'
import Login from './components/Login'
import { Route, Routes } from 'react-router-dom'
import ForgotPassword from './components/ForgotPassword'
import AdminLayout from './layouts/AdminLayout'
import InternalAuditor from './pages/users/InternalAuditor'
import AuditManager from './pages/users/AuditManager'
import ChiefAuditExecutive from './pages/users/ChiefAuditExecutive'
import RiskOfficer from './pages/users/RiskOfficer'
import Auditee from './pages/users/Auditee'
import ComplianceOfficer from './pages/users/ComplianceOfficer'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { ROLES } from './components/ROLES'
import InternalAuditorLayout from './layouts/InternalAuditorLayout'
import AuditManagerLayout from './layouts/AuditManagerLayout'
import ChiefAuditExecutiveLayout from './layouts/ChiefAuditExecutiveLayout'
import RiskOfficerLayout from './layouts/RiskOfficerLayout'
import AuditeeLayout from './layouts/AuditeeLayout'
import ComplianceOfficerLayout from './layouts/ComplianceOfficerLayout'
import RiskSearch from './pages/risk-officer/RiskSearch'

import RiskRegister from './pages/risk-officer/createRisk/RiskRegister'
import RiskDetails from './pages/risk-officer/createRisk/RiskDetails'
import RiskAssessment from './pages/risk-officer/createRisk/RiskAssessment'
import Mitigation from './pages/risk-officer/Mitigation'
import KriDashboard from './pages/risk-officer/KriDashboard'
import Vendors from './pages/risk-officer/Vendors'
import ReportsDashboard from './pages/risk-officer/ReportsDashboard'
import NotificationDashboard from './pages/risk-officer/NotificationDashboard'
import RODashboard from './pages/risk-officer/RODashboard'
import AuditorAssignmentPage from './pages/auditManager/AuditorAssignmentPage'
import AssignedRisks from './pages/internal-auditor-manager/AssignedRisks'
import Findings from './pages/internal-auditor-manager/Findings'
import AuditPlanning from './pages/internal-auditor-manager/AuditPlanning'
import AuditeeMyAudits from './pages/auditee/AuditeeMyAudits'
import AuditeeAssignment from './pages/auditManager/AuditeeAssignment'
import AuditDetails from './pages/auditee/AuditDetails'
// import FindingDetails from './pages/auditee/FindingDetails'
import AuditeeAuditFilters from './components/auditee/my_audits/AuditeeAuditFilters'
import AuditeeFindings from './pages/auditee/AuditeeFindings'
import AuditeeEvidence from './pages/auditee/AuditeeEvidence'
import AuditeeSubmitResponse from './pages/auditee/AuditeeSubmitResponse'
import InternalAuditorRecommendations from './pages/internal-auditor-manager/InternalAuditorRecommendations'
import AuditeeRecommendations from './pages/auditee/AuditeeRecommendations'
import AuditeeDashboard from './pages/auditee/AuditeeDashboard'
import InternalAuditorEvidence from './pages/internal-auditor-manager/InternalAuditorEvidence'
// import AuditExecution from './pages/internal-auditor-manager/AuditExecution'
// import AuditExecutionDetails from './pages/internal-auditor-manager/AuditExecutionDetails'
import MyAudits from './pages/internal-auditor-manager/Myaudits'
import InternalAuditorDashboard from './pages/internal-auditor-manager/Internalauditordashboard'
import AuditReports from './pages/internal-auditor-manager/AuditReports'
import AuditReportDetails from './pages/internal-auditor-manager/AuditReportDetails'
import ComplianceRecommendations from './pages/complianceOfficer/ComplianceRecommendations'
import ComplianceReviews from './pages/complianceOfficer/ComplianceReviews'
import ComplianceRisks from './pages/complianceOfficer/ComplianceRisks'
import ComplianceFindings from './pages/complianceOfficer/ComplianceFindings'
import ComplianceDashboard from './pages/complianceOfficer/ComplianceDashboard'

import RegulatoryRequirements from './pages/complianceOfficer/RegulatoryRequirements'
import AuditMamagerAudits from './pages/auditManager/AuditManagerAudits'
import AnnualAuditPlans from './pages/auditManager/AnnualAuditPlans'
import AuditManagerRiskRegister from './pages/auditManager/AuditManagerRiskRegister'
import AuditManagerMitigations from './pages/auditManager/AuditManagerMitigations'
import AuditManagerKRI from './pages/auditManager/AuditManagerKRI'
//import AuditManagerEvidence from './pages/auditManager/AuditManagerEvidence'
import AuditManagerFindings from './pages/auditManager/AuditManagerFindings'
import RiskManagement from './pages/auditManager/RiskManagement'
import AuditManagerDashboard from './pages/auditManager/Auditmanagerdashboard'
import InternalAuditorResponses from './pages/internal-auditor-manager/InternalAuditorResponses'
import CAEAnnualAuditPlanDashboard from './pages/cae/CAEAnnualAuditPlanDashboard'
import CAEAuditPortfolio from './pages/cae/CAEAuditPortfolio'
import CAEriskOverview from './pages/cae/CAEriskOverview'
import CAEFindings from './pages/cae/CAEFindings'
import CAEAuditMonitoring from './pages/cae/CAEAuditMonitoring'
import RegulatoryRequirementsAdmin from './pages/admin/RegulatoryRequirements'
import RegulatoryRequirementDetails from './pages/admin/RegulatoryRequirementDetails'
import RiskConfiguration from './pages/admin/RiskConfiguration'
import AuditConfiguration from './pages/admin/AuditConfiguration'
import OrganizationManagement from './pages/admin/OrganizationManagement'
import RolesPermissions from './pages/admin/RolesPermissions'
import NotificationManagement from './pages/admin/NotificationManagement'
import SystemAdministrator from './pages/users/SystemAdministrator'
import UserManagementDashboard from './pages/admin/Usermanagementdashboard '
import SystemSettings from './pages/admin/SystemSettings'
import AuditLogs from './pages/admin/AuditLogs'
import CAERecommendations from './pages/cae/CAERecommendations'
import CAEComplianceOverview from './pages/cae/CAEComplianceOverview'
import ComplianceReports from './pages/complianceOfficer/ComplianceReports'
import AuditManagerReport from './pages/auditManager/AuditManagerReport'
import AuditPerformance from './pages/cae/AuditPerformance'
import AMAuditReportDetails from './pages/auditManager/AMAuditReportDetails'
import CAEReport from './pages/cae/CAEReport'
import CAEReportDetails from './pages/cae/CAEReportDetails'
import CAEExecutiveDashboard from './pages/cae/CAEExecutiveDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
// import RiskAssessmentTracking from './pages/auditManager/Riskassessmenttracking'
function App() {
 
  return (
       <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>


        <Route element={<ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMINISTRATOR]}/>}>

<Route path="/admin" element={<AdminLayout />}>
<Route path='dashboard' element={<AdminDashboard/>}/>
<Route path='regulatory-requirements' element={<RegulatoryRequirementsAdmin/>}/>
<Route path='regulatory-requirements/:id' element={<RegulatoryRequirementDetails/>}/>
<Route path='risk-configuration' element={<RiskConfiguration/>}/>
<Route path='audit-configuration' element={<AuditConfiguration/>}/>
<Route path='organization' element={<OrganizationManagement/>}/>
<Route path='roles-permissions' element={<RolesPermissions/>}/>
<Route path='notification-management' element={<NotificationManagement/>}/>
<Route path='settings' element={<SystemSettings/>}/>
<Route path='audit-logs' element={<AuditLogs/>}/>
<Route path='dashboard'/>
<Route path="users">

<Route index element={<UserManagementDashboard />} />

  <Route
    path="internal-auditor"
    element={<InternalAuditor />}
  />

  <Route path='system-administrator' element={<SystemAdministrator/>}/>

  <Route
    path="audit-manager"
    element={<AuditManager />}
  />

  <Route
    path="chief-audit-executive"
    element={<ChiefAuditExecutive />}
  />

  <Route
    path="risk-officer"
    element={<RiskOfficer />}
  />

  <Route
    path="auditee"
    element={<Auditee />}
  />

  <Route
    path="compliance-officer"
    element={<ComplianceOfficer />}
  />

</Route>
<Route path='notifications' element={<NotificationDashboard/>}/>

<Route
  path="profile"
  element={<Profile />}
/>

</Route>

        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.INTERNAL_AUDITOR]}/>}>
        <Route path='/internal-auditor' element={<InternalAuditorLayout/>}>
        <Route path='dashboard' element={<InternalAuditorDashboard/>}/>
        <Route path="profile" element={<Profile />} />
        <Route path='notifications' element={<NotificationDashboard/>}/>
        <Route path='risks' element={<AssignedRisks/>}/>
        <Route path='findings' element={<Findings/>}/>
        <Route path='planning' element={<AuditPlanning/>}/>
        <Route path='audits' element={<MyAudits/>}/>
        <Route path='evidence' element={<InternalAuditorEvidence/>}/>
        <Route path='reports' element={<AuditReports/>}/>
        <Route path='audit-reports/:auditId' element={<AuditReportDetails/>}/>
        <Route path='response' element={<InternalAuditorResponses/>}/>
        <Route path='recommendations' element={<InternalAuditorRecommendations/>}/>
        </Route>
        </Route>


        <Route element={<ProtectedRoute allowedRoles={[ROLES.AUDIT_MANAGER]}/>}>
        <Route path='/audit-manager' element={<AuditManagerLayout/>}>
        <Route path='dashboard' element={<AuditManagerDashboard/>}/>
        <Route path="profile" element={<Profile />} />
        <Route path='audits' element={<AuditMamagerAudits/>}/>
        <Route path='reports' element={<AuditManagerReport/>}/>
        <Route path='mitigation' element={<AuditManagerMitigations/>}/>
        <Route path='risk-management' element={<AuditManagerRiskRegister/>}/>
        <Route path='annual-audits' element={<AnnualAuditPlans/>}/>
        <Route path='auditor-assignment' element={<AuditorAssignmentPage/>}/>
        <Route path='findings' element={<AuditManagerFindings/>}/>
        <Route path='notifications' element={<NotificationDashboard/>}/>
        <Route path='kri' element={<AuditManagerKRI/>}/>
        <Route
    path="/audit-manager/audit-reports/:riskId"
    element={<AMAuditReportDetails />}
/>
        <Route path='risk-assessment' element={<RiskManagement/>}/>
        <Route path='auditee-assignment' element={<AuditeeAssignment/>}/>
        </Route>
        </Route>


        <Route element={<ProtectedRoute allowedRoles={[ROLES.CHIEF_AUDIT_EXECUTIVE]} />}>
    
    <Route
        path="/chief-audit-executive"
        element={<ChiefAuditExecutiveLayout />}
    >
        <Route path="profile" element={<Profile />} />

        <Route
            path="notifications"
            element={<NotificationDashboard />}
        />

        <Route
        path='dashboard'
        element={<CAEExecutiveDashboard/>}/>

        <Route
            path="audits"
            element={<CAEAuditPortfolio />}
        />

        <Route
            path="performance"
            element={<AuditPerformance />}
        />

        <Route
            path="risks"
            element={<CAEriskOverview />}
        />

        <Route
            path="monitoring"
            element={<CAEAuditMonitoring />}
        />

        <Route
            path="findings"
            element={<CAEFindings />}
        />

        <Route
            path="recommendations"
            element={<CAERecommendations />}
        />

        <Route
            path="compliance"
            element={<CAEComplianceOverview />}
        />

        <Route
            path="reports"
            element={<CAEReport />}
        />

        {/* ✅ FIXED */}
        <Route
            path="audit-reports/:riskId"
            element={<CAEReportDetails />}
        />

        <Route
            path="annual-audit-plan"
            element={<CAEAnnualAuditPlanDashboard />}
        />
    </Route>

</Route>


        <Route element={<ProtectedRoute allowedRoles={[ROLES.RISK_OFFICER]}/>}>
        <Route path='/risk-officer' element={<RiskOfficerLayout/>}>
       <Route path="risk-register" element={<RiskRegister />} />
       <Route path="risks/:id" element={<RiskDetails />} />
       <Route path="risk-assessment" element={<RiskAssessment />} />
      <Route path="risk-search" element={<RiskSearch />} />
      <Route path='mitigation' element={<Mitigation/>}/>
      <Route path='kri' element={<KriDashboard/>}/>
      <Route path='vendor' element={<Vendors/>}/>
      <Route path='reports' element={<ReportsDashboard/>}/>
      <Route path='dashboards' element={<RODashboard/>}/>
   <Route path="notifications" element={<NotificationDashboard />} />
    <Route path="profile" element={<Profile />} />
        </Route>
        </Route>


        <Route element={<ProtectedRoute allowedRoles={[ROLES.AUDITEE]}/>}>
    <Route path="/auditee-officer" element={<AuditeeLayout/>}>
        <Route index element={<AuditeeDashboard/>}/>
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<NotificationDashboard/>}/>
        <Route path="assigned-audits" element={<AuditeeMyAudits/>}/>
        <Route path="audit-details/:auditId" element={<AuditDetails/>}/>
        <Route path="findings" element={<AuditeeFindings/>}/>
        <Route path="submit-response" element={<AuditeeSubmitResponse/>}/>
        <Route path="upload-evidence" element={<AuditeeEvidence/>}/>
        {/* CHANGE THIS */}
        <Route path="evidence" element={<AuditeeEvidence/>}/>

        <Route path="recommendations" element={<AuditeeRecommendations/>}/>
    </Route>
</Route>


        <Route element={<ProtectedRoute allowedRoles={[ROLES.COMPLIANCE_OFFICER]}/>}>
        <Route path='/compliance-officer' element={<ComplianceOfficerLayout/>}>
        <Route path='dashboard' element={<ComplianceDashboard/>}/>
        <Route path="profile" element={<Profile />} />
        <Route path='review' element={<ComplianceReviews/>}/>
        <Route path='findings' element={<ComplianceFindings/>}/>
        <Route path='risks' element={<ComplianceRisks/>}/>
        <Route path='reports' element={<ComplianceReports/>}/>
        <Route path='notifications' element={<NotificationDashboard/>}/>
        <Route path='regulatory-requirements' element={<RegulatoryRequirements/>}/>
        <Route path='recommendations' element={<ComplianceRecommendations/>}/>    
        </Route>
        </Route>
     </Routes>
  )
}
export default App
