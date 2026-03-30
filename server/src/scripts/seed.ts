import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db';
import { User, Society, UserRole } from '../models';

/**
 * Seeds the database with initial societies and admin users.
 * Run with: npm run seed
 */

// All IEEE Societies, Affinity Groups, and Councils from constants.ts
const SOCIETIES = [
  { societyKey: 'sb', name: 'IEEE Student Branch', shortName: 'IEEE SB', budget: 100000 },
  { societyKey: 'aess', name: 'Aerospace and Electronic Systems Society', shortName: 'AESS', budget: 15000 },
  { societyKey: 'aps', name: 'Antennas and Propagation Society', shortName: 'APS', budget: 12000 },
  { societyKey: 'bts', name: 'Broadcast Technology Society', shortName: 'BTS', budget: 8000 },
  { societyKey: 'cas', name: 'Circuits and Systems Society', shortName: 'CAS', budget: 20000 },
  { societyKey: 'comsoc', name: 'Communications Society', shortName: 'ComSoc', budget: 25000 },
  { societyKey: 'cis', name: 'Computational Intelligence Society', shortName: 'CIS', budget: 18000 },
  { societyKey: 'cs', name: 'Computer Society', shortName: 'IEEE CS', budget: 40000 },
  { societyKey: 'ctsoc', name: 'Consumer Technology Society', shortName: 'CTSoc', budget: 10000 },
  { societyKey: 'css', name: 'Control Systems Society', shortName: 'CSS', budget: 15000 },
  { societyKey: 'deis', name: 'Dielectrics and Electrical Insulation Society', shortName: 'DEIS', budget: 9000 },
  { societyKey: 'eds', name: 'Electron Devices Society', shortName: 'EDS', budget: 14000 },
  { societyKey: 'emcs', name: 'Electromagnetic Compatibility Society', shortName: 'EMCS', budget: 11000 },
  { societyKey: 'eps', name: 'Electronics Packaging Society', shortName: 'EPS', budget: 10000 },
  { societyKey: 'embs', name: 'Engineering in Medicine and Biology Society', shortName: 'EMBS', budget: 22000 },
  { societyKey: 'edsoc', name: 'Education Society', shortName: 'EdSoc', budget: 12000 },
  { societyKey: 'grss', name: 'Geoscience and Remote Sensing Society', shortName: 'GRSS', budget: 16000 },
  { societyKey: 'ies', name: 'Industrial Electronics Society', shortName: 'IES', budget: 20000 },
  { societyKey: 'ias', name: 'Industry Applications Society', shortName: 'IAS', budget: 22000 },
  { societyKey: 'it', name: 'Information Theory Society', shortName: 'ITS', budget: 13000 },
  { societyKey: 'ims', name: 'Instrumentation and Measurement Society', shortName: 'IMS', budget: 12500 },
  { societyKey: 'itss', name: 'Intelligent Transportation Systems Society', shortName: 'ITSS', budget: 14000 },
  { societyKey: 'mag', name: 'Magnetics Society', shortName: 'MAG', budget: 10000 },
  { societyKey: 'mtt', name: 'Microwave Theory and Technology Society', shortName: 'MTT-S', budget: 18000 },
  { societyKey: 'npss', name: 'Nuclear and Plasma Sciences Society', shortName: 'NPSS', budget: 15000 },
  { societyKey: 'oes', name: 'Oceanic Engineering Society', shortName: 'OES', budget: 12000 },
  { societyKey: 'pho', name: 'Photonics Society', shortName: 'PHO', budget: 17000 },
  { societyKey: 'pels', name: 'Power Electronics Society', shortName: 'PELS', budget: 24000 },
  { societyKey: 'pes', name: 'Power & Energy Society', shortName: 'PES', budget: 30000 },
  { societyKey: 'pses', name: 'Product Safety Engineering Society', shortName: 'PSES', budget: 8500 },
  { societyKey: 'pcs', name: 'Professional Communication Society', shortName: 'PCS', budget: 7000 },
  { societyKey: 'rs', name: 'Reliability Society', shortName: 'RS', budget: 9500 },
  { societyKey: 'ras', name: 'Robotics and Automation Society', shortName: 'RAS', budget: 35000 },
  { societyKey: 'sps', name: 'Signal Processing Society', shortName: 'SPS', budget: 26000 },
  { societyKey: 'ssit', name: 'Society on Social Implications of Technology', shortName: 'SSIT', budget: 9000 },
  { societyKey: 'sscs', name: 'Solid-State Circuits Society', shortName: 'SSCS', budget: 20000 },
  { societyKey: 'smc', name: 'Systems, Man, and Cybernetics Society', shortName: 'SMC', budget: 15000 },
  { societyKey: 'tems', name: 'Technology and Engineering Management Society', shortName: 'TEMS', budget: 11000 },
  { societyKey: 'uffc', name: 'Ultrasonics, Ferroelectrics, and Frequency Control Society', shortName: 'UFFC', budget: 13000 },
  { societyKey: 'vts', name: 'Vehicular Technology Society', shortName: 'VTS', budget: 14500 },
  // Affinity Groups
  { societyKey: 'wie', name: 'Women in Engineering', shortName: 'WIE', budget: 15000 },
  { societyKey: 'yp', name: 'Young Professionals', shortName: 'YP', budget: 10000 },
  { societyKey: 'sight', name: 'Special Interest Group on Humanitarian Technology', shortName: 'SIGHT', budget: 12000 },
  { societyKey: 'lm', name: 'Life Members', shortName: 'LM', budget: 5000 },
  // Councils
  { societyKey: 'sensors', name: 'Sensors Council', shortName: 'Sensors', budget: 12000 },
  { societyKey: 'biometrics', name: 'Biometrics Council', shortName: 'Biometrics', budget: 8000 },
  { societyKey: 'nanotech', name: 'Nanotechnology Council', shortName: 'Nano', budget: 10000 },
  { societyKey: 'systems', name: 'Systems Council', shortName: 'Systems', budget: 15000 },
  { societyKey: 'ceda', name: 'Council on Electronic Design Automation', shortName: 'CEDA', budget: 11000 },
];

