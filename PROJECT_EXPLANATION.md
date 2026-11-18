# Project Explanation & Team Briefing Guide

Welcome to the **Cloud-Based Law Firm Management System**! This document provides a simple, high-level, and visual explanation of what this project is, how each part works, what connects to what, and how to demonstrate it to stakeholders or teammates.

---

## 1. What is this Project? (The Big Picture)

### The Elevator Pitch
Imagine running a busy law firm with dozens of ongoing court cases, high-profile corporate clients, multiple attorneys, court filing deadlines, and thousands of sensitive legal contracts. Without a dedicated system, law firms struggle with missed court dates, lost files, and communication bottlenecks.

This project is an **enterprise legal practice management platform**. It acts as the central digital operating system for a law firm:
- **Client Management:** Tracks corporate, individual, and non-profit clients.
- **Counsel Directory:** Maintains lawyer profiles, bar numbers, specialties, and real-time availability.
- **Litigation & Case Tracking:** Manages lawsuits, court hearings, legal briefs, and multi-attorney legal defense teams.
- **Appointment Calendar:** Schedules court appearances, client strategy sessions, and depositions without room or time conflicts.
- **Evidentiary Document Vault:** Stores, indexes, and streams evidentiary files (PDFs, discovery exhibits, contracts) securely.
- **Live Analytics Dashboard:** Provides firm partners with real-time operational KPIs, case status charts, and a system audit trail.

---

## 2. Who Uses It? (User Roles & Permissions)

The platform includes **Role-Based Access Control (RBAC)** to ensure data privacy:

| Role | Typical User | What They Can Do | Demo Login |
|---|---|---|---|
| **`ADMIN`** | Managing Partner / Firm Director | Full operational control: view financial & case KPIs, manage all staff/lawyers, audit system activity, and configure settings. | `admin@lawfirm.com`<br>`Admin@123` |
| **`LAWYER`** | Senior Counsel / Legal Associate | Manage assigned court cases, schedule hearings, review evidence documents, and update case statuses. | `priya@lawfirm.com`<br>`Lawyer@123` |
| **`STAFF`** | Paralegal / Legal Assistant | Register incoming clients, upload case discovery documents, schedule initial consultations, and intake filings. | `marcus.vance@lawfirm.com`<br>`Staff@123` |

---

## 3. How Does the System Work? (What's Connected to What)

Here is a clear architectural map showing how a user interaction travels from the browser down to the database and cloud:

```mermaid
flowchart TD
    User(["👤 Team Member / Client / Lawyer"]) -->|Opens in Browser| Frontend["🖥️ FRONTEND (React 19 + TypeScript + Vite)\nPort: 5173 / 80"]

    subgraph UserInterface ["1. User Interface Layer"]
        Frontend --> Router["React Router + ProtectedRoute (Checks Auth)"]
        Router --> Pages["Pages: Dashboard, Cases, Clients, Lawyers, Appointments, Documents"]
        Pages --> AxiosClient["API Client (Attaches JWT Token to Headers)"]
    end

    AxiosClient -->|JSON REST Requests (/api/*)| Backend["⚙️ BACKEND (Spring Boot 3 + Java 17/22)\nPort: 8081"]

    subgraph ApplicationLogic ["2. Application Brain Layer"]
        Backend --> SecurityFilter["Spring Security + JWT Filter (Validates Token)"]
        SecurityFilter --> Controllers["REST Controllers (Routes endpoints)"]
        Controllers --> Services["Service Layer (Business Logic, Validation, Null-Safety)"]
        Services --> JPA["Spring Data JPA / Hibernate (Object-Relational Mapping)"]
    end

    subgraph StorageLayer ["3. Data & Storage Layer"]
        JPA -->|Stores Structured Records| DB[("🗄️ DATABASE\nPostgreSQL 16 / AWS RDS / H2\n(Clients, Cases, Appointments, Users)")]
        Services -->|Stores Binary Files (PDFs/Images)| S3[("☁️ DOCUMENT VAULT\nAmazon S3 Bucket / Local Storage\n(Exhibit PDFs, Contracts, Evidence)")]
    end
```

---

## 4. How the Data Flows (Real-Life Scenarios)

