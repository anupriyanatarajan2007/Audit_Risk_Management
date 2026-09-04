# 🔐 Audit & Risk Management System

> A full-stack enterprise-oriented platform for managing **organizational risks, internal audits, compliance activities, evidence, findings, recommendations, and executive-level reporting** through a centralized workflow.

## 📌 Overview

The **Audit & Risk Management System** is a centralized web application designed to help organizations manage their complete **Risk, Audit, Compliance, and Governance lifecycle**.

Instead of maintaining risks, audits, findings, evidence, recommendations, and compliance activities across disconnected systems, this platform brings them together into a single workflow-driven application.

The system supports multiple organizational roles and provides role-specific dashboards, workflows, services, and access control.

### Core objectives

* Identify and register organizational risks
* Assess and prioritize risks
* Define and track mitigation activities
* Monitor Key Risk Indicators (KRIs)
* Plan and manage internal audits
* Assign auditors and auditees
* Record audit findings
* Collect and manage audit evidence
* Create and track recommendations
* Manage auditee responses
* Perform compliance reviews
* Generate management and audit reports
* Provide executive-level visibility through dashboards
* Improve accountability, traceability, and transparency

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────────┐
                         │        Users            │
                         │                         │
                         │ Admin / CAE / Manager   │
                         │ Auditor / Risk / etc.   │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │     React Frontend      │
                         │                         │
                         │ Dashboards              │
                         │ Risk Management         │
                         │ Audit Management        │
                         │ Compliance              │
                         │ Reports                 │
                         │ User Management         │
                         └────────────┬────────────┘
                                      │
                               REST API / JWT
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │   Spring Boot Backend   │
                         │                         │
                         │ Controllers             │
                         │ Services                │
                         │ Repositories            │
                         │ Security / JWT          │
                         │ Business Logic          │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │        MySQL            │
                         │                         │
                         │ Users                   │
                         │ Risks                   │
                         │ Audits                  │
                         │ Findings                │
                         │ Evidence                │
                         │ Compliance              │
                         │ Reports                 │
                         └─────────────────────────┘
```

---

# 👥 User Roles

The system is designed around role-based responsibilities.

| Role                            | Primary Responsibility                                                         |
| ------------------------------- | ------------------------------------------------------------------------------ |
| **System Administrator**        | System configuration, users, roles, permissions, organizations and departments |
| **Chief Audit Executive (CAE)** | Executive-level audit and risk oversight                                       |
| **Audit Manager**               | Audit planning, assignments, monitoring and review                             |
| **Internal Auditor**            | Audit execution, findings, evidence and recommendations                        |
| **Risk Officer**                | Risk identification, assessment, mitigation and KRI monitoring                 |
| **Auditee**                     | Audit participation, responses and evidence submission                         |
| **Compliance Officer**          | Compliance requirements, reviews and regulatory monitoring                     |

---

# 🔄 End-to-End Business Workflow

The application follows a structured audit and risk lifecycle.

```text
                    RISK MANAGEMENT
                          │
                          ▼
                  Risk Identification
                          │
                          ▼
                    Risk Assessment
                          │
                          ▼
                   Risk Prioritization
                          │
                          ▼
                    Risk Mitigation
                          │
                          ▼
                       KRI
                          │
                          ▼
                    Audit Planning
                          │
                          ▼
                  Auditor Assignment
                          │
                          ▼
                    Audit Execution
                          │
                          ▼
                       Findings
                          │
                          ▼
                      Evidence
                          │
                          ▼
                  Recommendations
                          │
                          ▼
                  Auditee Response
                          │
                          ▼
                       Review
                          │
                          ▼
                 Compliance Review
                          │
                          ▼
                    Audit Closure
                          │
                          ▼
                 Executive Reporting
```

---

# 🛡️ Risk Management

The Risk Management module provides a structured approach to identifying, evaluating, treating, and monitoring organizational risks.

### Features

* Risk registration
* Risk details management
* Risk assessment
* Risk categorization
* Risk status tracking
* Risk mitigation planning
* Mitigation monitoring
* Key Risk Indicators (KRI)
* Vendor-related risk management
* Risk search and filtering
* Risk dashboards
* Risk analytics
* Risk tracking

### Risk lifecycle

```text
NEW
 ↓
ANALYZED
 ↓
APPROVED
 ↓
IN_PROGRESS
 ↓
MITIGATED
 ↓
VERIFIED
 ↓
CLOSED
```

Additional lifecycle states such as **REOPENED** and **REJECTED** support exception handling.

---

# 🔎 Audit Management

The Audit Management module supports the complete lifecycle of internal audits.

### Features

* Annual audit planning
* Audit configuration
* Audit creation
* Audit assignment
* Auditor management
* Auditee assignment
* Audit execution
* Audit findings
* Evidence management
* Recommendations
* Review workflow
* Audit logs
* Audit reports
* Audit status tracking

### Audit lifecycle

```text
PLANNED
   ↓
ASSIGNED
   ↓
IN_PROGRESS
   ↓
UNDER_REVIEW
   ↓
COMPLETED
   ↓
CLOSED
```

This lifecycle provides clear visibility into the current state of every audit.

---

# 📝 Findings & Evidence

The platform allows internal auditors to document issues discovered during audit execution.

### Findings

Auditors can:

* Create findings
* Record finding details
* Track finding status
* Associate findings with audits
* Link findings to recommendations
* Track remediation progress

### Evidence

Evidence management supports:

* Evidence submission
* Evidence association with audits/findings
* Evidence review
* Evidence tracking
* Supporting audit conclusions with documentation

---

# 💡 Recommendations

Recommendations provide a structured way to convert audit findings into actionable improvements.

The workflow supports:

```text
Finding
   ↓
Recommendation
   ↓
Auditee Response
   ↓
Review
   ↓
Approval / Rejection
   ↓
Closure
```

This creates accountability between auditors, auditees, managers, and compliance teams.

---

# 📋 Auditee Response Management

Auditees can participate directly in the audit remediation workflow.

Supported response states include:

```text
DRAFT
  ↓
SUBMITTED
  ↓
UNDER_REVIEW
  ↓
APPROVED
```

Rejected responses can be returned for further action.

This creates a controlled communication workflow between auditors and auditees.

---

# ✅ Compliance Management

The Compliance module provides capabilities for managing organizational compliance activities.

### Features

* Compliance rules
* Regulatory requirements
* Compliance reviews
* Compliance reporting
* Regulatory requirement tracking
* Compliance officer workflow

The compliance layer can be used alongside risk and audit information to provide a broader governance perspective.

---

# 📊 Dashboards & Analytics

The application includes role-oriented dashboards designed to surface operational and executive information.

### Dashboard areas include

* Risk overview
* Risk status analytics
* Audit status analytics
* Audit assignments
* Findings
* Mitigation progress
* KRI monitoring
* Compliance information
* Reports
* Notifications
* Executive-level summaries

The dashboard architecture is designed to allow different roles to see the information relevant to their responsibilities.

---

# 🔐 Security

Security is a core part of the application architecture.

### Security capabilities

* JWT-based authentication
* Role-based access control
* Protected frontend routes
* Backend authorization
* User roles and permissions
* Organization-based management
* Department-based management
* Profile management

Sensitive configuration values should be provided through environment-specific configuration rather than committed directly to source control.

---

# 🧩 Major Backend Domain Components

The backend contains domain models covering the major business areas of the application.

```text
User / Profile
      │
      ├── Role
      ├── Permission
      ├── Department
      └── Organization

Risk
 ├── Risk Assessment
 ├── Mitigation
 ├── KRI
 ├── Vendor
 └── Auditor Assignment

Audit
 ├── Audit Configuration
 ├── Annual Audit Plan
 ├── Auditor Assignment
 ├── Auditee Assignment
 ├── Findings
 ├── Evidence
 ├── Recommendations
 ├── Auditee Response
 ├── Review
 └── Audit Log

Compliance
 ├── Compliance Rule
 ├── Regulatory Requirement
 └── Compliance Review

Reporting
 ├── Audit Reports
 ├── Risk Reports
 └── Compliance Reports
```

---

# 💻 Technology Stack

## Frontend

* **React**
* **Vite**
* **JavaScript**
* **React Router**
* **Tailwind CSS**
* **Framer Motion**
* **Recharts**
* **Axios**
* **Lucide React**

### Frontend responsibilities

* User interface
* Role-based navigation
* Dashboard visualization
* API integration
* Form handling
* Authentication state
* Protected routes
* Data filtering
* Reporting interfaces

---

## Backend

* **Java**
* **Spring Boot**
* **Spring Web**
* **Spring Data JPA**
* **Hibernate**
* **Spring Security**
* **JWT**
* **Maven**

### Backend responsibilities

* REST API development
* Authentication
* Authorization
* Business logic
* Database persistence
* Workflow management
* Audit/risk processing
* Reporting
* File/evidence handling

---

## Database

* **MySQL**
* **JPA / Hibernate ORM**

The database is designed around the relationships between users, organizations, departments, risks, audits, findings, evidence, compliance records, and reports.

---

# 📁 Project Structure

```text
Audit_Risk_Management/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/example/audit_risk_management/
│   │   │   │       ├── controller/
│   │   │   │       ├── service/
│   │   │   │       ├── repository/
│   │   │   │       ├── model/
│   │   │   │       ├── dto/
│   │   │   │       ├── enums/
│   │   │   │       ├── security/
│   │   │   │       └── ...
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── service/
│   │   ├── utils/
│   │   ├── assets/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── .gitattributes
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure the following are installed:

* Java JDK
* Maven
* Node.js
* npm
* MySQL
* Git

---

# 1️⃣ Clone the Repository

```bash
git clone https://github.com/anupriyanatarajan2007/Audit_Risk_Management.git
cd Audit_Risk_Management
```

---

# 2️⃣ Database Setup

Create a MySQL database:

```sql
CREATE DATABASE audit_risk_management;
```

Update your local backend configuration with your own database credentials.

