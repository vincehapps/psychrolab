<script lang="ts">
  import { ShieldCheck, Lock, Eye, HardDrive, FileText, ArrowLeft, Mail, Cookie, AlertCircle, Scale } from '@lucide/svelte';
</script>

<svelte:head>
  <title>Privacy Policy — PsychroLab</title>
  <meta name="description" content="Privacy Policy for PsychroLab. Learn how we handle client-side thermodynamic calculations, data security, local storage, and privacy standards." />
</svelte:head>

<div class="max-w-4xl mx-auto space-y-10 py-4">

  <!-- ================= TOP HERO HEADER ================= -->
  <section class="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-12 border border-slate-800 shadow-2xl">
    <!-- Ambient glowing backgrounds -->
    <div class="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 space-y-4 text-center md:text-left">
      <a
        href="/"
        class="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-blue-400 hover:text-blue-300 transition-colors"
      >
        <ArrowLeft class="w-3.5 h-3.5"/>
        <span>Return to Application</span>
      </a>

      <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-medium block w-fit mx-auto md:mx-0">
        <ShieldCheck class="w-3.5 h-3.5 text-blue-400"/>
        <span>Legal & Privacy Notice</span>
      </div>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
        Privacy Policy
      </h1>

      <p class="text-xs text-slate-400 font-mono">
        Last updated: September 01, 2026
      </p>
    </div>
  </section>

  <!-- ================= SUMMARY OF KEY POINTS ================= -->
  <section class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
    <div class="flex items-center space-x-2 text-white font-bold text-base border-b border-slate-800 pb-3">
      <FileText class="w-5 h-5 text-blue-400" />
      <h2>Summary of Key Points</h2>
    </div>
    
    <p class="text-xs text-slate-300 leading-relaxed">
      This Privacy Notice for <strong>PsychroLab</strong> ("<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>") describes how and why we might access, collect, store, use, and/or share ("<strong>process</strong>") your personal information when you visit our website at <a href="http://www.psychrolab.org" target="_blank" class="text-cyan-400 hover:underline">http://www.psychrolab.org</a> or use our thermodynamic engineering suite.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
        <span class="font-bold text-amber-400">Personal Data Processed</span>
        <p class="text-slate-400">We do not require account registration. Basic technical data (IP address, browser type) is collected automatically.</p>
      </div>
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
        <span class="font-bold text-emerald-400">Sensitive Information</span>
        <p class="text-slate-400">We do not collect or process sensitive personal information (such as health, biometric, or religious data).</p>
      </div>
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
        <span class="font-bold text-cyan-400">Third-Party Collection</span>
        <p class="text-slate-400">We use Google Analytics and Google AdSense to track performance and serve non-intrusive ad content.</p>
      </div>
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
        <span class="font-bold text-blue-400">Your Legal Rights</span>
        <p class="text-slate-400">Depending on your location (EU/UK/US/Canada), you have rights to access, delete, or opt out of data processing.</p>
      </div>
    </div>
  </section>

  <!-- ================= QUICK NAVIGATION TABLE OF CONTENTS ================= -->
  <section class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
    <h2 class="text-sm font-bold text-white uppercase tracking-wider">Table of Contents</h2>
    <ol class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-400 font-mono">
      <li><a href="#infocollect" class="hover:underline">1. WHAT INFORMATION DO WE COLLECT?</a></li>
      <li><a href="#infouse" class="hover:underline">2. HOW DO WE PROCESS YOUR INFORMATION?</a></li>
      <li><a href="#legalbases" class="hover:underline">3. LEGAL BASES FOR PROCESSING</a></li>
      <li><a href="#whoshare" class="hover:underline">4. SHARING PERSONAL INFORMATION</a></li>
      <li><a href="#3pwebsites" class="hover:underline">5. THIRD-PARTY WEBSITES & ADS</a></li>
      <li><a href="#cookies" class="hover:underline">6. COOKIES & GOOGLE ANALYTICS</a></li>
      <li><a href="#inforetain" class="hover:underline">7. DATA RETENTION PERIODS</a></li>
      <li><a href="#infominors" class="hover:underline">8. PRIVACY FOR MINORS</a></li>
      <li><a href="#privacyrights" class="hover:underline">9. YOUR PRIVACY RIGHTS</a></li>
      <li><a href="#DNT" class="hover:underline">10. DO-NOT-TRACK CONTROLS</a></li>
      <li><a href="#uslaws" class="hover:underline">11. US REGIONAL PRIVACY RIGHTS</a></li>
      <li><a href="#policyupdates" class="hover:underline">12. UPDATES TO THIS NOTICE</a></li>
      <li><a href="#contact" class="hover:underline">13. CONTACT INFORMATION</a></li>
      <li><a href="#request" class="hover:underline">14. REVIEW OR DELETE YOUR DATA</a></li>
    </ol>
  </section>

  <!-- ================= MAIN DETAILED POLICY SECTIONS ================= -->
  <div class="space-y-8 text-xs text-slate-300 leading-relaxed">

    <!-- Section 1 -->
    <section id="infocollect" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-blue-400"></span>
        <span>1. What Information Do We Collect?</span>
      </h2>
      <p><strong>Personal information disclosed by you:</strong> We collect personal information that you voluntarily provide when expressing interest in our products or Services, or when contacting us directly.</p>
      <p><strong>Information automatically collected:</strong> We automatically collect certain technical information when you visit or navigate PsychroLab. This includes Internet Protocol (IP) addresses, browser and device characteristics, operating systems, language preferences, referring URLs, and dates/times of page visits. This information is needed to maintain security and operate our services.</p>
    </section>

    <!-- Section 2 -->
    <section id="infouse" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>2. How Do We Process Your Information?</span>
      </h2>
      <p>We process your personal information to provide, improve, and administer our Services, to communicate with you, for security and fraud prevention, and to comply with legal obligations. We may also process your information for other purposes with your explicit consent.</p>
    </section>

    <!-- Section 3 -->
    <section id="legalbases" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
        <span>3. What Legal Bases Do We Rely On?</span>
      </h2>
      <p>If you are located in the EU, UK, or Canada, we only process your personal information when we believe we have a valid legal basis under applicable law. This includes processing based on your <strong>Consent</strong>, to comply with <strong>Legal Obligations</strong>, or to protect <strong>Vital Interests</strong>.</p>
    </section>

    <!-- Section 4 -->
    <section id="whoshare" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-amber-400"></span>
        <span>4. When and With Whom Do We Share Information?</span>
      </h2>
      <p>We do not sell your personal data. We may share information in specific situations, such as in connection with business transfers (mergers, sale of company assets, or acquisitions) or with service providers bound by written contracts.</p>
    </section>

    <!-- Section 5 -->
    <section id="3pwebsites" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-purple-400"></span>
        <span>5. Third-Party Websites & Advertisers</span>
      </h2>
      <p>Our Services may contain advertisements or links to third-party websites not affiliated with us. We cannot guarantee the privacy or security practices of third parties. Any data collected by third parties is not covered by this Privacy Notice.</p>
    </section>

    <!-- Section 6 -->
    <section id="cookies" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <Cookie class="w-4 h-4 text-amber-400" />
        <span>6. Do We Use Cookies & Tracking Technologies?</span>
      </h2>
      <p>We may use cookies and similar tracking technologies to store preferences and maintain site security. We also permit third parties (such as Google Analytics and Google AdSense) to display advertisements or collect traffic data.</p>
      <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
        <span class="font-bold text-blue-400">Google Analytics & AdSense Opt-Out</span>
        <p class="text-slate-400">To opt out of being tracked by Google Analytics, visit the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">Google Analytics Opt-out Browser Add-on</a>. You can also customize your ad settings via <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">Google Ads Settings</a>.</p>
      </div>
    </section>

    <!-- Section 7 -->
    <section id="inforetain" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-blue-400"></span>
        <span>7. How Long Do We Keep Your Information?</span>
      </h2>
      <p>We retain your personal information only for as long as necessary to fulfill the purposes set out in this notice, unless a longer period is required by law. When we have no ongoing business need, data is deleted or anonymized.</p>
    </section>

    <!-- Section 8 -->
    <section id="infominors" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-rose-400"></span>
        <span>8. Do We Collect Information From Minors?</span>
      </h2>
      <p>We do not knowingly collect or market data from children under 18 years of age. If you become aware that data has been collected from a minor, please contact us at <a href="mailto:vincenth.apps@gmail.com" class="text-cyan-400 hover:underline font-mono">vincenth.apps@gmail.com</a>.</p>
    </section>

    <!-- Section 9 -->
    <section id="privacyrights" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <Scale class="w-4 h-4 text-emerald-400" />
        <span>9. What Are Your Privacy Rights?</span>
      </h2>
      <p>Depending on your region (EEA, UK, Switzerland, Canada, US), you have rights to access, rectify, erase, or restrict processing of your personal data. UK residents unhappy with data processing may lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk/make-a-complaint" target="_blank" class="text-cyan-400 hover:underline">ico.org.uk</a>.</p>
    </section>

    <!-- Section 10 -->
    <section id="DNT" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
        <span>10. Controls For Do-Not-Track Features</span>
      </h2>
      <p>Most web browsers include a Do-Not-Track ("DNT") feature. Because no uniform technical standard for recognizing DNT signals has been finalized, we do not currently respond to DNT browser signals.</p>
    </section>

    <!-- Section 11 -->
    <section id="uslaws" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
        <span>11. Do United States Residents Have Specific Privacy Rights?</span>
      </h2>
      <p>Residents of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, and Virginia have specific rights regarding personal data access and deletion.</p>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse border border-slate-800">
          <thead>
            <tr class="bg-slate-900 text-slate-200">
              <th class="p-2 border border-slate-800 font-semibold">Category</th>
              <th class="p-2 border border-slate-800 font-semibold">Examples</th>
              <th class="p-2 border border-slate-800 font-semibold text-center">Collected</th>
            </tr>
          </thead>
          <tbody class="text-slate-400">
            <tr>
              <td class="p-2 border border-slate-800 font-mono text-cyan-300">A. Identifiers</td>
              <td class="p-2 border border-slate-800">IP address, unique online identifiers, email address</td>
              <td class="p-2 border border-slate-800 text-center font-bold text-emerald-400">NO</td>
            </tr>
            <tr>
              <td class="p-2 border border-slate-800 font-mono text-cyan-300">B. CA Customer Records</td>
              <td class="p-2 border border-slate-800">Name, contact info, employment, financial history</td>
              <td class="p-2 border border-slate-800 text-center font-bold text-emerald-400">NO</td>
            </tr>
            <tr>
              <td class="p-2 border border-slate-800 font-mono text-cyan-300">F. Network Activity</td>
              <td class="p-2 border border-slate-800">Browsing history, search history, online behavior</td>
              <td class="p-2 border border-slate-800 text-center font-bold text-emerald-400">NO</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 12 -->
    <section id="policyupdates" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-amber-400"></span>
        <span>12. Do We Make Updates To This Notice?</span>
      </h2>
      <p>Yes, we will update this notice as necessary to remain compliant with relevant laws. Updates are indicated by a revised date at the top of this page.</p>
    </section>

    <!-- Section 13 -->
    <section id="contact" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <Mail class="w-4 h-4 text-blue-400" />
        <span>13. How Can You Contact Us About This Notice?</span>
      </h2>
      <p>If you have questions or comments regarding this policy, email us at:</p>
      <div class="inline-flex items-center space-x-2 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 font-mono text-xs text-blue-300">
        <Mail class="w-4 h-4 text-blue-400"/>
        <a href="mailto:vincenth.apps@gmail.com" class="hover:underline">vincenth.apps@gmail.com</a>
      </div>
    </section>

    <!-- Section 14 -->
    <section id="request" class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
      <h2 class="text-base font-bold text-white tracking-tight flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>14. How to Review, Update, or Delete Your Data</span>
      </h2>
      <p>Based on applicable laws in your country or state, you may request access to, correction of, or deletion of your personal information. To submit a data request, please submit a Data Subject Access Request via email at <a href="mailto:vincenth.apps@gmail.com" class="text-cyan-400 hover:underline">vincenth.apps@gmail.com</a>.</p>
    </section>

  </div>

</div>