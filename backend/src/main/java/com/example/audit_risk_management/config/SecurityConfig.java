package com.example.audit_risk_management.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }


    @Bean
public CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(List.of(
        "http://localhost:5173"
    ));

    configuration.setAllowedMethods(List.of(
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ));

    configuration.setAllowedHeaders(List.of(
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With"
    ));

    configuration.setExposedHeaders(List.of(
        "Authorization",
        "Content-Disposition"
    ));

    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration("/**", configuration);

    return source;
}


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{

        System.out.println("Security filter chain reached");

        httpSecurity
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf->csrf.disable())
        .sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth->auth
            .requestMatchers("/login","/reset-password","/forgot-password","/verify-otp").permitAll()
            .requestMatchers("/uploads/**").permitAll()

            // Register
            .requestMatchers(HttpMethod.POST, "/register")
            .hasAuthority("USER_REGISTER")

            // Profile
             .requestMatchers(HttpMethod.GET, "/profile")
             .hasAuthority("PROFILE_VIEW")

            // ==========================================
            // USER MANAGEMENT - PERMISSION BASED
            // ==========================================
            
            .requestMatchers(
                HttpMethod.GET,
                "/users"
            )
            .hasAuthority("USER_VIEW")
            
            .requestMatchers(
                HttpMethod.GET,
                "/users/*"
            )
            .hasAuthority("USER_VIEW_BY_ROLE")
            
            .requestMatchers(
                HttpMethod.PUT,
                "/users/*"
            )
            .hasAuthority("USER_UPDATE")

            // ==========================================
// DEPARTMENT MANAGEMENT - PERMISSION BASED
// ==========================================

// CREATE DEPARTMENT
.requestMatchers(
    HttpMethod.POST,
    "/api/departments"
)
.hasAuthority("DEPARTMENT_CREATE")

// VIEW ALL DEPARTMENTS
.requestMatchers(
    HttpMethod.GET,
    "/api/departments"
)
.hasAuthority("DEPARTMENT_VIEW")

// VIEW DEPARTMENT BY ID
.requestMatchers(
    HttpMethod.GET,
    "/api/departments/*"
)
.hasAuthority("DEPARTMENT_VIEW")

// UPDATE DEPARTMENT
.requestMatchers(
    HttpMethod.PUT,
    "/api/departments/*"
)
.hasAuthority("DEPARTMENT_UPDATE")

// DELETE DEPARTMENT
.requestMatchers(
    HttpMethod.DELETE,
    "/api/departments/*"
)
.hasAuthority("DEPARTMENT_DELETE")




// ==========================================
// ORGANIZATION MANAGEMENT
// PERMISSION BASED
// ==========================================

// CREATE
.requestMatchers(
    HttpMethod.POST,
    "/api/organizations"
)
.hasAuthority("ORGANIZATION_CREATE")

// GET ALL
.requestMatchers(
    HttpMethod.GET,
    "/api/organizations"
)
.hasAuthority("ORGANIZATION_VIEW")

// GET BY ID
.requestMatchers(
    HttpMethod.GET,
    "/api/organizations/*"
)
.hasAuthority("ORGANIZATION_VIEW")

// GET BY ACTIVE STATUS
.requestMatchers(
    HttpMethod.GET,
    "/api/organizations/status"
)
.hasAuthority("ORGANIZATION_VIEW")

// UPDATE
.requestMatchers(
    HttpMethod.PUT,
    "/api/organizations/*"
)
.hasAuthority("ORGANIZATION_UPDATE")

// DELETE
.requestMatchers(
    HttpMethod.DELETE,
    "/api/organizations/*"
)
.hasAuthority("ORGANIZATION_DELETE")

// ACTIVATE
.requestMatchers(
    HttpMethod.PATCH,
    "/api/organizations/*/activate"
)
.hasAuthority("ORGANIZATION_ACTIVATE")

// DEACTIVATE
.requestMatchers(
    HttpMethod.PATCH,
    "/api/organizations/*/deactivate"
)
.hasAuthority("ORGANIZATION_DEACTIVATE")

.requestMatchers(HttpMethod.POST, "/api/roles")
    .hasAuthority("ROLE_CREATE")

.requestMatchers(HttpMethod.GET, "/api/roles")
    .hasAuthority("ROLE_VIEW")

.requestMatchers(HttpMethod.GET, "/api/roles/*")
    .hasAuthority("ROLE_VIEW")

.requestMatchers(HttpMethod.PUT, "/api/roles/*")
    .hasAuthority("ROLE_UPDATE")

.requestMatchers(HttpMethod.DELETE, "/api/roles/*")
    .hasAuthority("ROLE_DELETE")

