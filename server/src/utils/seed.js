require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Event = require('../models/Event');
const Project = require('../models/Project');
const CommunityPost = require('../models/CommunityPost');
const Announcement = require('../models/Announcement');
const Opportunity = require('../models/Opportunity');
const generateSlug = require('./slugify');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Wipe existing seed data
  await Promise.all([
    User.deleteMany({ email: { $in: ['admin@campuspilot.com', 'student@campuspilot.com', 'lecturer@campuspilot.com'] } }),
    Event.deleteMany({ 'organizer.name': 'CampusPilot Seed' }),
    Project.deleteMany({ tags: 'seed-data' }),
    CommunityPost.deleteMany({ tags: 'seed-data' }),
    Announcement.deleteMany({ department: 'SEED' }),
    Opportunity.deleteMany({ organization: { $in: ['Google', 'Microsoft', 'UNESCO', 'WAEC Foundation', 'MIT', 'UN Youth'] } }),
  ]);

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User', email: 'admin@campuspilot.com', password: 'admin123',
    role: 'admin', department: 'Administration', isVerified: true,
  });
  const student = await User.create({
    name: 'Kofi Mensah', email: 'student@campuspilot.com', password: 'student123',
    role: 'student', department: 'Computer Science', faculty: 'Engineering',
  });
  const lecturer = await User.create({
    name: 'Dr. Abena Osei', email: 'lecturer@campuspilot.com', password: 'lecturer123',
    role: 'lecturer', department: 'Computer Science', faculty: 'Engineering',
  });

  console.log('✅ Users created  (admin@campuspilot.com / admin123)');

  // ── Events ─────────────────────────────────────────────────────────────────
  const events = await Event.insertMany([
    {
      title: 'Annual Tech Innovation Summit 2025',
      slug: generateSlug('Annual Tech Innovation Summit 2025'),
      description: 'Join us for the biggest technology event on campus! Featuring keynotes from industry leaders, hands-on workshops, startup pitches, and networking sessions. Topics include AI, blockchain, cybersecurity, and sustainable tech.',
      category: 'technology',
      venue: 'Great Hall, Main Campus',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '9:00 AM',
      organizer: { name: 'CampusPilot Seed', user: admin._id },
      tags: ['tech', 'innovation', 'ai', 'networking'],
      status: 'approved', isFeatured: true,
      featuredPlacement: ['homepage', 'events_section'],
      views: 342, registrationCount: 89,
      createdBy: admin._id, approvedBy: admin._id, approvedAt: new Date(),
      contactInfo: { email: 'tech@campuspilot.com', phone: '+233 20 123 4567' },
    },
    {
      title: 'Final Year Project Defence & Exhibition',
      slug: generateSlug('Final Year Project Defence'),
      description: 'Watch as final year Computer Science students present and defend their capstone projects. Projects include AI-powered health diagnosis systems, smart campus navigation apps, and blockchain voting platforms.',
      category: 'academic',
      venue: 'Engineering Block, Lab A & B',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '10:00 AM',
      organizer: { name: 'CampusPilot Seed', user: lecturer._id },
      tags: ['academic', 'projects', 'engineering', 'showcase'],
      status: 'approved', isFeatured: true,
      featuredPlacement: ['homepage'],
      views: 210, registrationCount: 45,
      createdBy: lecturer._id, approvedBy: admin._id, approvedAt: new Date(),
      contactInfo: { email: 'cs@campuspilot.com' },
    },
    {
      title: 'Entrepreneurship & Startup Workshop',
      slug: generateSlug('Entrepreneurship Startup Workshop'),
      description: 'A full-day intensive workshop for aspiring student entrepreneurs. Learn how to validate your business idea, build an MVP, pitch to investors, and access funding. Guest speakers include successful alumni founders.',
      category: 'business',
      venue: 'Business School Auditorium',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      time: '8:30 AM',
      organizer: { name: 'CampusPilot Seed', user: admin._id },
      tags: ['entrepreneurship', 'startup', 'business', 'funding'],
      status: 'approved',
      views: 178, registrationCount: 62,
      createdBy: admin._id, approvedBy: admin._id, approvedAt: new Date(),
    },
    {
      title: 'Inter-Departmental Football Tournament',
      slug: generateSlug('Inter-Departmental Football Tournament'),
      description: '16 departments compete in the annual football tournament. Group stage matches start this weekend — come cheer for your department! Finals will be held on the main sports field with prizes for top teams.',
      category: 'sports',
      venue: 'Main Sports Field',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '3:00 PM',
      organizer: { name: 'CampusPilot Seed', user: student._id },
      tags: ['sports', 'football', 'tournament', 'competition'],
      status: 'approved',
      views: 520, registrationCount: 160,
      createdBy: student._id, approvedBy: admin._id, approvedAt: new Date(),
    },
    {
      title: 'Research Seminar: AI in Healthcare',
      slug: generateSlug('Research Seminar AI Healthcare'),
      description: 'Distinguished lecture series featuring researchers from Johns Hopkins and University of Ghana. Topics include machine learning for disease prediction, medical imaging AI, and ethical considerations in health AI.',
      category: 'seminar',
      venue: 'Medical Sciences Lecture Hall',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      time: '2:00 PM',
      organizer: { name: 'CampusPilot Seed', user: lecturer._id },
      tags: ['research', 'ai', 'healthcare', 'seminar'],
      status: 'approved',
      views: 134, registrationCount: 40,
      createdBy: lecturer._id, approvedBy: admin._id, approvedAt: new Date(),
    },
    {
      title: 'Cultural Night & Talent Show 2025',
      slug: generateSlug('Cultural Night Talent Show 2025'),
      description: 'Celebrate the rich diversity of our campus community. Musical performances, dance, comedy, fashion show, and traditional cultural displays from over 20 student clubs. Free entry for all students.',
      category: 'entertainment',
      venue: 'University Amphitheatre',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      time: '6:00 PM',
      organizer: { name: 'CampusPilot Seed', user: student._id },
      tags: ['culture', 'entertainment', 'talent', 'diversity'],
      status: 'approved',
      views: 891, registrationCount: 300,
      createdBy: student._id, approvedBy: admin._id, approvedAt: new Date(),
    },
  ]);

  console.log(`✅ ${events.length} Events created`);

  // ── Projects ───────────────────────────────────────────────────────────────
  const projects = await Project.insertMany([
    {
      name: 'CampusNav — Smart Campus Navigation App',
      slug: generateSlug('CampusNav Smart Campus Navigation'),
      description: 'An AI-powered mobile app that helps new and existing students navigate the campus efficiently. Features include real-time indoor positioning, class schedule integration, cafeteria wait times, and accessibility routing for students with disabilities.',
      category: 'mobile_app',
      department: 'Computer Science',
      teamMembers: [
        { name: 'Kofi Mensah', role: 'Lead Developer', user: student._id },
        { name: 'Ama Asante', role: 'UI/UX Designer' },
        { name: 'Kwame Boateng', role: 'Backend Developer' },
      ],
      tags: ['mobile', 'navigation', 'ai', 'seed-data'],
      projectLink: 'https://campusnav.demo',
      githubRepo: 'https://github.com/example/campusnav',
      status: 'approved', isFeatured: true,
      views: 412, likeCount: 87, bookmarkCount: 34, commentCount: 23,
      createdBy: student._id, approvedBy: admin._id,
    },
    {
      name: 'EduChain — Blockchain Certificate Verification',
      slug: generateSlug('EduChain Blockchain Certificate'),
      description: 'A blockchain-based system for issuing and verifying academic certificates, preventing fraud and enabling instant verification by employers worldwide. Built on Ethereum with a React frontend and smart contracts in Solidity.',
      category: 'final_year',
      department: 'Computer Science',
      teamMembers: [
        { name: 'Abena Frimpong', role: 'Blockchain Developer' },
        { name: 'Yaw Darko', role: 'Frontend Developer' },
      ],
      tags: ['blockchain', 'ethereum', 'certificates', 'seed-data'],
      githubRepo: 'https://github.com/example/educhain',
      demoLink: 'https://educhain.demo',
      status: 'approved', isFeatured: true,
      views: 287, likeCount: 64, bookmarkCount: 28,
      createdBy: student._id, approvedBy: admin._id,
    },
    {
      name: 'FarmSense — IoT Precision Agriculture Platform',
      slug: generateSlug('FarmSense IoT Agriculture'),
      description: 'IoT-powered smart farming platform that uses sensor networks, machine learning, and real-time dashboards to help smallholder farmers optimize crop yields, detect diseases early, and reduce water usage by 40%.',
      category: 'innovation',
      department: 'Agricultural Engineering',
      teamMembers: [
        { name: 'Akosua Owusu', role: 'Hardware Engineer' },
        { name: 'Nana Adjei', role: 'Data Scientist' },
        { name: 'Efia Mensah', role: 'Mobile Developer' },
      ],
      tags: ['iot', 'agriculture', 'ml', 'sustainability', 'seed-data'],
      projectLink: 'https://farmsense.demo',
      status: 'approved',
      views: 198, likeCount: 45, bookmarkCount: 19,
      createdBy: student._id, approvedBy: admin._id,
    },
    {
      name: 'MentorConnect — Student Mentorship Marketplace',
      slug: generateSlug('MentorConnect Student Mentorship'),
      description: 'A platform connecting students with alumni mentors based on career goals, skills, and availability. Features AI-powered mentor matching, scheduling, video calls, progress tracking, and resource sharing.',
      category: 'startup',
      department: 'Business Administration',
      teamMembers: [
        { name: 'Kwesi Amponsah', role: 'Product Manager' },
        { name: 'Adwoa Asante', role: 'Full-Stack Developer' },
      ],
      tags: ['startup', 'mentorship', 'ai-matching', 'seed-data'],
      projectLink: 'https://mentorconnect.demo',
      status: 'approved',
      views: 321, likeCount: 72, bookmarkCount: 41,
      createdBy: student._id, approvedBy: admin._id,
    },
    {
      name: 'CampusMarket — Student Marketplace App',
      slug: generateSlug('CampusMarket Student Marketplace'),
      description: 'A peer-to-peer marketplace exclusively for university students. Buy, sell, and rent textbooks, electronics, furniture, and services. Features secure payments, ratings, and campus-wide delivery.',
      category: 'startup',
      department: 'Computer Science',
      teamMembers: [
        { name: 'Fiifi Boateng', role: 'Founder & Developer' },
      ],
      tags: ['marketplace', 'ecommerce', 'p2p', 'seed-data'],
      status: 'approved',
      views: 156, likeCount: 38,
      createdBy: student._id, approvedBy: admin._id,
    },
    {
      name: 'Mental Health Chatbot for Students',
      slug: generateSlug('Mental Health Chatbot Students'),
      description: 'An AI-powered anonymous chatbot providing 24/7 mental health support, stress management tips, and guided mindfulness exercises for students. Detects crisis situations and connects users to campus counsellors.',
      category: 'research',
      department: 'Psychology',
      teamMembers: [
        { name: 'Serwa Amoah', role: 'Researcher' },
        { name: 'Baffour Adu', role: 'NLP Engineer' },
      ],
      tags: ['mental-health', 'nlp', 'ai', 'research', 'seed-data'],
      status: 'approved', isFeatured: true,
      views: 445, likeCount: 120, bookmarkCount: 55,
      createdBy: student._id, approvedBy: admin._id,
    },
  ]);

  console.log(`✅ ${projects.length} Projects created`);

  // ── Announcements ──────────────────────────────────────────────────────────
  const announcements = await Announcement.insertMany([
    {
      title: '2025/2026 Academic Year Registration Now Open',
      content: '<p>The Registrar\'s Office hereby announces that registration for the <strong>2025/2026 academic year</strong> is now open. All continuing students must complete registration by <strong>August 15, 2025</strong>.</p><p>Steps: Log into the student portal → Select courses → Pay fees → Print confirmation slip.</p><p>Late registration attracts a fine. Contact registrar@university.edu for assistance.</p>',
      category: 'registration',
      priority: 'urgent',
      isPublished: true, publishedAt: new Date(),
      department: 'SEED',
      createdBy: admin._id,
    },
    {
      title: 'Second Semester Examination Timetable Released',
      content: '<p>The examination timetable for the <strong>Second Semester 2024/2025</strong> has been released. Please check the student portal for your personalised schedule.</p><ul><li>Exam period: July 28 – August 10, 2025</li><li>No deferrals will be granted except for medical emergencies</li><li>Report halls 30 minutes before exam time</li></ul>',
      category: 'examination',
      priority: 'high',
      isPublished: true, publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      department: 'SEED',
      createdBy: admin._id,
    },
    {
      title: 'Campus Wi-Fi Upgrade — Scheduled Downtime',
      content: '<p>The IT Department will be upgrading the campus-wide Wi-Fi infrastructure this weekend. There will be <strong>intermittent connectivity</strong> from Friday 11 PM to Saturday 6 AM.</p><p>After the upgrade, speeds will increase from 100 Mbps to 1 Gbps across all buildings. Thank you for your patience.</p>',
      category: 'general',
      priority: 'normal',
      isPublished: true, publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      department: 'SEED',
      createdBy: admin._id,
    },
    {
      title: 'New Library Resources Available — 50,000+ eBooks',
      content: '<p>The University Library has added access to over <strong>50,000 new eBooks</strong> and 200 academic journals through our new partnership with SpringerLink and Elsevier.</p><p>Access using your student ID at library.university.edu. All resources available 24/7 from anywhere in the world.</p>',
      category: 'academic',
      priority: 'normal',
      isPublished: true, publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      department: 'SEED',
      createdBy: lecturer._id,
    },
    {
      title: '⚠️ Emergency: Water Supply Interruption Today',
      content: '<p>Due to a burst pipe on the north side of campus, water supply to <strong>Halls A, B, C and the Engineering Block</strong> will be interrupted today from 8 AM – 4 PM.</p><p>Water tankers have been deployed to Hall D car park. We apologise for the inconvenience.</p>',
      category: 'emergency',
      priority: 'urgent',
      isPublished: true, publishedAt: new Date(),
      isPinned: true,
      department: 'SEED',
      createdBy: admin._id,
    },
  ]);

  console.log(`✅ ${announcements.length} Announcements created`);

  // ── Community Posts ────────────────────────────────────────────────────────
  const posts = await CommunityPost.insertMany([
    {
      type: 'campus_news',
      title: 'University Ranked #1 in West Africa for Engineering — Again!',
      content: 'We are proud to announce that our university has been ranked #1 in West Africa for Engineering and Technology for the third consecutive year by QS World University Rankings 2025. The ranking cites our research output, industry partnerships, and graduate employability rate of 94%.',
      tags: ['ranking', 'achievement', 'engineering', 'seed-data'],
      author: admin._id, isPublished: true, isFeatured: true, isTrending: true,
      views: 2340, likeCount: 412, shareCount: 89, commentCount: 45, trendingScore: 850,
    },
    {
      type: 'scholarship',
      title: '🎓 Google Generation Scholarship 2025 — Applications Open',
      content: 'Google has announced 50 full scholarships for African students pursuing Computer Science and Engineering degrees. The scholarship covers full tuition, accommodation, laptop, and a monthly stipend of $500. Applications close September 30, 2025. Visit g.co/generation for details.',
      tags: ['scholarship', 'google', 'cs', 'fully-funded', 'seed-data'],
      author: admin._id, isPublished: true, isTrending: true,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      externalLink: 'https://buildyourfuture.withgoogle.com/scholarships',
      views: 1890, likeCount: 287, shareCount: 134, commentCount: 62, trendingScore: 720,
    },
    {
      type: 'internship',
      title: '💼 Microsoft LEAP Internship Programme — Summer 2025',
      content: 'Microsoft is recruiting 20 interns from African universities for their Summer 2025 LEAP programme. 12-week paid internship at Microsoft Nairobi. Requirements: 2nd year and above, GPA 3.0+, any STEM field. Application deadline: August 1, 2025.',
      tags: ['internship', 'microsoft', 'paid', 'tech', 'seed-data'],
      author: lecturer._id, isPublished: true,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      views: 1456, likeCount: 198, shareCount: 76, commentCount: 34,
    },
    {
      type: 'startup',
      title: '🚀 Student Startup EduPay Raises $500K Seed Round',
      content: 'Congratulations to our alumni Kofi Agyeman (CS 2022) whose edtech startup EduPay just closed a $500,000 seed round led by Novastar Ventures. EduPay allows students to pay tuition in flexible instalments without interest. Now active in 12 universities across Ghana and Nigeria.',
      tags: ['startup', 'funding', 'alumni', 'edtech', 'seed-data'],
      author: student._id, isPublished: true, isTrending: true,
      views: 3120, likeCount: 534, shareCount: 201, commentCount: 87, trendingScore: 940,
    },
    {
      type: 'competition',
      title: '🏆 National Hackathon 2025 — $10,000 Prize Pool',
      content: 'Register your team for the National University Hackathon hosted right here on our campus! Theme: "Tech for Social Good". 48-hour build, mentors from top tech companies, and a prize pool of $10,000. Teams of 2-4. Register by July 20.',
      tags: ['hackathon', 'competition', 'coding', 'prize', 'seed-data'],
      author: admin._id, isPublished: true, isTrending: true,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      views: 2780, likeCount: 456, shareCount: 178, commentCount: 94, trendingScore: 890,
    },
    {
      type: 'research',
      title: 'Call for Undergraduate Research Assistants — AI Lab',
      content: 'The Artificial Intelligence Research Lab is recruiting undergraduate research assistants for the 2025/2026 academic year. You will work alongside PhD students and professors on cutting-edge NLP and computer vision projects. Stipend: GHC 800/month. Apply by July 25.',
      tags: ['research', 'ai', 'lab', 'opportunity', 'seed-data'],
      author: lecturer._id, isPublished: true,
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      views: 678, likeCount: 89, commentCount: 18,
    },
    {
      type: 'club_activity',
      title: 'Google Developer Student Club — New Member Drive',
      content: 'The Google Developer Student Club (GDSC) is welcoming new members for the 2025/2026 academic year! We organise workshops, hackathons, study jams, and networking events. No experience required — just curiosity and passion for tech. First meeting: July 15, 5 PM, CS Lab 2.',
      tags: ['gdsc', 'google', 'club', 'tech', 'seed-data'],
      author: student._id, isPublished: true,
      views: 445, likeCount: 67, commentCount: 29,
    },
    {
      type: 'event',
      title: 'Reminder: Tech Innovation Summit Registration Closes Friday!',
      content: 'Only 48 hours left to register for the Annual Tech Innovation Summit 2025! We\'re down to the last 50 seats. Confirmed speakers include CEOs from Flutterwave, Andela, and mPharma. Register now at the events page.',
      tags: ['event', 'tech', 'reminder', 'seed-data'],
      author: admin._id, isPublished: true,
      views: 892, likeCount: 145, commentCount: 31,
    },
  ]);

  console.log(`✅ ${posts.length} Community posts created`);

  // ── Opportunities ──────────────────────────────────────────────────────────
  const opportunities = await Opportunity.insertMany([
    {
      title: 'Google Generation Scholarship 2025',
      description: 'Full scholarship for African students in Computer Science and Engineering. Covers tuition, accommodation, laptop, and $500/month stipend. Aimed at students who face barriers to higher education.',
      type: 'scholarship',
      organization: 'Google',
      location: 'Various African Universities',
      isRemote: false,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      link: 'https://buildyourfuture.withgoogle.com/scholarships',
      eligibility: '2nd year and above, CS or Engineering, GPA 3.0+, demonstrated financial need',
      benefits: 'Full tuition, accommodation, laptop, $500/month stipend, mentorship, internship placement',
      tags: ['scholarship', 'cs', 'engineering', 'google'],
      status: 'approved', views: 234, createdBy: admin._id, approvedBy: admin._id,
    },
    {
      title: 'Microsoft LEAP Summer Internship 2025',
      description: '12-week paid internship programme at Microsoft Africa Development Centre in Nairobi. Work on real products used by millions, mentored by senior Microsoft engineers.',
      type: 'internship',
      organization: 'Microsoft',
      location: 'Nairobi, Kenya',
      isRemote: false,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      link: 'https://careers.microsoft.com',
      eligibility: '2nd year and above, any STEM field, GPA 3.0+',
      benefits: 'Competitive monthly stipend, accommodation allowance, return flight, full-time offer possibility',
      tags: ['internship', 'microsoft', 'paid', 'nairobi'],
      status: 'approved', views: 189, createdBy: lecturer._id, approvedBy: admin._id,
    },
    {
      title: 'UNESCO Youth Innovation Grant 2025',
      description: 'Grants of up to $15,000 for youth-led projects addressing Sustainable Development Goals. Focus areas: Education, Climate, Health, and Digital Equity.',
      type: 'grant',
      organization: 'UNESCO',
      location: 'Global',
      isRemote: true,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      link: 'https://en.unesco.org',
      eligibility: 'Age 18-30, project must address an SDG, team of 2-5',
      benefits: 'Up to $15,000 grant, mentorship, global networking, UNESCO certification',
      tags: ['grant', 'sdg', 'innovation', 'youth'],
      status: 'approved', views: 145, createdBy: admin._id, approvedBy: admin._id,
    },
    {
      title: 'National STEM Olympiad 2025',
      description: 'Annual national competition for university students in Science, Technology, Engineering, and Mathematics. Represents Ghana at the Pan-African STEM Games.',
      type: 'competition',
      organization: 'WAEC Foundation',
      location: 'Accra, Ghana',
      isRemote: false,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      eligibility: 'Undergraduate students, any year, individual or team entry',
      benefits: 'GHC 20,000 first prize, scholarship opportunities, national recognition',
      tags: ['competition', 'stem', 'olympiad', 'national'],
      status: 'approved', views: 312, createdBy: admin._id, approvedBy: admin._id,
    },
    {
      title: 'MIT-Africa Innovate Fellowship 2025',
      description: 'Six-month fellowship at MIT Media Lab for African students with breakthrough tech ideas. Cohort-based programme with access to MIT facilities, faculty, and alumni network.',
      type: 'fellowship',
      organization: 'MIT',
      location: 'Cambridge, USA',
      isRemote: false,
      deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      eligibility: 'Final year or recent graduate, strong academic record, compelling innovation idea',
      benefits: 'Full funding, MIT stipend, visa support, dedicated mentor, global alumni network',
      tags: ['fellowship', 'mit', 'innovation', 'usa'],
      status: 'approved', views: 278, createdBy: lecturer._id, approvedBy: admin._id,
    },
    {
      title: 'UN Youth Delegate Programme 2025',
      description: 'Represent your country as a Youth Delegate at the United Nations General Assembly in New York. Engage with global leaders on youth empowerment, climate, and peace.',
      type: 'exchange_program',
      organization: 'UN Youth',
      location: 'New York, USA',
      isRemote: false,
      deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      eligibility: 'Age 18-28, strong leadership record, English proficiency',
      benefits: 'Fully funded travel, accommodation, and meals. UN General Assembly access.',
      tags: ['un', 'leadership', 'exchange', 'international'],
      status: 'approved', views: 167, createdBy: admin._id, approvedBy: admin._id,
    },
  ]);

  console.log(`✅ ${opportunities.length} Opportunities created`);

  console.log('\n🎉 Seed complete!\n');
  console.log('Test accounts:');
  console.log('  Admin   → admin@campuspilot.com    / admin123');
  console.log('  Student → student@campuspilot.com  / student123');
  console.log('  Lecturer→ lecturer@campuspilot.com / lecturer123\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
