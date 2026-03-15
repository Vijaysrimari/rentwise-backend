const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const User = require('./models/User');
const Asset = require('./models/Asset');
const Tenant = require('./models/Tenant');
const Rental = require('./models/Rental');
const Payment = require('./models/Payment');
const SupportRequest = require('./models/SupportRequest');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Asset.deleteMany({});
    await Tenant.deleteMany({});
    await Rental.deleteMany({});
    await Payment.deleteMany({});
    await SupportRequest.deleteMany({});
    console.log('Collections cleared');

    const adminPass = 'Admin@1234';
    const ownerPass = 'Owner@1234';
    const managerPass = 'Manager@1234';
    const tenantPass = 'Tenant@1234';

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@rentwise.com',
      password: adminPass,
      role: 'admin',
      phone: '',
      address: '',
      bio: '',
    });

    const sureshUser = await User.create({
      name: 'Vijay',
      email: 'owner@rentwise.com',
      password: ownerPass,
      role: 'owner',
      phone: '9876500001',
      address: '15, Poes Garden, Chennai',
      bio: 'Property owner with 10+ years experience.',
    });

    const karthikUser = await User.create({
      name: 'Vijay',
      email: 'manager@rentwise.com',
      password: managerPass,
      role: 'manager',
      phone: '9876500002',
      address: '22, Anna Nagar, Chennai',
      bio: 'Experienced property manager.',
    });

    const arunUser = await User.create({
      name: 'Arun Selvam',
      email: 'tenant@rentwise.com',
      password: tenantPass,
      role: 'tenant',
      phone: '9876543210',
      address: '12, Gandhi Street, Anna Nagar, Chennai - 600040',
      bio: 'Working professional, neat and punctual with payments.',
    });

    const priyaUser = await User.create({
      name: 'Priya Sharma',
      email: 'priya@rentwise.com',
      password: tenantPass,
      role: 'tenant',
      phone: '9123456780',
      address: '',
      bio: '',
    });

    const meenaUser = await User.create({
      name: 'Meena Devi',
      email: 'meena@rentwise.com',
      password: tenantPass,
      role: 'tenant',
      phone: '9988776655',
      address: '',
      bio: '',
    });

    const assets = await Asset.insertMany([
      {
        title: '2BHK Apartment',
        description: 'Spacious 2BHK with modern amenities, 24/7 water, covered parking and security. Near metro station.',
        category: 'House', subType: 'Apartment',
        location: 'Anna Nagar, Chennai',
        rentAmount: 1500, rentPer: 'day', status: 'occupied',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop'],
        owner: sureshUser._id, currentTenant: arunUser._id,
      },
      {
        title: 'Independent Villa',
        description: '4BHK villa with private garden, pool, 3 car parking. Premium gated community.',
        category: 'House', subType: 'Villa',
        location: 'Adyar, Chennai',
        rentAmount: 3500, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Studio Flat',
        description: 'Fully furnished studio for single professionals. AC, WiFi and weekly housekeeping included.',
        category: 'House', subType: 'Studio',
        location: 'T. Nagar, Chennai',
        rentAmount: 800, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'PG Room with Meals',
        description: 'AC single room PG with breakfast and dinner. Attached bath, daily housekeeping, WiFi.',
        category: 'House', subType: 'PG',
        location: 'Velachery, Chennai',
        rentAmount: 400, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: '3BHK Independent House',
        description: 'Spacious independent house with terrace, garden and separate pooja room. Quiet neighborhood.',
        category: 'House', subType: 'Independent',
        location: 'Tambaram, Chennai',
        rentAmount: 2500, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Commercial Office Space',
        description: '1200 sqft open plan office with 20 workstations, AC, conference room and reception area.',
        category: 'House', subType: 'Office',
        location: 'Nungambakkam, Chennai',
        rentAmount: 2000, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Shop / Showroom',
        description: 'Ground floor corner shop 800 sqft. High footfall area, glass facade, stockroom attached.',
        category: 'House', subType: 'Shop',
        location: 'Anna Salai, Chennai',
        rentAmount: 1800, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Warehouse Storage',
        description: '5000 sqft dry warehouse with loading dock, 24/7 CCTV, power backup and security.',
        category: 'House', subType: 'Warehouse',
        location: 'Ambattur, Chennai',
        rentAmount: 2200, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Luxury Penthouse',
        description: 'Top floor penthouse with 360 degree city view, private terrace, jacuzzi and smart home system.',
        category: 'House', subType: 'Penthouse',
        location: 'OMR, Chennai',
        rentAmount: 7000, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Bungalow with Garden',
        description: 'Classic bungalow with lush garden, verandah, 3 bedrooms and separate servant quarters.',
        category: 'House', subType: 'Bungalow',
        location: 'Besant Nagar, Chennai',
        rentAmount: 5000, rentPer: 'day', status: 'maintenance',
        images: ['https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },

      {
        title: 'King Size Bed with Storage',
        description: 'Solid teak wood king bed with hydraulic storage. Includes mattress and 2 pillows.',
        category: 'Furniture', subType: 'Bed',
        location: 'Chennai Citywide',
        rentAmount: 250, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Sofa Set 3+1+1',
        description: 'Premium fabric sofa set. 3-seater plus 2 singles in beige. Delivery included.',
        category: 'Furniture', subType: 'Seating',
        location: 'Chennai Citywide',
        rentAmount: 300, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Wooden Dining Table 6 Seater',
        description: 'Solid sheesham wood dining table with 6 cushioned chairs. Easy assembly.',
        category: 'Furniture', subType: 'Dining',
        location: 'Chennai Citywide',
        rentAmount: 150, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'L-Shaped Office Desk',
        description: 'Large L-shaped executive desk with cable management and side drawers.',
        category: 'Furniture', subType: 'Desk',
        location: 'Chennai Citywide',
        rentAmount: 100, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: '3 Door Wardrobe',
        description: 'Mirror finish 3-door wardrobe with hanging rails, shelves and bottom drawers.',
        category: 'Furniture', subType: 'Storage',
        location: 'Chennai Citywide',
        rentAmount: 120, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Ergonomic Study Chair',
        description: 'High back mesh ergonomic chair with lumbar support, adjustable height and armrests.',
        category: 'Furniture', subType: 'Chair',
        location: 'Chennai Citywide',
        rentAmount: 60, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: '5-Shelf Bookcase',
        description: 'Solid wood 5-shelf bookcase in walnut finish. Holds up to 200 books.',
        category: 'Furniture', subType: 'Storage',
        location: 'Chennai Citywide',
        rentAmount: 80, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Glass Coffee Table',
        description: 'Modern tempered glass top coffee table with chrome legs. 120cm x 60cm.',
        category: 'Furniture', subType: 'Table',
        location: 'Chennai Citywide',
        rentAmount: 70, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1499933374294-4584851b32e7?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Outdoor Garden Set',
        description: 'Teak outdoor 4-seater garden set with cushions. Weather resistant. Delivery included.',
        category: 'Furniture', subType: 'Outdoor',
        location: 'Chennai Citywide',
        rentAmount: 200, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'TV Unit Cabinet',
        description: 'Modern TV cabinet with storage drawers for 55-65 inch TVs. Matte finish.',
        category: 'Furniture', subType: 'Cabinet',
        location: 'Chennai Citywide',
        rentAmount: 90, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },

      {
        title: 'Electric Drill Machine Set',
        description: 'Bosch GSB 550W electric drill with 50 piece accessory kit. Ideal for home and construction.',
        category: 'Tools', subType: 'Power Tool',
        location: 'Chennai Citywide',
        rentAmount: 150, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Angle Grinder 4.5"',
        description: 'Makita 850W angle grinder with metal and masonry cutting discs. Safety guard included.',
        category: 'Tools', subType: 'Power Tool',
        location: 'Chennai Citywide',
        rentAmount: 120, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Circular Saw',
        description: 'Dewalt 1400W circular saw with laser guide. Cuts wood, plywood and plastic. Safety glasses included.',
        category: 'Tools', subType: 'Power Tool',
        location: 'Chennai Citywide',
        rentAmount: 200, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Professional Hammer Set',
        description: 'Set of 5 hammers - claw, ball peen, mallet, sledge and rubber hammer.',
        category: 'Tools', subType: 'Hand Tool',
        location: 'Chennai Citywide',
        rentAmount: 50, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Adjustable Wrench Set',
        description: 'Chrome vanadium 12-piece wrench set from 8mm to 32mm. Comes in a carry case.',
        category: 'Tools', subType: 'Hand Tool',
        location: 'Chennai Citywide',
        rentAmount: 60, rentPer: 'day', status: 'occupied',
        images: ['https://images.unsplash.com/photo-1581147036324-c47b66e93ab6?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Aluminium Ladder 12ft',
        description: 'Heavy duty 12ft aluminium A-frame ladder. Load capacity 150kg. Anti-slip feet.',
        category: 'Tools', subType: 'Equipment',
        location: 'Chennai Citywide',
        rentAmount: 100, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Concrete Mixer 350L',
        description: 'Electric concrete mixer 350L capacity. 1.5HP motor. Ideal for construction projects.',
        category: 'Tools', subType: 'Heavy Equipment',
        location: 'Chennai Citywide',
        rentAmount: 500, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Petrol Lawn Mower',
        description: 'Honda 4-stroke petrol lawn mower. 18 inch cutting width. Self-propelled. Grass bag included.',
        category: 'Tools', subType: 'Garden',
        location: 'Chennai Citywide',
        rentAmount: 300, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'High Pressure Washer',
        description: 'Karcher 1800W pressure washer. 130 bar pressure. Ideal for vehicles, floors, and walls.',
        category: 'Tools', subType: 'Cleaning',
        location: 'Chennai Citywide',
        rentAmount: 250, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Arc Welding Machine',
        description: '200A arc welding machine with electrodes, gloves, face shield and cables.',
        category: 'Tools', subType: 'Heavy Equipment',
        location: 'Chennai Citywide',
        rentAmount: 400, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },

      {
        title: 'Honda City 2022',
        description: 'Well-maintained petrol automatic sedan. Full insurance, GPS and roadside assistance.',
        category: 'Vehicles', subType: 'Car',
        location: 'Chennai Citywide',
        rentAmount: 1500, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Royal Enfield Classic 350',
        description: '2023 RE Classic 350 Stealth Black. Full tank on pickup. Helmet and gloves included.',
        category: 'Vehicles', subType: 'Motorcycle',
        location: 'Chennai Citywide',
        rentAmount: 800, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Toyota Innova Crysta',
        description: '7-seater diesel Innova Crysta. Perfect for family trips and outstation travel.',
        category: 'Vehicles', subType: 'MUV',
        location: 'Chennai Citywide',
        rentAmount: 2500, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Ather 450X Electric Scooter',
        description: 'Smart electric scooter with 85km range. Charging cable included. Helmet provided.',
        category: 'Vehicles', subType: 'Scooter',
        location: 'Chennai Citywide',
        rentAmount: 400, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Tata Ace Mini Truck',
        description: '1 ton payload mini truck. Ideal for shifting furniture or small goods transport.',
        category: 'Vehicles', subType: 'Truck',
        location: 'Chennai Citywide',
        rentAmount: 3000, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Toyota Fortuner SUV',
        description: 'Premium 7-seater diesel SUV. 4x4 capable. Perfect for highway and off-road trips.',
        category: 'Vehicles', subType: 'SUV',
        location: 'Chennai Citywide',
        rentAmount: 3500, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Firefox Mountain Bicycle',
        description: '21-speed mountain bicycle with disc brakes, helmet and lock. Great for daily commute.',
        category: 'Vehicles', subType: 'Bicycle',
        location: 'Chennai Citywide',
        rentAmount: 100, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Auto Rickshaw',
        description: 'CNG auto rickshaw in good condition. Valid permit and insurance. Ideal for small businesses.',
        category: 'Vehicles', subType: 'Auto',
        location: 'Chennai Citywide',
        rentAmount: 600, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Force Traveller Van 17 Seater',
        description: '17-seater tempo traveller. AC, push-back seats. Ideal for group trips and picnics.',
        category: 'Vehicles', subType: 'Van',
        location: 'Chennai Citywide',
        rentAmount: 2800, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1609520505218-7421df82eca3?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Mahindra Tractor 35HP',
        description: '35HP Mahindra tractor with rotavator attachment. Suitable for agricultural use.',
        category: 'Vehicles', subType: 'Tractor',
        location: 'Outskirts, Chennai',
        rentAmount: 2000, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },

      {
        title: 'MacBook Pro M2 14"',
        description: 'Apple MacBook Pro M2, 16GB RAM, 512GB SSD. Original charger and sleeve included.',
        category: 'Tech Asset', subType: 'Laptop',
        location: 'Chennai Citywide',
        rentAmount: 600, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Dell XPS 15 Laptop',
        description: 'Dell XPS 15, i7 12th gen, 16GB RAM, 1TB SSD, OLED display. Charger included.',
        category: 'Tech Asset', subType: 'Laptop',
        location: 'Chennai Citywide',
        rentAmount: 400, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'iPad Pro 12.9" M2',
        description: 'Apple iPad Pro M2 with Apple Pencil and Magic Keyboard. 256GB WiFi+Cellular.',
        category: 'Tech Asset', subType: 'Tablet',
        location: 'Chennai Citywide',
        rentAmount: 350, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Canon EOS 800D DSLR',
        description: 'Canon EOS 800D with 18-55mm lens, extra battery, 64GB card and camera bag.',
        category: 'Tech Asset', subType: 'Camera',
        location: 'Chennai Citywide',
        rentAmount: 800, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Epson 4K Laser Projector',
        description: '4K laser projector 3000 lumens with HDMI, USB and remote. Screen not included.',
        category: 'Tech Asset', subType: 'Projector',
        location: 'Chennai Citywide',
        rentAmount: 700, rentPer: 'day', status: 'occupied',
        images: ['https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'TP-Link WiFi 6 Router',
        description: 'Dual band WiFi 6 router 3000Mbps. Covers up to 3000 sqft. Easy setup.',
        category: 'Tech Asset', subType: 'Networking',
        location: 'Chennai Citywide',
        rentAmount: 100, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Sony PlayStation 5',
        description: 'PS5 with 2 controllers, 5 game discs and HDMI cable. Full setup ready to play.',
        category: 'Tech Asset', subType: 'Gaming',
        location: 'Chennai Citywide',
        rentAmount: 500, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Desktop PC Setup',
        description: 'i7 gaming desktop with 32GB RAM, RTX 3060, 27" monitor, keyboard and mouse.',
        category: 'Tech Asset', subType: 'Desktop',
        location: 'Chennai Citywide',
        rentAmount: 350, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'DJI Mavic 3 Drone',
        description: 'DJI Mavic 3 4K drone with 3 batteries, ND filters, carrying case and RC controller.',
        category: 'Tech Asset', subType: 'Drone',
        location: 'Chennai Citywide',
        rentAmount: 1200, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },
      {
        title: 'Meta Quest 3 VR Headset',
        description: 'Meta Quest 3 mixed reality headset with 2 controllers and 10 pre-loaded games.',
        category: 'Tech Asset', subType: 'VR',
        location: 'Chennai Citywide',
        rentAmount: 600, rentPer: 'day', status: 'vacant',
        images: ['https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&auto=format&fit=crop'],
        owner: sureshUser._id,
      },

    ]);

    const apartmentAsset = assets.find((a) => a.title === '2BHK Apartment');
    const rental1 = await Rental.create({
      asset: apartmentAsset._id,
      tenant: arunUser._id,
      owner: sureshUser._id,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-08-01'),
      rentAmount: 1500,
      securityDeposit: 30000,
      status: 'active',
      autoExpireCheck: false,
      terms:
        'Monthly payment due on 1st of every month. Security deposit refundable on exit after inspection. No subletting allowed. Tenant responsible for minor repairs under Rs500.',
    });

    await Payment.insertMany([
      {
        rental: rental1._id,
        tenant: arunUser._id,
        owner: sureshUser._id,
        amount: 1500,
        paymentDate: new Date('2025-02-01'),
        dueDate: new Date('2025-02-01'),
        method: 'upi',
        status: 'paid',
        note: 'February rent',
        receiptId: 'RW-1706745600000',
      },
      {
        rental: rental1._id,
        tenant: arunUser._id,
        owner: sureshUser._id,
        amount: 1500,
        paymentDate: new Date('2025-03-01'),
        dueDate: new Date('2025-03-01'),
        method: 'card',
        status: 'paid',
        note: 'March rent',
        receiptId: 'RW-1740787200000',
      },
      {
        rental: rental1._id,
        tenant: arunUser._id,
        owner: sureshUser._id,
        amount: 1500,
        paymentDate: new Date('2025-04-01'),
        dueDate: new Date('2025-04-01'),
        method: 'cash',
        status: 'paid',
        note: 'April rent',
        receiptId: 'RW-1743465600000',
      },
      {
        rental: rental1._id,
        tenant: arunUser._id,
        owner: sureshUser._id,
        amount: 1500,
        paymentDate: null,
        dueDate: new Date('2025-05-01'),
        method: 'other',
        status: 'pending',
        note: 'May rent - pending',
        receiptId: '',
      },
    ]);

    await SupportRequest.insertMany([
      {
        tenant: arunUser._id,
        asset: apartmentAsset._id,
        title: 'Plumbing issue - bathroom sink leaking',
        desc: 'Water is leaking from the drain pipe under the bathroom sink. Getting worse over the past 2 days.',
        category: 'plumbing',
        priority: 'high',
        status: 'in-progress',
      },
      {
        tenant: arunUser._id,
        asset: apartmentAsset._id,
        title: 'Electricity tripping in kitchen',
        desc: 'The MCB trips every time the microwave and induction are used simultaneously. Needs inspection.',
        category: 'electrical',
        priority: 'medium',
        status: 'resolved',
        resolvedAt: new Date('2025-03-20'),
      },
      {
        tenant: arunUser._id,
        asset: apartmentAsset._id,
        title: 'Main door lock stiff and getting stuck',
        desc: 'The main door lock is very stiff and sometimes gets stuck from outside. Needs replacement.',
        category: 'carpentry',
        priority: 'low',
        status: 'resolved',
        resolvedAt: new Date('2025-03-10'),
      },
    ]);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ RentWise Seed Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Users created: 6');
    console.log('🏠 Assets created: 50');
    console.log('📄 Rentals created: 1');
    console.log('💰 Payments created: 4');
    console.log('💬 Support requests: 3');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test Login Credentials:');
    console.log('  Owner:   owner@rentwise.com   / Owner@1234');
    console.log('  Tenant:  tenant@rentwise.com  / Tenant@1234');
    console.log('  Manager: manager@rentwise.com / Manager@1234');
    console.log('  Admin:   admin@rentwise.com   / Admin@1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