.requestMatchers(
    HttpMethod.POST,
    "/api/roles/*/permissions/*"
)
.hasAuthority("ROLE_PERMISSION_ASSIGN")

.requestMatchers(
    HttpMethod.DELETE,
    "/api/roles/*/permissions/*"
)
.hasAuthority("ROLE_PERMISSION_REMOVE")

.requestMatchers(
    HttpMethod.GET,
    "/api/roles/*/permissions"
)
.hasAuthority("ROLE_PERMISSION_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/admin/notification-configuration"
)
.hasAuthority("NOTIFICATION_CONFIGURATION_VIEW")

.requestMatchers(
    HttpMethod.PUT,
    "/api/admin/notification-configuration"
)
.hasAuthority("NOTIFICATION_CONFIGURATION_UPDATE")

.requestMatchers(HttpMethod.POST, "/api/risks")
.hasAuthority("RISK_CREATE")

.requestMatchers(HttpMethod.PUT, "/api/risks/*")
.hasAuthority("RISK_UPDATE")

.requestMatchers(HttpMethod.DELETE, "/api/risks/*")
.hasAuthority("RISK_DELETE")

// View risk
.requestMatchers(HttpMethod.GET, "/api/risks")
.hasAuthority("RISK_VIEW")

.requestMatchers(HttpMethod.GET, "/api/risks/*")
.hasAuthority("RISK_VIEW")

.requestMatchers(HttpMethod.GET, "/api/risks/riskId/*")
.hasAuthority("RISK_VIEW")

.requestMatchers(HttpMethod.GET, "/api/risks/identified-by/*")
.hasAuthority("RISK_VIEW")

.requestMatchers(HttpMethod.GET, "/api/risks/assigned-to/*")
.hasAuthority("RISK_VIEW")

.requestMatchers(HttpMethod.GET, "/api/risks/status/*")
.hasAuthority("RISK_VIEW")

.requestMatchers(HttpMethod.GET, "/api/risks/level/*")
.hasAuthority("RISK_VIEW")

.requestMatchers(HttpMethod.GET, "/api/risks/department/*")
.hasAuthority("RISK_VIEW")

.requestMatchers(HttpMethod.GET, "/api/risks/category/*")
.hasAuthority("RISK_VIEW")

.requestMatchers(HttpMethod.GET, "/api/risks/overdue")
.hasAuthority("RISK_VIEW")

.requestMatchers(HttpMethod.GET, "/api/risks/closed")
.hasAuthority("RISK_VIEW")


// ==============================
// SEARCH
// ==============================

.requestMatchers(HttpMethod.GET, "/api/risks/search")
.hasAuthority("RISK_SEARCH")


// ==============================
// ASSIGN RISK
// ==============================

.requestMatchers(
HttpMethod.PATCH,
"/api/risks/*/assign/*"
)
.hasAuthority("RISK_ASSIGN")


// ==============================
// UPDATE STATUS
// ==============================

.requestMatchers(
HttpMethod.PATCH,
"/api/risks/*/status"
)
.hasAuthority("RISK_STATUS_UPDATE")


// ==============================
// UPDATE MITIGATION
// ==============================

.requestMatchers(
HttpMethod.PATCH,
"/api/risks/*/mitigation"
)
.hasAuthority("RISK_MITIGATION_UPDATE")


// ==============================
// RISK DASHBOARD
// ==============================

.requestMatchers(
HttpMethod.GET,
"/api/risks/dashboard/**"
)
.hasAuthority("RISK_DASHBOARD_VIEW")


// ==============================
// AUDIT LOG
// ==============================

.requestMatchers(
HttpMethod.GET,
"/api/audit-logs"
)
.hasAuthority("AUDIT_LOG_VIEW")

.requestMatchers(
HttpMethod.GET,
"/api/audit-logs/**"
)
.hasAuthority("AUDIT_LOG_VIEW")


// ==============================
// INTERNAL AUDITORS
// ==============================

.requestMatchers(
HttpMethod.GET,
"/api/risks/manager/internal-auditors"
)
.hasAuthority("USER_VIEW")

// ================= MITIGATION =================

.requestMatchers(HttpMethod.POST, "/api/mitigations")
    .hasAuthority("MITIGATION_CREATE")

.requestMatchers(HttpMethod.GET, "/api/mitigations")
    .hasAuthority("MITIGATION_READ")

.requestMatchers(HttpMethod.GET, "/api/mitigations/search")
    .hasAuthority("MITIGATION_SEARCH")

.requestMatchers(HttpMethod.GET, "/api/mitigations/overdue")
    .hasAuthority("MITIGATION_OVERDUE")