### Scenario A: How Logging In Works (Security Flow)
1. You type `admin@lawfirm.com` and `Admin@123` on the login page.
2. The **Frontend** sends a `POST /api/auth/login` request.
3. The **Backend** retrieves the user record from the **Database** and compares the encrypted password using BCrypt.
4. If correct, the backend generates a cryptographically signed **JWT (JSON Web Token)** valid for 24 hours.
5. The frontend saves this token in browser memory/localStorage and attaches it to every future request header:  
   `Authorization: Bearer <TOKEN>`.
6. If an unauthorized user tries to access `/cases` or `/dashboard`, the `<ProtectedRoute>` component immediately redirects them to `/login`.

---

### Scenario B: How a Legal Case is Created (Relational Flow)
1. A paralegal opens the **Cases** tab and clicks **"New Case"**.
2. The frontend dynamically fetches active clients and available lawyers to populate dropdown menus (no manual ID typing).
3. The paralegal selects client `"Apex Innovations"`, checks lawyers `"Priya Nair"` and `"Elena Rostova"`, and inputs court information.
4. The **Backend** receives the payload, links the relational foreign keys, saves the case in **PostgreSQL**, and automatically logs an event in the **Audit Activity Log**.
5. The **Dashboard** immediately updates its live KPI metrics and case status distribution chart.

---

### Scenario C: How Legal Documents are Stored & Downloaded (File Flow)
1. In the **Documents** tab, a user selects a file (e.g., `Patent_Infringement_Exhibit_A.pdf`).
2. The browser sends a `multipart/form-data` request to `POST /api/documents`.
3. The **Backend** separates the metadata from the raw file:
   - **Metadata** (filename, size, file type, upload timestamp, linked client/case) is saved into the **Database**.
   - **Raw Binary Bytes** are streamed directly to the **Amazon S3 Document Bucket** (or local storage).
4. When any team member clicks the **"Download"** button:
   - The backend calls `GET /api/documents/{id}/download`.
   - It streams the file back with the header `Content-Disposition: attachment; filename="..."`, allowing the user to view or download the original file in one click.

---

## 5. Why We Use Each DevOps & Cloud Tool

This project isn't just an application—it's a production-ready, cloud-native architecture. Here is why each DevOps tool was implemented:

| Tool | What Problem It Solves | Where It Lives in the Code |
|---|---|---|
| **Docker** | Eliminates *"it works on my machine"* syndrome. Packages the backend and frontend into self-contained container images that run identically anywhere. | [backend/Dockerfile](file:///C:/Users/swast/Desktop/Law_Firm/backend/Dockerfile)<br>[frontend/Dockerfile](file:///C:/Users/swast/Desktop/Law_Firm/frontend/Dockerfile) |
| **Docker Compose** | Lets developers start the entire three-tier architecture (Frontend + Backend + PostgreSQL 16 database) with a single command: `docker-compose up`. | [docker-compose.yml](file:///C:/Users/swast/Desktop/Law_Firm/docker-compose.yml) |
| **Kubernetes (K8s)** | Enterprise orchestration for production clusters. Manages multiple pod replicas, health-check probes, auto-restart, persistent storage claims, and load-balanced Ingress routing. | [k8s/](file:///C:/Users/swast/Desktop/Law_Firm/k8s/) |
| **Ansible** | Automates server provisioning. If you launch a fresh Ubuntu server, this single playbook installs Docker, configures firewall rules, pulls the code, and launches the app automatically. | [ansible/playbook.yml](file:///C:/Users/swast/Desktop/Law_Firm/ansible/playbook.yml) |
| **Amazon S3** | Durable, encrypted cloud object storage for client documents and case exhibits (AES-256 server-side encryption with public access blocked). | S3 Bucket: `lawfirm-documents-010607374213` |
| **Amazon ECR** | Elastic Container Registry. A private Docker container registry hosted in AWS that stores our built images for automated deployment. | Repositories: `lawfirm-management-backend`<br>`lawfirm-management-frontend` |
| **Amazon RDS** | Managed cloud PostgreSQL 16 database with automated backups, multi-AZ support, and encryption. | CloudFormation RDS instance: `production-lawfirm-db` |
| **Terraform & CloudFormation** | **Infrastructure as Code (IaC)**. Allows creating the entire AWS cloud topology (VPC, Subnets, Security Groups, RDS, S3, ECS) automatically via code instead of clicking manually in the AWS web console. | [terraform/](file:///C:/Users/swast/Desktop/Law_Firm/terraform/)<br>[aws/cloudformation.yaml](file:///C:/Users/swast/Desktop/Law_Firm/aws/cloudformation.yaml) |
| **GitHub Actions** | **CI/CD Pipeline**. Automatically runs tests, builds production bundles, builds Docker images, and pushes to Amazon ECR every time a developer pushes code to GitHub. | [.github/workflows/ci-cd-aws.yml](file:///C:/Users/swast/Desktop/Law_Firm/.github/workflows/ci-cd-aws.yml) |

---

## 6. Project Structure Cheat Sheet

```text
Law_Firm/
├── PROJECT_EXPLANATION.md            # This briefing document for the team
├── README.md                         # Standard operational documentation & commands
├── docker-compose.yml                # 1-click multi-container orchestration
│
├── frontend/                         # React 19 + TypeScript + Tailwind CSS UI
│   ├── src/pages/                    # Dashboard, Cases, Clients, Lawyers, Appointments, Documents
│   ├── src/App.tsx                   # Routing & dynamic ProtectedRoute security
│   ├── Dockerfile                    # Multi-stage Node builder + Nginx Alpine runtime
│   └── nginx.conf                    # Nginx reverse proxy configuration
│
├── backend/                          # Spring Boot 3 Java 17 Backend
│   ├── src/main/java/com/lawfirm/app/
│   │   ├── config/                   # SecurityConfig, JWT Filter, DataSeeder
│   │   ├── controller/               # REST API endpoints (/api/*)
│   │   ├── entity/                   # Database tables (Case, Client, Lawyer, Appointment, User)
│   │   └── service/                  # Business logic, null-safe sorting, file streaming
│   ├── Dockerfile                    # Multi-stage Maven builder + Temurin JRE runtime
│   ├── mvnw / mvnw.cmd               # Cross-platform Maven wrapper
│   └── pom.xml                       # Java dependencies (Spring Boot, Security, PostgreSQL)
│
├── k8s/                              # Kubernetes manifests (Deployments, Services, PVC, Ingress)
├── ansible/                          # Ansible automated server provisioning playbook
├── terraform/                        # Terraform AWS IaC modules (VPC, RDS, S3, ECS, ALB)
└── aws/cloudformation.yaml           # AWS CloudFormation 1-click cloud infrastructure template
```

---

## 7. How to Give a 2-Minute Project Demo

When presenting this project to your team, instructor, or client, follow this quick sequence:

1. **Start the App:**
   - Run backend: `cd backend && .\mvnw.cmd spring-boot:run`
   - Run frontend: `cd frontend && npm run dev`
   - Open browser to **`http://localhost:5173`**.

2. **Demonstrate Authentication & Role-Based UI:**
   - Log in as **`admin@lawfirm.com`** / **`Admin@123`**. Point out the authenticated user chip and **ADMIN** badge in the header.

3. **Show the Live Dashboard:**
   - Highlight the **KPI summary tiles** (6 Active Cases, 5 Retained Clients, 5 Counsel, 4 Scheduled Hearings).
   - Point out the **Case Status Pie Chart** and the real-time **System Audit Activity Stream**.

4. **Showcase Case & Matter Management:**
   - Navigate to the **Cases** page. Show that cases display court names, filing dates, next hearing dates, and multi-lawyer assignments.
   - Click **"New Case"** to show connected client and lawyer dropdowns.

5. **Show Appointments Calendar:**
   - Navigate to **Appointments**. Point out the scheduled court hearings and deposition preps with room locations and status filters.

6. **Demonstrate Document Storage & Download:**
   - Navigate to **Documents**. Click **"Download"** on any file to show single-click binary file streaming.

7. **Show the Cloud & DevOps Suite:**
   - Show the **GitHub Actions** tab: point out that tests and Docker image pushes to **Amazon ECR** passed with 100% green checkmarks.
   - Mention the **Amazon S3** bucket (`lawfirm-documents-010607374213`) and **Amazon RDS PostgreSQL** database deployed via **AWS CloudFormation**.