> ⚠️ Do not commit passwords, JWT secrets, email credentials, or other sensitive configuration to GitHub.

---

# 3️⃣ Start the Backend

```bash
cd backend
```

Using Maven:

```bash
mvn spring-boot:run
```

Or on Windows:

```bash
mvnw.cmd spring-boot:run
```

The backend will start on the configured Spring Boot port.

---

# 4️⃣ Start the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL displayed by Vite in your browser.

---

# 🔗 Application Flow

After authentication, users are directed to functionality based on their assigned role.

```text
Login
  │
  ▼
Authentication
  │
  ▼
Role Verification
  │
  ├───────────────┬────────────────┬────────────────┐
  ▼               ▼                ▼                ▼
Risk Officer   Internal Auditor  Audit Manager     CAE
  │               │                │                │
  ▼               ▼                ▼                ▼
Risk Workflow   Audit Workflow   Audit Oversight   Executive View
```

---

# 📈 Example Business Scenario

Consider an organization identifying a high-risk issue in its IT security environment.

### Step 1 — Risk Identification

The Risk Officer registers the risk.

### Step 2 — Risk Assessment

The risk is analyzed based on its characteristics and severity.

### Step 3 — Mitigation

A mitigation plan is created and tracked.

### Step 4 — Audit Planning

The Audit Manager plans an audit related to the identified risk.

### Step 5 — Auditor Assignment

An Internal Auditor is assigned to conduct the audit.

### Step 6 — Audit Execution

The auditor performs audit procedures and records findings.

### Step 7 — Evidence

Supporting evidence is collected and associated with the audit.

### Step 8 — Recommendation

The auditor creates recommendations based on identified issues.

### Step 9 — Auditee Response

The Auditee provides a response and supporting evidence.

### Step 10 — Review

The relevant manager reviews the response and audit results.

### Step 11 — Compliance

Compliance requirements can be reviewed against the audit/risk outcome.

### Step 12 — Closure

The audit and related actions are completed and closed.

---

# 🎯 Key Project Highlights

### Enterprise-style workflow

The system models real organizational processes instead of functioning as a simple CRUD application.

### Multi-role architecture

Different users receive different responsibilities and access based on their roles.

### Integrated Risk + Audit

Risks and audits are managed as connected business processes.

### Evidence-driven auditing

Audit findings can be supported with evidence and recommendations.

### Compliance integration

Compliance activities are incorporated into the broader risk and audit lifecycle.

### Dashboard-driven monitoring

Role-specific dashboards provide visibility into operational and management-level information.

### Workflow-based status management

Audit and risk records move through controlled lifecycle states.

### Scalable architecture

The separation between frontend, backend, services, repositories, models, and database provides a foundation for future enhancements.

---

# 🚀 Future Enhancements

Potential future improvements include:

* Real-time notifications using WebSockets
* Advanced risk heatmaps
* Automated risk scoring
* AI-assisted audit finding analysis
* AI-generated audit recommendations
* Advanced compliance framework mapping
* Scheduled report generation
* Email notification workflows
* Audit calendar integration
* Advanced analytics
* Cloud deployment
* Docker containerization
* CI/CD pipeline
* Comprehensive automated testing
* API documentation with Swagger/OpenAPI
* Centralized audit trail and activity monitoring

---

# 🧪 Testing Strategy

Future testing coverage can be expanded across:

```text
Frontend
 ├── Component Testing
 ├── Page Testing
 └── Integration Testing

Backend
 ├── Unit Testing
 ├── Service Testing
 ├── Repository Testing
 ├── Controller Testing
 └── Security Testing

API
 ├── Authentication
 ├── Authorization
 ├── CRUD Operations
 └── Workflow Validation
```

---

# 🔒 Security Notice

This repository is intended for development and educational purposes.

Never commit:

```text
Database passwords
JWT secrets
Email passwords
API keys
Private credentials
Production configuration
Uploaded confidential evidence
```

Use environment variables or secure configuration management for sensitive values.

---

# 👩‍💻 Developer

**Anupriya N**

B.Tech – Information Technology

Interested in:

* Full-Stack Development
* Java
* Spring Boot
* React
* Software Engineering
* Enterprise Application Development
* Risk & Compliance Technology

---

# 🌐 Repository

**GitHub:**
https://github.com/anupriyanatarajan2007/Audit_Risk_Management

---

# 📜 License

This project is currently intended primarily as an educational and portfolio project.

A formal open-source license can be added when the project is prepared for public distribution.

---

# ⭐ Project Summary

**Audit & Risk Management System** is a full-stack enterprise-style application that brings together **Risk Management, Internal Audit, Compliance, Evidence, Findings, Recommendations, Reporting, and Role-Based Access Control** into a centralized platform.

The project demonstrates practical experience with:

```text
React
   +
Spring Boot
   +
Spring Security / JWT
   +
JPA / Hibernate
   +
MySQL
   +
REST APIs
   +
Role-Based Workflows
   +
Dashboard Analytics
```

> **Built to demonstrate how modern full-stack engineering can be applied to enterprise Audit, Risk, and Compliance workflows.**
