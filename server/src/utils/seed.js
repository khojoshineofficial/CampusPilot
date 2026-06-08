require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const PastQuestion = require('../models/PastQuestion');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
const Post = require('../models/Post');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Book.deleteMany({}),
    PastQuestion.deleteMany({}),
    Event.deleteMany({}),
    Announcement.deleteMany({}),
    Opportunity.deleteMany({}),
    Notification.deleteMany({}),
    Post.deleteMany({}),
  ]);

  const admin = await User.create({
    fullname: 'Admin User',
    email: 'admin@campuspilot.com',
    password: 'Admin@123',
    role: 'admin',
    department: 'Administration',
    isApproved: true,
  });

  const lecturer = await User.create({
    fullname: 'Dr. Kwame Mensah',
    email: 'lecturer@campuspilot.com',
    password: 'Lecturer@123',
    role: 'lecturer',
    department: 'Computer Science',
    isApproved: true,
  });

  const student = await User.create({
    fullname: 'Ama Owusu',
    email: 'student@campuspilot.com',
    password: 'Student@123',
    role: 'student',
    department: 'Computer Science',
    level: '300',
    isApproved: true,
  });

  await Book.insertMany([
    {
      title: 'Introduction to Algorithms',
      author: 'Cormen, Leiserson, Rivest, Stein',
      department: 'Computer Science',
      course: 'Data Structures and Algorithms',
      level: '200',
      description: 'The classic algorithms textbook used worldwide.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      coverImage: 'https://res.cloudinary.com/demo/image/upload/sample',
      fileType: 'pdf',
      uploadedBy: lecturer._id,
      tags: ['algorithms', 'data structures', 'computer science'],
    },
    {
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      department: 'Computer Science',
      course: 'Database Management',
      level: '300',
      description: 'Comprehensive guide to database systems and SQL.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      coverImage: 'https://res.cloudinary.com/demo/image/upload/sample',
      fileType: 'pdf',
      uploadedBy: lecturer._id,
      tags: ['database', 'sql', 'computer science'],
    },
    {
      title: 'Engineering Mathematics',
      author: 'K.A. Stroud',
      department: 'Engineering',
      course: 'Engineering Mathematics',
      level: '100',
      description: 'Essential mathematics for engineering students.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      fileType: 'pdf',
      uploadedBy: admin._id,
      tags: ['mathematics', 'engineering'],
    },
  ]);

  await PastQuestion.insertMany([
    {
      courseCode: 'CS301',
      courseName: 'Data Structures and Algorithms',
      level: '300',
      year: '2023',
      semester: 'First',
      department: 'Computer Science',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      uploadedBy: lecturer._id,
    },
    {
      courseCode: 'CS201',
      courseName: 'Object Oriented Programming',
      level: '200',
      year: '2022',
      semester: 'Second',
      department: 'Computer Science',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      uploadedBy: lecturer._id,
    },
  ]);

  await Event.insertMany([
    {
      title: 'Annual Tech Summit 2026',
      description: 'Join us for the biggest technology event of the year featuring industry experts, workshops, and networking opportunities.',
      category: 'conference',
      date: new Date('2026-07-15'),
      time: '09:00 AM',
      venue: 'Main Auditorium',
      organizer: 'Computer Science Department',
      targetDepartment: 'all',
      createdBy: admin._id,
      isPublished: true,
    },
    {
      title: 'Web Development Workshop',
      description: 'Hands-on workshop covering HTML, CSS, JavaScript and modern frameworks.',
      category: 'workshop',
      date: new Date('2026-06-25'),
      time: '10:00 AM',
      venue: 'Lab 4, Engineering Block',
      organizer: 'Dr. Kwame Mensah',
      targetDepartment: 'Computer Science',
      createdBy: lecturer._id,
      isPublished: true,
    },
  ]);

  await Announcement.insertMany([
    {
      title: 'End of Semester Examinations',
      content: 'End of semester examinations will commence on July 1st, 2026. Students are advised to check the examination timetable on the student portal.',
      createdBy: admin._id,
      targetRole: 'student',
      priority: 'urgent',
      isPinned: true,
    },
    {
      title: 'Staff Meeting Notice',
      content: 'All academic staff are required to attend the faculty meeting on June 15th, 2026 at 2:00 PM in the Senate Room.',
      createdBy: admin._id,
      targetRole: 'lecturer',
      priority: 'high',
    },
    {
      title: 'Library Hours Extension',
      content: 'The university library will extend its hours to 10 PM during the examination period to support student studies.',
      createdBy: admin._id,
      targetRole: 'all',
      priority: 'normal',
    },
  ]);

  await Opportunity.insertMany([
    {
      title: 'Google Africa Scholarship Program',
      description: 'Google is offering full scholarships for outstanding students in STEM fields across Africa.',
      type: 'scholarship',
      organization: 'Google',
      location: 'Remote / Various',
      isRemote: true,
      deadline: new Date('2026-08-31'),
      link: 'https://buildyourfuture.withgoogle.com',
      eligibility: 'Current university students in STEM. Minimum GPA of 3.0.',
      benefits: 'Full tuition, mentorship, internship opportunities',
      createdBy: admin._id,
      isApproved: true,
      tags: ['scholarship', 'stem', 'google', 'africa'],
    },
    {
      title: 'Software Engineering Internship - Hubtel',
      description: 'Hubtel is looking for talented software engineering interns to join their team.',
      type: 'internship',
      organization: 'Hubtel',
      location: 'Accra, Ghana',
      isRemote: false,
      deadline: new Date('2026-07-15'),
      eligibility: 'CS/Engineering students in level 300 or above',
      benefits: 'Monthly stipend, mentorship, possible full-time offer',
      createdBy: admin._id,
      isApproved: true,
      tags: ['internship', 'software', 'ghana'],
    },
  ]);

  await Notification.insertMany([
    {
      title: 'Welcome to CampusPilot!',
      content: 'Your smart campus companion is ready. Explore the digital library, upcoming events, and more.',
      type: 'system',
      recipientRole: 'all',
      createdBy: admin._id,
      icon: '🎉',
    },
    {
      title: 'New Past Questions Available',
      content: 'New past question papers for CS301 and CS201 have been uploaded to the Past Questions repository.',
      type: 'general',
      recipientRole: 'student',
      createdBy: lecturer._id,
      icon: '📄',
    },
  ]);

  await Post.insertMany([
    {
      user: lecturer._id,
      content: 'Welcome to the new semester! I have uploaded study materials for CS301 - Data Structures and Algorithms. Check the library section.',
      type: 'announcement',
    },
    {
      user: student._id,
      content: 'Looking for study partners for the upcoming CS301 exam. Anyone interested can DM me!',
      type: 'general',
    },
    {
      user: admin._id,
      content: 'The university has partnered with Google to provide free access to Google Workspace for all students. Check your emails for activation instructions.',
      type: 'announcement',
    },
  ]);

  console.log('\n✅ Seed completed successfully!\n');
  console.log('Test Accounts:');
  console.log('  Admin:    admin@campuspilot.com    / Admin@123');
  console.log('  Lecturer: lecturer@campuspilot.com / Lecturer@123');
  console.log('  Student:  student@campuspilot.com  / Student@123\n');

  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
