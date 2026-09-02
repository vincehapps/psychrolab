<script lang="ts">
  import { ShieldAlert, ArrowLeft, FileText, Scale, Lock, AlertTriangle, Cpu, Globe, Mail } from '@lucide/svelte';
</script>

<svelte:head>
  <title>Terms and Conditions — PsychroLab</title>
  <meta name="description" content="Terms and Conditions and Legal Terms for using the PsychroLab thermodynamic engineering workspace." />
</svelte:head>

<div class="max-w-4xl mx-auto space-y-10 py-4">

  <!-- ================= HERO HEADER ================= -->
  <section class="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-12 border border-slate-800 shadow-2xl">
    <!-- Ambient background glows -->
    <div class="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 space-y-4 text-center md:text-left">
      <div>
        <a
          href="/"
          class="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Return to Application</span>
        </a>
      </div>

      <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-medium block w-fit mx-auto md:mx-0">
        <Scale class="w-3.5 h-3.5 text-blue-400" />
        <span>Legal Agreement & Terms of Service</span>
      </div>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
        Terms and Conditions
      </h1>

      <p class="text-xs sm:text-sm text-slate-400 font-mono">
        Last updated: September 01, 2026
      </p>
    </div>
  </section>

  <!-- ================= AGREEMENT TO LEGAL TERMS ================= -->
  <section class="glass-panel rounded-2xl p-6 md:p-8 border border-slate-800 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
    <h2 class="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
      <FileText class="w-5 h-5 text-blue-400" />
      <span>Agreement to Our Legal Terms</span>
    </h2>

    <p>
      We operate the website <a href="http://www.psychrolab.org" target="_blank" class="text-blue-400 hover:underline">http://www.psychrolab.org</a> (the <strong>"Site"</strong>), as well as any other related products and services that refer or link to these legal terms (collectively, the <strong>"Services"</strong>). You can contact us by email at <a href="mailto:vincenth.apps@gmail.com" class="text-blue-400 hover:underline">vincenth.apps@gmail.com</a>.
    </p>

    <p>
      These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (<strong>"you"</strong>), and PsychroLab concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms.
    </p>

    <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 font-semibold text-xs">
      IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
    </div>

    <p>
      The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services. We recommend that you print a copy of these Legal Terms for your records.
    </p>
  </section>

  <!-- ================= TABLE OF CONTENTS ================= -->
  <section class="glass-panel rounded-2xl p-6 md:p-8 border border-slate-800 space-y-4">
    <h2 class="text-base font-bold text-white tracking-tight">Table of Contents</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
      <a href="#section-1" class="text-blue-400 hover:text-blue-300 transition-colors">1. OUR SERVICES</a>
      <a href="#section-2" class="text-blue-400 hover:text-blue-300 transition-colors">2. INTELLECTUAL PROPERTY RIGHTS</a>
      <a href="#section-3" class="text-blue-400 hover:text-blue-300 transition-colors">3. USER REPRESENTATIONS</a>
      <a href="#section-4" class="text-blue-400 hover:text-blue-300 transition-colors">4. PROHIBITED ACTIVITIES</a>
      <a href="#section-5" class="text-blue-400 hover:text-blue-300 transition-colors">5. USER GENERATED CONTRIBUTIONS</a>
      <a href="#section-6" class="text-blue-400 hover:text-blue-300 transition-colors">6. CONTRIBUTION LICENSE</a>
      <a href="#section-7" class="text-blue-400 hover:text-blue-300 transition-colors">7. ADVERTISERS</a>
      <a href="#section-8" class="text-blue-400 hover:text-blue-300 transition-colors">8. SERVICES MANAGEMENT</a>
      <a href="#section-9" class="text-blue-400 hover:text-blue-300 transition-colors">9. PRIVACY POLICY</a>
      <a href="#section-10" class="text-blue-400 hover:text-blue-300 transition-colors">10. TERM AND TERMINATION</a>
      <a href="#section-11" class="text-blue-400 hover:text-blue-300 transition-colors">11. MODIFICATIONS AND INTERRUPTIONS</a>
      <a href="#section-12" class="text-blue-400 hover:text-blue-300 transition-colors">12. GOVERNING LAW</a>
      <a href="#section-13" class="text-blue-400 hover:text-blue-300 transition-colors">13. DISPUTE RESOLUTION</a>
      <a href="#section-14" class="text-blue-400 hover:text-blue-300 transition-colors">14. CORRECTIONS</a>
      <a href="#section-15" class="text-amber-400 hover:text-amber-300 transition-colors">15. ENGINEERING TOOLS DISCLAIMER & LIMITATION OF LIABILITY</a>
      <a href="#section-16" class="text-blue-400 hover:text-blue-300 transition-colors">16. INDEMNIFICATION</a>
      <a href="#section-17" class="text-blue-400 hover:text-blue-300 transition-colors">17. USER DATA</a>
      <a href="#section-18" class="text-blue-400 hover:text-blue-300 transition-colors">18. ELECTRONIC COMMUNICATIONS</a>
      <a href="#section-19" class="text-blue-400 hover:text-blue-300 transition-colors">19. CALIFORNIA USERS AND RESIDENTS</a>
      <a href="#section-20" class="text-blue-400 hover:text-blue-300 transition-colors">20. MISCELLANEOUS</a>
      <a href="#section-21" class="text-blue-400 hover:text-blue-300 transition-colors">21. CONTACT US</a>
    </div>
  </section>

  <!-- ================= DETAILED SECTIONS ================= -->
  <div class="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">

    <!-- SECTION 1 -->
    <section id="section-1" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">1. OUR SERVICES</h3>
      <p>
        The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation. Those who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws.
      </p>
      <p>
        The Services are not tailored to comply with industry-specific regulations (HIPAA, FISMA, etc.), so if your interactions would be subjected to such laws, you may not use the Services. You may not use the Services in a way that would violate the Gramm-Leach-Bliley Act (GLBA).
      </p>
    </section>

    <!-- SECTION 2 (CONSOLIDATED IP CLAUSE) -->
    <section id="section-2" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
      <h3 class="text-base font-bold text-white flex items-center space-x-2">
        <Lock class="w-4 h-4 text-cyan-400" />
        <span>2. INTELLECTUAL PROPERTY RIGHTS</span>
      </h3>
      
      <p>
        <strong>2.1 Platform Ownership & Reservation of Rights:</strong> We are the owner or the licensee of all intellectual property rights in our Services. All rights, title, and interest in and to PsychroLab—including, but not limited to, the underlying source code, application architecture, custom thermodynamic calculation engines, algorithms, user interface (UI) designs, graphic layouts, visual styling, audio, video, text, database schemas, icons, and brand assets (including the name "PsychroLab" and logos)—are protected by copyright, trademark, and unfair competition laws around the world.
      </p>

      <p>
        <strong>2.2 Permitted Usage & End-User License:</strong> Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to access the platform and download or print a copy of any portion of the Content to which you have properly gained access, solely for your personal, non-commercial use or internal business evaluation purposes. You may export data summaries (such as CSV spreadsheets or dynamic chart graphics) generated through your lawful use of the platform.
      </p>

      <p>
        <strong>2.3 Restrictions:</strong> Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, reverse engineered, decompiled, or otherwise exploited for any commercial purpose whatsoever without our express prior written permission.
      </p>

      <p>
        <strong>2.4 Submissions:</strong> By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. We shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose without acknowledgment or compensation to you.
      </p>
    </section>

    <!-- SECTION 3 -->
    <section id="section-3" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">3. USER REPRESENTATIONS</h3>
      <p>By using the Services, you represent and warrant that:</p>
      <ul class="list-disc list-inside space-y-1 pl-2 text-slate-400">
        <li>You have the legal capacity and agree to comply with these Legal Terms;</li>
        <li>You are not a minor in the jurisdiction in which you reside;</li>
        <li>You will not access the Services through automated or non-human means (bots, scripts, scrapers);</li>
        <li>You will not use the Services for any illegal or unauthorized purpose;</li>
        <li>Your use of the Services will not violate any applicable law or regulation.</li>
      </ul>
    </section>

    <!-- SECTION 4 -->
    <section id="section-4" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">4. PROHIBITED ACTIVITIES</h3>
      <p>
        You may not access or use the Services for any purpose other than that for which we make the Services available. As a user of the Services, you agree not to:
      </p>
      <ul class="list-disc list-inside space-y-1 pl-2 text-slate-400">
        <li>Systematically retrieve data or content to create or compile a database or directory without written permission from us;</li>
        <li>Trick, defraud, or mislead us and other users;</li>
        <li>Circumvent, disable, or interfere with security-related features of the Services;</li>
        <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services;</li>
        <li>Upload viruses, Trojan horses, or continuous repetitive text (spamming);</li>
        <li>Engage in automated use of the system, such as using data mining or extraction tools;</li>
        <li>Copy or adapt the Services' software (including JavaScript, Svelte, HTML, or CSS code);</li>
        <li>Decipher, decompile, disassemble, or reverse engineer any software comprising the Services;</li>
        <li>Use the Services as part of any effort to compete with us or for revenue-generating commercial enterprises without written consent.</li>
      </ul>
    </section>

    <!-- SECTION 5 & 6 -->
    <section id="section-5" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">5. USER GENERATED CONTRIBUTIONS & 6. CONTRIBUTION LICENSE</h3>
      <p>
        The Services do not offer open public forums for user posting. However, we may provide you with the opportunity to submit text, feedback, or comments ("Contributions"). You retain full ownership of your Contributions. By submitting feedback, you grant us permission to use, process, and share such input following our Privacy Policy without compensation. You agree to exonerate us from any and all responsibility regarding your Submissions.
      </p>
    </section>

    <!-- SECTION 7 -->
    <section id="section-7" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">7. ADVERTISERS</h3>
      <p>
        We allow advertisers to display their advertisements and other information in certain areas of the Services, such as sidebar advertisements or banner advertisements. We simply provide the space to place such advertisements, and we have no other relationship with advertisers.
      </p>
    </section>

    <!-- SECTION 8 -->
    <section id="section-8" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">8. SERVICES MANAGEMENT</h3>
      <p>
        We reserve the right, but not the obligation, to: (1) monitor the Services for violations; (2) take appropriate legal action against anyone who violates the law or these terms; (3) refuse, restrict, or disable access to any portion of the Services; and (4) otherwise manage the Services in a manner designed to protect our rights and facilitate proper site functioning.
      </p>
    </section>

    <!-- SECTION 9 -->
    <section id="section-9" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">9. PRIVACY POLICY</h3>
      <p>
        We care about data privacy and security. Please review our Privacy Policy at: 
        <a href="http://www.psychrolab.org/privacy" target="_blank" class="text-blue-400 hover:underline">http://www.psychrolab.org/privacy</a>. By using the Services, you agree to be bound by our Privacy Policy. The Services are hosted in the <strong>Philippines</strong>. If you access the Services from regions with differing personal data collection laws, you consent to transferring your data to the Philippines.
      </p>
    </section>

    <!-- SECTION 10 & 11 -->
    <section id="section-10" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">10. TERM AND TERMINATION & 11. MODIFICATIONS AND INTERRUPTIONS</h3>
      <p>
        These Legal Terms shall remain in effect while you use the Services. WE RESERVE THE RIGHT TO DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES) TO ANY PERSON FOR ANY REASON WITHOUT NOTICE OR LIABILITY.
      </p>
      <p>
        We reserve the right to change, modify, or remove content on the Services at any time without notice. We cannot guarantee the Services will be available at all times due to hardware, software, or maintenance interruptions. You agree that we have no liability whatsoever for any loss or damage caused by your inability to access or use the Services during downtime.
      </p>
    </section>

    <!-- SECTION 12 & 13 -->
    <section id="section-12" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">12. GOVERNING LAW & 13. DISPUTE RESOLUTION</h3>
      <p>
        These Legal Terms shall be governed by and defined following the laws of the <strong>Philippines</strong>. PsychroLab and yourself irrevocably consent that the courts of the Philippines shall have exclusive jurisdiction to resolve any dispute which may arise.
      </p>
      <p>
        <strong>Informal Negotiations:</strong> The Parties agree to first attempt to negotiate any Dispute informally for at least 30 days before initiating arbitration.
      </p>
      <p>
        <strong>Binding Arbitration:</strong> Any dispute unresolvable via informal negotiation shall be finally resolved by arbitration in accordance with UNCITRAL Arbitration Rules. The seat of arbitration shall be the Philippines, conducted in the English language.
      </p>
    </section>

    <!-- SECTION 14 -->
    <section id="section-14" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">14. CORRECTIONS</h3>
      <p>
        There may be information on the Services that contains typographical errors, inaccuracies, or omissions. We reserve the right to correct any errors, inaccuracies, or omissions and to update information on the Services at any time without prior notice.
      </p>
    </section>

    <!-- SECTION 15 (CONSOLIDATED ENGINEERING & WARRANTY DISCLAIMER) -->
    <section id="section-15" class="glass-panel rounded-2xl p-6 md:p-8 border border-amber-500/40 bg-amber-500/5 space-y-4">
      <h3 class="text-base font-bold text-amber-300 flex items-center space-x-2">
        <AlertTriangle class="w-5 h-5 text-amber-400" />
        <span>15. DISCLAIMER OF WARRANTIES & LIMITATION OF LIABILITY FOR CALCULATIONS</span>
      </h3>

      <div class="space-y-3 text-xs sm:text-sm text-slate-300">
        <p>
          <strong>15.1 "As-Is" and "As-Available" Provision:</strong> The services, calculations, dynamic psychrometric charts, Mollier diagrams, state-point solvers, process delta outputs, and generated CSV or data summaries provided on PsychroLab (collectively, the "Engineering Tools") are made available strictly on an "AS IS" and "AS AVAILABLE" basis, without warranties or conditions of any kind, whether express, implied, or statutory.
        </p>

        <p>
          <strong>15.2 No Warranty of Commercial or Engineering Accuracy:</strong> While PsychroLab utilizes equations derived from published thermodynamic and psychrometric literature (such as the 2017 ASHRAE Handbook — Fundamentals and DIN standards), we make no representations, warranties, or guarantees regarding the absolute accuracy, completeness, reliability, correctness, or fitness for any specific commercial, industrial, or educational purpose of any outputs or calculations.
        </p>

        <p>
          <strong>15.3 Professional Responsibility & Verification:</strong> The Engineering Tools are provided solely for educational, informational, reference, and preliminary design assistance. They do not constitute formal engineering advice, design certification, or licensed mechanical consulting. Any user—including professional engineers, mechanical designers, contractors, or students—who relies on calculations generated by PsychroLab for real-world equipment selection, air handling unit (AHU) sizing, coil load determination, or building envelope analysis assumes full responsibility and risk for such reliance. Users are strictly advised to independently verify all thermodynamic outputs using official licensed software or manual ASHRAE engineering methods prior to physical implementation.
        </p>

        <p>
          <strong>15.4 Limitation of Liability:</strong> To the maximum extent permitted by applicable law, PsychroLab, its developers, operators, affiliates, and licensors shall not be held liable for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages whatsoever—including, without limitation, financial losses, operational delays, cost of replacement equipment, property damage, business interruption, or engineering errors—arising out of or in connection with the use of, or inability to use, the platform.
        </p>
      </div>
    </section>

    <!-- SECTION 16 -->
    <section id="section-16" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">16. INDEMNIFICATION</h3>
      <p>
        You agree to defend, indemnify, and hold us harmless, including our officers, partners, and agents, from and against any loss, damage, liability, claim, or demand (including reasonable attorneys' fees) made by any third party due to or arising out of: (1) use of the Services; (2) breach of these Legal Terms; (3) breach of your representations; (4) violation of third-party intellectual property rights; or (5) any overt harmful act toward any other user of the Services.
      </p>
    </section>

    <!-- SECTION 17 & 18 -->
    <section id="section-17" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">17. USER DATA & 18. ELECTRONIC COMMUNICATIONS</h3>
      <p>
        We maintain certain data transmitted to the Services to manage platform performance. Although we perform routine backups, you are solely responsible for all data transmitted or relating to your activity. You agree that we have no liability for any loss or corruption of such data.
      </p>
      <p>
        Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications and agree that all contracts, notices, and records delivered electronically satisfy any legal requirement for written notice.
      </p>
    </section>

    <!-- SECTION 19 -->
    <section id="section-19" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">19. CALIFORNIA USERS AND RESIDENTS</h3>
      <p>
        If any complaint with us is not satisfactorily resolved, you can contact the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs in writing at 1625 North Market Blvd., Suite N 112, Sacramento, California 95834 or by telephone at (800) 952-5210 or (916) 445-1254.
      </p>
    </section>

    <!-- SECTION 20 -->
    <section id="section-20" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h3 class="text-base font-bold text-white">20. MISCELLANEOUS</h3>
      <p>
        These Legal Terms constitute the entire agreement between you and us. Our failure to exercise or enforce any right or provision shall not operate as a waiver. If any provision is determined to be unlawful or unenforceable, that provision is deemed severable and does not affect the validity of remaining provisions. There is no joint venture, partnership, or agency relationship created between you and us.
      </p>
    </section>

    <!-- SECTION 21 -->
    <section id="section-21" class="glass-panel rounded-2xl p-6 md:p-8 border border-blue-500/30 space-y-4">
      <h3 class="text-base font-bold text-white flex items-center space-x-2">
        <Mail class="w-4 h-4 text-blue-400" />
        <span>21. CONTACT US</span>
      </h3>
      <p>
        In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
      </p>
      <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs space-y-1">
        <div class="text-white font-bold">PsychroLab Development Desk</div>
        <div class="text-slate-400">Email: <a href="mailto:vincenth.apps@gmail.com" class="text-blue-400 hover:underline">vincenth.apps@gmail.com</a></div>
        <div class="text-slate-400">Website: <a href="http://www.psychrolab.org" target="_blank" class="text-blue-400 hover:underline">www.psychrolab.org</a></div>
      </div>
    </section>

  </div>

  <!-- Footnote -->
  <div class="text-center text-[10px] font-mono text-slate-500 py-4">
    This Terms and Conditions page was created and adapted for PsychroLab.
  </div>

</div>