.requestMatchers(HttpMethod.GET, "/api/mitigations/dashboard/**")
    .hasAuthority("MITIGATION_DASHBOARD")

.requestMatchers(HttpMethod.GET, "/api/mitigations/status/**")
    .hasAuthority("MITIGATION_READ")

.requestMatchers(HttpMethod.GET, "/api/mitigations/risk/**")
    .hasAuthority("MITIGATION_READ")

.requestMatchers(HttpMethod.GET, "/api/mitigations/owner/**")
    .hasAuthority("MITIGATION_READ")

.requestMatchers(HttpMethod.GET, "/api/mitigations/*")
    .hasAuthority("MITIGATION_READ")

.requestMatchers(HttpMethod.PUT, "/api/mitigations/*")
    .hasAuthority("MITIGATION_UPDATE")

.requestMatchers(HttpMethod.DELETE, "/api/mitigations/*")
    .hasAuthority("MITIGATION_DELETE")

.requestMatchers(HttpMethod.PATCH, "/api/mitigations/*/status")
    .hasAuthority("MITIGATION_STATUS_UPDATE")

.requestMatchers(HttpMethod.PATCH, "/api/mitigations/*/assign/*")
    .hasAuthority("MITIGATION_ASSIGN")

.requestMatchers(HttpMethod.PATCH, "/api/mitigations/*/complete")
    .hasAuthority("MITIGATION_COMPLETE")
    
    // ============================================================
    // KRI
    // ============================================================

    .requestMatchers(HttpMethod.POST, "/api/kri")
        .hasAuthority("KRI_CREATE")

    // IMPORTANT: specific GET endpoints first
    .requestMatchers(HttpMethod.GET, "/api/kri/search/**")
        .hasAuthority("KRI_SEARCH")

    .requestMatchers(HttpMethod.GET, "/api/kri/critical")
        .hasAuthority("KRI_CRITICAL")

    .requestMatchers(HttpMethod.GET, "/api/kri/dashboard")
        .hasAuthority("KRI_DASHBOARD")

    .requestMatchers(HttpMethod.GET, "/api/kri/risk/**")
        .hasAuthority("KRI_READ")

    .requestMatchers(HttpMethod.GET, "/api/kri/status/**")
        .hasAuthority("KRI_READ")

    .requestMatchers(HttpMethod.GET, "/api/kri/department/**")
        .hasAuthority("KRI_READ")

    .requestMatchers(HttpMethod.GET, "/api/kri/category/**")
        .hasAuthority("KRI_READ")

    .requestMatchers(HttpMethod.GET, "/api/kri/owner/**")
        .hasAuthority("KRI_READ")

    .requestMatchers(HttpMethod.GET, "/api/kri")
        .hasAuthority("KRI_READ")

    .requestMatchers(HttpMethod.GET, "/api/kri/*")
        .hasAuthority("KRI_READ")

    .requestMatchers(HttpMethod.PUT, "/api/kri/*/status")
        .hasAuthority("KRI_STATUS_UPDATE")

    .requestMatchers(HttpMethod.PUT, "/api/kri/*")
        .hasAuthority("KRI_UPDATE")

    .requestMatchers(HttpMethod.DELETE, "/api/kri/*")
        .hasAuthority("KRI_DELETE")

        .requestMatchers(HttpMethod.POST, "/api/vendors")
        .hasAuthority("VENDOR_CREATE")
    
    .requestMatchers(HttpMethod.GET, "/api/vendors")
        .hasAuthority("VENDOR_READ")
    
    .requestMatchers(HttpMethod.GET, "/api/vendors/{vendorId}")
        .hasAuthority("VENDOR_READ")
    
    .requestMatchers(HttpMethod.GET, "/api/vendors/status/**")
        .hasAuthority("VENDOR_VIEW_BY_STATUS")
    
    .requestMatchers(HttpMethod.GET, "/api/vendors/risk-level/**")
        .hasAuthority("VENDOR_VIEW_BY_RISK_LEVEL")
    
    .requestMatchers(HttpMethod.GET, "/api/vendors/my-vendors")
        .hasAuthority("VENDOR_VIEW_MY_VENDORS")
    
    .requestMatchers(HttpMethod.PUT, "/api/vendors/**")
        .hasAuthority("VENDOR_UPDATE")
    
    .requestMatchers(HttpMethod.DELETE, "/api/vendors/**")
        .hasAuthority("VENDOR_DELETE")

        // Reports
        .requestMatchers(HttpMethod.POST, "/api/reports")
            .hasAuthority("REPORT_CREATE")
    
        .requestMatchers(HttpMethod.GET, "/api/reports/dashboard")
            .hasAuthority("REPORT_DASHBOARD_VIEW")
    
        .requestMatchers(HttpMethod.GET, "/api/reports/**")
            .hasAuthority("REPORT_VIEW")
    
        .requestMatchers(HttpMethod.PUT, "/api/reports/**")
            .hasAuthority("REPORT_UPDATE")
    
        .requestMatchers(HttpMethod.DELETE, "/api/reports/**")
            .hasAuthority("REPORT_DELETE")
    
            // Report Generator
            .requestMatchers(
                HttpMethod.GET,
                "/api/report-generator/pdf/**"
            ).hasAuthority("REPORT_PDF_GENERATE")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/report-generator/word/**"
            ).hasAuthority("REPORT_WORD_GENERATE")
        
            .requestMatchers(
                HttpMethod.POST,
                "/api/report-generator/save/pdf/**"
            ).hasAuthority("REPORT_PDF_SAVE")
         
            .requestMatchers(
                HttpMethod.POST,
                "/api/report-generator/save/word/**"
            ).hasAuthority("REPORT_WORD_SAVE")

            .requestMatchers(
                HttpMethod.POST,
                "/api/notifications"
            ).hasAuthority("NOTIFICATION_SEND")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/notifications/unread-count"
            ).hasAuthority("NOTIFICATION_UNREAD_COUNT")
            
            .requestMatchers(
                HttpMethod.GET,
                "/api/notifications"
            ).hasAuthority("NOTIFICATION_VIEW")
        
            .requestMatchers(
                HttpMethod.PUT,
                "/api/notifications/*/read"
            ).hasAuthority("NOTIFICATION_MARK_READ")

            // =========================================================
            // ANNUAL AUDIT PLAN
            // =========================================================
            
            // CREATE
            .requestMatchers(
                    HttpMethod.POST,
                    "/api/annual-audit-plans"
            )
            .hasAuthority("ANNUAL_AUDIT_PLAN_CREATE")
            
            // UPDATE STATUS - CAE
            // Must come before /{id}
            .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/annual-audit-plans/*/status"
            )
            .hasAuthority("ANNUAL_AUDIT_PLAN_STATUS_UPDATE")
            
            // UPDATE PLAN
            .requestMatchers(
                    HttpMethod.PUT,
                    "/api/annual-audit-plans/*"
            )
            .hasAuthority("ANNUAL_AUDIT_PLAN_UPDATE")
            
            // DELETE
            .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/annual-audit-plans/*"
            )
            .hasAuthority("ANNUAL_AUDIT_PLAN_DELETE")
            
            // GET ALL
            .requestMatchers(
                    HttpMethod.GET,
                    "/api/annual-audit-plans"
            )
            .hasAuthority("ANNUAL_AUDIT_PLAN_VIEW")
            
            // GET PLAN BY ID
            .requestMatchers(
                    HttpMethod.GET,
                    "/api/annual-audit-plans/*"
            )
            .hasAuthority("ANNUAL_AUDIT_PLAN_VIEW")
            
            // GET BY PLAN ID
            .requestMatchers(
                    HttpMethod.GET,
                    "/api/annual-audit-plans/plan/*"
            )
            .hasAuthority("ANNUAL_AUDIT_PLAN_VIEW")
            
            // GET MY PLANS
            .requestMatchers(
                    HttpMethod.GET,
                    "/api/annual-audit-plans/my"
            )
            .hasAuthority("ANNUAL_AUDIT_PLAN_VIEW")
            
            // GET BY YEAR
            .requestMatchers(
                    HttpMethod.GET,
                    "/api/annual-audit-plans/year/*"
            )
            .hasAuthority("ANNUAL_AUDIT_PLAN_VIEW")
            
            // GET BY STATUS
            .requestMatchers(
                    HttpMethod.GET,
                    "/api/annual-audit-plans/status/*"
            )
            .hasAuthority("ANNUAL_AUDIT_PLAN_VIEW")
            
            // =====================================================
            // AUDIT COMMITMENTS
            // =====================================================
        
            .requestMatchers(
                HttpMethod.POST,
                "/api/audit-commitments"
            ).hasAuthority("AUDIT_COMMITMENT_CREATE")
        
            .requestMatchers(
                HttpMethod.PUT,
                "/api/audit-commitments/*/status"
            ).hasAuthority("AUDIT_COMMITMENT_STATUS_UPDATE")

            .requestMatchers(
                HttpMethod.DELETE,
                "/api/audit-commitments/*"
            ).hasAuthority("AUDIT_COMMITMENT_DELETE")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/audit-commitments/auditor/*/availability"
            ).hasAuthority("AUDIT_COMMITMENT_AVAILABILITY_VIEW")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/audit-commitments/auditor/*/active"
            ).hasAuthority("AUDIT_COMMITMENT_VIEW")

            .requestMatchers(
                HttpMethod.GET,
                "/api/audit-commitments/auditor/*"
            ).hasAuthority("AUDIT_COMMITMENT_VIEW")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/audit-commitments/audit/*"
            ).hasAuthority("AUDIT_COMMITMENT_VIEW")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/audit-commitments"
            ).hasAuthority("AUDIT_COMMITMENT_VIEW")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/audit-commitments/*"
            ).hasAuthority("AUDIT_COMMITMENT_VIEW")
 
            // Audit Configuration
            .requestMatchers(
                HttpMethod.GET,
                "/api/audit-configuration"
            ).hasAuthority("AUDIT_CONFIGURATION_VIEW")
        
            .requestMatchers(
                HttpMethod.PUT,
                "/api/audit-configuration"
            ).hasAuthority("AUDIT_CONFIGURATION_UPDATE")
  
            // =====================================================
            // AUDITS
            // =====================================================
        
            .requestMatchers(
                HttpMethod.POST,
                "/api/audits"
            ).hasAuthority("AUDIT_CREATE")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/audits/my-assigned"
            ).hasAuthority("AUDIT_ASSIGNED_VIEW")
            .requestMatchers(
                HttpMethod.GET,
                "/api/audits/my-audits"
            ).hasAuthority("AUDIT_MY_VIEW")
        
            .requestMatchers(
                HttpMethod.PUT,
                "/api/audits/*/assign/*"
            ).hasAuthority("AUDIT_ASSIGN")
            
            .requestMatchers(
                HttpMethod.PUT,
                "/api/audits/*/status"
            ).hasAuthority("AUDIT_STATUS_UPDATE")
        
            .requestMatchers(
                HttpMethod.PUT,
                "/api/audits/*"
            ).hasAuthority("AUDIT_UPDATE")
        
            .requestMatchers(
                HttpMethod.DELETE,
                "/api/audits/*"
            ).hasAuthority("AUDIT_DELETE")

            .requestMatchers(
                HttpMethod.GET,
                "/api/audits"
            ).hasAuthority("AUDIT_VIEW")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/audits/*"
            ).hasAuthority("AUDIT_VIEW")
            // =====================================================
            // AUDITEE ASSIGNMENTS
            // =====================================================
        
            .requestMatchers(
                HttpMethod.POST,
                "/api/auditee-assignments"
            ).hasAuthority("AUDITEE_ASSIGNMENT_CREATE")
        
            .requestMatchers(
                HttpMethod.PUT,
                "/api/auditee-assignments/*/status"
            ).hasAuthority("AUDITEE_ASSIGNMENT_STATUS_UPDATE")
            .requestMatchers(
                HttpMethod.DELETE,
                "/api/auditee-assignments/*"
            ).hasAuthority("AUDITEE_ASSIGNMENT_DELETE")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/auditee-assignments/audit/*"
            ).hasAuthority("AUDITEE_ASSIGNMENT_VIEW")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/auditee-assignments/auditee/*"
            ).hasAuthority("AUDITEE_ASSIGNMENT_VIEW")

            .requestMatchers(
                HttpMethod.GET,
                "/api/auditee-assignments/assigned-by/*"
            ).hasAuthority("AUDITEE_ASSIGNMENT_VIEW")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/auditee-assignments"
            ).hasAuthority("AUDITEE_ASSIGNMENT_VIEW")
        
            .requestMatchers(
                HttpMethod.GET,
                "/api/auditee-assignments/*"
            ).hasAuthority("AUDITEE_ASSIGNMENT_VIEW")


// =========================================================
// AUDITEE RESPONSES
// =========================================================

// SUBMIT RESPONSE
.requestMatchers(
        HttpMethod.POST,
        "/api/auditee-responses"
)
.hasAuthority("AUDITEE_RESPONSE_CREATE")

// UPDATE RESPONSE STATUS
.requestMatchers(
        HttpMethod.PATCH,
        "/api/auditee-responses/*/status"
)
.hasAuthority("AUDITEE_RESPONSE_STATUS_UPDATE")