const ADMIN_USERS = [
  { name: 'CHRIST SBC', email: 'admin@ieee.org', password: 'admin123', role: UserRole.SUPER_ADMIN },
  { name: 'Dean of Engineering', email: 'dean@ieee.org', password: 'admin123', role: UserRole.SUPER_ADMIN },
  { name: 'SB Treasurer', email: 'treasurer@ieee.org', password: 'treasurer123', role: UserRole.SB_TREASURER },
];

async function seed() {
  await connectDB();
  console.log('\n🌱 Starting database seed...\n');

  // Clear existing data
  await User.deleteMany({});
  await Society.deleteMany({});
  console.log('✓ Cleared existing users and societies');

  // Seed societies
  const societies = await Society.insertMany(
    SOCIETIES.map(s => ({ ...s, balance: s.budget, officeBearers: [], members: [] }))
  );
  console.log(`✓ Seeded ${societies.length} societies`);

  // Seed admin users
  for (const admin of ADMIN_USERS) {
    await User.create(admin);
  }
  console.log(`✓ Seeded ${ADMIN_USERS.length} admin users`);

  // Create one Society Admin per society for testing
  const testSocieties = ['cs', 'ras', 'wie'];
  for (const key of testSocieties) {
    await User.create({
      name: `${key.toUpperCase()} Chair`,
      email: `${key}@ieee.org`,
      password: 'chair123',
      role: UserRole.SOCIETY_ADMIN,
      societyId: key,
    });
  }
  console.log(`✓ Seeded ${testSocieties.length} test Society Admin accounts`);

  console.log('\n✅ Seed complete!\n');
  console.log('Test credentials:');
  console.log('  Super Admin:    admin@ieee.org / admin123');
  console.log('  SB Treasurer:   treasurer@ieee.org / treasurer123');
  console.log('  Society Admin:  cs@ieee.org / chair123');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
