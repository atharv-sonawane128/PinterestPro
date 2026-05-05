const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/pintrest_pro';

const DUMMY_PINS = [
  {
    title: 'Aesthetic Workspace Setup',
    images: ['/explore_1.png', '/explore_2.png'],
    author: { name: 'Design Daily', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', id: '1' },
    privateNote: 'Love the lighting in this one for my room redesign.',
    category: 'All'
  },
  {
    title: 'Creative Flat Lay Art',
    images: ['/explore_2.png'],
    author: { name: 'Artistic Souls', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', id: '2' },
    category: 'Beautiful Paragraphs'
  },
  {
    title: 'Stunning Sunset Mountains',
    images: ['/explore_3.png', '/explore_1.png', '/explore_2.png'],
    author: { name: 'Traveler Joe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', id: '3' },
    privateNote: 'Reference for the hike next summer.',
    category: 'All'
  },
  {
    title: 'Cyberpunk Cityscape',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60'],
    author: { name: 'Neon Dreams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', id: '4' },
    category: 'Reality quotes'
  },
  {
    title: 'Minimalist Interior',
    images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&auto=format&fit=crop&q=60'],
    author: { name: 'Space Design', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', id: '5' },
    category: 'All'
  },
  {
    title: 'Portrait Photography',
    images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60'],
    author: { name: 'Lens Magic', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', id: '6' },
    category: 'All'
  },
  {
    title: 'Nature Escape',
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=60'],
    author: { name: 'Earth Pix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7', id: '7' },
    category: 'All'
  },
  {
    title: 'Lakeside Peace',
    images: ['https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&auto=format&fit=crop&q=60'],
    author: { name: 'Calm Vibe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8', id: '8' },
    category: 'All'
  }
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('pintrest_pro');
    const collection = db.collection('pins');
    
    await collection.deleteMany({});
    await collection.insertMany(DUMMY_PINS);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seed();