// GET RESPONSES BY FINDING
.requestMatchers(
        HttpMethod.GET,
        "/api/auditee-responses/finding/*"
)
.hasAuthority("AUDITEE_RESPONSE_VIEW")

// GET RESPONSES BY AUDITEE
.requestMatchers(
        HttpMethod.GET,
        "/api/auditee-responses/auditee/*"
)
.hasAuthority("AUDITEE_RESPONSE_VIEW")

// GET ALL RESPONSES
.requestMatchers(
        HttpMethod.GET,
        "/api/auditee-responses"
)
.hasAuthority("AUDITEE_RESPONSE_VIEW")

// DELETE RESPONSE
.requestMatchers(
        HttpMethod.DELETE,
        "/api/auditee-responses/*"
)
.hasAuthority("AUDITEE_RESPONSE_DELETE")

// GET RESPONSE BY ID
.requestMatchers(
        HttpMethod.GET,
        "/api/auditee-responses/*"
)
.hasAuthority("AUDITEE_RESPONSE_VIEW")


// =========================================================
// AUDIT LOGS
// =========================================================

// GET LOGS BY USER
.requestMatchers(
        HttpMethod.GET,
        "/api/audit-logs/user/*"
)
.hasAuthority("AUDIT_LOG_USER_VIEW")

