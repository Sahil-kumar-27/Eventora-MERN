const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');
const Event = require('./src/models/event.model');
const Booking = require('./src/models/booking.model');

dotenv.config();

const users = [
    { name: 'Admin User', email: 'admin@eventora.com', password: 'password123', role: 'admin' },
    { name: 'Demo User', email: 'user@eventora.com', password: 'password123', role: 'user' },
    { name: 'Aarav Sharma', email: 'aarav@eventora.com', password: 'password123', role: 'user' },
    { name: 'Priya Verma', email: 'priya@eventora.com', password: 'password123', role: 'user' },
    { name: 'Rohan Mehta', email: 'rohan@eventora.com', password: 'password123', role: 'user' },
    { name: 'Ananya Gupta', email: 'ananya@eventora.com', password: 'password123', role: 'user' },
    { name: 'Kabir Singh', email: 'kabir@eventora.com', password: 'password123', role: 'user' },
    { name: 'Isha Kapoor', email: 'isha@eventora.com', password: 'password123', role: 'user' },
    { name: 'Arjun Malhotra', email: 'arjun@eventora.com', password: 'password123', role: 'user' },
    { name: 'Neha Joshi', email: 'neha@eventora.com', password: 'password123', role: 'user' }
];

const events = [
    {
        title: 'React & Node.js Developer Summit India',
        description: 'Join us for a 3-day deep dive into modern full-stack web development with top Indian tech mentors and engineers.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Bengaluru Tech Convention Center, Karnataka',
        category: 'Technology',
        totalSeats: 200,
        ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Sunburn Neon EDM Night',
        description: 'Experience an electrifying night of EDM, techno, and lights with India’s top DJs and international artists.',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        location: 'Jawaharlal Nehru Stadium, Delhi',
        category: 'Music',
        totalSeats: 500,
        ticketPrice: 1500,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'India Startup & Business Leaders Summit',
        description: 'A premium gathering of CEOs, founders, and investors discussing AI, startups, and the future of Indian business.',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        location: 'The Leela Palace, Mumbai',
        category: 'Business',
        totalSeats: 150,
        ticketPrice: 5000,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Modern Art Expo Delhi 2026',
        description: 'Discover breathtaking contemporary and modern art from emerging Indian artists and global creators.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'India Habitat Centre, New Delhi',
        category: 'Art',
        totalSeats: 300,
        ticketPrice: 200,
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Startup Pitch India 2026',
        description: 'Watch India’s most promising startups pitch to VCs and angel investors for seed funding opportunities.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'Pragati Maidan, New Delhi',
        category: 'Business',
        totalSeats: 250,
        ticketPrice: 100,
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Cloud Computing Architecture Seminar',
        description: 'A purely technical breakdown of scalable cloud solutions, multi-region routing, and serverless compute systems.',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        location: 'HITEX Exhibition Center, Hyderabad',
        category: 'Technology',
        totalSeats: 100,
        ticketPrice: 600,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventora');
        console.log('\n✅ MongoDB connection open...');

        await User.deleteMany();
        await Event.deleteMany();
        await Booking.deleteMany();
        console.log('🗑️  Cleared existing data.');

        const salt = await bcrypt.genSalt(10);
        const hashedUsers = users.map(u => ({
            ...u,
            password: bcrypt.hashSync(u.password, salt),
            isVerified: true
        }));

        const createdUsers = await User.insertMany(hashedUsers);
        const adminUser = createdUsers.find(u => u.role === 'admin');
        const normalUsers = createdUsers.filter(u => u.role === 'user');
        console.log(`👤 Created ${createdUsers.length} total dummy users.`);

        const eventsWithAdmin = events.map(e => ({
            ...e,
            availableSeats: e.totalSeats,
            createdBy: adminUser._id
        }));

        const createdEvents = await Event.insertMany(eventsWithAdmin);
        console.log(`🎉 Created ${createdEvents.length} distinct events with Unsplash images.`);

        const bookingsData = [];

        for (const event of createdEvents) {
            const randomCount = Math.floor(Math.random() * 4) + 3;
            const shuffledUsers = [...normalUsers].sort(() => 0.5 - Math.random());
            const selectedUsers = shuffledUsers.slice(0, randomCount);

            for (const user of selectedUsers) {
                const statuses = ['pending', 'confirmed', 'cancelled'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                let paymentStatus = 'not_paid';
                if (status === 'confirmed' && event.ticketPrice > 0) {
                    paymentStatus = Math.random() > 0.1 ? 'paid' : 'not_paid';
                } else if (event.ticketPrice === 0) {
                    paymentStatus = 'paid';
                }

                bookingsData.push({
                    userId: user._id,
                    eventId: event._id,
                    status: status,
                    paymentStatus: paymentStatus,
                    amount: event.ticketPrice
                });

                if (status === 'confirmed') {
                    event.availableSeats -= 1;
                    await event.save();
                }
            }
        }

        await Booking.insertMany(bookingsData);
        console.log(`🎫 Inserted ${bookingsData.length} randomized dummy bookings (confirmed, pending, cancelled, paid, not_paid).`);

        console.log('\n🚀 Database seeded successfully!');
        console.log('-------------------------------------------');
        console.log('Admin Email: admin@eventora.com');
        console.log('User Email:  user@eventora.com');
        console.log('Password for all users: password123');
        console.log('-------------------------------------------\n');

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedDatabase();