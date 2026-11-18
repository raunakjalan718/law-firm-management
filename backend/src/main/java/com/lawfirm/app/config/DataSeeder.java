package com.lawfirm.app.config;

import com.lawfirm.app.entity.ActivityLog;
import com.lawfirm.app.entity.Appointment;
import com.lawfirm.app.entity.AppointmentStatus;
import com.lawfirm.app.entity.CaseStatus;
import com.lawfirm.app.entity.Client;
import com.lawfirm.app.entity.Lawyer;
import com.lawfirm.app.entity.LegalCase;
import com.lawfirm.app.entity.RoleName;
import com.lawfirm.app.entity.User;
import com.lawfirm.app.repository.ActivityLogRepository;
import com.lawfirm.app.repository.AppointmentRepository;
import com.lawfirm.app.repository.ClientRepository;
import com.lawfirm.app.repository.LawyerRepository;
import com.lawfirm.app.repository.LegalCaseRepository;
import com.lawfirm.app.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final LawyerRepository lawyerRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final AppointmentRepository appointmentRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, ClientRepository clientRepository, LawyerRepository lawyerRepository,
                      LegalCaseRepository legalCaseRepository, AppointmentRepository appointmentRepository,
                      ActivityLogRepository activityLogRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.lawyerRepository = lawyerRepository;
        this.legalCaseRepository = legalCaseRepository;
        this.appointmentRepository = appointmentRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // ----------------------------------------------------
            // 1. DEMO USERS (ADMIN, LAWYER, STAFF)
            // ----------------------------------------------------
            User admin = new User("Alexander", "Sterling", "admin@lawfirm.com", passwordEncoder.encode("Admin@123"), "+1-555-0101", RoleName.ADMIN);
            User seniorPartner = new User("Priya", "Nair", "priya@lawfirm.com", passwordEncoder.encode("Lawyer@123"), "+1-555-0102", RoleName.LAWYER);
            User paralegal = new User("Marcus", "Vance", "marcus.vance@lawfirm.com", passwordEncoder.encode("Staff@123"), "+1-555-0103", RoleName.STAFF);

            userRepository.save(admin);
            userRepository.save(seniorPartner);
            userRepository.save(paralegal);

            // ----------------------------------------------------
            // 2. REALISTIC CLIENT DIRECTORY
            // ----------------------------------------------------
            Client c1 = new Client();
            c1.setFullName("Apex Innovations Global Ltd");
            c1.setEmail("legal@apexinnovations.com");
            c1.setPhone("+1-555-0201");
            c1.setAddress("100 Innovation Way, Suite 400, Silicon Valley, CA");
            c1.setClientType("Corporate");
            c1.setNotes("Series B deep-tech firm. Retained for cross-border software patent defense and enterprise IP litigation.");
            clientRepository.save(c1);

            Client c2 = new Client();
            c2.setFullName("Dr. Arvind Swaminathan");
            c2.setEmail("arvind.swaminathan@gmail.com");
            c2.setPhone("+1-555-0302");
            c2.setAddress("42 Orchid Boulevard, Pune, MH");
            c2.setClientType("Individual");
            c2.setNotes("Chief Cardiothoracic Surgeon. Healthcare system partnership buyout and restrictive covenant contestation.");
            clientRepository.save(c2);

            Client c3 = new Client();
            c3.setFullName("Metropolitan Real Estate Trust");
            c3.setEmail("compliance@metropolitanrealty.com");
            c3.setPhone("+1-555-0403");
            c3.setAddress("75 Wall Street, 14th Floor, New York, NY");
            c3.setClientType("Corporate");
            c3.setNotes("Commercial real estate REIT. Commercial lease restructuring and municipal zoning appeal for downtown redevelopment.");
            clientRepository.save(c3);

            Client c4 = new Client();
            c4.setFullName("Sarah Jenkins");
            c4.setEmail("s.jenkins@outlook.com");
            c4.setPhone("+1-555-0504");
            c4.setAddress("18 Heritage Road, Boston, MA");
            c4.setClientType("Individual");
            c4.setNotes("Estate probate settlement and contested testamentary trust allocation involving commercial family holdings.");
            clientRepository.save(c4);

            Client c5 = new Client();
            c5.setFullName("Global Green Energy Foundation");
            c5.setEmail("contact@globalgreenenergy.org");
            c5.setPhone("+1-555-0605");
            c5.setAddress("500 Sustainability Avenue, Seattle, WA");
            c5.setClientType("Non-Profit");
            c5.setNotes("Clean-energy NGO. Federal regulatory compliance filings and utility grid interconnection mitigation agreements.");
            clientRepository.save(c5);

            // ----------------------------------------------------
            // 3. LAWYER & COUNSEL ROSTER
            // ----------------------------------------------------
            Lawyer l1 = new Lawyer();
            l1.setFullName("Priya Nair");
            l1.setEmail("priya@lawfirm.com");
            l1.setPhone("+1-555-0404");
            l1.setSpecialization("Corporate Litigation & M&A");
            l1.setYearsOfExperience(12);
            l1.setBarRegistrationNumber("BAR-1204");
            l1.setAvailabilityStatus("Available");
            lawyerRepository.save(l1);

            Lawyer l2 = new Lawyer();
            l2.setFullName("Harsh Mehta");
            l2.setEmail("harsh@lawfirm.com");
            l2.setPhone("+1-555-0505");
            l2.setSpecialization("Family & Estate Law");
            l2.setYearsOfExperience(15);
            l2.setBarRegistrationNumber("BAR-9901");
            l2.setAvailabilityStatus("On Call");
            lawyerRepository.save(l2);

            Lawyer l3 = new Lawyer();
            l3.setFullName("Elena Rostova");
            l3.setEmail("elena.rostova@lawfirm.com");
            l3.setPhone("+1-555-0707");
            l3.setSpecialization("Intellectual Property & Patents");
            l3.setYearsOfExperience(9);
            l3.setBarRegistrationNumber("BAR-5541");
            l3.setAvailabilityStatus("Available");
            lawyerRepository.save(l3);

            Lawyer l4 = new Lawyer();
            l4.setFullName("Devon Vance, Esq.");
            l4.setEmail("devon.vance@lawfirm.com");
            l4.setPhone("+1-555-0808");
            l4.setSpecialization("Commercial Real Estate");
            l4.setYearsOfExperience(18);
            l4.setBarRegistrationNumber("BAR-8820");
            l4.setAvailabilityStatus("Busy");
            lawyerRepository.save(l4);

            Lawyer l5 = new Lawyer();
            l5.setFullName("Ananya Sengupta");
            l5.setEmail("ananya.s@lawfirm.com");
            l5.setPhone("+1-555-0909");
            l5.setSpecialization("Regulatory & Environmental Law");
            l5.setYearsOfExperience(7);
            l5.setBarRegistrationNumber("BAR-3312");
            l5.setAvailabilityStatus("Available");
            lawyerRepository.save(l5);

            // ----------------------------------------------------
            // 4. REALISTIC LEGAL CASES (LITIGATION & MATTERS)
            // ----------------------------------------------------
            LegalCase case1 = new LegalCase();
            case1.setCaseNumber("LF-2026-001");
            case1.setTitle("Apex v. Omnicorp Technologies (Patent Infringement)");
            case1.setCaseType("IP Litigation");
            case1.setClient(c1);
            case1.setCourtName("High Court Commercial Division");
            case1.setFilingDate(LocalDate.now().minusDays(18));
            case1.setNextHearingDate(LocalDate.now().plusDays(6));
            case1.setDescription("Multi-jurisdiction patent infringement action defending proprietary neural network architecture against unauthorized algorithmic duplication.");
            case1.setStatus(CaseStatus.ACTIVE);
            case1.getLawyers().add(l1);
            case1.getLawyers().add(l3);
            legalCaseRepository.save(case1);

            LegalCase case2 = new LegalCase();
            case2.setCaseNumber("LF-2026-002");
            case2.setTitle("Metropolitan Real Estate Trust vs. City Zoning Board");
            case2.setCaseType("Municipal & Commercial Appeal");
            case2.setClient(c3);
            case2.setCourtName("Appellate Court of Municipal Appeals");
            case2.setFilingDate(LocalDate.now().minusDays(45));
            case2.setNextHearingDate(LocalDate.now().plusDays(2));
            case2.setDescription("Administrative appeal challenging municipal denial of mixed-use variance permit for $120M downtown commercial revitalization project.");
            case2.setStatus(CaseStatus.HEARING_SCHEDULED);
            case2.getLawyers().add(l4);
            legalCaseRepository.save(case2);

            LegalCase case3 = new LegalCase();
            case3.setCaseNumber("LF-2026-003");
            case3.setTitle("Dr. Swaminathan Healthcare Partnership Non-Compete");
            case3.setCaseType("Employment Dispute");
            case3.setClient(c2);
            case3.setCourtName("High Court Arbitration Division");
            case3.setFilingDate(LocalDate.now().minusDays(8));
            case3.setNextHearingDate(LocalDate.now().plusDays(14));
            case3.setDescription("Challenging an overbroad 5-year geographic restrictive covenant in a physician partnership buyout agreement.");
            case3.setStatus(CaseStatus.ACTIVE);
            case3.getLawyers().add(l1);
            legalCaseRepository.save(case3);

            LegalCase case4 = new LegalCase();
            case4.setCaseNumber("LF-2026-004");
            case4.setTitle("Estate of Arthur Jenkins Probate & Trust Allocation");
            case4.setCaseType("Probate & Estate Dispute");
            case4.setClient(c4);
            case4.setCourtName("Surrogate's Probate Court");
            case4.setFilingDate(LocalDate.now().minusDays(25));
            case4.setNextHearingDate(LocalDate.now().plusDays(20));
            case4.setDescription("Formal judicial settlement of accounts, resolution of contested testamentary bequest, and transfer of estate deeds.");
            case4.setStatus(CaseStatus.PENDING);
            case4.getLawyers().add(l2);
            legalCaseRepository.save(case4);

            LegalCase case5 = new LegalCase();
            case5.setCaseNumber("LF-2026-005");
            case5.setTitle("Global Green Energy Permitting & Environmental Review");
            case5.setCaseType("Regulatory Compliance");
            case5.setClient(c5);
            case5.setCourtName("Federal Energy Regulatory Commission (FERC)");
            case5.setFilingDate(LocalDate.now().minusDays(30));
            case5.setNextHearingDate(LocalDate.now().plusDays(8));
            case5.setDescription("Preparation of environmental impact mitigation brief and inter-agency grid interconnection agreement approval.");
            case5.setStatus(CaseStatus.ACTIVE);
            case5.getLawyers().add(l5);
            legalCaseRepository.save(case5);

            LegalCase case6 = new LegalCase();
            case6.setCaseNumber("LF-2026-006");
            case6.setTitle("St. Jude Medical Device Licensing Settlement");
            case6.setCaseType("Commercial Contracts");
            case6.setClient(c1);
            case6.setCourtName("International Chamber of Commerce (ICC) Arbitration");
            case6.setFilingDate(LocalDate.now().minusDays(90));
            case6.setNextHearingDate(null);
            case6.setDescription("Successfully concluded arbitral mediation securing $4.2M licensing royalty payout and global cross-licensing framework.");
            case6.setStatus(CaseStatus.CLOSED);
            case6.getLawyers().add(l1);
            case6.getLawyers().add(l3);
            legalCaseRepository.save(case6);

            // ----------------------------------------------------
            // 5. APPOINTMENTS & COURT HEARINGS
            // ----------------------------------------------------
            Appointment ap1 = new Appointment();
            ap1.setClient(c3);
            ap1.setLawyer(l4);
            ap1.setLegalCase(case2);
            ap1.setDate(LocalDate.now().plusDays(2));
            ap1.setTime(LocalTime.of(10, 30));
            ap1.setLocation("Courtroom 402, Municipal Courthouse");
            ap1.setAppointmentType("Court Hearing");
            ap1.setDescription("Oral arguments before the presiding appellate magistrate on municipal zoning variance appeal.");
            ap1.setStatus(AppointmentStatus.SCHEDULED);
            appointmentRepository.save(ap1);

            Appointment ap2 = new Appointment();
            ap2.setClient(c1);
            ap2.setLawyer(l3);
            ap2.setLegalCase(case1);
            ap2.setDate(LocalDate.now().plusDays(4));
            ap2.setTime(LocalTime.of(14, 0));
            ap2.setLocation("Executive Boardroom A");
            ap2.setAppointmentType("Deposition Prep");
            ap2.setDescription("Cross-examination prep for lead forensic software patent expert witness.");
            ap2.setStatus(AppointmentStatus.SCHEDULED);
            appointmentRepository.save(ap2);

            Appointment ap3 = new Appointment();
            ap3.setClient(c2);
            ap3.setLawyer(l1);
            ap3.setLegalCase(case3);
            ap3.setDate(LocalDate.now().plusDays(6));
            ap3.setTime(LocalTime.of(11, 0));
            ap3.setLocation("Client Conference Room 2B");
            ap3.setAppointmentType("Strategy Session");
            ap3.setDescription("Review settlement terms proffered by hospital healthcare system defense counsel.");
            ap3.setStatus(AppointmentStatus.SCHEDULED);
            appointmentRepository.save(ap3);

            Appointment ap4 = new Appointment();
            ap4.setClient(c5);
            ap4.setLawyer(l5);
            ap4.setLegalCase(case5);
            ap4.setDate(LocalDate.now().plusDays(8));
            ap4.setTime(LocalTime.of(15, 30));
            ap4.setLocation("Virtual Video Conference (Zoom Room 1)");
            ap4.setAppointmentType("Regulatory Hearing");
            ap4.setDescription("FERC environmental impact public testimony and inter-agency hearing.");
            ap4.setStatus(AppointmentStatus.SCHEDULED);
            appointmentRepository.save(ap4);

            Appointment ap5 = new Appointment();
            ap5.setClient(c4);
            ap5.setLawyer(l2);
            ap5.setLegalCase(case4);
            ap5.setDate(LocalDate.now().minusDays(3));
            ap5.setTime(LocalTime.of(9, 30));
            ap5.setLocation("Client Consultation Suite 3");
            ap5.setAppointmentType("Document Execution");
            ap5.setDescription("Execution of updated affidavit of heirship and inventory of probate assets.");
            ap5.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(ap5);

            // ----------------------------------------------------
            // 6. REAL-TIME AUDIT ACTIVITY LOGS
            // ----------------------------------------------------
            activityLogRepository.save(new ActivityLog("System", "Database Initialized", "Enterprise practice management database seeded with demonstration accounts and baseline directory."));
            activityLogRepository.save(new ActivityLog("Alexander Sterling", "User Provisioning", "Provisioned Senior Partner account for Priya Nair (Corporate Litigation)."));
            activityLogRepository.save(new ActivityLog("Elena Rostova", "Document Filed", "Filed Exhibit A: Forensic Source Code Diff Analysis for Case LF-2026-001."));
            activityLogRepository.save(new ActivityLog("Devon Vance", "Hearing Scheduled", "Scheduled municipal oral arguments for Metropolitan Real Estate appeal on Courtroom 402."));
            activityLogRepository.save(new ActivityLog("Priya Nair", "Case Status Updated", "Case LF-2026-006 transitioned to CLOSED following mutual execution of arbitral settlement agreement."));
        }
    }
}