// GET LOGS BY MODULE
.requestMatchers(
        HttpMethod.GET,
        "/api/audit-logs/module/*"
)
.hasAuthority("AUDIT_LOG_MODULE_VIEW")

// GET LOGS BY ACTION
.requestMatchers(
        HttpMethod.GET,
        "/api/audit-logs/action/*"
)
.hasAuthority("AUDIT_LOG_ACTION_VIEW")

// GET ALL AUDIT LOGS
.requestMatchers(
        HttpMethod.GET,
        "/api/audit-logs"
)
.hasAuthority("AUDIT_LOG_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/admin/system-settings"
).hasAuthority("SYSTEM_SETTINGS_VIEW")

.requestMatchers(
    HttpMethod.PUT,
    "/api/admin/system-settings"
).hasAuthority("SYSTEM_SETTINGS_UPDATE")


.requestMatchers(
    HttpMethod.POST,
    "/api/risk-auditor-assignments"
).hasAuthority("RISK_AUDITOR_ASSIGNMENT_CREATE")

.requestMatchers(
    HttpMethod.GET,
    "/api/risk-auditor-assignments"
).hasAuthority("RISK_AUDITOR_ASSIGNMENT_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/risk-auditor-assignments/{id}"
).hasAuthority("RISK_AUDITOR_ASSIGNMENT_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/risk-auditor-assignments/risk/**"
).hasAuthority("RISK_AUDITOR_ASSIGNMENT_VIEW_BY_RISK")

.requestMatchers(
    HttpMethod.GET,
    "/api/risk-auditor-assignments/auditor/**"
).hasAuthority("RISK_AUDITOR_ASSIGNMENT_VIEW_BY_AUDITOR")

.requestMatchers(
    HttpMethod.GET,
    "/api/risk-auditor-assignments/status/**"
).hasAuthority("RISK_AUDITOR_ASSIGNMENT_VIEW_BY_STATUS")

.requestMatchers(
    HttpMethod.GET,
    "/api/risk-auditor-assignments/assigned-by/**"
).hasAuthority("RISK_AUDITOR_ASSIGNMENT_VIEW_BY_ASSIGNED_BY")

.requestMatchers(
    HttpMethod.PATCH,
    "/api/risk-auditor-assignments/*/status"
).hasAuthority("RISK_AUDITOR_ASSIGNMENT_UPDATE_STATUS")

.requestMatchers(
    HttpMethod.PATCH,
    "/api/risk-auditor-assignments/*/priority"
).hasAuthority("RISK_AUDITOR_ASSIGNMENT_UPDATE_PRIORITY")

.requestMatchers(
    HttpMethod.DELETE,
    "/api/risk-auditor-assignments/*"
).hasAuthority("RISK_AUDITOR_ASSIGNMENT_DELETE")

.requestMatchers(
    HttpMethod.POST,
    "/api/reviews"
).hasAuthority("REVIEW_CREATE")

.requestMatchers(
    HttpMethod.GET,
    "/api/reviews"
).hasAuthority("REVIEW_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/reviews/code/**"
).hasAuthority("REVIEW_VIEW_BY_CODE")

.requestMatchers(
    HttpMethod.GET,
    "/api/reviews/audit/**"
).hasAuthority("REVIEW_VIEW_BY_AUDIT")

.requestMatchers(
    HttpMethod.GET,
    "/api/reviews/reviewer/**"
).hasAuthority("REVIEW_VIEW_BY_REVIEWER")

.requestMatchers(
    HttpMethod.GET,
    "/api/reviews/status/**"
).hasAuthority("REVIEW_VIEW_BY_STATUS")

.requestMatchers(
    HttpMethod.PUT,
    "/api/reviews/*"
).hasAuthority("REVIEW_UPDATE")

.requestMatchers(
    HttpMethod.DELETE,
    "/api/reviews/*"
).hasAuthority("REVIEW_DELETE")

.requestMatchers(
    HttpMethod.POST,
    "/api/recommendations"
).hasAuthority("RECOMMENDATION_CREATE")

.requestMatchers(
    HttpMethod.GET,
    "/api/recommendations/my-recommendations"
).hasAuthority("RECOMMENDATION_VIEW_MY_AUDITOR")

.requestMatchers(
    HttpMethod.GET,
    "/api/recommendations/my-auditee-recommendations"
).hasAuthority("RECOMMENDATION_VIEW_MY_AUDITEE")

.requestMatchers(
    HttpMethod.GET,
    "/api/recommendations/finding/**"
).hasAuthority("RECOMMENDATION_VIEW_BY_FINDING")

.requestMatchers(
    HttpMethod.GET,
    "/api/recommendations/all"
).hasAuthority("RECOMMENDATION_VIEW_ALL")

.requestMatchers(
    HttpMethod.GET,
    "/api/recommendations/*"
).hasAuthority("RECOMMENDATION_VIEW")

.requestMatchers(
    HttpMethod.PUT,
    "/api/recommendations/*/status"
).hasAuthority("RECOMMENDATION_UPDATE_STATUS")

// =========================================================
// FINDING ENDPOINTS
// =========================================================

.requestMatchers(
        HttpMethod.POST,
        "/api/findings"
).hasAuthority("FINDING_CREATE")

// IMPORTANT: specific routes first

.requestMatchers(
        HttpMethod.GET,
        "/api/findings/audit/*/risk-level/*"
).hasAuthority("FINDING_VIEW_AUDIT_RISK_LEVEL")

.requestMatchers(
        HttpMethod.GET,
        "/api/findings/auditor/*/status/*"
).hasAuthority("FINDING_VIEW_AUDITOR_STATUS")

.requestMatchers(
        HttpMethod.GET,
        "/api/findings/audit/*"
).hasAuthority("FINDING_VIEW_BY_AUDIT")

.requestMatchers(
        HttpMethod.GET,
        "/api/findings/auditor/*"
).hasAuthority("FINDING_VIEW_BY_AUDITOR")

.requestMatchers(
        HttpMethod.GET,
        "/api/findings/status/*"
).hasAuthority("FINDING_VIEW_BY_STATUS")

.requestMatchers(
        HttpMethod.GET,
        "/api/findings/risk-level/*"
).hasAuthority("FINDING_VIEW_BY_RISK_LEVEL")

.requestMatchers(
        HttpMethod.GET,
        "/api/findings"
).hasAuthority("FINDING_VIEW_ALL")

.requestMatchers(
        HttpMethod.GET,
        "/api/findings/*"
).hasAuthority("FINDING_VIEW")

.requestMatchers(
        HttpMethod.PUT,
        "/api/findings/*"
).hasAuthority("FINDING_UPDATE")

.requestMatchers(
        HttpMethod.DELETE,
        "/api/findings/*"
).hasAuthority("FINDING_DELETE")

// =====================================================
// EVIDENCE
// =====================================================

.requestMatchers(
    HttpMethod.POST,
    "/api/evidence/upload"
).hasAuthority("EVIDENCE_UPLOAD")

.requestMatchers(
    HttpMethod.GET,
    "/api/evidence/audit/*"
).hasAuthority("EVIDENCE_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/evidence/user/*"
).hasAuthority("EVIDENCE_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/evidence/pending"
).hasAuthority("EVIDENCE_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/evidence/*"
).hasAuthority("EVIDENCE_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/evidence"
).hasAuthority("EVIDENCE_VIEW")

.requestMatchers(
    HttpMethod.PUT,
    "/api/evidence/*/approve"
).hasAuthority("EVIDENCE_APPROVE")

.requestMatchers(
    HttpMethod.PUT,
    "/api/evidence/*/reject"
).hasAuthority("EVIDENCE_REJECT")

.requestMatchers(
    HttpMethod.DELETE,
    "/api/evidence/*"
).hasAuthority("EVIDENCE_DELETE")


// =====================================================
// COMPLIANCE RULES
// =====================================================

.requestMatchers(
    HttpMethod.POST,
    "/api/compliance-rules"
).hasAuthority("COMPLIANCE_RULE_CREATE")

.requestMatchers(
    HttpMethod.GET,
    "/api/compliance-rules"
).hasAuthority("COMPLIANCE_RULE_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/compliance-rules/regulatory/*"
).hasAuthority("COMPLIANCE_RULE_VIEW_BY_REGULATORY")

.requestMatchers(
    HttpMethod.GET,
    "/api/compliance-rules/department/*"
).hasAuthority("COMPLIANCE_RULE_VIEW_BY_DEPARTMENT")

.requestMatchers(
    HttpMethod.GET,
    "/api/compliance-rules/*"
).hasAuthority("COMPLIANCE_RULE_VIEW")

.requestMatchers(
    HttpMethod.PUT,
    "/api/compliance-rules/*"
).hasAuthority("COMPLIANCE_RULE_UPDATE")

.requestMatchers(
    HttpMethod.DELETE,
    "/api/compliance-rules/*"
).hasAuthority("COMPLIANCE_RULE_DELETE")

// =====================================================
// COMPLIANCE
// =====================================================

// View evidence submitted for compliance review
.requestMatchers(
    HttpMethod.GET,
    "/api/compliance/reviews"
).hasAuthority("COMPLIANCE_REVIEW_VIEW")

// Approve / Reject evidence
.requestMatchers(
    HttpMethod.PUT,
    "/api/compliance/review/*/*"
).hasAuthority("COMPLIANCE_REVIEW_UPDATE")

// =====================================================
// PERMISSION MANAGEMENT
// =====================================================

.requestMatchers(
    HttpMethod.POST,
    "/api/permissions"
).hasAuthority("PERMISSION_CREATE")

.requestMatchers(
    HttpMethod.GET,
    "/api/permissions"
).hasAuthority("PERMISSION_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/permissions/active"
).hasAuthority("PERMISSION_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/permissions/module/*"
).hasAuthority("PERMISSION_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/permissions/module/*/active"
).hasAuthority("PERMISSION_VIEW")

.requestMatchers(
    HttpMethod.GET,
    "/api/permissions/*"
).hasAuthority("PERMISSION_VIEW")

.requestMatchers(
    HttpMethod.PUT,
    "/api/permissions/*"
).hasAuthority("PERMISSION_UPDATE")

.requestMatchers(
    HttpMethod.DELETE,
    "/api/permissions/*"
).hasAuthority("PERMISSION_DELETE")

// =====================================================
// REGULATORY REQUIREMENTS
// =====================================================

// GET ALL
.requestMatchers(
    HttpMethod.GET,
    "/api/regulatory-requirements"
)
.hasAuthority(
    "REGULATORY_REQUIREMENT_VIEW"
)

// GET BY ID
.requestMatchers(
    HttpMethod.GET,
    "/api/regulatory-requirements/{id}"
)
.hasAuthority(
    "REGULATORY_REQUIREMENT_VIEW"
)

// GET BY CODE
.requestMatchers(
    HttpMethod.GET,
    "/api/regulatory-requirements/code/**"
)
.hasAuthority(
    "REGULATORY_REQUIREMENT_VIEW_BY_CODE"
)

// GET BY STATUS
.requestMatchers(
    HttpMethod.GET,
    "/api/regulatory-requirements/status/**"
)
.hasAuthority(
    "REGULATORY_REQUIREMENT_VIEW_BY_STATUS"
)

// GET BY CATEGORY
.requestMatchers(
    HttpMethod.GET,
    "/api/regulatory-requirements/category/**"
)
.hasAuthority(
    "REGULATORY_REQUIREMENT_VIEW_BY_CATEGORY"
)

// GET BY REGULATORY BODY
.requestMatchers(
    HttpMethod.GET,
    "/api/regulatory-requirements/regulatory-body/**"
)
.hasAuthority(
    "REGULATORY_REQUIREMENT_VIEW_BY_REGULATORY_BODY"
)

// GET BY DEPARTMENT
.requestMatchers(
    HttpMethod.GET,
    "/api/regulatory-requirements/department/**"
)
.hasAuthority(
    "REGULATORY_REQUIREMENT_VIEW_BY_DEPARTMENT"
)

// CREATE
.requestMatchers(
    HttpMethod.POST,
    "/api/regulatory-requirements"
)
.hasAuthority(
    "REGULATORY_REQUIREMENT_CREATE"
)

// UPDATE
.requestMatchers(
    HttpMethod.PUT,
    "/api/regulatory-requirements/**"
)
.hasAuthority(
    "REGULATORY_REQUIREMENT_UPDATE"
)

// DELETE
.requestMatchers(
    HttpMethod.DELETE,
    "/api/regulatory-requirements/**"
)
.hasAuthority(
    "REGULATORY_REQUIREMENT_DELETE"
)

            .anyRequest()
            .authenticated()
            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    
    }


}
